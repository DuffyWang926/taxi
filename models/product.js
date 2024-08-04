const db = require('../db');

module.exports = db.defineModel('products', {
    id: {
        type: db.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: db.STRING(255),
    degree: db.STRING(5),
    deliver: db.STRING(5),
    address: db.STRING(255),
    price: db.DECIMAL(10,2),
    oldPrice: db.DECIMAL(10,2),
    contact: db.STRING(30),
    brand: db.STRING(20),
    publisher: db.STRING(50),
    description: db.TEXT,
    updatedAt: db.STRING(40),
    city: db.STRING(10),
    reportNum: db.STRING(5),
    reportReason: db.STRING(100),
    
});


// CREATE TABLE products (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     title VARCHAR(255),
//     degree VARCHAR(5),
//     deliver VARCHAR(5),
//     address VARCHAR(255),
//     price DECIMAL(10,2),
//     oldprice DECIMAL(10,2),
//     contact VARCHAR(30),
//     brand VARCHAR(20),
//     publisher VARCHAR(50),
//     updatedat VARCHAR(50),
//     city VARCHAR(50),
//     reportNum VARCHAR(5),
//     reportReason VARCHAR(100),
//     description TEXT
//   );