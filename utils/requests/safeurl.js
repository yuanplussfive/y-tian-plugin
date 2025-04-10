import CryptoJS from 'crypto-js';

export function random(str) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
}

export function random_safe(str) {
    try {
        return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return str;
    }
}