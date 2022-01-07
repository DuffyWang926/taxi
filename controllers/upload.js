const fs = require('fs')
const model = require('../model');
var fn_upload = async (ctx, next) => {
    let body = ctx.request.body
    const { type, name, theme} = body
    let fileBuffer = ctx.file.buffer
    let now = new Date().getTime() + ''
    let code = 200
    let writePath = '../products/' + now + '.gif'
    let filePath = 'http://192.168.0.104:3000/product/' + now
    try{
        fs.writeFile(writePath, fileBuffer, function(err) {
            if (err) {
                throw err;
            }
        });

    }catch{

    }
    console.log('end')

    let productModel = model.product
    let sum = parseInt(+now/10) + ''
    
    await  productModel.create({
        productId:now,
        imgUrl: filePath,
        type,
        author: 'a',
        title: name,
        description: '',
        sum,
        createdAt: now,
        updatedAt: now,
    })

   






   
    ctx.response.body = {
        code,
    }

};

module.exports = {
    'POST /upload': fn_upload
};