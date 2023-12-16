const fs = require('fs')
const model = require('../model');
var uploadGroupFn = async (ctx, next) => {
    let code = 200

    // let body = ctx.request.body
    // const { type, name, theme} = body
    // let fileBuffer = ctx.file.buffer
    let now = new Date().getTime() + ''
    
    
    // let writePath = '../products/' + now + '.gif'
    // // let filePath = 'http://127.0.0.1:3000/product/' + now
    // let filePath = 'https://www.mengshikejiwang.top/api/product/' + now
    
    // try{
    //     fs.writeFile(writePath, fileBuffer, function(err) {
    //         if (err) {
    //             throw err;
    //         }
    //     });

    // }catch{

    // }
    // console.log('end')

    let groupModel = model.group
    let sum = Math.floor(Math.random()*10+1) + ''
    console.log(now,'now')
    console.log(typeof now,'now')
    await  groupModel.create({
        id:'1',
        productId:now,
        imgUrl: filePath,
        title: 'name',
        description: '',
    })

   
    ctx.response.body = {
        code,
    }

};

module.exports = {
    // 'POST /api/upload': fn_upload,
    'GET /api/uploadGroup': uploadGroupFn
};