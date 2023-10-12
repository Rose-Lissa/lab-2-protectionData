// Функция для преобразования числа в шестнадцатеричную строку
function hex(num) {
    let hexChars = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += hexChars.charAt((num >> (i * 4)) & 0x0f);
    }
    return result;
}

// Функция для вычисления хеш-суммы MD5
function md5(str) {
// Инициализация констант
    let s = [
        0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476
    ];

// Инициализация буфера
    let buffer = [];
    for (let i = 0; i < str.length * 8; i += 8) {
        buffer[i >> 5] |= (str.charCodeAt(i / 8) & 0xff) << (i % 32);
    }

// Добавление дополнительных бит
    buffer[str.length >> 2] |= 0x80 << ((str.length % 4) * 8 + 6);
    buffer[((str.length + 8) >> 6 << 4) + 14] = str.length * 8;

// Вычисление хеш-суммы
    let a = s[0], b = s[1], c = s[2], d = s[3];
    for (let i = 0; i < buffer.length; i += 16) {
        let aTemp = a, bTemp = b, cTemp = c, dTemp = d;

        for (let j = 0; j < 64; j++) {
            let f, k;
            if (j < 16) {
                f = (bTemp & cTemp) | ((~bTemp) & dTemp);
                k = j;
            } else if (j < 32) {
                f = (dTemp & bTemp) | ((~dTemp) & cTemp);
                k = (5 * j + 1) % 16;
            } else if (j < 48) {
                f = bTemp ^ cTemp ^ dTemp;
                k = (3 * j + 5) % 16;
            } else {
                f = cTemp ^ (bTemp | (~dTemp));
                k = (7 * j) % 16;
            }

            let temp = dTemp;
            dTemp = cTemp;
            cTemp = bTemp;
            bTemp = bTemp + ((aTemp + f + 0x5a827999 + buffer[i + k]) << 7 | (aTemp + f + 0x5a827999 + buffer[i + k]) >>> 25);
            aTemp = temp;
        }

        a = a + aTemp;
        b = b + bTemp;
        c = c + cTemp;
        d = d + dTemp;
    }

    return hex(a) + hex(b) + hex(c) + hex(d);
}

// Пример использования
console.log(md5("hello"));
console.log(md5("hella"));
console.log(md5("helpo"));