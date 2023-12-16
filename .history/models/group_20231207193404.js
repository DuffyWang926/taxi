const db = require('../db');

module.exports = db.defineModel('group', {
    productId:db.STRING(30),
    imgUrl: db.STRING(100),
    type: db.STRING(20),
    title: db.STRING(40),
    description: db.STRING(100),
});

// create table products (
//     id varchar(50) not null,
//     productId varchar(50) not null,
//     imgUrl varchar(100),
//     type varchar(20),
//     author varchar(10),
//     title varchar(20),
//     sum varchar(20),
//     description varchar(100),
//     createdAt bigint,
//     updatedAt bigint,
//     primary key (id)
// ) engine=innodb;