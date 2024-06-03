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


// CREATE TABLE ProductImgs (
//     ID INT AUTO_INCREMENT PRIMARY KEY,
//     ProductId bigint,
//     ImagePath VARCHAR(100)
// );