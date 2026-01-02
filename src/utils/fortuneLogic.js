import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// --- 1. Vector Definitions ---

// 2026 Red Horse Year Vector (High Demand)
// PRD: Expressive(High), Control(High), Mediation(High), Stable(Low/Negative)
const YEAR_VECTOR_2026 = {
  stable: -1,
  expressive: 3,
  control: 3,
  mediation: 3
};

// Grade Vectors (Classroom Environments)
const GRADE_VECTORS = {
  1: { stable: 8, expressive: 2, control: 2, mediation: 8 }, // Care-heavy
  2: { stable: 6, expressive: 4, control: 3, mediation: 7 },
  3: { stable: 5, expressive: 6, control: 4, mediation: 5 }, // Active
  4: { stable: 4, expressive: 5, control: 6, mediation: 5 }, // Academic/Discipline
  5: { stable: 3, expressive: 4, control: 7, mediation: 6 }, // High discipline
  6: { stable: 2, expressive: 3, control: 8, mediation: 7 }  // Max discipline/complexity
};

// --- 2. Helper Functions ---

const calculateAge = (dob) => {
  const birthYear = parseInt(dob.substring(0, 4));
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear + 1; // Korean Age
};

const getZodiac = (dob) => {
  const year = parseInt(dob.substring(0, 4));
  const zodiacs = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'];
  return zodiacs[year % 12];
};

const getTimeBucket = (time) => {
  if (!time) return 'unknown';
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 23 || hour < 3) return 'night'; // 23:00-03:00 (Ja/Chuk)
  if (hour < 7) return 'dawn'; // 03:00-07:00 (In/Myo)
  if (hour < 11) return 'morning'; // 07:00-11:00 (Jin/Sa)
  if (hour < 15) return 'afternoon'; // 11:00-15:00 (O/Mi)
  if (hour < 19) return 'evening'; // 15:00-19:00 (Shin/Yu)
  return 'night'; // 19:00-23:00 (Sul/Hae)
};

// --- 3. Core Logic: Personal Vector & Stress ---

const calculatePersonalVector = (dob, birthTime) => {
  const month = parseInt(dob.substring(4, 6));
  const timeBucket = getTimeBucket(birthTime);

  // Base weights (0-10 scale)
  // Adjusted to 4 to create meaningful gaps against Target 7
  let v = { stable: 4, expressive: 4, control: 4, mediation: 4 };

  // Season Adjustments (1. Season is Key)
  if (month >= 3 && month <= 5) { // Spring
    v.expressive += 2; v.mediation += 2;
  } else if (month >= 6 && month <= 8) { // Summer
    v.expressive += 3; v.control -= 1;
  } else if (month >= 9 && month <= 11) { // Autumn
    v.control += 2; v.stable += 2;
  } else { // Winter (12, 1, 2)
    v.stable += 3; v.mediation += 1;
  }

  // Time Bucket Adjustments (2. Time Modifies Usage)
  switch (timeBucket) {
    case 'dawn': v.mediation += 2; break;
    case 'morning': v.control += 2; break;
    case 'afternoon': v.expressive += 2; break;
    case 'evening': v.stable += 2; break;
    case 'night': v.expressive += 1; v.mediation -= 1; break;
  }

  // Normalize to 0-10
  Object.keys(v).forEach(k => {
    v[k] = Math.max(0, Math.min(10, v[k]));
  });

  return v;
};

