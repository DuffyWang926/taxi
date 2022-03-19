const axios = require('axios');
const QRCode = require('qrcode') 

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


module.exports = {
    'POST /taxiapi/codeImg': codeImgFn,
};