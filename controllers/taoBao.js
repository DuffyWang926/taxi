const puppeteer = require('puppeteer')
const chalk = require('chalk')
let browser = null
const log = console.log

var loginTaoFn = async (ctx, next) => {
    if(!browser){
        browser = await puppeteer.launch({
            headless: false,
            // headless: true,
            devtools:true,
            // defaultViewport:{ width: 1800, height: 800 },
            // defaultViewport:null,
            // args: ['--no-sandbox', '--disable-setuid-sandbox','--start-maximized','--incognito',]
            // args: ['--no-sandbox','--incognito',]
            args: ['--no-sandbox']
        })
    }
    let url = 'https://pub.alimama.com/'
    try {
        const firstPage = await browser.newPage()
        await firstPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36')
        await firstPage.evaluateOnNewDocument(() =>{ Object.defineProperties(navigator,{ webdriver:{ get: () => false } }) })
        await firstPage.goto(url,{waitUntil: 'load', timeout: 60000})
        await firstPage.evaluate(() => {
            window.navigator.webdriver = false

        });
        await firstPage.content();
        await firstPage.waitForSelector("iframe")
        const frameHandle = await firstPage.$("iframe");
        log('frameHandle',frameHandle)
        log('frameHandle contentFrame',frameHandle.contentFrame)
        const frame = await frameHandle.contentFrame();
        
        await loginTaoBaoFrame(frame,firstPage)


    } catch (error) {
        console.log(error)
        log(chalk.red('服务意外终止'))
    } finally {
        log(chalk.green('服务正常结束'))
        if(ctx){
            let dataRes = {
                code:200,
                data:{}
            }
            ctx.response.body = dataRes
        }
    }
    ctx.response.body = {
                        code:200,
                        
                    }
};

async function loginTaoBaoFrame(frame,firstPage){
    // let name = '15321830653'
    // let pwd = '15321830653abc'
    let name = '153218306531'
    let pwd = '15321830653abc1'
    await frame.type('#fm-login-id', name)
    await frame.type('#fm-login-password', pwd)
    await frame.waitForTimeout(1000)
}

module.exports = {
    'GET /taxiapi/loginTao': loginTaoFn,

};