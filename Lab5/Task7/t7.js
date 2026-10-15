const students = [
    {
        id: 101,
        name: 'Ali',
        completedCourses: ['CS301', 'CS302']
    },
    {
        id: 102,
        name: 'Sara',
        completedCourses: ['CS301']
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

// Part A: Promise based services

function getStudent(studentId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const student = students.find(s => s.id === studentId);

            if (student) {
                resolve(student);
            } else {
                reject(new Error('Student not found'));
            }
        }, 300);
    });
}

// Part C: Get the first successful course response

function getCourseFromServer(serverName, courseCode, delay, shouldFail) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error(serverName + ' failed'));
                return;
            }

            const course = courses.find(c => c.code === courseCode);

            if (course) {
                resolve({
                    ...course,
                    server: serverName
                });
            } else {
                reject(new Error('Course not found on ' + serverName));
            }
        }, delay);
    });
}

function getCourse(courseCode) {
    return Promise.any([
        getCourseFromServer('Server A', courseCode, 300, true),
        getCourseFromServer('Server B', courseCode, 700, false)
    ]);
}

function checkPrerequisites(student, course) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const hasCompleted = course.prerequisites.every(
                prerequisite => student.completedCourses.includes(prerequisite)
            );

            if (hasCompleted) {
                resolve({ student, course });
            } else {
                reject(new Error('Prerequisites not completed'));
            }
        }, 300);
    });
}

function checkSeats(course) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (course.availableSeats > 0) {
                resolve(course);
            } else {
                reject(new Error('No seats available'));
            }
        }, 300);
    });
}

function registerStudent(student, course) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                studentId: student.id,
                studentName: student.name,
                course: course.code,
                status: 'REGISTERED'
            });
        }, 300);
    });
}

// Part B: Post-registration services

function sendEmail(registration) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Email sent to ' + registration.studentName);
        }, 300);
    });
}

function sendSMS(registration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('SMS service is unavailable'));
        }, 200);
    });
}

function writeAuditLog(registration) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Audit log saved for ' + registration.course);
        }, 400);
    });
}

// Main registration chain

function startRegistration(studentId, courseCode) {
    console.log('\nStarting registration...');

    getStudent(studentId)
        .then(student => {
            console.log('Student found:', student.name);

            // Return is necessary to continue the chain.
            return getCourse(courseCode).then(course => ({
                student,
                course
            }));
        })
        .then(({ student, course }) => {
            console.log('Course received from:', course.server);

            // Keep both student and course for the next stage.
            return checkPrerequisites(student, course).then(() => ({
                student,
                course
            }));
        })
        .then(({ student, course }) => {
            console.log('Prerequisites checked');

            return checkSeats(course).then(() => ({
                student,
                course
            }));
        })
        .then(({ student, course }) => {
            console.log('Seat available');

            return registerStudent(student, course);
        })
        .then(registration => {
            console.log('\nRegistration successful:');
            console.log(registration);

            const serviceNames = ['Email', 'SMS', 'Audit'];

            // All three services start independently.
            return Promise.allSettled([
                sendEmail(registration),
                sendSMS(registration),
                writeAuditLog(registration)
            ]).then(results => {
                const report = results.map((result, index) => ({
                    service: serviceNames[index],
                    status: result.status
                }));

                console.log('\nPost-registration report:');
                console.log(report);

                return registration;
            });
        })
        .catch(error => {
            console.log('Registration failed:', error.message);
        })
        .finally(() => {
            console.log('Registration workflow finished.');
        });
}

startRegistration(101, 'CS401');