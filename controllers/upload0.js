// const sharp = require('sharp');
const fs = require('fs')
const path = require('path');
const model = require('../model');
const {baseUrl} = require('../constants/baseUrl');
const { computePoints } = require('./public');
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
        province = {},
        city = {},
        region = {}
    } = body;
    let provinceCode = province.code
    let provinceName = province.name
    let cityCode = city.code
    let cityName = city.name
    let regionCode = region.code
    let regionName = region.name
    let now = new Date().getTime() + ''

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
        updatedAt:now,
        provinceCode:provinceCode,
        province:provinceName,
        cityCode:cityCode,
        city:cityName,
        regionCode:regionCode,
        region:regionName,
        reportNum:'0',
        reportReason:''
    })
    
    //product.id 为null 查找就有
    let products = await  productModel.findAll({
        where: {
            updatedAt:now
        },
    })
    product = products && products[0]
    console.log('product', product)
    let productId = product && product.id
    let productImgModel = model.productImgs
    
    for (let url of imgUrlList) {
        await  productImgModel.create({
            productId,
            imagePath:url
        })
        // await productImgModel.update({
        //     productId: productId, 
        // },{
        //     where: {
        //         imagePath: url 
        //     }
        // });
    }

    await computePoints(publisher)

   
    ctx.response.body = {
        code,
    }

};

var fn_upload = async (ctx, next) => {

    let fileBuffer = ctx.file.buffer
    let now = new Date().getTime() + ''
    
    let code = 200
    console.log('ctx.file', ctx.file)
    const fileExtension = ctx.file.mimetype.split('/').pop();
    
    let filePath = baseUrl + '/product/' + now +  '.' + fileExtension
    let writePath = path.join(__dirname, '../../products/', `${now}.${fileExtension}`);

    console.log('writePath', writePath)

    
    try{
        fs.writeFile(writePath, fileBuffer, function(err) {
            if (err) {
                throw err;
            }
        });

        // sharp(fileBuffer)
        //     .resize(200, 200)
        //     .jpeg({ quality: 80 })
        //     .toFile(writePath, (err, info) => {
        //     if (err) {
        //         console.error(err);
        //     } else {
        //         console.log('Image processed:', info);
        //     }
        //     });
        console.log(`Image processed and saved successfully at ${writePath}`);
    }catch(err){
        console.error('An error occurred during image processing:', err);
        process.exit(1);
    }
    
    // let productImgModel = model.productImgs
    // let img = await  productImgModel.create({
    //     productId:0,
    //     imagePath:filePath
    // })

   
    ctx.response.body = {
        code,
        filePath:filePath
    }

};

module.exports = {
    'POST /taxiapi/upload': fn_upload,
    'POST /taxiapi/publish': publishFn,
};