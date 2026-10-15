const results = [
    { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
    { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
    { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
    { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
    { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
    { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 }
];

// A. Result Processing

function getGrade(marks) {
    if (typeof marks !== 'number' || !Number.isFinite(marks) ||
        marks < 0 || marks > 100) {
        return 'Invalid';
    }

    if (marks >= 85) return 'A';
    if (marks >= 80) return 'A-';
    if (marks >= 75) return 'B+';
    if (marks >= 70) return 'B';
    if (marks >= 65) return 'B-';
    if (marks >= 60) return 'C+';
    if (marks >= 50) return 'C';

    return 'F';
}

function getGradePoints(grade) {
    switch (grade) {
        case 'A': return 4.00;
        case 'A-': return 3.70;
        case 'B+': return 3.30;
        case 'B': return 3.00;
        case 'B-': return 2.70;
        case 'C+': return 2.30;
        case 'C': return 2.00;
        case 'F': return 0.00;
        default: return null;
    }
}

const processedResults = results.map(student => {
    const grade = getGrade(student.marks);

    let status;

    if (grade === 'Invalid') {
        status = 'INVALID';
    } else if (student.marks >= 50) {
        status = 'PASS';
    } else {
        status = 'FAIL';
    }

    return {
        ...student,
        grade,
        status,
        gradePoints: getGradePoints(grade)
    };
});

console.log('A. Processed Results');

processedResults.forEach(student => {
    console.log(student);
});


// B. Ranked Merit List

// sort() changes the array, so make a copy first.
const meritList = [...processedResults].sort((a, b) => {
    if (b.marks !== a.marks) {
        return b.marks - a.marks;
    }

    return a.name.localeCompare(b.name);
});

console.log('B. Ranked Merit List');
console.log(meritList);


// C. Department Statistics

const departmentStats = processedResults.reduce((stats, student) => {
    if (!stats[student.department]) {
        stats[student.department] = {
            students: 0,
            totalMarks: 0,
            average: 0,
            highest: null,
            passed: 0
        };
    }

    const department = stats[student.department];

    department.students++;

    if (student.status !== 'INVALID') {
        department.totalMarks += student.marks;

        if (
            department.highest === null ||
            student.marks > department.highest
        ) {
            department.highest = student.marks;
        }

        if (student.status === 'PASS') {
            department.passed++;
        }
    }

    return stats;
}, {});

// Calculate the average for each department.
Object.values(departmentStats).forEach(department => {
    const validStudents = processedResults.filter(
        student =>
            student.department in departmentStats &&
            student.status !== 'INVALID' &&
            departmentStats[student.department] === department
    );

    const count = validStudents.length;

    department.average = count > 0
        ? Number((department.totalMarks / count).toFixed(2))
        : null;

    delete department.totalMarks;
});

console.log('C. Department Statistics');
console.log(departmentStats);


// D. Academic Queries

// First student scoring more than 85
const firstAbove85 = processedResults.find(
    student => student.marks > 85
);

// Index of the first failed student
const firstFailedIndex = processedResults.findIndex(
    student => student.status === 'FAIL'
);

// Whether at least one student failed
const hasFailedStudent = processedResults.some(
    student => student.status === 'FAIL'
);

// Whether every student has valid marks
const allMarksValid = processedResults.every(
    student =>
        typeof student.marks === 'number' &&
        Number.isFinite(student.marks) &&
        student.marks >= 0 &&
        student.marks <= 100
);

// Overall average
const overallAverage = processedResults.length > 0
    ? processedResults.reduce(
        (total, student) => total + student.marks, 0
    ) / processedResults.length
    : 0;

// All students scoring above the overall average
const aboveAverageStudents = processedResults.filter(
    student => student.marks > overallAverage
);

// Names of the top three students
const topThreeStudents = meritList.slice(0, 3).map(
    student => student.name
);

console.log('D. Academic Queries');
console.log('First student scoring above 85:', firstAbove85);
console.log('Index of first failed student:', firstFailedIndex);
console.log('At least one student failed:', hasFailedStudent);
console.log('All marks valid:', allMarksValid);
console.log('Overall average:', Number(overallAverage.toFixed(2)));
console.log('Students above average:', aboveAverageStudents);
console.log('Top three students:', topThreeStudents);