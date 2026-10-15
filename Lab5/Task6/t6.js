const students = [
    {
        id: 101,
        name: 'Ali',
        completedCourses: ['CS301', 'CS302'],
        registeredCourses: []
    },
    {
        id: 102,
        name: 'Sara',
        completedCourses: ['CS301'],
        registeredCourses: []
    },
    {
        id: 103,
        name: 'Ahmed',
        completedCourses: ['CS301', 'CS302'],
        registeredCourses: ['CS401']
    }
];

const courses = [
    {
        code: 'CS401',
        prerequisites: ['CS301', 'CS302'],
        availableSeats: 5
    },
    {
        code: 'CS402',
        prerequisites: [],
        availableSeats: 0
    }
];


// 1. Load Student
function loadStudent(studentId, callback) {
    setTimeout(() => {
        const student = students.find(s => s.id === studentId);

        if (!student) {
            callback(new Error('Student does not exist'));
            return;
        }

        callback(null, student);
    }, 500);
}


// 2. Check Prerequisites
function checkPrerequisites(student, courseCode, callback) {
    setTimeout(() => {
        const course = courses.find(c => c.code === courseCode);

        if (!course) {
            callback(new Error('Course does not exist'));
            return;
        }

        const hasPrerequisites = course.prerequisites.every(
            prerequisite => student.completedCourses.includes(prerequisite)
        );

        if (!hasPrerequisites) {
            callback(new Error('Prerequisite not completed'));
            return;
        }

        callback(null, course);
    }, 500);
}


// 3. Check Available Seats
function checkAvailableSeats(course, callback) {
    setTimeout(() => {
        if (course.availableSeats <= 0) {
            callback(new Error('Course is full'));
            return;
        }

        callback(null, course);
    }, 500);
}


// 4. Register Course
function registerCourse(student, course, callback) {
    setTimeout(() => {
        if (student.registeredCourses.includes(course.code)) {
            callback(new Error('Student already registered'));
            return;
        }

        const confirmation = {
            studentId: student.id,
            course: course.code,
            status: 'REGISTERED'
        };

        callback(null, confirmation);
    }, 500);
}


// Complete registration workflow
function registrationWorkflow(studentId, courseCode, callback) {
    loadStudent(studentId, (error, student) => {
        if (error) {
            callback(error);
            return;
        }

        checkPrerequisites(student, courseCode, (error, course) => {
            if (error) {
                callback(error);
                return;
            }

            checkAvailableSeats(course, (error, availableCourse) => {
                if (error) {
                    callback(error);
                    return;
                }

                registerCourse(student, availableCourse, (error, result) => {
                    if (error) {
                        callback(error);
                        return;
                    }

                    callback(null, result);
                });
            });
        });
    });
}


// Testing different situations
function showResult(error, result) {
    if (error) {
        console.log('Registration failed:', error.message);
    } else {
        console.log('Registration successful:');
        console.log(result);
    }

    console.log('----------------------');
}

console.log('Test 1: Successful registration');
registrationWorkflow(101, 'CS401', showResult);

console.log('Test 2: Student does not exist');
registrationWorkflow(999, 'CS401', showResult);

console.log('Test 3: Prerequisite not completed');
registrationWorkflow(102, 'CS401', showResult);

console.log('Test 4: Course is full');
registrationWorkflow(101, 'CS402', showResult);

console.log('Test 5: Already registered');
registrationWorkflow(103, 'CS401', showResult);