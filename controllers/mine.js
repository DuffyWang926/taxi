const QRCode = require('qrcode') 
const model = require('../model');

const codeImgFn = async (ctx, next) => {
    let imgData = ''
    let body = ctx.request.body
    let { url } = body
    imgData = await QRCode.toDataURL(url)
    
    ctx.response.body = {
                            code:200,
                            data:{
                                imgData
                            }
                        }
};

const userAccountFn = async (ctx, next) => {
    let body = ctx.request.body
    let { openid } = body
    let userAccountsModel = model.userAccounts
    let userAccounts = await userAccountsModel.findAll({
        where: {
            openid:openid
        }
    })
    let userAccount = userAccounts[0]
    ctx.response.body = {
        code:200,
        data:{
            userAccount
        }
    }


    
};



module.exports = {
    'POST /taxiapi/codeImg': codeImgFn,
    'POST /taxiapi/userAccount': userAccountFn,
    
};