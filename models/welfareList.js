const db = require('../db');


module.exports = db.defineModel('welfareList', {
    id: {
        type: db.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: db.STRING(100),
    nickName: db.STRING(100),
    headUrl: db.STRING(100),
    date: db.STRING(100),
    attendSum: db.STRING(100),
    
});



// CREATE TABLE welfareList (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     userId VARCHAR(40),
//     nickName VARCHAR(100),
//     headUrl VARCHAR(200),
//     date VARCHAR(100),
//     attendSum VARCHAR(100)
// );