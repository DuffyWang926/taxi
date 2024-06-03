const db = require('../db');

module.exports = db.defineModel('productImgs', {
    id: {
        type: db.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    productId: db.BIGINT,
    imagePath: db.STRING(100),
});

// CREATE TABLE productImgs (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     productid INT,
//     imagepath VARCHAR(100)
// );