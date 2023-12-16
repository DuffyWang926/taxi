const fs = require('fs')
const model = require('../model');
const path = require('path');
var uploadGroupFn = async (ctx, next) => {
    let code = 200

    let body = ctx.request.body
    console.log('body',body)
    console.log('ctx.file',ctx.file)
    const { radioItem } = body
    console.log("radioItem",radioItem)
    let fileBuffer = ctx.file.buffer
    let now = new Date().getTime() + ''
    const fileExtension = ctx.file.mimetype.split('/').pop();
    let writePath = path.join(__dirname, '../groupImgs', now + '.' + fileExtension);
    let filePath = 'http://127.0.0.1:3000/groupImgs/' + now
    // let filePath = 'https://www.mengshikejiwang.top/api/product/' + now
    
    try{
        const directory = path.dirname(writePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

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
        createdAt:now,
    })

   
    ctx.response.body = {
        code,
    }

};


const getGroupImgsFn = async (ctx, next) => {
    let code = 200

    let body = ctx.request.body
    console.log('body',body)
    console.log('ctx.file',ctx.file)
    const { radioItem } = body
    console.log("radioItem",radioItem)
    let fileBuffer = ctx.file.buffer
    let now = new Date().getTime() + ''
    const fileExtension = ctx.file.mimetype.split('/').pop();
    let writePath = path.join(__dirname, '../groupImgs', now + '.' + fileExtension);
    let filePath = 'http://127.0.0.1:3000/groupImgs/' + now
    // let filePath = 'https://www.mengshikejiwang.top/api/product/' + now
    
    try{
        const directory = path.dirname(writePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

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
        createdAt:now,
    })

   
    ctx.response.body = {
        code,
    }

};

module.exports = {
    'POST /api/uploadGroup': uploadGroupFn,
    'GET /api/getGroupImgs': getGroupImgsFn
};