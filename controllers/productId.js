const model = require('../model');
const fn_productId = async (ctx, next) => {
    let body = ctx.request.body
    const { id } = body
    let productModel = model.product

    let product = await  productModel.findAll({
        where: {
            productId:id
        }
    })
    console.log(`find ${product} product:`);
    let imgList = Array.isArray(product) && product.map( (v,i) =>{
        let res = {
            imgId:v.productId,
            imgUrl:v.imgUrl,
            title:v.title,
            author:v.author,
            downSum:v.sum,
            updatedAt:v.updatedAt
        }
        return res
    })
    let productEnd = imgList.length > 0 && imgList[0]
    
    
    let dataRes = {
        product:productEnd,
    }
        
    ctx.response.body = dataRes
};



module.exports = {
    'POST /api/productId': fn_productId,
    
};