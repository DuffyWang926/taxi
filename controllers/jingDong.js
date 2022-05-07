const model = require('../model');
const chalk = require('chalk')
const puppeteer = require('puppeteer')
const {handleImgToPostition} = require('../utils/pixel');
const { max } = require('lodash');
const log = console.log
let page = null
let browser = null
const loginJingDongFn = async (ctx, next) => {
    log(chalk.yellow('/taxiapi/loginJingDong start'))
    if(!browser){
        browser = await puppeteer.launch({
            // headless: false,
            headless: true,
            defaultViewport:null,
            // args: ['--start-maximized'],
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
    }
    
    // let url = 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F'
    let url = 'https://union.jd.com/index'
    try {
        const page = await browser.newPage()
        await page.goto(url)
        log(chalk.yellow('京东页面初次加载完毕'))
        await page.content();
        // loginJingDong(page)
        await loginJingDongLianMeng(page)

        //登录
    } catch (error) {
        // 出现任何错误，打印错误消息并且关闭浏览器
        console.log(error)
        log(chalk.red('服务意外终止'))
        browser = null
        await browser.close()
    } finally {
        // 最后要退出进程
        // await browser.close()
        log(chalk.green('服务正常结束'))
        if(ctx){
            let dataRes = {
                code:200,
                data:{}
            }
            ctx.response.body = dataRes

        }
        
    }

}
const searchJingDongFn = async (ctx, next) => {
    log(chalk.yellow('/taxiapi/searchjingdong start'))
    let query = ctx.request.query
    let goodsList = []
    try {
        if(!browser){
            await loginJingDongFn()
        }
        goodsList = await searchGoods(browser,query)
    } catch (error) {
        // 出现任何错误，打印错误消息并且关闭浏览器
        console.log(error)
        log(chalk.red('服务意外终止'))
        // page = null
        // browser = null
        // await browser.close()
    } finally {
        // 最后要退出进程
        // await browser.close()
        log(chalk.green('服务正常结束'))
        let dataRes = {
            code:200,
            data:{}
        }
            
        ctx.response.body = dataRes
        
        // process.exit(0)
        
    }
    
    ctx.response.body = {
                        code:200,
                        data:{
                            goodsList
                        }
                    }
    
    
};
const loginJingDong = async (page) => {
    let clickNode = await page.$('.login-tab-r')
    if(clickNode){
        clickNode.click()
        await page.waitForTimeout(1000)
    }
    let name = '等花开926'
    let pwd = 'Wef1991926'
    await page.type('.item-fore1 >input', name)
    await page.type('.item-fore2 >input', pwd)
    const loginBtn = await page.$('.login-btn')
    if(loginBtn){
        loginBtn.click()
        await page.waitForTimeout(2000)
    }
    let validateFlag = false 
    while(!validateFlag){
        const bigImg = await page.$eval('.JDJRV-bigimg >img', el => el.src);
        const smallImg = await page.$eval('.JDJRV-smallimg >img', el => el.src);
        validateFlag = await handleImgToPostition(bigImg,smallImg )

        if(!validateFlag){
            const freshValidateImg = await page.$('.JDJRV-img-refresh')
            if(freshValidateImg){
                freshValidateImg.click()
                await page.waitForTimeout(1000)
            }
        }
    }
    const keyClientWidth = await page.$eval('.JDJRV-smallimg >img', el => el.clientWidth);
    const { keyWidth, minX} = validateFlag
    let rightSpace = ( (+minX) *(+keyClientWidth/keyWidth)).toFixed(2)
    // let rightSpace = ( (+minX) *(keyClientWidth/keyWidth)).toFixed(2)
    await page.waitForTimeout(1000)
    const slideBtn = await page.$('.JDJRV-slide-btn')
    let wrongSpace = 4.4
    while(slideBtn){
        // debugger
        const boundingBox = await slideBtn.boundingBox() || {}
        let slideLeft = boundingBox.x + boundingBox.width * 0.5
        let slideTop = boundingBox.y + boundingBox.height * 0.5
        let spaceFirst = +rightSpace - 10  
        // let spaceEnd = +rightSpace + wrongSpace
        let spaceEnd = +rightSpace
        let end = slideLeft + spaceEnd
        const smallImgNode = await page.$('.JDJRV-smallimg >img')
        const keyboundingBox = await smallImgNode.boundingBox() || {}
        const keyLeft = await page.$eval('.JDJRV-smallimg >img', el => el.left);

        console.log('keyboundingBox init', keyboundingBox )
        console.log('drag init', minX )
        console.log('boundingBox', boundingBox )
        console.log('rightSpace', rightSpace )
        console.log('end', end )

        await page.mouse.click(slideLeft,slideTop,{delay:2000})
        await page.mouse.down(slideLeft,slideTop)
        await page.mouse.move(slideLeft + spaceFirst,slideTop,{steps:30})
        await page.mouse.move(end,slideTop,{steps:20})
        const boundingBoxEnd = await slideBtn.boundingBox() || {}
        const smallImgNodeEnd = await page.$('.JDJRV-smallimg >img')
        const keyboundingBoxEnd = await smallImgNodeEnd.boundingBox() || {}
        console.log('boundingBoxEnd end', boundingBoxEnd )
        console.log('keyboundingBox end', keyboundingBoxEnd )
        let wucha = end - boundingBoxEnd.x - boundingBox.width * 0.5
        console.log('wucha end', wucha )

        await page.waitForTimeout(500)
        await page.mouse.up();
        await page.waitForTimeout(1000)
        let nextFlag = await page.$('.search_logo')
        if(nextFlag){
            slideBtn = false
        }
    }
    

    


}

const loginJingDongLianMeng = async (page) =>{
    await page.waitForSelector("iframe[id='indexIframe']")
    let accountTab = await page.$('#tab-account')
    if(accountTab){
        accountTab.click()
        await page.waitForTimeout(1000)
    }
    const frameHandle = await page.$("iframe[id='indexIframe']");
    const frame = await frameHandle.contentFrame();

    let name = '17319075327'
    let pwd = 'wef1991926'
    await frame.type('.item-ifo >input', name)
    await frame.type('#nloginpwd', pwd)
    let loginBtn = await frame.$('#paipaiLoginSubmit')
    if(loginBtn){
        loginBtn.click()
        await frame.waitForTimeout(2000)
    }
    let next = await frame.$(".JDJRV-bigimg >img")
    if(next){
        await validateLogin(frame, page)
    }
}

async function validateLogin(page, parent){
    log(chalk.yellow('validateLogin start'))
    let validateFlag = false 
    while(!validateFlag){
        console.log('while start')
        let next = await page.$(".JDJRV-bigimg >img")
        if(!next){
            return
        }
        // await page.waitForSelector(".JDJRV-bigimg >img")
        const bigImg = await page.$eval('.JDJRV-bigimg >img', el => el.src);
        console.log('bigImg')

        const smallImg = await page.$eval('.JDJRV-smallimg >img', el => el.src);
        let locationObj = {}
        if(bigImg && smallImg){
            locationObj = await handleImgToPostition(bigImg,smallImg )
        }
        const keyClientWidth = await page.$eval('.JDJRV-smallimg >img', el => el.clientWidth);
        const { keyWidth, minX} = locationObj
        let rightSpace = ( (+minX) *(keyClientWidth/keyWidth)).toFixed(2)
        await page.waitForTimeout(1000)
        const slideBtn = await page.$('.JDJRV-slide-btn')
        if(slideBtn){
            const boundingBox = await slideBtn.boundingBox() || {}
            let slideLeft = boundingBox.x + boundingBox.width * 0.5
            let slideTop = boundingBox.y + boundingBox.height * 0.5
            let spaceFirst = +rightSpace - 10  
            let spaceEnd = +rightSpace
            let end = slideLeft + spaceEnd
            const smallImgNode = await page.$('.JDJRV-smallimg >img')
            const keyboundingBox = await smallImgNode.boundingBox() || {}

            console.log('keyboundingBox init', keyboundingBox )
            console.log('drag init', minX )
            console.log('boundingBox', boundingBox )
            console.log('rightSpace', rightSpace )
            console.log('end', end )
            let mouseParent = page
            if(parent){
                mouseParent = parent
            }
            console.log('mouseParent.mouse', mouseParent.mouse )


            await mouseParent.mouse.click(slideLeft,slideTop,{delay:1000})
            await mouseParent.mouse.down(slideLeft,slideTop)
            await mouseParent.mouse.move(slideLeft + spaceFirst,slideTop,{steps:30})
            await mouseParent.mouse.move(end,slideTop,{steps:20})
            const boundingBoxEnd = await slideBtn.boundingBox() || {}
            const smallImgNodeEnd = await page.$('.JDJRV-smallimg >img')
            const keyboundingBoxEnd = await smallImgNodeEnd.boundingBox() || {}
            console.log('boundingBoxEnd end', boundingBoxEnd )
            console.log('keyboundingBox end', keyboundingBoxEnd )
            let wucha = end - boundingBoxEnd.x - boundingBox.width * 0.5
            console.log('wucha end', wucha )

            await mouseParent.waitForTimeout(500)
            await mouseParent.mouse.up();
            await mouseParent.waitForTimeout(2000)
            let nextNodeInit = await page.$('.JDJRV-slide-bar-center')
            if(nextNodeInit){
                var centerContentNext = await page.evaluate(() => {
                    let nextNodeInit = document.getElementByClassName('.JDJRV-slide-bar-center')
                    return nextNodeInit.innerText;
                });
                console.log('centerContentNext',centerContentNext)
                let centerContent = await page.$eval('.JDJRV-slide-bar-center', el => el.value) || '';
                console.log('centerContent',centerContent)
                if(centerContent && centerContent.includes('成功')){
                    validateFlag = true
                }
            }else{
                console.log('tiaozhuan')
            }
            await mouseParent.waitForNavigation()
            let nextNode = await mouseParent.$('#tab-account')
            if(!nextNode){
                console.log('tiaozhuan')
                validateFlag = true
            }
            console.log('while end')
        }
    }

}

async function searchGoods(browser, query){
    log(chalk.yellow('searchGoods start'))
    let url = 'https://union.jd.com/overview'
    let goodsList = []
    const { keyword, isInit, size } = query
    debugger
    try {
        if(!page){
            page = await browser.newPage()
            await page.goto(url)
            await page.waitForSelector('.menu-wrapper')
            let recommentMenu = await page.$('.menu-wrapper:nth-child(2)')
            if(recommentMenu){
                recommentMenu.click()
                await page.waitForTimeout(1000)
            }
            let recommentMenuItem = await page.$('.menu-wrapper:nth-child(2) >.el-submenu >.el-menu >a')
            if(recommentMenuItem){
                recommentMenuItem.click()
                await page.waitForTimeout(2000)
                // await page.waitForSelector('.el-input__inner')
            }
        }
        // let loginBtn = await page.$('.el-button--primary')
        // if(loginBtn){
        //     loginBtn.click()
        //     await page.waitForTimeout(1000)
        // }
        
        
        let searchKey = keyword || ''
        let searchInput = await page.$('.el-input__inner')
        if(searchInput){
            await page.type('.el-input__inner', searchKey)
        }
        let searchBtn = await page.$('.search-btn')
        if(searchBtn){
            searchBtn.click()
            await page.waitForTimeout(1000)
        }
        let goodNodeList = await page.$$('.search-card')
        console.log('goodNodeList.length',goodNodeList.length)
        let goodLen = goodNodeList.length
        if(size < goodLen){
            goodLen = +size 
        }
        for(let i =0 ; i < goodLen; i++ ){
            let item = goodNodeList[i]
            let imgNode = item.$('a >img')
            let imgSrc = ''
            let buyUrl = ''
            let couponUrl = ''
            let title = ''
            let price = ''
            let returnRate= 0
            let returnMoney= 0
            let shop = ''

            if(imgNode){
                imgSrc = await item.$eval('a >img', el => el.src);
            }
            //url
            if(isInit !== '0'){
                let buyNode = await item.$('div:nth-of-type(5) >.el-button:nth-child(2)')
                if(!buyNode){
                    buyNode = await item.$('div:nth-of-type(4) >.el-button:nth-child(2)')
                }
                if(buyNode){
                    buyNode.click()
                    await page.waitForTimeout(2000)
                    // let tabNode = await page.$('#tab-1')
                    // if(tabNode){
                    //     tabNode.click()
                    //     await page.waitForTimeout(1000)
                    // }
                    let inputNode = await page.$('.el-textarea >textarea')
                    if(inputNode){
                        buyUrl = await page.$eval('.el-textarea >textarea', el => el.value)
                    }
                    let couponInputNode = await page.$('#pane-0 >.el-row >.el-col >.el-input >.el-input__inner')
                    if(couponInputNode){
                        couponUrl = await page.$eval('#pane-0 >.el-row >.el-col >.el-input >.el-input__inner', el => el.value)
                    }
                    let closeBtn = await page.$('.promote >.el-dialog >.el-dialog__header >.el-dialog__headerbtn >.el-dialog__close')
                    if(closeBtn){
                        closeBtn.click()
                        await page.waitForTimeout(1000)
                    }
                }

            }
            
            
            //title
            let titleNode = await item.$('.two >a')
            if(titleNode){
                title = await item.$eval('.two >a', el => el.innerHTML);
            }
            let priceNode = await item.$('.three >span')
            if(priceNode){
                priceTxt = await item.$eval('.three >span', el => el.innerHTML);
                price = priceTxt.replace('￥','').trim()
            }
            let returnRateNode = await item.$('.el-popover__reference')
            if(returnRateNode){
                returnRate = await item.$eval('.el-popover__reference', el => el.innerHTML);
                returnRate = returnRate.replace('%','')
                returnRate = +returnRate * 0.01
            }
            returnMoney =  (+price * returnRate * 0.9).toFixed(2)
            let shopNode = await item.$('.shop-detail >span >a')
            if(shopNode){
                shop = await item.$eval('.shop-detail >span >a', el => el.innerHTML);
            }
            let res = {
                imgSrc,
                buyUrl,
                title,
                price,
                returnRate,
                returnMoney,
                couponUrl,
                shop
            }
            goodsList.push(res)

        }
        debugger
        
        // const test = await page.$eval('.el-input__inner', el => el.outerHTML);
        // console.log('test', test)
    }catch(e){
        console.log(e)
    }
    return goodsList

    


    
    


    

}

module.exports = {
    'GET /taxiapi/searchjingdong': searchJingDongFn,
    'GET /taxiapi/loginjingdong': loginJingDongFn,

};