'use strict';

class Person {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }

    introduce() {
        return `My name is ${this.name} and my email is ${this.email}.`;
    }
}

class Student extends Person {
    constructor(name, email, rollNo, marks) {
        super(name, email);
        this.rollNo = rollNo;
        this.marks = marks;
    }

    introduce() {
        return `${super.introduce()} I am a student. My roll number is ${this.rollNo}.`;
    }

    getResult() {
        if (typeof this.marks !== 'number' ||
            !Number.isFinite(this.marks) ||
            this.marks < 0 ||
            this.marks > 100) {
            return 'Invalid marks';
        }

        return this.marks >= 50 ? 'PASS' : 'FAIL';
    }
}

class FacultyMember extends Person {
    constructor(name, email, employeeId, department) {
        super(name, email);
        this.employeeId = employeeId;
        this.department = department;
    }

    introduce() {
        return `${super.introduce()} I am a faculty member in ${this.department} department. My employee ID is ${this.employeeId}.`;
    }
}


const student1 = new Student(
    'Ali',
    'ali@university.edu',
    'CS-101',
    82
);

const student2 = new Student(
    'Sara',
    'sara@university.edu',
    'CS-102',
    45
);

const faculty1 = new FacultyMember(
    'Dr. Hassan',
    'hassan@university.edu',
    'EMP-201',
    'Computer Science'
);

const faculty2 = new FacultyMember(
    'Ms. Ayesha',
    'ayesha@university.edu',
    'EMP-202',
    'Artificial Intelligence'
);


// Runtime polymorphism
const users = [student1, faculty1, student2, faculty2];

console.log('User Introductions:');

users.forEach(user => console.log(user.introduce()));


console.log('\nStudent Results:');
console.log(student1.name + ': ' + student1.getResult());
console.log(student2.name + ': ' + student2.getResult());


console.log('\nInstance Checks:');
console.log(student1 instanceof Student);       
console.log(student1 instanceof Person);        
console.log(faculty1 instanceof FacultyMember); 
console.log(faculty1 instanceof Person);        
console.log(student1 instanceof FacultyMember); 


// call() challenge
const guest = {
    name: 'Dr. Ahmed',
    email: 'ahmed@example.com'
};

console.log('\nUsing call():');
console.log(Person.prototype.introduce.call(guest));


// Detached method challenge
console.log('\nDetached Method:');

const fn = student1.introduce;

try {
    console.log(fn());
} catch (error) {
    console.log('Error:', error.message);
}


// bind() challenge
console.log('\nUsing bind():');

const boundIntroduction = student1.introduce.bind(student1);

console.log(boundIntroduction());