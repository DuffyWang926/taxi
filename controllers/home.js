const model = require('../model');

var fn_postUserInfo = async (ctx, next) => {
    let body = ctx.request.body
    const { unionid } = body
    let userModel = model.user
    
    let users = await  userModel.findAll({
        where: {
            unionid:unionid
        }
    })
    let userInfo = {
        nickname:'',
        sex:'',
        province:'',
        city:'',
        headimgurl:'',
        openid:'',
        unionid:'test',
        userId:'test'
    }
    if(users.length > 0 ){
        const {  nickname= '', sex= -1, province = '', city = '', headimgurl = '', unionid = 'test', userId = 'test' } = users[0]
        userInfo = {
            nickname,
            sex,
            province,
            city,
            headimgurl,
            openid,
            unionid,
            userId
        }
    }
    console.log('userInfo',JSON.stringify(userInfo))
    ctx.response.body = {
                        code:200,
                        data:{
                            userInfo
                        }
                    }
    
    
};

module.exports = {
    'POST /taxiapi/postUserInfo': fn_postUserInfo,

};