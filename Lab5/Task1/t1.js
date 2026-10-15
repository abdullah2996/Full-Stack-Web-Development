const applicants = [
    {
        id: 'A101',
        name: 'Sara Khan',
        age: '19',
        matricMarks: '91',
        intermediateMarks: '87',
        entryTest: '78',
        program: 'BSCS',
        feePaid: 'true'
    },
    {
        id: 'A102',
        name: 'Ahmed Ali',
        age: 'twenty',
        matricMarks: '88',
        intermediateMarks: '',
        entryTest: '72',
        program: 'BSSE',
        feePaid: 'false'
    },
    {
        id: 'A103',
        name: 'Hassan',
        age: '18',
        matricMarks: '76',
        intermediateMarks: '83',
        entryTest: '91',
        program: 'BSAI',
        feePaid: 'true'
    }
];

const supportedPrograms = ['BSCS', 'BSSE', 'BSAI'];

function isMissing(value) {
    return value === undefined ||
           value === null ||
           (typeof value === 'string' && value.trim() === '');
}

function processApplicant(applicant) {
    const errors = [];

    if (!applicant || typeof applicant !== 'object' ||
        Array.isArray(applicant)) {
        return {
            id: 'Unknown',
            name: 'Unknown',
            status: 'INVALID DATA',
            errors: ['Invalid applicant record']
        };
    }

    const { id, name, program } = applicant;

    if (isMissing(id)) {
        errors.push('Missing applicant ID');
    }

    if (isMissing(name)) {
        errors.push('Missing applicant name');
    }

    if (isMissing(program)) {
        errors.push('Missing program');
    } else if (!supportedPrograms.includes(program)) {
        errors.push('Unsupported program');
    }

    const age = Number(applicant.age);
    const matric = Number(applicant.matricMarks);
    const intermediate = Number(applicant.intermediateMarks);
    const entryTest = Number(applicant.entryTest);

    const numericFields = [
        { name: 'Age', original: applicant.age, value: age },
        { name: 'Matric marks', original: applicant.matricMarks, value: matric },
        {
            name: 'Intermediate marks',
            original: applicant.intermediateMarks,
            value: intermediate
        },
        { name: 'Entry test', original: applicant.entryTest, value: entryTest }
    ];

    for (const field of numericFields) {
        if (isMissing(field.original)) {
            errors.push('Missing ' + field.name);
        } else if (!Number.isFinite(field.value)) {
            errors.push('Invalid ' + field.name);
        }
    }

    if (Number.isFinite(age) && (age < 17 || age > 30)) {
        errors.push('Age must be between 17 and 30');
    }

    const marks = [
        { name: 'Matric marks', value: matric },
        { name: 'Intermediate marks', value: intermediate },
        { name: 'Entry test', value: entryTest }
    ];

    for (const mark of marks) {
        if (Number.isFinite(mark.value) &&
            (mark.value < 0 || mark.value > 100)) {
            errors.push(mark.name + ' must be between 0 and 100');
        }
    }

    let feePaid;

    if (applicant.feePaid === 'true' || applicant.feePaid === true) {
        feePaid = true;
    } else if (
        applicant.feePaid === 'false' ||
        applicant.feePaid === false
    ) {
        feePaid = false;
    } else {
        errors.push('Invalid fee payment value');
    }

    // Do not calculate merit if the application has invalid data.
    if (errors.length > 0) {
        return {
            id: id ?? 'Unknown',
            name: name ?? 'Unknown',
            program: program ?? 'Unknown',
            feePaid,
            merit: null,
            status: 'INVALID DATA',
            errors
        };
    }

    const merit = Number((
        matric * 0.20 +
        intermediate * 0.30 +
        entryTest * 0.50
    ).toFixed(2));

    let status;

    if (
        merit >= 80 &&
        entryTest >= 60 &&
        intermediate >= 60
    ) {
        status = 'SELECTED';
    } else if (
        merit >= 70 &&
        entryTest >= 60 &&
        intermediate >= 60
    ) {
        status = 'WAITING';
    } else {
        status = 'REJECTED';
    }

    return {
        id,
        name,
        age,
        program,
        matricMarks: matric,
        intermediateMarks: intermediate,
        entryTest,
        feePaid,
        merit,
        status,
        errors
    };
}

function generateSummary(results) {
    const validApplicants = results.filter(
        applicant => applicant.status !== 'INVALID DATA'
    );

    const invalidApplicants = results.filter(
        applicant => applicant.status === 'INVALID DATA'
    );

    const meritApplicants = validApplicants.filter(
        applicant => applicant.merit !== null
    );

    const programCounts = {
        BSCS: 0,
        BSSE: 0,
        BSAI: 0
    };

    for (const applicant of results) {
        if (supportedPrograms.includes(applicant.program)) {
            programCounts[applicant.program]++;
        }
    }

    let highestMeritApplicant = null;
    let lowestMerit = null;
    let totalMerit = 0;

    for (const applicant of meritApplicants) {
        totalMerit += applicant.merit;

        if (
            highestMeritApplicant === null ||
            applicant.merit > highestMeritApplicant.merit
        ) {
            highestMeritApplicant = applicant;
        }

        if (lowestMerit === null || applicant.merit < lowestMerit) {
            lowestMerit = applicant.merit;
        }
    }

    const averageMerit = meritApplicants.length > 0
        ? Number((totalMerit / meritApplicants.length).toFixed(2))
        : null;

    return {
        totalApplicants: results.length,
        validApplicants: validApplicants.length,
        invalidApplicants: invalidApplicants.length,
        highestMeritApplicant: highestMeritApplicant
            ? {
                name: highestMeritApplicant.name,
                merit: highestMeritApplicant.merit
            }
            : null,
        lowestMerit,
        averageMerit,
        programCounts
    };
}

const results = applicants.map(processApplicant);
const summary = generateSummary(results);

console.log('Admission Results:');
console.log(JSON.stringify(results, null, 2));

console.log('Final Summary:');
console.log(JSON.stringify(summary, null, 2));