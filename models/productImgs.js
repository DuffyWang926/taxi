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
<<<<<<< HEAD
//     ProductId bigint,
//     ImagePath VARCHAR(100)
=======
//     ProductId INT,
//     ImagePath VARCHAR(100),
//     FOREIGN KEY (ProductId) REFERENCES Products(Id)
>>>>>>> 05f85f468194c32942410d96778e36a73529647d
// );