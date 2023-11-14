const db = require('../db');

module.exports = db.defineModel('users', {
    id: db.STRING(10),
    userId:db.STRING(10),
    upId:db.STRING(10),
    upCode:db.STRING(10),
    userCode:db.STRING(10),
    nickname:db.STRING(50),
    sex: db.BIGINT(10),
    province: db.STRING(40),
    city: db.STRING(40),
    headimgurl: db.STRING(100),
    openid: db.STRING(100),
    unionid: db.STRING(100),
    createdAt: db.STRING(100),
    updatedAt: db.STRING(100),
    version: db.BIGINT(10),
});

// create table users (
//     id varchar(50) not null,
//     userId varchar(10),
//     upId varchar(10),
//     upCode varchar(10),
//     userCode varchar(10),
//     nickname varchar(10),
//     sex bigint,
//     province varchar(10),
//     city varchar(10),
//     headimgurl varchar(500),
//     openid varchar(100),
//     unionid varchar(100),
//     createdAt varchar(100),
//     updatedAt varchar(100),
//     version bigint,
//     primary key (id)
// ) engine=innodb;

let test =                                
{
    id:'0',
    nickname:'test',
    sex:1,
    province:'test',
    city:'test',
    headimgurl:'test',
    openid:'test',
    unionid:'test',
    createdAt:'test',
    updatedAt:'test',
    version:1.0
}