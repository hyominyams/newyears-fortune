import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Lazy-load env (no dotenv dependency)
(() => {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    const raw = fs.readFileSync(envPath, "utf8");
    raw.split("\n").forEach(line => {
      if (!line.trim() || line.trim().startsWith("#")) return;
      const [key, ...rest] = line.split("=");
      if (!key || !rest.length) return;
      let val = rest.join("=").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val) process.env[key.trim()] = val;
    });
  } catch (e) {
    console.warn("Could not read .env file", e.message);
  }
})();

// --- Internal replicas of vector/stage logic (pure, no API) ---
const getTimeBucket = (time) => {
  if (!time) return "unknown";
  const hour = parseInt(time.split(":")[0]);
  if (hour >= 23 || hour < 3) return "night";
  if (hour < 7) return "dawn";
  if (hour < 11) return "morning";
  if (hour < 15) return "afternoon";
  if (hour < 19) return "evening";
  return "night";
};

const calculatePersonalVector = (dob, birthTime) => {
  const month = parseInt(dob.substring(4, 6));
  const timeBucket = getTimeBucket(birthTime);

  let v = { stable: 4, expressive: 4, control: 4, mediation: 4 };

  if (month >= 3 && month <= 5) { v.expressive += 2; v.mediation += 2; }
  else if (month >= 6 && month <= 8) { v.expressive += 3; v.control -= 1; }
  else if (month >= 9 && month <= 11) { v.control += 2; v.stable += 2; }
  else { v.stable += 3; v.mediation += 1; }

  switch (timeBucket) {
    case "dawn": v.mediation += 2; break;
    case "morning": v.control += 2; break;
    case "afternoon": v.expressive += 2; break;
    case "evening": v.stable += 2; break;
    case "night": v.expressive += 1; v.mediation -= 1; break;
  }

  Object.keys(v).forEach(k => { v[k] = Math.max(0, Math.min(10, v[k])); });
  return v;
};

const calculateFortuneStage = (personalVec) => {
  let stress = 0;
  stress += Math.pow(Math.max(0, 7 - personalVec.expressive), 2.0);
  stress += Math.pow(Math.max(0, 7 - personalVec.control), 2.0);
  stress += Math.pow(Math.max(0, 7 - personalVec.mediation), 2.0);
  stress += Math.pow(Math.max(0, 5 - personalVec.stable), 2.0);

  const stressScore = Math.min(100, stress * 4.0);
  const capacityScore = personalVec.stable + personalVec.mediation;

  let key = "평운";
  if (capacityScore >= 12 && stressScore < 80) key = "대성";
  else if (stressScore >= 65) key = "형충";
  else if (stressScore >= 35) key = "평운";
  else key = "합운";

  return { key, stressScore, capacityScore };
};

// --- Persona generation helpers ---
const koreanNames = [
  "김하늘", "이서준", "박지민", "정은우", "최가은", "강도윤", "윤서연", "한지호",
  "서민재", "오시우", "장유진", "백다인", "심예준", "문서아", "유지호", "조시온",
  "송주하", "노하린", "신유찬", "안나율", "유채린", "표도현", "정리안", "공세은",
  "고지환", "명하윤", "기예서", "류도담", "하지안", "배이안", "박선율", "설아인",
  "라윤호", "엄채연", "유시안", "남수호", "임지효", "양하율", "진주안", "차지후"
];

const timeSlots = ["05:30", "08:30", "10:30", "13:30", "16:30", "21:30", "23:30"];

const desiredCounts = { "형충": 8, "평운": 10, "합운": 9, "대성": 3 }; // total 30, 대성 희귀
const stageBuckets = { "형충": [], "평운": [], "합운": [], "대성": [] };

// Generate a pool of candidates and bucket by stage
for (let year = 1975; year <= 1995; year++) {
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 28; day += 7) {
      for (const time of timeSlots) {
        const dob = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
        const vec = calculatePersonalVector(dob, time);
        const stage = calculateFortuneStage(vec).key;
        if (stageBuckets[stage].length < desiredCounts[stage] * 3) { // small buffer
          stageBuckets[stage].push({ dob, time, vec, stage });
        }
      }
    }
  }
}

const pickFromBucket = (stage, countNeeded) => {
  const arr = stageBuckets[stage];
  // simple shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, countNeeded);
};

const personas = [];
Object.entries(desiredCounts).forEach(([stage, count]) => {
  const selected = pickFromBucket(stage, count);
  if (selected.length < count) {
    throw new Error(`Not enough candidates for stage ${stage}`);
  }
  personas.push(...selected.map((c, idx) => ({
    name: koreanNames[(personas.length + idx) % koreanNames.length],
    dob: c.dob,
    birthTime: c.time,
    stagePlanned: stage
  })));
});

// Trim/limit to exactly 30 (already sums to 30)
const finalPersonas = personas.slice(0, 30);

const summaryCounts = { "형충": 0, "평운": 0, "합운": 0, "대성": 0 };

// --- Run fortune generation sequentially ---
const lines = [];
lines.push("# 30명 가상 인물 예시 결과");
lines.push("");

const run = async () => {
  const { calculateTeacherFortune } = await import("./src/utils/fortuneLogic.js");
  for (let i = 0; i < finalPersonas.length; i++) {
    const p = finalPersonas[i];
    const vec = calculatePersonalVector(p.dob, p.birthTime);
    const stageLocal = calculateFortuneStage(vec);
    const stage = stageLocal.key;
    summaryCounts[stage] = (summaryCounts[stage] || 0) + 1;
    try {
      const result = await calculateTeacherFortune(p.name, p.dob, p.birthTime);
      const stress = Number.isFinite(stageLocal.stressScore)
        ? stageLocal.stressScore.toFixed(1)
        : "NA";
      const cap = stageLocal.capacityScore;
      const gradeLabel = result.isDaeseong ? "교과전담" : `${result.gradeNumber}학년`;

      lines.push(`## ${i + 1}. ${p.name} (${p.dob} ${p.birthTime})`);
      lines.push(`- 예상 연운 단계: **${stage}** (스트레스 ${stress}, 안정+조율 ${cap})`);
      lines.push(`- 배정 결과: **${gradeLabel}**`);
      lines.push(`- 한줄 요약: ${result.headline}`);
      lines.push(`- 카드 사유: ${result.finalPredictionExplain.sajuReason}`);
      lines.push(`- 학교 해석: ${result.finalPredictionExplain.whatItMeansInSchool}`);
      lines.push(`- 학급 운영: ${result.managementAdvice.classOperation}`);
      lines.push(`- 학생 지도: ${result.managementAdvice.studentGuidance}`);
      lines.push(`- 학부모 소통: ${result.managementAdvice.parentCommunication}`);
      lines.push("");
    } catch (e) {
      lines.push(`## ${i + 1}. ${p.name} (${p.dob} ${p.birthTime})`);
      lines.push(`- 에러: ${e.message}`);
      lines.push("");
    }
  }

  lines.unshift(`- 형충: ${summaryCounts["형충"]}명, 평운: ${summaryCounts["평운"]}명, 합운: ${summaryCounts["합운"]}명, 대성: ${summaryCounts["대성"]}명`);
  lines.unshift("## 분포 요약");

  fs.writeFileSync("example.md", lines.join("\n"), "utf8");
  console.log("example.md 생성 완료");
};

run();
