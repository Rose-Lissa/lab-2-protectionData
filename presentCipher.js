const fs = require('fs');

function toBinaryString(number, length) {
    let binaryString = number.toString(2);
    while (binaryString.length < length) {
        binaryString = "0" + binaryString;
    }
    return binaryString;
}

function applyPermutation(data) {
    const permutation = [
        0, 16, 32, 48, 1, 17, 33, 49,
        2, 18, 34, 50, 3, 19, 35, 51,
        4, 20, 36, 52, 5, 21, 37, 53,
        6, 22, 38, 54, 7, 23, 39, 55,
        8, 24, 40, 56, 9, 25, 41, 57,
        10, 26, 42, 58, 11, 27, 43, 59,
        12, 28, 44, 60, 13, 29, 45, 61,
        14, 30, 46, 62, 15, 31, 47, 63
    ];

    let newData = [];
    for (let i = 0; i < 64; i++) {
        newData[i] = data[permutation[i]];
    }

    return newData;
}

function generateRoundKeys(key) {
    const roundKeys = [];

    let k0 = key & BigInt(0xFFFFFFFFFFFF);
    let k1 = (key >> BigInt(64)) & BigInt(0xFFFFFFFFFFFF);

    for (let round = 0; round < 32; round++) {
        roundKeys.push([k1 >> BigInt(11), k1 >> BigInt(7), k1 >> BigInt(3), (k1 << BigInt(1)) & BigInt(0xF)]);
        k1 = ((k1 << BigInt(61)) | ((k0 << BigInt(3)) & BigInt(0xFFFFFFFFFFFFFFFF))) ^ BigInt(round + 1);
        k0 = k1 ^ ((k0 << BigInt(8)) & BigInt(0xFFFFFFFFFFFFFFFF));
    }

    return roundKeys;
}

function applySBox(number) {
    const sBox = [
        0xCn, 0x5n, 0x6n, 0xBn, 0x9n, 0x0n, 0xAn, 0xDn, 0x3n, 0xEn, 0xFn, 0x8n, 0x4n, 0x7n, 0x1n, 0x2n
    ];

    let binaryString = toBinaryString(BigInt(number), 4);
    let row = parseInt(binaryString[0] + binaryString[3], 2);
    let column = parseInt(binaryString.substring(1, 3), 2);

    return sBox[row * 4 + column];
}

function xor(a, b) {
    let xorResult = [];
    for (let i = 0; i < a.length; i++) {
        const aValue = a[i] !== undefined ? BigInt(a[i]) : BigInt(0);
        const bValue = b[i] !== undefined ? BigInt(b[i]) : BigInt(0);
        xorResult[i] = aValue ^ bValue;
    }
    return xorResult;
}

function presentEncrypt(blockData, key) {
    let data = blockData.slice();
    let roundKeys = generateRoundKeys(key);

    for (let round = 0; round < 31; round++) {
        data = xor(data, roundKeys[round]);
        for (let i = 0; i < 64; i += 4) {
            const a = data[i];
            const b = data[i + 1];
            const c = data[i + 2];
            const d = data[i + 3];

            if (a === undefined || b === undefined || c === undefined || d === undefined ||
                !isValidValue(a) || !isValidValue(b) || !isValidValue(c) || !isValidValue(d)) {
                throw new Error('Invalid data');
            }

            const sBoxOutput = applySBox((BigInt(a) << 12n) | (BigInt(b) << 8n) | (BigInt(c) << 4n) | BigInt(d));
            data[i] = Number((sBoxOutput & 8n) >> 3n);
            data[i + 1] = Number((sBoxOutput & 4n) >> 2n);
            data[i + 2] = Number((sBoxOutput & 2n) >> 1n);
            data[i + 3] = Number(sBoxOutput & 1n);
        }
        data = applyPermutation(data);
    }

    data = xor(data, roundKeys[31]);

    return data;
}

function presentDecrypt(blockData, key) {
    let data = blockData.slice();
    let roundKeys = generateRoundKeys(key);

    data = xor(data, roundKeys[31]);
    data = applyPermutation(data);

    for (let round = 30; round >= 0; round--) {
        for (let i = 0; i < 64; i += 4) {
            const a = data[i];
            const b = data[i + 1];
            const c = data[i + 2];
            const d = data[i + 3];

            if (a === undefined || b === undefined || c === undefined || d === undefined ||
                !isValidValue(a) || !isValidValue(b) || !isValidValue(c) || !isValidValue(d)) {
                throw new Error('Invalid data');
            }

            const sBoxOutput = applySBox((BigInt(a) << 12n) | (BigInt(b) << 8n) | (BigInt(c) << 4n) | BigInt(d));
            data[i] = Number((sBoxOutput & 8n) >> 3n);
            data[i + 1] = Number((sBoxOutput & 4n) >> 2n);
            data[i + 2] = Number((sBoxOutput & 2n) >> 1n);
            data[i + 3] = Number(sBoxOutput & 1n);
        }
        data = applyPermutation(data);
    }

    return data;
}

function isValidValue(value) {
    return value !== undefined && value >= 0 && value <= 15;
}

const blockSize = 8; // 8 bytes = 64 bits
const inputFile = "input.txt";
const encryptedFile = "encrypted.txt";
const decryptedFile = "decrypted.txt";

fs.readFile(inputFile, (err, data) => {
    if (err) throw err;

    const inputFileData = data;
    const numBlocks = Math.ceil(inputFileData.length / blockSize);

    let encryptedData = Buffer.alloc(numBlocks * blockSize);
    let decryptedData = Buffer.alloc(numBlocks * blockSize);

    for (let i = 0; i < numBlocks; i++) {
        const start = i * blockSize;
        const end = (i + 1) * blockSize;

        const blockData = Array.from(inputFileData.slice(start, end));
        blockData.length = blockSize; // Установка длины блока

        const encryptedBlockData = presentEncrypt(blockData, BigInt(0xDEADBEEFDEADBEEFDEAD));
        const decryptedBlockData = presentDecrypt(encryptedBlockData, BigInt(0xDEADBEEFDEADBEEFDEAD));

        encryptedData.set(encryptedBlockData, start);
        decryptedData.set(decryptedBlockData, start);
    }

    fs.writeFile(encryptedFile, encryptedData, (err) => {
        if (err) throw err;
        console.log("File successfully encrypted.");
    });

    fs.writeFile(decryptedFile, decryptedData, (err) => {
        if (err) throw err;
        console.log("File successfully decrypted.");
    });
});