import { calculateTeacherFortune } from './src/utils/fortuneLogic.js';

// Mock Gemini API to avoid actual calls and just test logic
// We need to bypass the actual API call in calculateTeacherFortune
// Since I cannot easily mock the internal API call without modifying the code, 
// I will copy the logic parts I need to test into this script.

// --- COPIED LOGIC FROM fortuneLogic.js ---

const YEAR_VECTOR_2026 = {
    stable: -1,
    expressive: 3,
    control: 3,
    mediation: 3
};

const getTimeBucket = (time) => {
    if (!time) return 'unknown';
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 23 || hour < 3) return 'night';
    if (hour < 7) return 'dawn';
    if (hour < 11) return 'morning';
    if (hour < 15) return 'afternoon';
    if (hour < 19) return 'evening';
    return 'night';
};

const calculatePersonalVector = (dob, birthTime) => {
    const month = parseInt(dob.substring(4, 6));
    const timeBucket = getTimeBucket(birthTime);

    let v = { stable: 5, expressive: 5, control: 5, mediation: 5 };

    if (month >= 3 && month <= 5) { v.expressive += 2; v.mediation += 2; }
    else if (month >= 6 && month <= 8) { v.expressive += 3; v.control -= 1; }
    else if (month >= 9 && month <= 11) { v.control += 2; v.stable += 2; }
    else { v.stable += 3; v.mediation += 1; }

    switch (timeBucket) {
        case 'dawn': v.mediation += 2; break;
        case 'morning': v.control += 2; break;
        case 'afternoon': v.expressive += 2; break;
        case 'evening': v.stable += 2; break;
        case 'night': v.expressive += 1; v.mediation -= 1; break;
    }

    Object.keys(v).forEach(k => {
        v[k] = Math.max(0, Math.min(10, v[k]));
    });

    return v;
};

const calculateFortuneStage = (personalVec) => {
    let stress = 0;
    stress += Math.max(0, 7 - personalVec.expressive);
    stress += Math.max(0, 7 - personalVec.control);
    stress += Math.max(0, 7 - personalVec.mediation);
    stress += Math.max(0, 5 - personalVec.stable);

    const stressScore = Math.min(100, stress * 4);

    let key = "평운";
    if (stressScore >= 60) key = "형충";
    else if (stressScore >= 35) key = "평운";
    else if (stressScore >= 15) key = "합운";
    else {
        if ((personalVec.stable + personalVec.mediation) >= 14) key = "대성";
        else key = "합운";
    }
    return { key, stressScore, personalVec };
};

// --- TEST RUNNER ---

const runTest = () => {
    const results = { "형충": 0, "평운": 0, "합운": 0, "대성": 0 };
    const total = 1000;

    for (let i = 0; i < total; i++) {
        // Random DOB (1970-2000)
        const year = 1970 + Math.floor(Math.random() * 30);
        const month = 1 + Math.floor(Math.random() * 12);
        const day = 1 + Math.floor(Math.random() * 28);
        const dob = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;

        // Random Time
        const hour = Math.floor(Math.random() * 24);
        const time = `${hour.toString().padStart(2, '0')}:00`;

        const pVec = calculatePersonalVector(dob, time);
        const { key, stressScore } = calculateFortuneStage(pVec);

        results[key]++;
    }

    console.log("Distribution (N=1000):");
    Object.keys(results).forEach(k => {
        console.log(`${k}: ${results[k]} (${(results[k] / total * 100).toFixed(1)}%)`);
    });
};

runTest();
