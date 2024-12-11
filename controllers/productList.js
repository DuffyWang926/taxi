const model = require('../model');
const fs = require('fs');
const { Op } = require('sequelize');
const fn_productList = async (ctx, next) => {
    let body = ctx.request.body
    const { type = 0, page, pageSize, userId, city, keyword, isAll } = body
    let productModel = model.product
    let offset = ( +page -1) * (+pageSize)
    let searchObj = {}
    let findObj = {}
    let order = [['updatedAt', 'DESC']]
    if(type == 0){                                
        order = [['updatedAt', 'DESC']]
    }else if(type == 1){
        order = [['price', 'DESC']]
    }
    if(isAll){
        findObj={}

    }else{
        if(userId){
            searchObj = {
                publisher:userId
            }
            findObj = {
                where: searchObj,
                // include: [{
                //     model: model.productImgs,
                //     required: false,
                // }],
                order: order,
                offset,
                limit: pageSize 
            }
        }else if(city){
            searchObj = {
                cityCode:city,
                title: {
                    [Op.like]: `%${keyword}%` // 使用 Sequelize 的 like 操作符来查找 title 中包含关键字的记录
                  }
            }
            findObj = {
                where: searchObj,
                // include: [{
                //     model: model.productImgs,
                //     required: false,
                // }],
                order: order,
                offset,
                limit: pageSize 
            }
        }else{
            findObj = {
                where: {},
                // include: [{
                //     model: model.productImgs,
                //     required: false,
                // }],
                order: order,
                offset,
                limit: pageSize 
            }
        }

    }
    
    let productList = await  productModel.findAll(findObj)
    
    let productImgModel = model.productImgs    
    let productEndList = []
    for (let item of productList) {
        let imgList = await  productImgModel.findAll({
            where: {
                productId:item.id
            },
        })
        let imgEndList = imgList.map( img => img.imagePath)
        let plainItem = item.get({plain: true});
        plainItem.imgList = imgEndList;
        productEndList.push(plainItem)
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
const reportProduct = async (ctx, next) => {
    let body = ctx.request.body
    const { id, reason } = body
    let productModel = model.product

    let products = await  productModel.findAll({
        where: {
            id:id
        }
    })
    if(products && products.length > 0){
        let product = products[0]
        const { reportNum } = product
        let nextNum = +reportNum + 1
        let nextReason = reason
        await productModel.update(
            {
                ...product,
                reportNum:nextNum,
                reportReason:nextReason
            },
            {
                where: { id:id },
            }
        );

    }
    
    
    let dataRes = {
        code:200,
    }
        
    ctx.response.body = dataRes
};

module.exports = {
    'POST /taxiapi/productlist': fn_productList,
    'POST /taxiapi/deleteproducts': deleteProducts,
    'POST /taxiapi/reportProduct': reportProduct,
};