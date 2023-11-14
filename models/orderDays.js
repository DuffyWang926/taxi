const db = require('../db');

module.exports = db.defineModel('orderDays', {
    id:db.STRING(10),
    orderDay:db.STRING(10),
    isCheck: db.BIGINT(2),
});


// create table orderDays (
//     id varchar(10) not null,
//     orderDay varchar(10),
//     isCheck bigint,
//     primary key (id)
// ) engine=innodb;

