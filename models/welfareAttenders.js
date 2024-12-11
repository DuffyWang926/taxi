const db = require('../db');


module.exports = db.defineModel('welfareAttenders', {
    id: {
        type: db.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: db.STRING(100),
    date: db.STRING(100),
    nickName: db.STRING(100),
    headUrl: db.STRING(100),
    points: {
        type: db.STRING(100),
        allowNull: false,
        defaultValue: '0'
    },
    
});



// CREATE TABLE welfareAttenders (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     userId VARCHAR(40),
//     date VARCHAR(100),
//     nickName VARCHAR(100),
//     headUrl VARCHAR(100),
//     points VARCHAR(100) NOT NULL DEFAULT '0'
// );