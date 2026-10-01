function sumMultiples(x, y, z) {
    let sum = 0

    for (let i = 1; i < z; i++) {
        if (i % x === 0 || i % y === 0) {
            sum += i
        }
    }

    return sum
}

console.log(sumMultiples(3, 5, 10))