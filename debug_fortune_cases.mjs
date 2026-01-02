
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

const calculatePersonalVector = (month, timeBucket) => {
    // Base weights (Current Logic: 4)
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
    const g1 = Math.pow(Math.max(0, 7 - personalVec.expressive), 2.0);
    const g2 = Math.pow(Math.max(0, 7 - personalVec.control), 2.0);
    const g3 = Math.pow(Math.max(0, 7 - personalVec.mediation), 2.0);
    const g4 = Math.pow(Math.max(0, 5 - personalVec.stable), 2.0);

    stress = g1 + g2 + g3 + g4;
    const stressScore = Math.min(100, stress * 3.0);

    let key = "평운";
    if (stressScore >= 60) key = "형충 (Clash)";
    else if (stressScore >= 35) key = "평운 (Average)";
    else key = "합운 (Harmony)";

    // Partial output for debugging
    return {
        key,
        stressScore: stressScore.toFixed(1),
        details: `E:${personalVec.expressive}(${g1}) C:${personalVec.control}(${g2}) M:${personalVec.mediation}(${g3}) S:${personalVec.stable}(${g4})`
    };
};

const cases = [
    { name: "Spring Morning (3월, 09:00)", month: 4, time: "morning" },
    { name: "Summer Afternoon (7월, 13:00)", month: 7, time: "afternoon" },
    { name: "Autumn Evening (10월, 17:00)", month: 10, time: "evening" },
    { name: "Winter Night (1월, 23:00)", month: 1, time: "night" },
    { name: "Spring Dawn (4월, 05:00)", month: 4, time: "dawn" },
    { name: "Summer Night (8월, 21:00)", month: 8, time: "night" }
];

console.log("=== Fortune Logic Debug (Base 4, Target 7/7/7/5, SqGap, Mult 3.0) ===");
cases.forEach(c => {
    const v = calculatePersonalVector(c.month, c.time);
    const result = calculateFortuneStage(v);
    console.log(`\n[${c.name}]`);
    console.log(`Vector: ${JSON.stringify(v)}`);
    console.log(`Gaps (Sq): ${result.details}`);
    console.log(`Total Score: ${result.stressScore} -> ${result.key}`);
});
