
let givenNumber = 23
let nextNumber = givenNumber + 1
let isPrime = false

while (!isPrime) {
    isPrime = true

    for (let i = 2; i < nextNumber; i++) {
        if (nextNumber % i === 0) {
            isPrime = false
            break
        }
    }

    if (!isPrime) {
        nextNumber++
    }
}

console.log("Given Prime Number:", givenNumber)
console.log("Next Prime Number:", nextNumber)