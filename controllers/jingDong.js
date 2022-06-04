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
let shtmlNum = 0
const loginJingDongFn = async (ctx, next) => {
    log(chalk.yellow('/taxiapi/loginJingDong start'))
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
    
    // let url = 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F'
    let url = 'https://union.jd.com/index'
    // let url = 'https://www.mengshikejiwang.top/#/pages/index/index'
    try {
        const firstPage = await browser.newPage()
        await firstPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36')
        await firstPage.evaluateOnNewDocument(() =>{ Object.defineProperties(navigator,{ webdriver:{ get: () => false } }) })
        
       
        await firstPage.setRequestInterception(true);
        // firstPage.on('request', (request) => { request.continue();})
        firstPage.on('request', (request) => {
            let url = request.url()
            let path = url.replace('https://iv.jd.com','')
            
            let cookie = 'RT="z=1&dm=jd.com&si=aa7qdse4mcb&ss=l3y9vwfo&sl=0&tt=0"; __jdv=209449046|direct|-|none|-|1654250247995; __jdu=1654250247995953887068; __jda=95931165.1654250247995953887068.1654250248.1654250248.1654250248.1; __jdc=95931165; __jdb=95931165.3.1654250247995953887068|1.1654250248'
            let manulHeadersFirst = {
                    ':authority':'iv.jd.com',
                    ':method':'GET',
                    ':path':path,
                    ':scheme':'https',
                    "Accept":'*/*',
                    "Accept-Encoding":'gzip, deflate, br',
                    'Accept-Language':'zh-CN,zh;q=0.9',
                    'Connection':'keep-alive',
                    'cookie':cookie,
                    'Host':'iv.jd.com',
                    'Referer':'https://passport.jd.com/',
                    'sec-ch-ua':'" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                    'sec-ch-ua-mobile':'?0',
                    'sec-ch-ua-platform':'"Windows"',
                    'Sec-Fetch-Dest':'script',
                    'Sec-Fetch-Mode':'no-cors',
                    'Sec-Fetch-Site':'same-site',
                    }
            let cookieSecond = '__jdv=209449046|direct|-|none|-|1654250247995; __jdu=1654250247995953887068; __jda=95931165.1654250247995953887068.1654250248.1654250248.1654250248.1; __jdc=95931165; __jdb=95931165.3.1654250247995953887068|1.1654250248; 3AB9D23F7A4B3C9B=SVJPZUO4OFVV757GORUJHZRMNZ7DZCUJ6CMQ4TMBAYHH6D46DOCHBTTHNSZZU53BK7LGX7RYU4JKSN6627YORSNZLE; JSESSIONID=0EF4DD07ECA4FC6A1B2F831252C15A70.s1; RT="z=1&dm=jd.com&si=aa7qdse4mcb&ss=l3y9vvzr&sl=1&tt=22r&ld=2v1"'
            let manulHeadersSecond = {
                    ':authority':'iv.jd.com',
                    ':method':'GET',
                    ':path':path,
                    "Accept":'*/*',
                    "Accept-Encoding":'gzip, deflate, br',
                    'Accept-Language':'zh-CN,zh;q=0.9',
                    'Connection':'keep-alive',
                    'Cookie':cookieSecond,
                    // 'Cookie':'',
                    // 'cookie':'',
                    'Host':'iv.jd.com',
                    'Referer':'https://passport.jd.com/',
                    'sec-ch-ua':'" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                    'sec-ch-ua-mobile':'?0',
                    'sec-ch-ua-platform':'"Windows"',
                    'Sec-Fetch-Dest':'script',
                    'Sec-Fetch-Mode':'no-cors',
                    'Sec-Fetch-Site':'same-site',
            }
            let nextHeaders = Object.assign({}, request.headers(),manulHeadersFirst )
            
            if (request.resourceType() === 'image') {
                request.continue();
            } else {
                if(url.includes('s.html')){
                    shtmlNum++
                    let headers = JSON.stringify(request.headers())
                    if(shtmlNum > 0){
                        nextHeaders = Object.assign({}, request.headers(),manulHeadersSecond )
                        // nextHeaders = manulHeadersSecond 
                    }
                    log(chalk.yellow('request header log', headers))

                    log(chalk.yellow('request log', request.url()))
                    let urlFirst = url.split('?')
                    let urlSecond = urlFirst[1] && urlFirst[1].split('&')
                    let urlThirdEnd = []
                    let jsonText = ''
                    let urlThird = Array.isArray(urlSecond) && urlSecond.map( v =>{
                        let res = v
                        let urlFour = v && v.split('=')
                        let key = ''
                        let value = ''
                        if(urlFour.length > 1){
                            key = urlFour[0]
                            value = urlFour[1]
                        }
                        if(key == 'd'){
                            if(shtmlNum == 1){
                                value = '000002Ao4EAGf~101000000310100100011030010003102001000110200200031030010002101000000110300200031010010001103001000310100000011020000003102003000110200100031010010002102001000110200100031020010001102000000300000100011030020003101000000110200100031020010002102002000110100100031020000001102002000310300200011020000003000001000110200000031020020001102001000210200200031020010001102001000310200100011010010003102001000110300100031020010001101001000210100200031030000001101000000310100100011010010003101001000110100100021020000003101001000410100100011010010005101000000400000100010000010009101001001k0000010001000001000k0000010008000001000u0000010006000001000e002001000a00100000020000010007000001000100000100060000010004000000000200100200060000010006001001000800100000080010000016000000000K000000000t00010100mP000102000600010100040001010002101000000200010100020001010004101101000200010100040001020002101101000400010100020001010004000102000210100000020001010002000102000400010100020001010002000102000400010100021011010004000101000200010100020001020002101000000200010100041011010002000101000200010100020001010006000101000200010100040001010004000101000c000101000200010100040001010008000101000k1010000004000101000a000101000e000101001I000101001Q000101000m001000003G000101000200210100040010000002000000000200300000020011010002003102000200200000020031010002002000000200200000020041010002002101000200410100020041020002005101000200510100020051010002007000000200410200020061020002006101000200500000020071010002007102000210310n00oq109002000210e002000410a003000010b001000210a00200021080030002108001000210900200021060010002107002000210600000021050030002105001000210400000021060010002102001000210400100021030010002103000000210200100021030010002103000000210200100021020010002102000000310300100011010000002102000000210100100021010000002102001000210200000021010010002101000000210200000021010010004102001000210100100040000000002101000000210100000040000010002000001001Q00000100080000010004000001000l000001000j001000002u000001000C'
                            }else{
                                value = value
                            }
                            res = key + '=' + value
                        }else if(key == 'c'){
                            res = key + '=' + value
                        }else if(key == 'w'){
                            res = key + '=' + value
                        }else if(key == 'appId'){
                            res = key + '=' + value
                        }else if(key == 'scene'){
                            res = key + '=' + value
                        }else if(key == 'product'){
                            res = key + '=' + value
                        }else if(key == 'scene'){
                            res = key + '=' + value
                        }else if(key == 'e'){
                            res = key + '=' + value
                        }else if(key == 's'){
                            res = key + '=' + value
                        }else if(key == 'o'){
                            res = key + '=' + value
                        }else if(key == 'o1'){
                            value = '0'
                            res = key + '=' + value
                        }else if(key == 'u'){
                            res = key + '=' + value
                        }else if(key == 'lang'){
                            res = key + '=' + value
                        }else if(key == 'callback'){
                            jsonText = value 
                            res = key + '=' + value
                        }
                        return res
                    })
                    urlThirdEnd = urlThird.join('&')
                    let nextUrl = `${urlFirst[0]}?${urlThirdEnd}`
                    log(chalk.yellow('nextUrl log', nextUrl))
                    // request.continue({url:nextUrl,headers:nextHeaders})
                    request.continue()
                    
                    // if(shtmlNum > 1){
                    //     let bodyTxt =`${jsonText}({"message":"success","nextVerify":"NULL_VERIFY","success":"1","validate":"97136291569a4a2b8ca450537401df35"})`
                    //     request.respond({
                    //         status: 200,
                    //         body:bodyTxt
                    //     });
                    // }else{
                    //     request.continue()
                    // }
                    
                    
                }else{
                    request.continue()
                    // log(chalk.yellow('request log', request.url()))
                }
            }
        });
        
           
        
        firstPage.on('console', msg => console.log('PAGE log', msg.text()))
        
        firstPage.on('response',(response) => {
                let url = response.url()
                if (url.includes('image')) {
                }else if(url.includes('s.html')){
                    response.text().then((body)=>{
                        log(chalk.red('response url', url))
                        log(chalk.red('response log', body))
                    })

                }else { 
                }
            }
           )
        await firstPage.mouse.move(300,310,{steps:30})
        await firstPage.goto(url,{waitUntil: 'load', timeout: 60000})
        log(chalk.yellow('京东页面初次加载完毕'))
        await firstPage.evaluate(() => {
            window.navigator.webdriver = false
        });
        await firstPage.content();
        
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
        log(chalk.red('wucha end', wucha))

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
    // let name = '17319075327'
    let name = '17319075339'
    let pwd = 'wef1991926'
    await frame.type('.item-ifo >input', name)
    await frame.type('#nloginpwd', pwd)
    await frame.waitForTimeout(1000)
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
    try{
        while(!validateFlag){
            console.log('while start')
            // debugger
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
                debugger

                
    
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
    // let url = `http://192.168.0.107:3001/taxiapi/searchjingdong`
    let url = `http://5403917lb3.51vip.biz:12931/taxiapi/searchjingdong`
    
    
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