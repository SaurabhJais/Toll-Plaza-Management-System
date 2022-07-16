module.exports = (len) => {
    let final = "SJ";

    let alpha = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    for (let i = 0; i < len; i++) {
        let a = [alpha, nums];
        let b = a[random(0, 1)]
        final += b[random(0, b.length - 1)]
    }
    return final;
}

let random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

