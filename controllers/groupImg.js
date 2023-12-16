const sendfile = require('koa-sendfile');
const path = require('path');
const fn_product = async (ctx, next) => {
    console.log('imgs',ctx.params.name)

    const name = ctx.params.name;
    // const path = `../groupImgs/${name}`;
    let filePath = path.join(__dirname, '../groupImgs', name);
    ctx.attachment(decodeURI(filePath));
    await sendfile(ctx, filePath);
};

module.exports = {
    'GET /api/groupImg/:name': fn_product
};