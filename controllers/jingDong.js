const axios = require('axios');
const model = require('../model');
const chalk = require('chalk')
const puppeteer = require('puppeteer')
const {handleImgToPostition} = require('../utils/pixel');
const { max } = require('lodash');
const log = console.log
let page = null
let browser = null
let isLogin = false
const loginJingDongFn = async (ctx, next) => {
    log(chalk.yellow('/taxiapi/loginJingDong start'))
    if(!browser){
        browser = await puppeteer.launch({
            headless: false,
            // headless: true,
            // devtools:true,

            // defaultViewport:{ width: 1800, height: 800 },
            // defaultViewport:null,
            // args: ['--start-maximized'],
            // args: ['--no-sandbox', '--disable-setuid-sandbox','--start-maximized']
            // args: ['--no-sandbox', '--disable-setuid-sandbox',]
            args: ['--no-sandbox']
        })
    }
    
    // let url = 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F'
    let url = 'https://union.jd.com/index'
    try {
        const firstPage = await browser.newPage()
        await firstPage.setUserAgent('"Mozilla/5.0 (Windows NT 6.0) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.36 Safari/536.5"')
        await firstPage.evaluateOnNewDocument('() =>{ Object.defineProperties(navigator,{ webdriver:{ get: () => false } }) }')
        await firstPage.goto(url,{waitUntil: 'load', timeout: 60000})
        log(chalk.yellow('京东页面初次加载完毕'))
        await firstPage.content();
        
        // await page.evaluate(() => {

        //     localStorage.setItem('_isGotoIndexFlag', '10');
        //     let user = '{"appAgree":0,"calendar":0,"cpActivity":0,"cpcAgree":0,"cpsAgree":1,"isCeleShop":0,"isContent":0,"isOperate":0,"isGK":0,"isMotherPower":0,"isChannel":0,"qualificationStatus":0,"register":1,"nickName":"等月的树","haveMultipleAccounts":false,"yunBigImageUrl":""}'
        //     localStorage.setItem('UNION_ROLES', user);
        //     localStorage.setItem('register', 1);
            
        // });
        // loginJingDong(page)
        // await loginJingDongFrame(page)
        await loginJingDongLianMeng(firstPage)

        //登录
    } catch (error) {
        // 出现任何错误，打印错误消息并且关闭浏览器
        console.log(error)
        log(chalk.red('服务意外终止'))
        // browser = null
        // await browser.close()
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
    return isLogin

}
const searchJingDongFn = async (ctx, next) => {
    log(chalk.yellow('/taxiapi/searchjingdong start'))
    let query = ctx.request.query
    let goodsList = []
    try {
        if(!browser){
            await loginJingDongFn()
        }
        debugger
        if(isLogin){
            goodsList = await searchGoods(browser,query)
        }
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

        // console.log('keyboundingBox init', keyboundingBox )
        // console.log('drag init', minX )
        // console.log('boundingBox', boundingBox )
        // console.log('rightSpace', rightSpace )
        // console.log('end', end )

        await page.mouse.click(slideLeft,slideTop,{delay:2000})
        await page.mouse.down(slideLeft,slideTop)
        await page.mouse.move(slideLeft + spaceFirst,slideTop,{steps:30})
        await page.mouse.move(end,slideTop,{steps:20})
        const boundingBoxEnd = await slideBtn.boundingBox() || {}
        const smallImgNodeEnd = await page.$('.JDJRV-smallimg >img')
        const keyboundingBoxEnd = await smallImgNodeEnd.boundingBox() || {}
        // console.log('boundingBoxEnd end', boundingBoxEnd )
        // console.log('keyboundingBox end', keyboundingBoxEnd )
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
    log(chalk.yellow('loginJingDongLianMeng start'))
    await page.waitForSelector("iframe[id='indexIframe']")
    let accountTab = await page.$('#tab-account')
    if(accountTab){
        accountTab.click()
        await page.waitForTimeout(1000)
    }
    const frameHandle = await page.$("iframe[id='indexIframe']");
    const frame = await frameHandle.contentFrame();
    await loginJingDongFrame(frame,page)
}

const loginJingDongFrame = async (frame,page) =>{
    let name = '17319075327'
    // let name = '17319075329'
    let pwd = 'wef1991926'
    await frame.type('.item-ifo >input', name)
    await frame.type('#nloginpwd', pwd)
    await frame.waitForTimeout(1000)
    let loginBtn = await frame.$('#paipaiLoginSubmit')
    // await frame.$eval('#useSlideAuthCode', el => el.value = 1)
    // await frame.evaluate(() => {
    //     // let useSlideAuthCode = document.getElementById('#useSlideAuthCode')
    //     // useSlideAuthCode.value = '1'
    //     // this.useSlideAuthCode = false
    //     window.useSlideAuthCode = true
    //     let time = new Date().valueOf()

    //     localStorage.setItem('_isGotoIndexFlag', '7');
    //     // let user = '{"appAgree":0,"calendar":0,"cpActivity":0,"cpcAgree":0,"cpsAgree":1,"isCeleShop":0,"isContent":0,"isOperate":0,"isGK":0,"isMotherPower":0,"isChannel":0,"qualificationStatus":0,"register":1,"nickName":"等月的树","haveMultipleAccounts":false,"yunBigImageUrl":""}'
    //     let user = '{"appAgree":0,"calendar":0,"cpActivity":0,"cpcAgree":0,"cpsAgree":1,"isCeleShop":0,"isContent":0,"isOperate":0,"isGK":0,"isMotherPower":0,"isChannel":0,"qualificationStatus":0,"register":1,"nickName":"等月的树","haveMultipleAccounts":false,"yunBigImageUrl":""}'
    //     localStorage.setItem('UNION_ROLES', user);
    //     localStorage.setItem('register', 1);
    //     localStorage.setItem('cfvalmdjrr', '7164d3a376a0f99e67731a75dd068ed7');
    //     localStorage.setItem('timecfjrr', time);
    //     localStorage.setItem('webglvmdjrr', 'de47b81396f4bb894de86880200cc3f3');
    //     localStorage.setItem('3AB9D23F7A4B3C9B', 'HDVTYF7P7BRYZKRDEQG7VOTGFZO2HXWG7GCSROQ57GFWOS4TD2TZPUKK6DGXDI6N4WT3LRRZR3TSK6XWTE2YQ5BNKQ');
    //     localStorage.setItem('timejrrwg', time);
    // });
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
    try{
        while(!validateFlag){
            console.log('while start')
            let next = await page.$(".JDJRV-bigimg >img")
            if(!next){
                return
            }
            // await page.waitForSelector(".JDJRV-bigimg >img")
            const bigImg = await page.$eval('.JDJRV-bigimg >img', el => el.src);
    
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
                let spaceFirst = +rightSpace - 60  
                let spaceSecond = +rightSpace - 30  
                let spaceThird = +rightSpace - 10  
                let spaceEnd = +rightSpace
                let end = slideLeft + spaceEnd
                const smallImgNode = await page.$('.JDJRV-smallimg >img')
                const keyboundingBox = await smallImgNode.boundingBox() || {}
    
                // console.log('keyboundingBox init', keyboundingBox )
                // console.log('drag init', minX )
                // console.log('boundingBox', boundingBox )
                // console.log('rightSpace', rightSpace )
                // console.log('end', end )
                let mouseParent = page
                if(parent){
                    mouseParent = parent
                }
    
                await mouseParent.mouse.click(slideLeft,slideTop,{delay:1000})
                await mouseParent.mouse.down(slideLeft,slideTop)
                await mouseParent.mouse.move(slideLeft + spaceFirst,slideTop,{steps:30})
                await mouseParent.mouse.move(slideLeft + spaceSecond,slideTop,{steps:10})
                await mouseParent.mouse.move(slideLeft + spaceThird,slideTop,{steps:20})
                await mouseParent.mouse.move(end,slideTop,{steps:20})
                const boundingBoxEnd = await slideBtn.boundingBox() || {}
                const smallImgNodeEnd = await page.$('.JDJRV-smallimg >img')
                const keyboundingBoxEnd = await smallImgNodeEnd.boundingBox() || {}
                // console.log('boundingBoxEnd end', boundingBoxEnd )
                // console.log('keyboundingBox end', keyboundingBoxEnd )
                let wucha = end - boundingBoxEnd.x - boundingBox.width * 0.5
                console.log('wucha end', wucha )
                
    
                await mouseParent.waitForTimeout(500)
                await mouseParent.mouse.up();
                // let name = './test' +wucha + '.png'
                // await mouseParent.screenshot({
                //     path: name,
                //     fullPage: true
                // });
                // await mouseParent.waitForTimeout(1000)
                // if(wucha <= 0.09){
                //     console.log('tiaozhuan')
                //     validateFlag = true
                // }
                
                let nextNodeInit = await page.$('.JDJRV-slide-bar-center')
                if(nextNodeInit){
                    let centerContentNext = await page.evaluate(() => {
                        let nextNodeInit = document.querySelector('.JDJRV-slide-bar-center') || []
                        console.log('nextNodeInit',nextNodeInit)
                        let centerNode = nextNodeInit
                        return centerNode.outerHTML;
                    });
                    let centerContent = await page.$eval('.JDJRV-slide-bar-center', el => el.outerHTML) || '';
                    console.log('centerContentNext',centerContentNext)
                    console.log('centerContent',centerContent)
                    if(centerContent && centerContent.includes('成功')){
                        validateFlag = true
                    }
                }else{
                    console.log('error')
                }
                console.log('while end')
            }
        }

    }catch(e){
        console.log('navigate',e)
    }
    isLogin = true

}

async function searchGoods(browser, query){
    const { keyword, isInit, size } = query
    let goodsList = []

    log(chalk.yellow('searchGoods start'))
    // let url = 'https://union.jd.com/overview'
    let url = 'https://union.jd.com/proManager/index?keywords='
    try {
        if(!page){
            page = await browser.newPage()
            await page.goto(url,{waitUntil: 'load', timeout: 0})

            // await page.waitForSelector('.union-msg-title')
            await page.waitForSelector('.search-card')
            await page.waitForSelector('.search >.search-btn')
            
            // let recommentMenu = await page.$('.menu-wrapper:nth-child(2)')
            // if(recommentMenu){
            //     recommentMenu.click()
            //     await page.waitForTimeout(1000)
            // }
            // let recommentMenuItem = await page.$('.menu-wrapper:nth-child(2) >.el-submenu >.el-menu >a')
            // if(recommentMenuItem){
            //     recommentMenuItem.click()
            //     await page.waitForTimeout(2000)
            // }
            let tipCloseNode = await page.$('.union-msg-title >span')
            if(tipCloseNode){
                const tipCloseNodeTemp = await page.$('.union-msg-title >span')
                const boundingBox = await tipCloseNodeTemp.boundingBox() || {}
                let slideLeft = +boundingBox.x + (+boundingBox.width) * 0.5
                let slideTop = +boundingBox.y + (+boundingBox.height) * 0.5
                await page.mouse.click(slideLeft,slideTop)
                
            }
        }
        
        let searchKey = keyword || ''
        let searchInput = await page.$('.el-input__inner')
        if(searchInput){
            await page.$eval('.el-input__inner', el => el.value = '');
            console.log('.searchKey', searchKey)
            await page.type('.el-input__inner', searchKey)
        }
        debugger

        // let searchBtn = await page.$('.search >.search-btn >span')
        let searchBtn = await page.$('.search >.search-btn')
        if(searchBtn){
            // const tipCloseNodeTemp = await page.$('.search >.search-btn >span')
            const tipCloseNodeTemp = await page.$('.search >.search-btn')
            const boundingBox = await tipCloseNodeTemp.boundingBox() || {}
            let slideLeft = +boundingBox.x + (+boundingBox.width) * 0.5
            let slideTop = +boundingBox.y + (+boundingBox.height) * 0.5
            console.log('.slideLeft', slideLeft)
            console.log('.slideTop', slideTop)
            // await page.mouse.click(slideLeft,slideTop)
            await searchBtn.click()
            const test = await page.$eval('.search >.search-btn >span', el => el.outerHTML);
            console.log('.search-btn', test)
            await page.waitForTimeout(2000)
        }
        debugger
        // let test = await page.$('.card-box')
        // if(test){
        //     const test = await page.$eval('.card-box', el => el.outerHTML);
        //     console.log('.search-btn', test)
        //     const test2 = await page.$eval('.card-box >.search-card', el => el.outerHTML);
        //     console.log('.search-btn', test2)

        // }
        
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
        let res = await page.content()
        // console.log('page',res)
        
        // const test = await page.$eval('.el-input__inner', el => el.outerHTML);
        // console.log('test', test)
    }catch(e){
        console.log(e)
    }
    return goodsList

}

 
const searchGooodsJDFn = async (ctx, next) => {
    let query = ctx.request.query
    log(chalk.yellow('/taxiapi/searchGooodsJDFn start'))
    let url = `http://192.168.0.107:3001/taxiapi/searchjingdong`
    
    let response = await axios({
        method: "GET",
        url: url,
        params:query
    })
    const { data={} } = response
    let dataRes = {
        code:200,
        data
    }
    ctx.response.body = dataRes

}


module.exports = {
    'GET /taxiapi/searchjingdong': searchJingDongFn,
    'GET /taxiapi/searchgoodsjd': searchGooodsJDFn,
    'GET /taxiapi/loginjingdong': loginJingDongFn,

};