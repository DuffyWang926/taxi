const db = require('../db');

module.exports = db.defineModel('userAccounts', {
    id:db.STRING(10),
    userId:db.STRING(10),
    upId:db.STRING(10),
    amount: db.STRING(10),
});


// create table userAccounts (
//     id varchar(10) not null,
//     userId varchar(10),
//     upId varchar(10),
//     amount varchar(10),
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