var name = "Abdullah"
var age = 20
var university = "Air University"
var degree = "BS Computer Science"
var semester = 5
var isStudent = true

console.log(" My Biography ")
console.log("Name:", name)
console.log("Age:", age)
console.log("University:", university)
console.log("Degree:", degree)
console.log("Semester:", semester)
console.log("Currently a Student:", isStudent)


var biography = {
    name: "Abdullah",
    age: 20,
    university: "Air University",
    
    address: {
        city: "Islamabad",
        country: "Pakistan"
    },

    degreeProgram: {
        degree: "BS Computer Science",
        semester: 5
    }
}


console.log("\n Biography Object ")

console.log("Name:", biography.name)
console.log("Age:", biography.age)
console.log("University:", biography.university)

console.log("City:", biography.address.city)
console.log("Country:", biography.address.country)

console.log("Degree:", biography.degreeProgram.degree)
console.log("Semester:", biography.degreeProgram.semester)
