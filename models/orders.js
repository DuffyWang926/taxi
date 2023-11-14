const db = require('../db');

module.exports = db.defineModel('orders', {
    id:db.STRING(30),
    orderNo:db.STRING(30),
    orderStatus: db.BIGINT(10),
    paidTime:db.STRING(30),
    orederId:db.STRING(30),
    promotionId:db.STRING(40),
    settleTime:db.STRING(30),
    estimateAmount:db.STRING(10),
    settleAmount:db.STRING(10),
});


// create table orders (
//     orderNo varchar(30) not null,
//     orderStatus bigint,
//     paidTime varchar(30),
//     orederId varchar(30),
//     promotionId varchar(40),
//     settleTime varchar(30),
//     estimateAmount varchar(10),
//     settleAmount varchar(10),
//     primary key (orderNo)
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