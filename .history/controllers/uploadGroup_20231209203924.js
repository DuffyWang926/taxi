const fs = require('fs')
const model = require('../model');
var uploadGroupFn = async (ctx, next) => {
    let code = 200

    let body = ctx.request.body
    console.log('body',body)
    const { type, name, theme} = body
    let fileBuffer = ctx.file.buffer
    let now = new Date().getTime() + ''
    
    
    let writePath = '../groupImgs/' + now + '.gif'
    let filePath = 'http://127.0.0.1:3000/groupImgs/' + now
    // let filePath = 'https://www.mengshikejiwang.top/api/product/' + now
    
    try{
        fs.writeFile(writePath, fileBuffer, function(err) {
            if (err) {
                throw err;
            }
        });

    }catch{

    }
    console.log('end')

    let groupModel = model.group
    console.log(now,'now')
    console.log(typeof now,'now')
    await  groupModel.create({
        id:'1',
        imgId:now,
        imgUrl: 'filePath',
        title: 'name',
        description: '',
    })

   
    ctx.response.body = {
        code,
    }

};

module.exports = {
    'POST /api/uploadGroup': uploadGroupFn,
    'GET /api/uploadGroup': uploadGroupFn
};