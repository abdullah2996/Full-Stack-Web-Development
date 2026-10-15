export default class Student {
    constructor(id, name, courses) {
        this.id = id;
        this.name = name;
        this.courses = courses;
    }

    getAverage() {
        if (this.courses.length === 0) {
            return 0;
        }

        const total = this.courses.reduce(
            (sum, course) => sum + course.marks,
            0
        );

        return Number((total / this.courses.length).toFixed(2));
    }
}
