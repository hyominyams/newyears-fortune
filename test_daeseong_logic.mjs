
const calculatePersonalVector = (month, timeBucket) => {
    let v = { stable: 4, expressive: 4, control: 4, mediation: 4 };

    // Season
    if (month >= 3 && month <= 5) { v.expressive += 2; v.mediation += 2; }
    else if (month >= 6 && month <= 8) { v.expressive += 3; v.control -= 1; }
    else if (month >= 9 && month <= 11) { v.control += 2; v.stable += 2; }
    else { v.stable += 3; v.mediation += 1; }

    // Time
    switch (timeBucket) {
        case 'dawn': v.mediation += 2; break; // In/Myo (03-07)
        case 'morning': v.control += 2; break;
        case 'afternoon': v.expressive += 2; break;
        case 'evening': v.stable += 2; break;
        case 'night': v.expressive += 1; v.mediation -= 1; break;
    }

    Object.keys(v).forEach(k => v[k] = Math.max(0, Math.min(10, v[k])));
    return v;
};

const run = () => {
    // Test Winter Dawn (Max Capacity Candidate)
    // Month 12, Dawn
    const v = calculatePersonalVector(12, 'dawn');

    // Calculate Stress
    let stress = 0;
    stress += Math.pow(Math.max(0, 7 - v.expressive), 2.0);
    stress += Math.pow(Math.max(0, 7 - v.control), 2.0);
    stress += Math.pow(Math.max(0, 7 - v.mediation), 2.0);
    stress += Math.pow(Math.max(0, 5 - v.stable), 2.0); // Target 5

    const score = Math.min(100, stress * 4.0);
    const sum = v.stable + v.mediation;

    console.log(`Winter Dawn Vector: E:${v.expressive} C:${v.control} M:${v.mediation} S:${v.stable}`);
    console.log(`Sum (S+M): ${sum}`);
    console.log(`Stress Raw: ${stress}`);
    console.log(`Stress Score: ${score}`);

    let result = "???";
    if (sum >= 12 && score < 80) result = "Daeseong";
    else if (score >= 65) result = "Hyung-Chung";
    else if (score >= 25) result = "Pyeong-Un";
    else result = "Hap-Un";
    console.log(`Result: ${result}`);
};

run();
