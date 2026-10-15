import Student from './Student.js';
import {
    calculateGrade,
    calculateAverage as getAverage,
    calculateGPA
} from './gradeUtils.js';

export function processTranscript(rawData) {
    let data;

    // Parse JSON safely
    try {
        data = JSON.parse(rawData);
    } catch (error) {
        throw new SyntaxError('Malformed JSON transcript');
    }

    if (!Array.isArray(data)) {
        throw new TypeError('Transcript must contain an array of students');
    }

    const studentIds = new Set();

    const reportStudents = data.map(record => {
        if (
            record === null ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            throw new TypeError('Invalid student record');
        }

        if (
            record.id === undefined ||
            record.id === null ||
            record.id === ''
        ) {
            throw new TypeError('Student ID is missing');
        }

        if (studentIds.has(record.id)) {
            throw new Error('Duplicate student ID: ' + record.id);
        }

        studentIds.add(record.id);

        if (!Array.isArray(record.courses)) {
            throw new TypeError(
                'Courses must be an array for student ' + record.id
            );
        }

        const courses = record.courses.map(course => {
            if (
                course === null ||
                typeof course !== 'object' ||
                Array.isArray(course)
            ) {
                throw new TypeError('Invalid course record');
            }

            if (
                typeof course.code !== 'string' ||
                course.code.trim() === ''
            ) {
                throw new TypeError('Course code is missing');
            }

            if (
                typeof course.marks !== 'number' ||
                !Number.isFinite(course.marks)
            ) {
                throw new TypeError(
                    'Course marks must be a valid number'
                );
            }

            if (course.marks < 0 || course.marks > 100) {
                throw new RangeError(
                    'Course marks must be between 0 and 100'
                );
            }

            return {
                code: course.code,
                marks: course.marks,
                grade: calculateGradeForCourse(course.marks)
            };
        });

        const student = new Student(
            record.id,
            record.name ?? 'Unknown',
            courses
        );

        const marks = courses.map(course => course.marks);

        return {
            id: student.id,
            name: student.name,
            courses: student.courses,
            average: getAverage(marks),
            GPA: calculateGPA(marks)
        };
    });

    return {
        totalStudents: reportStudents.length,
        students: reportStudents
    };
}

// Use the named grade function through a small helper.
function calculateGradeForCourse(marks) {
    return calculateGrade(marks);
}