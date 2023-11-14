// const CryptoJS = require("crypto-js");
// const crypto = require('crypto');

// let aesCount = (str,keyword) =>{
//     while(keyword.length% 16 != 0){
//         keyword += '0'
//     }
//     console.log(keyword, 'keyword')
//     let key = CryptoJS.enc.Utf8.parse(keyword); //密钥必须是16位，且避免使用保留字符
//     console.log(key, 'key')
    
//     let encryptedData  = CryptoJS.AES.encrypt(str, key, {
//         mode: CryptoJS.mode.ECB,
//         padding: CryptoJS.pad.Pkcs7
//     });
//     console.log(encryptedData,'encryptedData')
//     let hexData = encryptedData.ciphertext.toString();
//     console.log(hexData)
//     return hexData

// };

// const unAesCount = (str,keyword) =>{
//     let key = CryptoJS.enc.Utf8.parse(keyword);
//     // let key = keyword;
//     let encryptedHexStr  = CryptoJS.enc.Hex.parse(str);
//     let encryptedBase64Str  = CryptoJS.enc.Base64.stringify(encryptedHexStr);
//     let decryptedData  = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
//         mode: CryptoJS.mode.ECB,
//         padding: CryptoJS.pad.Pkcs7
//     });
//     let text = decryptedData.toString(CryptoJS.enc.Utf8);
//     return text
// }


// function aesEncrypt(data, key) {
//   const cipher = crypto.createCipher('aes192', key);
//   var crypted = cipher.update(data, 'utf8', 'hex');
//   crypted += cipher.final('hex');
//   return crypted;
// }

// function aesDecrypt(encrypted, key) {
//   const decipher = crypto.createDecipher('aes192', key);
//   var decrypted = decipher.update(encrypted, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }




// module.exports = { 
//     aesCount,
//     unAesCount,
//     aesEncrypt,
//     aesDecrypt
    
// };