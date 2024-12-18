const db = require('../db');


module.exports = db.defineModel('users', {
    id: {
        type: db.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: db.STRING(100),
    upCode: db.STRING(25),
    nickName: db.STRING(25),
    sex: db.STRING(10),
    province: db.STRING(10),
    city: db.STRING(10),
    openid: db.STRING(100),
    headUrl: db.STRING(200),
    unionid: db.STRING(100),
    points: {
        type: db.STRING(100),
        allowNull: false,
        defaultValue: '0'
    },
    groupId: db.STRING(25),
    
});



// CREATE TABLE users (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     userId VARCHAR(40),
//     upCode VARCHAR(25),
//     nickName VARCHAR(25),
//     sex VARCHAR(10),
//     province VARCHAR(10),
//     city VARCHAR(10),
//     openid VARCHAR(100),
//     headUrl VARCHAR(200),
//     unionid VARCHAR(100),
//     groupId VARCHAR(25),

//     points VARCHAR(100) NOT NULL DEFAULT '0'
// );



let test =                                
{
    id:'0',
    nickname:'test',
    sex:1,
    province:'test',
    city:'test',
    openid:'test',
    unionid:'test',
    createdAt:'test',
    updatedAt:'test',
    version:1.0
}