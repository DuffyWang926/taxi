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
    
});


// CREATE TABLE Products (
//     Id INT AUTO_INCREMENT PRIMARY KEY,
//     Title VARCHAR(255),
//     Degree VARCHAR(5),
//     Deliver VARCHAR(5),
//     Address VARCHAR(255),
//     Price DECIMAL(10,2),
//     OldPrice DECIMAL(10,2),
//     Contact VARCHAR(30),
//     Brand VARCHAR(20),
//     Publisher VARCHAR(50),
//     UpdatedAt VARCHAR(50),
//     City VARCHAR(50),
//     Description TEXT
//   );