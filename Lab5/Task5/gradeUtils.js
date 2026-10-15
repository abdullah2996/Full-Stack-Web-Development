export function calculateGrade(marks) {
    if (
        typeof marks !== 'number' ||
        !Number.isFinite(marks) ||
        marks < 0 ||
        marks > 100
    ) {
        throw new RangeError('Marks must be between 0 and 100');
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

export function calculateAverage(marks) {
    if (!Array.isArray(marks)) {
        throw new TypeError('Marks must be an array');
    }

    if (marks.length === 0) {
        return 0;
    }

    const total = marks.reduce((sum, mark) => {
        if (
            typeof mark !== 'number' ||
            !Number.isFinite(mark) ||
            mark < 0 ||
            mark > 100
        ) {
            throw new RangeError('Invalid marks found');
        }

        return sum + mark;
    }, 0);

    return Number((total / marks.length).toFixed(2));
}

export function calculateGPA(marks) {
    if (!Array.isArray(marks)) {
        throw new TypeError('Marks must be an array');
    }

    if (marks.length === 0) {
        return 0;
    }

    const gradePoints = marks.map(mark => {
        const grade = calculateGrade(mark);

        switch (grade) {
            case 'A': return 4.00;
            case 'A-': return 3.70;
            case 'B+': return 3.30;
            case 'B': return 3.00;
            case 'B-': return 2.70;
            case 'C+': return 2.30;
            case 'C': return 2.00;
            default: return 0.00;
        }
    });

    const total = gradePoints.reduce((sum, point) => sum + point, 0);

    return Number((total / gradePoints.length).toFixed(2));
}