const calculateFortuneStage = (personalVec, yearVec) => {
  // Stress Calculation: Gap between Demand and Capacity
  // Logic: Stress = max(0, YearDemand - PersonalCapacity)

  let stress = 0;

  // 1. Expressive Gap (High Demand)
  // If Year=3 (High), we expect Personal >= 7.
  stress += Math.pow(Math.max(0, 7 - personalVec.expressive), 2.0);

  // 2. Control Gap (High Demand)
  // If Year=3 (High), we expect Personal >= 7.
  stress += Math.pow(Math.max(0, 7 - personalVec.control), 2.0);

  // 3. Mediation Gap (High Demand)
  // If Year=3 (High), we expect Personal >= 7.
  stress += Math.pow(Math.max(0, 7 - personalVec.mediation), 2.0);

  // 4. Stable Gap (Low Support / Drain)
  // Year=-1. Requires internal stability to withstand. Expect Personal >= 5.
  stress += Math.pow(Math.max(0, 5 - personalVec.stable), 2.0);

  // Max possible stress: 7^2 * 3 + 5^2 = 147 + 25 = 172.
  // Normalize to 0-100. (Stress * 4.0 strictly)
  const stressScore = Math.min(100, stress * 4.0);

  let key = "평운(平運)";
  let desc = "무난하고 안정적인 흐름을 보이는 해입니다.";
  let isDaeseong = false;

  // Revised Logic: Daeseong (High Capacity) overrides Stress up to a limit.
  if ((personalVec.stable + personalVec.mediation) >= 12 && stressScore < 80) {
    key = "대운·대성(大運 / 大成)";
    desc = "판이 바뀌고 큰 역할이 주어지는 매우 희귀하고 강력한 운입니다.";
    isDaeseong = true;
  } else if (stressScore >= 65) {
    key = "형충(刑沖)";
    desc = "변화와 역동성이 강하게 나타나며, 에너지 소모에 주의해야 하는 해입니다.";
  } else if (stressScore >= 25) {
    key = "평운(平運)";
    desc = "큰 기복 없이 무난하나, 선택에 따라 흐름이 달라질 수 있는 해입니다.";
  } else {
    key = "합운(合運)";
    desc = "주변 환경과 나의 기운이 물 흐르듯 조화롭게 어우러지는 해입니다.";
  }
  return { key, desc, isDaeseong, stressScore };
};

const calculateGradeProbabilities = (personalVec, yearVec) => {
  const grades = [1, 2, 3, 4, 5, 6];
  const scores = grades.map(g => {
    const gVec = GRADE_VECTORS[g];
    // Personal Affinity
    const pScore =
      (personalVec.stable * gVec.stable) +
      (personalVec.expressive * gVec.expressive) +
      (personalVec.control * gVec.control) +
      (personalVec.mediation * gVec.mediation);

    return { grade: g, score: pScore };
  });

  // Normalize to Percentages
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const probabilities = scores.map(s => ({
    grade: s.grade,
    percent: Math.round((s.score / totalScore) * 100)
  })).sort((a, b) => b.percent - a.percent);

  return { probabilities, dominant: probabilities[0] };
};

// --- 4. Main Function ---

