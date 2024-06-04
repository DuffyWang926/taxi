const sendfile = require('koa-sendfile');
const fn_product = async (ctx, next) => {
    console.log('imgs')

    const name = ctx.params.name;
    const path = `../products/${name}`;
    ctx.attachment(decodeURI(path));
    await sendfile(ctx, path);
};

module.exports = {
    'GET /taxiapi/product/:name': fn_product
};

   