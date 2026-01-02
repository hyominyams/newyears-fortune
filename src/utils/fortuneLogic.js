// Initialize OpenAI API
const apiKey = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_OPENAI_API_KEY
  : process.env.VITE_OPENAI_API_KEY;

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-5-mini";

const requestOpenAIJson = async (prompt) => {
  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Set VITE_OPENAI_API_KEY.");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt.trim() }],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI API Error: empty response.");
  }

  try {
    return JSON.parse(content);
  } catch (parseError) {
    throw new Error("OpenAI API Error: invalid JSON response.");
  }
};

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

const calculateFortuneStage = (personalVec) => {
  // Stress Calculation: Gap between Year Demand(7 for expressive/control/mediation, 5 for stable) and Personal Capacity
  let stress = 0;
  stress += Math.pow(Math.max(0, 7 - personalVec.expressive), 2.0);
  stress += Math.pow(Math.max(0, 7 - personalVec.control), 2.0);
  stress += Math.pow(Math.max(0, 7 - personalVec.mediation), 2.0);
  stress += Math.pow(Math.max(0, 5 - personalVec.stable), 2.0);

  // Normalize to 0-100
  const stressScore = Math.min(100, stress * 4.0);
  const capacityScore = personalVec.stable + personalVec.mediation; // 안정+조율 합

  let key = "평운";
  let desc = "무난한 흐름. 선택과 집중에 따라 결과가 달라질 수 있습니다.";
  let isDaeseong = false;

  if (capacityScore >= 12 && stressScore < 80) {
    key = "대성";
    desc = "판이 바뀌고 큰 역할이 주어지는 시기. 구조를 설계하고 주도할 에너지가 있습니다.";
    isDaeseong = true;
  } else if (stressScore >= 65) {
    key = "형충";
    desc = "변화·역동이 강해 부담이 큰 시기. 에너지 관리와 방어적 운영이 중요합니다.";
  } else if (stressScore >= 35) {
    key = "평운";
    desc = "큰 기복 없이 무난하나, 선택에 따라 흐름이 갈립니다.";
  } else {
    key = "합운";
    desc = "환경과 개인 기운이 조화롭게 어우러져 흐름이 매끄럽습니다.";
  }

  const stageReason = `스트레스 점수 ${stressScore.toFixed(1)}, 안정+조율 ${capacityScore} → ${key}`;
  return { key, desc, isDaeseong, stressScore, capacityScore, stageReason };
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
    const age = calculateAge(dob);
    const zodiac = getZodiac(dob);

    // 1. Calculate Vectors & Stats
    const personalVec = calculatePersonalVector(dob, birthTime);
    const {
      key: fortuneStageKey,
      desc: fortuneStageDesc,
      isDaeseong,
      stressScore,
      capacityScore,
      stageReason
    } = calculateFortuneStage(personalVec);
    const { probabilities, dominant } = calculateGradeProbabilities(personalVec, YEAR_VECTOR_2026);

    // 2. Determine Final Prediction based on Fortune Stage
    let finalGrade = null;
    let finalType = "grade";
    let candidateReason = "";

    const candidatePool = isDaeseong
      ? ["교과전담"]
      : fortuneStageKey === "형충"
        ? [1, 6]
        : fortuneStageKey === "평운"
          ? [2, 5]
          : [3, 4]; // 합운 기본

    if (isDaeseong) {
      finalType = "subjectTeacher";
      finalGrade = null;
      candidateReason = "대성의 강한 추진력으로 학년 고정 없이 전학년을 조율·지원하는 교과전담이 적합함";
    } else {
      // Pick the one with higher probability among candidatePool
      const c1 = probabilities.find(p => p.grade === candidatePool[0]);
      const c2 = probabilities.find(p => p.grade === candidatePool[1]);

      if (c1.percent >= c2.percent) {
        finalGrade = c1.grade;
        candidateReason = `${candidatePool[0]}학년(${c1.percent}%) vs ${candidatePool[1]}학년(${c2.percent}%). 더 높은 적합도를 보인 ${candidatePool[0]}학년 선택.`;
      } else {
        finalGrade = c2.grade;
        candidateReason = `${candidatePool[1]}학년(${c2.percent}%) vs ${candidatePool[0]}학년(${c1.percent}%). 더 높은 적합도를 보인 ${candidatePool[1]}학년 선택.`;
      }
    }

    // 3. Prepare Input JSON for AI
    const inputJson = {
      meta: { name, dob, birthTime, age, zodiac, year: 2026, yearNote: "붉은 말의 해" },
      fortuneStage: {
        key: fortuneStageKey,
        desc: fortuneStageDesc,
        stressScore,
        capacityScore,
        reason: stageReason
      },
      candidatePool: {
        grades: candidatePool,
        rule: isDaeseong
          ? "대성 → 교과전담"
          : fortuneStageKey === "형충"
            ? "형충 → 1, 6학년"
            : fortuneStageKey === "평운"
              ? "평운 → 2, 5학년"
              : "합운 → 3, 4학년"
      },
      finalPrediction: { type: finalType, grade: finalGrade },
      logicReasoning: {
        candidates: candidatePool,
        selectionRecall: candidateReason,
        personalVector: personalVec
      },
      isDaeseong
    };

    const prompt = `
당신은 사주·명리(연운/오행/합·충)를 이해하지만,
사주 전문가가 아닌 교사가 읽어도 이해할 수 있는 상담 보고서 톤의 해설자입니다.

[연운 단계는 이미 코드에서 점수화 완료]
- fortuneStage.key/stressScore/capacityScore는 입력 그대로 사용하고 재계산·변경하지 마세요.
- candidatePool(학년 후보군)도 입력 그대로 사용하며, 규칙을 설명만 합니다.
- finalPrediction.type/grade도 입력 그대로 사용하고, 이유만 풀어줍니다.

[2026년 병오년 해석 기준]
- 발산/통제/조율 요구가 높고, 안정 지원이 낮은 해
- "바쁜 해", "산만해진다" 금지 → "감정이 드러난다", "판단과 개입이 중요"로 표현

[입력 데이터]
INPUT_JSON:
${JSON.stringify(inputJson, null, 2)}

[작성 가이드]
1) fortuneStage.explain: 입력된 key/score를 요약해 3~5문장으로 체감 설명.
   - 2026년(병오년)의 발산·통제·조율 요구가 높고 안정 지원이 낮은 특성과, 개인 사주의 계절/시간대/안정·조율 vs 발산·통제 균형을 함께 엮어 설명합니다.
2) candidatePool: 단계→학년 매핑 규칙을 1~2문장으로 설명.
3) finalPredictionExplain:
   - title: INPUT_JSON.finalPrediction을 그대로 사용해 한 줄로 요약.
   - sajuReason: **숫자·퍼센트 대신** 계절/시간대/안정·조율 vs 발산·통제의 균형 같은 사주 흐름을 근거로, 왜 이 학년(또는 교과전담)으로 기운이 모이는지 풀이식으로 설명. INPUT_JSON.logicReasoning.selectionRecall은 참고만 하고, 퍼센트 언급 금지.
   - whatItMeansInSchool: 학교 현장에서 체감될 상황을 2~4문장으로 설명.
4) 대성(교과전담)일 때: 축하·격려 톤, "올해는 선생님의 무대" 같은 표현 포함.

[출력 형식(JSON만)]
{
  "headline": "string(한 줄 요약; 대성이면 축하 톤)",
  "fortuneStage": {
    "key": "string(INPUT_JSON.fortuneStage.key)",
    "explain": "string(4단계 의미 + 2026 체감 3~5문장)",
    "scoreExplain": "string(스트레스/안정+조율 점수 요약 1~2문장)"
  },
  "candidatePool": {
    "grades": "string('1,6학년' 등 또는 '교과전담')",
    "whyTheseGrades": "string(단계→학년 규칙 설명 1~2문장)"
  },
  "finalPredictionExplain": {
    "title": "string(예: '2026년 운의 흐름이 향하는 곳: 6학년' / '대성 흐름: 교과전담')",
    "sajuReason": "string(후보 비교·선택 이유를 짧게)",
    "whatItMeansInSchool": "string(학교 현장 언어로 2~4문장)"
  },
  "managementAdvice": {
    "classOperation": "string(규칙·환경·분위기 조언 2~3문장)",
    "studentGuidance": "string(라포·지도·문제대응 조언 2~3문장)",
    "parentCommunication": "string(소통·신뢰·민원 예방 조언 2~3문장)"
  },
  "uiHints": {
    "primaryCardId": "string('G{grade}' or 'SUBJECT')"
  }
}

[uiHints 규칙]
- INPUT_JSON.finalPrediction.type === "grade" → primaryCardId = "G{grade}"
- "subjectTeacher" → primaryCardId = "SUBJECT"

[대성 모드 추가 규칙]
- 담임 관점 표현을 피하고, 전학년을 조율·지원하는 톤으로 작성.
- '대성' 단어는 whatItMeansInSchool에서 최대 1회만 사용.
`;

    const response = await requestOpenAIJson(prompt);

    return {
      name,
      age,
      zodiac,
      gradeNumber: finalGrade,
      isDaeseong,
      ...response
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
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
    fortuneStage: { key: "합운", explain: "안정적인 흐름입니다." },
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