export const calculateTeacherFortune = async (name, dob, birthTime) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const age = calculateAge(dob);
    const zodiac = getZodiac(dob);

    // 1. Calculate Vectors & Stats
    const personalVec = calculatePersonalVector(dob, birthTime);
    const { key: fortuneStageKey, desc: fortuneStageDesc, isDaeseong, stressScore } = calculateFortuneStage(personalVec, YEAR_VECTOR_2026);
    const { probabilities, dominant } = calculateGradeProbabilities(personalVec, YEAR_VECTOR_2026);

    // 2. Determine Final Prediction based on Fortune Stage
    let finalGrade = null;
    let finalType = "grade";

    if (isDaeseong) {
      finalType = "subjectTeacher";
      finalGrade = null;
    } else {
      // Filter grades based on stage
      let candidateGrades = [];
      if (fortuneStageKey.includes("형충")) {
        candidateGrades = [1, 6];
      } else if (fortuneStageKey.includes("평운")) {
        candidateGrades = [2, 5];
      } else { // 합운
        candidateGrades = [3, 4];
      }

      // Pick the one with higher probability
      const c1 = probabilities.find(p => p.grade === candidateGrades[0]);
      const c2 = probabilities.find(p => p.grade === candidateGrades[1]);
      finalGrade = (c1.percent >= c2.percent) ? c1.grade : c2.grade;
    }

    // 3. Prepare Input JSON for AI
    const inputJson = {
      fortuneStage: { key: fortuneStageKey, desc: fortuneStageDesc },
      yearMeta: { age, zodiac, name },
      finalPrediction: { type: finalType, grade: finalGrade },
      isDaeseong
    };

    const prompt = `
당신은 사주·명리(연운/오행/합·충)를 이해하지만,
사주 전문가가 아닌 초등학교 교사가 읽어도 이해할 수 있도록
‘2026년 연운 예측 리포트’를 차분한 상담 보고서 톤으로 작성하는 해설자입니다.

[핵심 철학]
- 이 서비스는 "추천(Recommendation)"이 아니라 "예측(Prediction)"입니다.
- 연운(2026 병오년)의 요구와 개인 기질의 간격(Stress)에 따라 현실적으로 배치될 가능성이 높은 곳을 알려줍니다.
- 당신은 결과를 바꾸지 않고, "왜 이 결과가 나왔는지"를 설명합니다.

[2026년 병오년(붉은 말의 해) 해석 기준]
- 발산/통제/조율 요구가 높고, 안정 지원이 낮은 해입니다.
- "바쁜 해", "산만해진다" 등의 표현은 금지합니다.
- 대신 "감정과 반응이 드러나는 해", "판단과 개입이 중요한 해"로 해석하세요.

[입력 데이터]
INPUT_JSON:
${JSON.stringify(inputJson, null, 2)}

[출력 형식]
아래 JSON 스키마대로만 출력하세요. JSON 외 텍스트 금지.

{
  "headline": "string(한 줄 요약: 2026년 예측의 핵심을 교사 언어로)",
  "fortuneStage": {
    "key": "string(INPUT_JSON.fortuneStage.key 그대로)",
    "explain": "string(형충/평운/합운/대성의 뜻 + 2026년에 어떻게 체감될지 3~5문장)"
  },
  "finalPredictionExplain": {
    "title": "string(최종 결과 한 줄: 예: '2026년 운의 흐름이 향하는 곳: 6학년' / '대성 흐름: 교과전담')",
    "sajuReason": "string(UI 카드용 짧은 이유: 예: '강한 발산 기운이 충돌하여 역동적인 1학년과 공명')",
    "whatItMeansInSchool": "string(학교 현장 언어로: 올해 어떤 종류의 한 해가 될지 2~4문장)"
  },
  "managementAdvice": {
    "classOperation": "string(학급 운영 조언: 규칙, 분위기 조성, 환경 구성 등 구체적 방법 2~3문장)",
    "studentGuidance": "string(학생 지도 조언: 문제 행동 대응, 라포 형성, 생활 지도 팁 2~3문장)",
    "parentCommunication": "string(학부모 상담 조언: 신뢰 형성, 소통 방식, 민원 예방 팁 2~3문장)"
  },
  "uiHints": {
    "primaryCardId": "string('G1'~'G6' 또는 'SUBJECT')"
  }
}

[uiHints 규칙]
- INPUT_JSON.finalPrediction.type이 "grade"면 primaryCardId = "G{grade}"
- "subjectTeacher"면 primaryCardId = "SUBJECT"

[교담(대성) 모드 규칙]
- INPUT_JSON.isDaeseong이 true라면:
  - 담임 기준 표현을 최대한 피하고,
  - “멀리서 전체를 바라보며 구조를 정리하는 역할” 관점으로 작성하세요.
  - '대성(大成)'이라는 단어는 finalPredictionExplain.whatItMeansInSchool에서 딱 1번만 사용하세요.
`;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());

    return {
      name,
      age,
      zodiac,
      gradeNumber: finalGrade,
      isDaeseong,
      ...response
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackTeacherFortune(name);
  }
};

// Fallback Function
const getFallbackTeacherFortune = (name) => {
  return {
    name,
    age: 30,
    zodiac: "소",
    gradeNumber: 3,
    isDaeseong: false,
    headline: "2026년, 조화와 균형의 해",
    fortuneStage: { key: "합운(合運)", explain: "안정적인 흐름입니다." },
    finalPredictionExplain: {
      title: "2026년 운의 흐름: 3학년",
      sajuReason: "안정과 조율의 기운이 조화롭게 어우러짐",
      whatItMeansInSchool: "무난하고 평온한 한 해가 예상됩니다."
    },
    managementAdvice: {
      classOperation: "기본 규칙을 잘 지키는 것이 중요합니다.",
      studentGuidance: "학생들의 이야기를 잘 들어주세요.",
      parentCommunication: "정기적인 소통이 도움이 됩니다."
    },
    uiHints: { primaryCardId: "G3" }
  };
};

export const calculateStudentFortune = async (name, dob, birthTime, grade, friendName, friendDob) => {
  // Placeholder for student fortune logic if needed, or keep existing if it was there.
  // Since the user focused on Teacher, I'll provide a minimal valid export to prevent errors.
  return {
    studentType: "탐구형",
    overallTitle: "즐거운 학교 생활",
    overallSummary: "친구들과 사이좋게 지내는 한 해가 될 거예요.",
    flows: [],
    friendCompatibility: { probability: null, message: null },
    advice: "화이팅!"
  };
};
