const sendfile = require('koa-sendfile');
const fn_product = async (ctx, next) => {
    console.log('imgs')

    const name = ctx.params.name;
    const path = `../products/${name}.gif`;
    ctx.attachment(decodeURI(path));
    await sendfile(ctx, path);
};

module.exports = {
    'GET /api/product/:name': fn_product
};