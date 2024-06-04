const model = require('../model');
const fs = require('fs');
const fn_productList = async (ctx, next) => {
    let body = ctx.request.body
    const { type, page, pageSize, userId } = body
    let productModel = model.product
    let offset = ( +page -1) * (+pageSize)
    let searchObj = {}
    if(userId){
        searchObj = {
            publisher:userId
        }
    }

    let productList = await  productModel.findAll({
        where: searchObj,
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
const deleteProducts = async (ctx, next) => {
    let body = ctx.request.body
    const { ids } = body; 
    let productModel = model.product;
    let productImgModel = model.productImgs;

    // 获取要删除的商品图片信息
    let productImages = await productImgModel.findAll({
        where: {
            ProductId: ids
        }
    });

    // 删除图片文件
    for (let productImage of productImages) {
        let imageUrl = productImage.imagePath;
        let basePath = imageUrl.split('product/');
        if(basePath && basePath.length > 1){
            let imagePath = '../products/' + basePath[1]  // 假设文件是jpg格式
            fs.unlink(imagePath, (err) => {
                if(err) {
                console.error('There was an error:', err);
                } else {
                console.log('image.jpg was deleted');
                }
            });

        }
        

    }

    // 删除 productImgs 表中的记录
    await productImgModel.destroy({
        where: {
            ProductId: ids
        }
    });

    // 删除 products 表中的记录
    await productModel.destroy({
        where: {
            id: ids
        }
    });  
        
    ctx.response.body = {
        code:200,
    }
};


module.exports = {
    'POST /taxiapi/productlist': fn_productList,
    'POST /taxiapi/deleteproducts': deleteProducts,
};