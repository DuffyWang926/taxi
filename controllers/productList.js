const model = require('../model');
const fn_productList = async (ctx, next) => {
    let body = ctx.request.body
    const { type, page, pageSize } = body
    let productModel = model.product
    let offset = ( +page -1) * (+pageSize)

    let productList = await  productModel.findAll({
        where: {
            
        },
        // include: [{
        //     model: model.productImgs,
        //     required: false,
        // }],
        offset,
        limit: pageSize 
    })
    console.log(`find ${productList} productList:`);
    
    let productImgModel = model.productImgs    
    let productEndList = []
    for (let item of productList) {
        let imgList = await  productImgModel.findAll({
            where: {
                productId:item.id
            },
        })
        console.log('imgList',imgList)
        let imgEndList = imgList.map( img => img.imagePath)
        let plainItem = item.get({plain: true});
        plainItem.imgList = imgEndList;
        productEndList.push(plainItem)
    }

    
                                                                                                                                                                                                                                                                                                                                                                                                                                      
    if(type == 0){                                
        productEndList.sort((a,b) =>{
            return a.updatedAt - b.updatedAt
        })
    }else if(type == 1){
        productEndList.sort((a,b) =>{
            return a.price - b.price
        })
    }
        
    ctx.response.body = {
        code:200,
        data:productEndList,
    }
};

module.exports = {
    'POST /taxiapi/productlist': fn_productList
};