const db = require('../db');

module.exports = db.defineModel('group', {
    imgId:db.STRING(30),
    imgUrl: db.STRING(100),
    title: db.STRING(40),
    description: db.STRING(100),
});

// create table products (
//     id varchar(50) not null,
//     imgId varchar(50) not null,
//     imgUrl varchar(100),
//     title varchar(20),
//     description varchar(100),
//     primary key (id)
// ) engine=innodb;