function abs() {
    if (arguments.length === 0) {
        return 0
    }

    if (arguments.length === 1) {
        return Math.abs(arguments[0])
    }

    let values = []

    for (let i = 0; i < arguments.length; i++) {
        values.push(Math.abs(arguments[i]))
    }

    return values
}


function ceil() {
    if (arguments.length === 0) {
        return 0
    }

    if (arguments.length === 1) {
        return Math.ceil(arguments[0])
    }

    let values = []

    for (let i = 0; i < arguments.length; i++) {
        values.push(Math.ceil(arguments[i]))
    }

    return values
}


function floor() {
    if (arguments.length === 0) {
        return 0
    }

    if (arguments.length === 1) {
        return Math.floor(arguments[0])
    }

    let values = []

    for (let i = 0; i < arguments.length; i++) {
        values.push(Math.floor(arguments[i]))
    }

    return values
}

console.log('Absolute')
console.log(abs())
console.log(abs(-5))
console.log(abs(-5, 3, -2.7))

console.log('\nCeiling')
console.log(ceil())
console.log(ceil(4.2))
console.log(ceil(4.2, 5.8, -2.3))

console.log('\nFloor')
console.log(floor())
console.log(floor(4.8))
console.log(floor(4.8, 5.2, -2.3))