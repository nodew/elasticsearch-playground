const characters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

function getRandomInt(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min)) + min;
}


function getRandomChar() {
    return characters[getRandomInt(characters.length)];

}

function genRandomWord(minLength, maxLength) {
    let length = getRandomInt(minLength, maxLength);
    return new Array(length).fill(undefined).map(getRandomChar).join("");
}

function genRandomSentence(minLength, maxLength) {
    let length = getRandomInt(minLength, maxLength);
    return new Array(length).fill(undefined).map(() => genRandomWord(1, 30)).join(" ");
}

function paddingZero(num, length) {
    return ("" + num).padStart(length, "0");
}

module.exports = {
    getRandomInt,
    getRandomChar,
    genRandomWord,
    genRandomSentence,
    paddingZero
}
