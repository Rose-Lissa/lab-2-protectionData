function generateKey (length) {
    let key = ""
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        key += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return key
}

function encrypt (text, key) {
    let encryptedText = ""
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i)
        const keyCharCode = key.charCodeAt(i)
        const encryptedCharCode = charCode ^ keyCharCode
        encryptedText += String.fromCharCode(encryptedCharCode)
    }
    return encryptedText
}

function decrypt (encryptedText, key) {
    let decryptedText = ""
    for (let i = 0; i < encryptedText.length; i++) {
        const charCode = encryptedText.charCodeAt(i)
        const keyCharCode = key.charCodeAt(i)
        const decryptedCharCode = charCode ^ keyCharCode
        decryptedText += String.fromCharCode(decryptedCharCode)
    }
    return decryptedText
}

const readline = require("readline")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question("Введите строку для шифрования: ", (text) => {
    const key = generateKey(text.length)
    const encryptedText = encrypt(text, key)
    console.log(`Зашифрованная строка: ${encryptedText}`)
    const decryptedText = decrypt(encryptedText, key)
    console.log(`Расшифрованная строка: ${decryptedText}`)
    rl.close();
})
