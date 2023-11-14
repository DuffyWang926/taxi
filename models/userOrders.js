const db = require('../db');

module.exports = db.defineModel('userOrders', {
    id:db.STRING(40),
    openid:db.STRING(40),
    clickTime: db.STRING(40),
    goodName: db.STRING(60),
    isCheck:db.BIGINT(2)
});


// create table userOrders (
//     id varchar(40) not null,
//     userId varchar(10) not null,
//     clickTime varchar(40),
//     isCheck bigint,
//     primary key (id)
// ) engine=innodb;

// alter table userOrders drop userId;
// alter table userOrders modify openid varchar(40);
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
// alter table 表名 add column 列名 varchar(20);