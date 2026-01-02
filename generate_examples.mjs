
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

    // Base weights (Final: 4)
    let v = { stable: 4, expressive: 4, control: 4, mediation: 4 };

    // Season Adjustments
    if (month >= 3 && month <= 5) { v.expressive += 2; v.mediation += 2; }
    else if (month >= 6 && month <= 8) { v.expressive += 3; v.control -= 1; }
    else if (month >= 9 && month <= 11) { v.control += 2; v.stable += 2; }
    else { v.stable += 3; v.mediation += 1; }

    // Time Bucket Adjustments
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

    // Gaps (Squared)
    stress += Math.pow(Math.max(0, 7 - personalVec.expressive), 2.0);
    stress += Math.pow(Math.max(0, 7 - personalVec.control), 2.0);
    stress += Math.pow(Math.max(0, 7 - personalVec.mediation), 2.0);
    stress += Math.pow(Math.max(0, 5 - personalVec.stable), 2.0);

    // Multiplier 4.0
    const stressScore = Math.min(100, stress * 4.0);

    let key = "Pyeong-Un";

    // Daeseong Check (Priority): High Capacity AND Tolerable Stress
    // Logic matches fortuneLogic.js exactly
    if ((personalVec.stable + personalVec.mediation) >= 12 && stressScore < 80) {
        key = "Daeseong (Great Success)";
    } else if (stressScore >= 65) {
        key = "Hyung-Chung (Clash)";
    } else if (stressScore >= 25) {
        key = "Pyeong-Un (Average)";
    } else {
        key = "Hap-Un (Harmony)";
    }
    return { key, stressScore };
};

const generateRandomData = () => {
    const year = 1970 + Math.floor(Math.random() * 30);
    const month = 1 + Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    const dob = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;

    const hour = Math.floor(Math.random() * 24);
    const time = `${hour.toString().padStart(2, '0')}:00`;

    return { dob, time };
};

const main = () => {
    console.log("# 10 Random Fortune Examples (English Output)");
    console.log("| No | DOB | Time | Vector (S/E/C/M) | Stress | Result |");
    console.log("|---|---|---|---|---|---|");

    for (let i = 1; i <= 10; i++) {
        const { dob, time } = generateRandomData();
        const pVec = calculatePersonalVector(dob, time);
        const { key, stressScore } = calculateFortuneStage(pVec);

        const vecStr = `${pVec.stable}/${pVec.expressive}/${pVec.control}/${pVec.mediation}`;
        console.log(`| ${i} | ${dob} | ${time} | ${vecStr} | ${stressScore.toFixed(0)} | **${key}** |`);
    }
};

main();
