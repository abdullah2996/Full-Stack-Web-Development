function createPhoneNumber(numbers) {
    let phoneNumber = "("

    for (let i = 0; i < 3; i++) {
        phoneNumber += numbers[i]
    }

    phoneNumber += ") "

    for (let i = 3; i < 6; i++) {
        phoneNumber += numbers[i]
    }

    phoneNumber += "-"

    for (let i = 6; i < 10; i++) {
        phoneNumber += numbers[i]
    }

    return phoneNumber
}

console.log(createPhoneNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]))