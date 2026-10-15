const users = [
    { id: 1, name: 'Ali', department: 'CS' },
    { id: 2, name: 'Sara', department: 'CS' },
    { id: 3, name: 'Ahmed', department: 'SE' },
    { id: 4, name: 'Hina', department: 'AI' }
];

const courses = [
    { id: 101, name: 'DAA', department: 'CS' },
    { id: 102, name: 'Operating Systems', department: 'CS' },
    { id: 103, name: 'Software Engineering', department: 'SE' },
    { id: 104, name: 'Artificial Intelligence', department: 'AI' }
];

const results = [
    { studentId: 1, courseId: 101, marks: 85 },
    { studentId: 1, courseId: 102, marks: 75 },
    { studentId: 2, courseId: 101, marks: 92 },
    { studentId: 2, courseId: 102, marks: 88 },
    { studentId: 3, courseId: 103, marks: 42 },
    { studentId: 4, courseId: 104, marks: 78 }
];

// Fake Fetch API for testing

async function fakeFetch(url, options = {}) {
    const signal = options.signal;
    let delay = 300;

    if (url.includes('mode=slow')) {
        delay = 3000;
    }

    await new Promise((resolve, reject) => {
        if (signal?.aborted) {
            const error = new Error('Request aborted');
            error.name = 'AbortError';
            reject(error);
            return;
        }

        const timer = setTimeout(resolve, delay);

        if (signal) {
            signal.addEventListener('abort', () => {
                clearTimeout(timer);

                const error = new Error('Request aborted');
                error.name = 'AbortError';
                reject(error);
            }, { once: true });
        }
    });

    if (url.includes('mode=network')) {
        throw new TypeError('Network connection failed');
    }

    let status = 200;
    let data;

    if (url.includes('mode=404')) {
        status = 404;
    } else if (url.includes('mode=500')) {
        status = 500;
    } else if (url.includes('mode=invalid')) {
        data = 'INVALID JSON';
    } else if (url.includes('/users')) {
        data = users;
    } else if (url.includes('/courses')) {
        data = courses;
    } else if (url.includes('/results')) {
        data = results;
    } else {
        status = 404;
    }

    return {
        ok: status >= 200 && status < 300,
        status,
        async json() {
            if (url.includes('mode=invalid')) {
                throw new SyntaxError('Invalid JSON response');
            }

            return data;
        }
    };
}

// Get JSON and handle HTTP errors

async function getJSON(url, fetchImplementation) {
    const response = await fetchImplementation(url);

    if (!response.ok) {
        throw new Error('HTTP error: ' + response.status);
    }

    return await response.json();
}

// Load all dashboard data concurrently

async function loadDashboard() {
    try {
        const [allUsers, allCourses, allResults] = await Promise.all([
            getJSON('/users', fakeFetch),
            getJSON('/courses', fakeFetch),
            getJSON('/results', fakeFetch)
        ]);

        return makeReport(allUsers, allCourses, allResults);
    } catch (error) {
        console.log('Dashboard loading failed:', error.message);
        throw error;
    }
}

// Generate dashboard statistics

function makeReport(allUsers, allCourses, allResults) {
    const studentStats = allUsers.map(user => {
        const studentResults = allResults.filter(
            result => result.studentId === user.id
        );

        const totalMarks = studentResults.reduce(
            (sum, result) => sum + result.marks,
            0
        );

        const average = studentResults.length > 0
            ? totalMarks / studentResults.length
            : 0;

        return {
            id: user.id,
            name: user.name,
            department: user.department,
            average
        };
    });

    const validResults = allResults.filter(result =>
        Number.isFinite(result.marks) &&
        result.marks >= 0 &&
        result.marks <= 100
    );

    const overallAverage = validResults.length > 0
        ? validResults.reduce((sum, result) => sum + result.marks, 0)
            / validResults.length
        : 0;

    const highestStudent = studentStats.length > 0
        ? studentStats.reduce((highest, student) =>
            student.average > highest.average ? student : highest
        )
        : null;

    const failedStudents = studentStats.filter(
        student => student.average < 50
    );

    const departmentStats = {};

    allUsers.forEach(user => {
        if (!departmentStats[user.department]) {
            departmentStats[user.department] = {
                students: 0,
                totalMarks: 0,
                resultCount: 0,
                failedStudents: 0
            };
        }

        departmentStats[user.department].students++;
    });

    studentStats.forEach(student => {
        const department = departmentStats[student.department];

        const studentResults = allResults.filter(
            result => result.studentId === student.id &&
                Number.isFinite(result.marks) &&
                result.marks >= 0 &&
                result.marks <= 100
        );

        department.totalMarks += studentResults.reduce(
            (sum, result) => sum + result.marks,
            0
        );

        department.resultCount += studentResults.length;

        if (student.average < 50) {
            department.failedStudents++;
        }
    });

    Object.keys(departmentStats).forEach(name => {
        const department = departmentStats[name];

        department.averageMarks = department.resultCount > 0
            ? department.totalMarks / department.resultCount
            : 0;

        delete department.totalMarks;
        delete department.resultCount;
    });

    return {
        totalStudents: allUsers.length,
        totalCourses: allCourses.length,
        overallAverageMarks: Number(overallAverage.toFixed(2)),
        highestPerformingStudent: highestStudent,
        failedStudents: failedStudents.length,
        departmentStats
    };
}

// Request with a timeout

async function fetchWithTimeout(
    url,
    milliseconds,
    fetchImplementation = fakeFetch
) {
    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort();
    }, milliseconds);

    try {
        return await getJSON(url, requestUrl =>
            fetchImplementation(requestUrl, {
                signal: controller.signal
            })
        );
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }

        throw error;
    } finally {
        clearTimeout(timer);
    }
}

// Run the dashboard

async function main() {
    try {
        const report = await loadDashboard();

        console.log('Dashboard Report:');
        console.log(report);

        // Test timeout with a slow response.
        const slowData = await fetchWithTimeout(
            '/users?mode=slow',
            500
        );

        console.log(slowData);
    } catch (error) {
        console.log('Error:', error.message);
    } finally {
        console.log('Dashboard process finished.');
    }
}

main();

// Other tests: uncomment one at a time.
// getJSON('/users?mode=404', fakeFetch);
// getJSON('/users?mode=500', fakeFetch);
// getJSON('/users?mode=network', fakeFetch);
// getJSON('/users?mode=invalid', fakeFetch);
// fetchWithTimeout('/users?mode=slow', 500, fakeFetch);