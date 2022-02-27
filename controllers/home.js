const model = require('../model');
const _ = require('lodash')

const fn_banner = async (ctx, next) => {
    let productModel = model.user

    let users = await  productModel.findAll({
        where: {
        }
    })
    console.log(`find ${users} users:`);
    
    ctx.response.body = {
        bannerList:users
    }
};

const fn_home = async (ctx, next) => {
    let productModel = model.product

    let products = await  productModel.findAll({
        where: {
        }
    })
    console.log(`find ${products} products:`);
    let imgList = Array.isArray(products) && products.map( (v,i) =>{
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
    imgList.sort((a,b) =>{
        return a.downSum - b.downSum
    })
    let imgListEnd = imgList.slice(0,3)
    let nextList = _.cloneDeep(imgList)
    nextList.sort((a,b) =>{
        return b.updatedAt - a.updatedAt
    })
    let newList = nextList.slice(0,3)
    console.log(imgList)
    console.log(nextList)
    let dataRes = [
        {
            title:'热门',
            type:0,
            imgList:imgListEnd
        },
        {
            title:'最新',
            type:1,
            imgList:newList
        },
    ]
    ctx.response.body = dataRes
    
};

module.exports = {
    'GET /taxiapi/home': fn_home,
    'GET /taxiapi/banner': fn_banner,

};