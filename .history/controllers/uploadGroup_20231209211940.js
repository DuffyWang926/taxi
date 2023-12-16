const fs = require('fs')
const model = require('../model');
const path = require('path');
var uploadGroupFn = async (ctx, next) => {
    let code = 200

    let body = ctx.request.body
    console.log('body',body)
    console.log('ctx.file',ctx.file)
    const { value, text } = body

    console.log("radioItem",radioItem)
    console.log("value",value)
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
        imgId:value,
        imgUrl: filePath,
        title: text,
        description: text,
        createdAt:now,
    })

   
    ctx.response.body = {
        code,
    }

};


const getGroupImgsFn = async (ctx, next) => {
    let code = 200

    let groupModel = model.group
    let groupImgs = await  groupModel.findAll({
        where: {}
    })
    console.log(groupImgs)
    let data = []
    if(groupImgs && groupImgs.length > 0){
        let item = groupImgs[0]
        let createDate = item && item.createdAt
        let now = new Date().getTime()
        const weekDuration = 7 * 24 * 60 * 60 * 1000;
        if (createDate && (now - createDate) <= weekDuration) {
            data = groupImgs
        } else {
            data = []
        }
    }
   
    ctx.response.body = {
        code,
        data,
    }

};

module.exports = {
    'POST /api/uploadGroup': uploadGroupFn,
    'GET /api/getGroupImgs': getGroupImgsFn
};