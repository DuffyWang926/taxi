const model = require('../model');
const _ = require('lodash')
const Sequelize = require('sequelize');
const Op = Sequelize.Op

const fn_search = async (ctx, next) => {
    let body = ctx.request.body
    const { keyword } = body
    console.log(keyword,'keyword')
    let productModel = model.product

    let products = await  productModel.findAll({
        where: {
            title: { [Op.like]: `%${keyword}%` } 
        }
    })
    console.log(`find ${products} products:`);
    let imgList = Array.isArray(products) && products.map( (v,i) =>{
        let res = {
            imgId:v.id,
            imgUrl:v.imgUrl,
            title:v.title,
            author:v.author,
            downSum:v.sum,
            updatedAt:v.updatedAt
        }
        return res
    })
    imgList.sort((a,b) =>{
        return a.downSum - b.downSum
    })
    let imgListEnd = imgList.slice(0,3)
    
    let dataRes = {
        imgList:imgListEnd,
        imgListNext:imgListEnd
    }
        
    ctx.response.body = dataRes
    
};





module.exports = {
    'POST /api/search': fn_search,
    
};