// Removed import, using copied logic only.

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

    let v = { stable: 4, expressive: 4, control: 4, mediation: 4 };

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

    // Logic: Stress = Sum of (Gap ^ 2.0) * Multiplier
    // Using power of 2.0 (Square) to strictly penalize gaps.

    // 1. Expressive Gap (Target 7)
    stress += Math.pow(Math.max(0, 7 - personalVec.expressive), 2.0);

    // 2. Control Gap (Target 7)
    stress += Math.pow(Math.max(0, 7 - personalVec.control), 2.0);

    // 3. Mediation Gap (Target 7)
    stress += Math.pow(Math.max(0, 7 - personalVec.mediation), 2.0);

    // 4. Stable Gap (Target 5)
    stress += Math.pow(Math.max(0, 5 - personalVec.stable), 2.0);

    // Avg Gap 2 -> 4. Total 16.
    // Multiplier 3.0 -> Score 48 (Pyeong-Un).

    const stressScore = Math.min(100, stress * 3.0);

    let key = "평운";
    // Thresholds
    if (stressScore >= 60) key = "형충"; // High stress
    else if (stressScore >= 35) key = "평운"; // Moderate stress
    else {
        // Relaxed Daeseong: Score < 60 AND Sum >= 12
        // Allow any non-Hyung-Chung stress if capacity is high.
        if (stressScore < 60 && (personalVec.stable + personalVec.mediation) >= 12) {
            key = "대성";
        } else {
            key = "합운";
        }
    }
    return { key, stressScore };
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

        if (i < 5) {
            console.log(`Vec: ${JSON.stringify(pVec)}, Stress: ${stressScore.toFixed(1)}, Key: ${key}`);
        }

        results[key]++;
    }

    console.log("Distribution (N=1000):");
    Object.keys(results).forEach(k => {
        console.log(`${k}: ${results[k]} (${(results[k] / total * 100).toFixed(1)}%)`);
    });
};

runTest();
