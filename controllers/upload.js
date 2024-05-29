const fs = require('fs')
const model = require('../model');
const {baseUrl} = require('../constants/baseUrl');

var publishFn = async (ctx, next) => {
    let body = ctx.request.body
    let code = 200
    console.log('body', body)
    const {
        title = "",
        degree = "",
        deliver = "",
        address = "",
        price = 0.00,
        oldPrice = 0.00,
        contact = "",
        brand = "",
        description = "",
        publisher = "",
        imgUrlList,
    } = body;

    let productModel = model.product
    let product = await  productModel.create({
        title,
        degree,
        deliver,
        address,
        price,
        oldPrice,
        contact,
        brand,
        description,
        publisher,
    })
    console.log('product', product)
    let productId = product && product.Id
    let productImgModel = model.productImgs
    
    for (let url of imgUrlList) {
        await productImgModel.update({
            productId: productId, 
        },{
            where: {
                imagePath: url 
            }
        });
    }

   
    ctx.response.body = {
        code,
    }

};

var fn_upload = async (ctx, next) => {

    let fileBuffer = ctx.file.buffer
    let now = new Date().getTime() + ''
    
    let code = 200
    let writePath = '../products/' + now + '.gif'
    let filePath = baseUrl + '/product/' + now
    
    try{
        fs.writeFile(writePath, fileBuffer, function(err) {
            if (err) {
                throw err;
            }
        });

    }catch{

    }
    
    let productImgModel = model.productImgs
    let img = await  productImgModel.create({
        productId:0,
        imagePath:filePath
    })

   
    ctx.response.body = {
        code,
        filePath:img && img.imagePath
    }

};

module.exports = {
    'POST /taxiapi/upload': fn_upload,
    'POST /taxiapi/publish': publishFn,
};