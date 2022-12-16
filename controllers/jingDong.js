const axios = require('axios');
const requestModule = require("request");
const cheerio = require("cheerio");
const model = require('../model');
const chalk = require('chalk')
const puppeteer = require('puppeteer')
const {handleImgToPostition} = require('../utils/pixel');
const {rightSpaceLocalList} = require('../constants/loginImg');
const fs = require('fs')
const { max } = require('lodash');
const log = console.log
let page = null
let browser = null

let isLogin = false
let shtmlNum = 0
let whileFlag = false
let mousePos = ''
let clickProductData = ''
let jd_risk_token_id = ''
let navigator = null
let window = null

let params = {
    // c: g.html.challenge 
    validateID:'',
    // $("#slideAppId").val() || "1604ebb2287"
    appId: '',
    scene: "login",
    product: "bind-suspend",
    //fcf.html 
    e: '',
    // jseqf.html _jdtdmap_sessionId
    s:'',
    //encodeURIComponent($("#loginname").val()) 
    o:'',
    //window.navigator.webdriver 1
    o1:'',

}

const loginJingDongFn = async (ctx, next) => {
    log(chalk.yellow('/taxiapi/loginJingDong start'))
    if(!browser){
        browser = await puppeteer.launch({
            headless: false,
            // headless: true,
            devtools:true,
            // defaultViewport:{ width: 1800, height: 800 },
            // defaultViewport:null,
            // args: ['--no-sandbox', '--disable-setuid-sandbox','--start-maximized','--incognito','--disable-blink-features=AutomationControlled']
            // args: ['--no-sandbox','--incognito',]
            args: ['--no-sandbox'],
            // dumpio: false,
        })
        

    }
    async function initConfig(page){
      await page.evaluateOnNewDocument(() => {
          const newProto = navigator.__proto__;
          delete newProto.webdriver; //删除 navigator.webdriver字段
          navigator.__proto__ = newProto;
      });
      // 添加 window.chrome字段，向内部填充一些值
      await page.evaluateOnNewDocument(() => {
        window.chrome = {};
        window.chrome.app = {
            InstallState: 'hehe',
            RunningState: 'haha',
            getDetails: 'xixi',
            getIsInstalled: 'ohno',
        };
        window.chrome.csi = function () {};
        window.chrome.loadTimes = function () {};
        window.chrome.runtime = function () {};
      });
      // userAgent设置
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'userAgent', {
            //userAgent在无头模式下有headless字样，所以需覆盖
            get: () =>
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        });
      });
      // plugins设置
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'plugins', {
            //伪装真实的插件信息
            get: () => [
            {
                0: {
                type: 'application/x-google-chrome-pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: Plugin,
                },
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                length: 1,
                name: 'Chrome PDF Plugin',
            },
            {
                0: {
                type: 'application/pdf',
                suffixes: 'pdf',
                description: '',
                enabledPlugin: Plugin,
                },
                description: '',
                filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
                length: 1,
                name: 'Chrome PDF Viewer',
            },
            {
                0: {
                type: 'application/x-nacl',
                suffixes: '',
                description: 'Native Client Executable',
                enabledPlugin: Plugin,
                },
                1: {
                type: 'application/x-pnacl',
                suffixes: '',
                description: 'Portable Native Client Executable',
                enabledPlugin: Plugin,
                },
                description: '',
                filename: 'internal-nacl-plugin',
                length: 2,
                name: 'Native Client',
            },
            ],
        });
      });

            // languages设置
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'languages', {
            //添加语言
            get: () => ['zh-CN', 'zh', 'en'],
        });
      });

      // permissions设置
      await page.evaluateOnNewDocument(() => {
        const originalQuery = window.navigator.permissions.query; //notification伪装
        window.navigator.permissions.query = (parameters) =>
            parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters);
      });

      // WebGL设置
      await page.evaluateOnNewDocument(() => {
        const getParameter = WebGLRenderingContext.getParameter;
        WebGLRenderingContext.prototype.getParameter = function (parameter) {
            // UNMASKED_VENDOR_WEBGL
            if (parameter === 37445) {
                return 'Intel Inc.';
            }
            // UNMASKED_RENDERER_WEBGL
            if (parameter === 37446) {
                return 'Intel(R) Iris(TM) Graphics 6100';
            }
            return getParameter(parameter);
        };
      });


    }
    
    let url = 'https://union.jd.com/index'
    // let url = 'file:///C:/workplace/web/%E4%BA%AC%E4%B8%9C/files/%E7%99%BB%E5%BD%95%E4%BA%AC%E4%B8%9C.html'
    let loginUrl = 'https://passport.jd.com/common/loginPage?from=media&ReturnUrl=https%3A%2F%2Funion.jd.com%2Foverview'
    
    try {
        const firstPage = await browser.newPage()
        // await initConfig(firstPage)
        await firstPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36')
        await firstPage.evaluateOnNewDocument(() =>{ Object.defineProperties(navigator,{ webdriver:{ get: () => false } }) })
        await firstPage.evaluate(() => {
            window.navigator.webdriver = false
        });
        await firstPage.setRequestInterception(true);
        navigator = await firstPage.evaluate(() => {
          let tempNavigator = window.navigator
          let navigatorCache = {}
          for( let i in tempNavigator){
            console.log('i',i,tempNavigator[i])
            navigatorCache[i] = tempNavigator[i]
          }

          console.log(navigatorCache)
          return  navigatorCache 
        });
        window = await firstPage.evaluate(() => {
          let tempwindow = window
          let cache = {}
          for( let i in tempwindow){
            
            let temp = ''
            if(i == 'sessionStorage' || i == 'localStorage' || i == 'indexedDB'|| i == 'openDatabase'|| i == 'globalStorage' ){
              console.log('next',i)
              cache[i] = true
            }
            
          }
          if(window['AudioContext']){
            cache['AudioContext'] = window['AudioContext'];
          }
          if(window['webkitAudioContext']){
            cache['webkitAudioContext'] = window['webkitAudioContext'];
          }
          if(window['getComputedStyle']){
            cache['getComputedStyle'] = window['getComputedStyle'];
          }
          if(window['WebGLRenderingContext']){
            cache['WebGLRenderingContext'] = window['WebGLRenderingContext'];
          }

          console.log(cache)
          return  cache 
        });
        console.log(navigator)
        console.log(window)
        console.log(firstPage)
        debugger
        

        let sHtmlCount = 0
        firstPage.on('request', async (request) => {
            let url = request.url()
            let headers = request.headers()
            if (request.resourceType() === 'image') {
                request.continue();
            } else {
                if(url.includes('s.html')){
                    if(sHtmlCount > 0){
                        log(chalk.red('url',url))
                        let urlParamsD = computeSHtml(mousePos)
                        log(chalk.red('mousePos',mousePos))
                        log(chalk.red('urlParams',urlParamsD))
                        log(chalk.red('headers',JSON.stringify(request.headers())))
                        let urlList = url.split('?') || []
                        let urlNextList = urlList.length > 1 && urlList[1].split('&')
                        let urlThirdList =  urlNextList.map( (v,i) =>{
                            let valList = v.split('=')
                            if(valList[0] == 'd'){
                                let temp = 'd=' + urlParamsD
                                return temp
                            }
                            return v
                        })
                        
                        let nextUrl = urlList[0] + '?' + urlThirdList.join('&')

                        request.continue({url:nextUrl})

                    }else{
                        request.continue()
                    }
                    sHtmlCount ++ 
                    
                }else if(url.includes('passport.jd.com/common/loginPage')){
                    // let reqResponse =  await request.response()

                    // log(chalk.red('request  passport.jd.com log', reqResponse))
                    // request.continue() 

                    // let tempResponse = await axios.get(url)
                    // const { status, statusText, headers, config, request, data } = tempResponse;
                    // log(chalk.red('tempResponse  ', tempResponse))
                    
                    // request.respond(tempResponse);

                    // await request.respond({
                    //     ...tempResponse,
                    // });
            
                    
            
                    // Send response
                    // request.respond({
                    //     ok: statusMessage === "OK",
                    //     status: statusCode,
                    //     contentType,
                    //     body: $.html(),
                    // });
                    request.continue() 
                }else if(url.includes('union.jd.com/index')){
                    let manulHeadersFirst = {
                        'sec-ch-ua':'"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
                        'sec-ch-ua-mobile':'?0',
                        'sec-ch-ua-platform':'"Windows"',
                        'upgrade-insecure-requests':1,
                        'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                        'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site':'none',
                        'sec-fetch-mode':'navigate',
                        'sec-fetch-user':'?1',
                        'sec-fetch-dest':'document',
                        'accept-encoding':'gzip, deflate, br',
                        'accept-language':'zh-CN,zh;q=0.9',
                        
                    }
                    let nextHeaders = Object.assign({},manulHeadersFirst )
                    request.continue({url,headers:nextHeaders})
                }else if(url.includes('fcf.html')){
                    let manulHeadersFirst = {
                        'Host':'gia.jd.com',
                        'Connection':'keep-alive',
                        'Content-Length':headers['Content-Length'],
                        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
                        'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',
                        'Accept':'*/*',
                        'Origin':'https://passport.jd.com',
                        'Sec-Fetch-Site':'same-site',
                        'Sec-Fetch-Mode':'cors',
                        'Sec-Fetch-Dest':'empty',
                        'Referer':'https://passport.jd.com/',
                        'Accept-Encoding':'gzip, deflate, br',
                        'Accept-Language':'zh-CN',
                        
                    }
                    let nextHeaders = Object.assign({},manulHeadersFirst )
                    let result = getFcfUrl()
                    let nextUrl = result.url
                    log(chalk.green('url',url))
                    log(chalk.green('nextUrl',nextUrl))
                    debugger
                    request.continue({url:nextUrl,headers:nextHeaders})
                
                }else{
                    request.continue() 
                }
                
            }
        });
        firstPage.on('console', msg => console.log('PAGE log', msg.text()))
        firstPage.on('response',async (response) => {
                let url = response.url()
                if (url.includes('image')) {
                }else if(url.includes('s.html')){
                    response.text().then((body)=>{
                        log(chalk.red('response url', url))
                        log(chalk.red('response log', body))
                    })

                // }else if(url.includes('passport.jd.com/common/loginPage')){
                //     let val =  await response.text()
                //     log(chalk.red('response passport.jd.com/common/loginPage log', val))
                //     for(let k in response){
                //         log(chalk.red('response ',k, response[k]))

                //     }
                     
                // }else if(url.includes('g.html')){
                //     let text =  await response.text()
                //     log(chalk.red('g.html response json', json))
                //     log(chalk.red('g.html response ', text))
                //     let  validateID = val.challenge
                //     params.validateID = validateID
                }else if(url.includes('y.html')){
                    response.text().then((body)=>{
                        log(chalk.red('y.html response url', url))
                        log(chalk.red('y.html response log', body))
                        let resList = body.split('=')
                        let resTxt = resList.length > 0 && resList[1]
                        jd_risk_token_idTemp = resTxt.replace(`';`,'')
                        jd_risk_token_id = jd_risk_token_idTemp.replace(`'`,'')
                        log(chalk.green('jd_risk_token_id', jd_risk_token_id))
                    })
                }
            }
           )
        
        
        await firstPage.goto(url,{waitUntil: 'load', timeout: 60000})
        log(chalk.yellow('京东页面初次加载完毕'))
        
        
        await firstPage.content();
        // loginJingDong(page)
        // await loginJingDongFrame(firstPage) 
        await loginJingDongLianMeng(firstPage)

        //登录
    } catch (error) {
        console.log(error)
        log(chalk.red('服务意外终止'))
        // browser = null
        // await browser.close()
    } finally {
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
        if(isLogin){
            goodsList = await searchGoods(browser,query)
        }
    } catch (error) {
        console.log(error)
        log(chalk.red('服务意外终止'))
        // page = null
        // browser = null
        // await browser.close()
    } finally {
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
    // let pwd = 'wef1991926'

    // let name = '等花开926'
    // let pwd = 'Wef1991926'
    
    

    let name = '等花开9263'
    let pwd = 'Wef19919263'
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
        while(!validateFlag && !whileFlag){
            console.log('while start')
            let next = await page.$(".JDJRV-bigimg >img")
            await page.waitForTimeout(1000)
            if(!next){
                return
            }
            let bigImg = await page.$eval('.JDJRV-bigimg >img', el => el.src);
            let smallImg = await page.$eval('.JDJRV-smallimg >img', el => el.src);

            let locationObj = {}
            if(bigImg && smallImg){
                if(bigImg.includes('data:') && bigImg.includes('data:')){
                    locationObj = await handleImgToPostition(bigImg,smallImg )
                }else{
                    return validateLogin(page, parent)
                }
            }
            const keyClientWidth = await page.$eval('.JDJRV-smallimg >img', el => el.clientWidth);
            const { keyWidth, minX} = locationObj
            let rightSpace = ( (+minX) *(keyClientWidth/keyWidth)).toFixed(2)
            // rightSpace = Math.ceil(rightSpace).toFixed(2)
            rightSpace = Math.floor(rightSpace).toFixed(2)
            // await page.waitForTimeout(2000)
            const slideBtn = await page.$('.JDJRV-slide-btn')
            const bigImgNode = await page.$('.JDJRV-bigimg >img')
            if(slideBtn){
                let boundingBox = await slideBtn.boundingBox() || {}
                log(chalk.yellow('slideBtn boundingBox start'),boundingBox)
                log(chalk.yellow('rightSpace'),rightSpace)
                let bigImgNode = await page.$('.JDJRV-bigimg >img')
                let bigImgNodeBox = await bigImgNode.boundingBox() || {}
                log(chalk.yellow('bigImgNodeBox'),bigImgNodeBox)
                let smallImgNode = await page.$('.JDJRV-smallimg >img')
                let smallImgNodeBox = await smallImgNode.boundingBox() || {}
                log(chalk.yellow('smallImgNodeBox'),smallImgNodeBox)

                let initX = boundingBox.x 
                let initY = boundingBox.y 
                let slideLeft = boundingBox.x + boundingBox.width * 0.5
                let slideTop = boundingBox.y + boundingBox.height * 0.5
                let spaceFirst = +rightSpace - 60  
                let spaceSecond = +rightSpace - 30  
                let spaceThird = +rightSpace - 10  
                let spaceEnd = +rightSpace
                let end = slideLeft + spaceEnd
                let mouseParent = page
                if(parent){
                    mouseParent = parent
                }
                let boundingBoxEnd1 = ''

                await mouseParent.mouse.click(slideLeft,slideTop,{delay:1000})
                boundingBox = await slideBtn.boundingBox() || {}
                let moveX = boundingBox.x - initX
                log('moveX', moveX)

                slideLeft =  boundingBox.x + boundingBox.width * 0.5
                
                boundingBoxEnd1 = await slideBtn.boundingBox() || {}
                log('boundingBoxEnd1 click', chalk.yellow(boundingBoxEnd1.x, initX, slideLeft ))
                bigImgNode = await page.$('.JDJRV-bigimg >img')
                bigImgNodeBox = await bigImgNode.boundingBox() || {}
                log(chalk.yellow('bigImgNodeBox'),bigImgNodeBox)
                smallImgNode = await page.$('.JDJRV-smallimg >img')
                smallImgNodeBox = await smallImgNode.boundingBox() || {}
                log(chalk.yellow('smallImgNodeBox'),smallImgNodeBox)

                await mouseParent.mouse.down(slideLeft,slideTop)
                boundingBoxEnd1 = await slideBtn.boundingBox() || {}
                log('boundingBoxEnd1 down', chalk.yellow(boundingBoxEnd1.x, initX , slideLeft))
                bigImgNode = await page.$('.JDJRV-bigimg >img')
                 bigImgNodeBox = await bigImgNode.boundingBox() || {}
                log(chalk.yellow('bigImgNodeBox'),bigImgNodeBox)
                smallImgNode = await page.$('.JDJRV-smallimg >img')
                smallImgNodeBox = await smallImgNode.boundingBox() || {}
                log(chalk.yellow('smallImgNodeBox'),smallImgNodeBox)

                slideLeft += -moveX
                await mouseParent.mouse.move(slideLeft + spaceFirst,slideTop,{steps:30})
                boundingBoxEnd1 = await slideBtn.boundingBox() || {}
                log(' move First boundingBoxEnd1.x, initX', chalk.yellow(boundingBoxEnd1.x, initX ))
                log('boundingBoxEnd2', chalk.yellow(boundingBoxEnd1.x - slideLeft - spaceFirst))
                log('boundingBoxEnd2', chalk.yellow(boundingBoxEnd1.x - initX -  spaceFirst))
                bigImgNode = await page.$('.JDJRV-bigimg >img')
                bigImgNodeBox = await bigImgNode.boundingBox() || {}
                log(chalk.yellow('bigImgNodeBox'),bigImgNodeBox)
                smallImgNode = await page.$('.JDJRV-smallimg >img')
                smallImgNodeBox = await smallImgNode.boundingBox() || {}
                log(chalk.yellow('smallImgNodeBox'),smallImgNodeBox)

                await mouseParent.mouse.move(slideLeft + spaceSecond,slideTop,{steps:10})
                boundingBoxEnd1 = await slideBtn.boundingBox() || {}
                log(' move spaceSecond  boundingBoxEnd1.x, initX', chalk.yellow(boundingBoxEnd1.x, initX ))
                log('boundingBoxEnd3', chalk.yellow(boundingBoxEnd1.x - slideLeft - spaceSecond ))
                log('boundingBoxEnd3', chalk.yellow(boundingBoxEnd1.x - initX - spaceSecond ))
                bigImgNode = await page.$('.JDJRV-bigimg >img')
                bigImgNodeBox = await bigImgNode.boundingBox() || {}
                log(chalk.yellow('bigImgNodeBox'),bigImgNodeBox)
                smallImgNode = await page.$('.JDJRV-smallimg >img')
                smallImgNodeBox = await smallImgNode.boundingBox() || {}
                log(chalk.yellow('smallImgNodeBox'),smallImgNodeBox)


                await mouseParent.mouse.move(slideLeft + spaceThird,slideTop,{steps:20})
                boundingBoxEnd1 = await slideBtn.boundingBox() || {}
                log(' move spaceThird boundingBoxEnd1.x, initX', chalk.yellow(boundingBoxEnd1.x, initX ))
                log('boundingBoxEnd4', chalk.yellow(boundingBoxEnd1.x - slideLeft - spaceThird ))
                log('boundingBoxEnd4', chalk.yellow(boundingBoxEnd1.x - initX - spaceThird ))
                bigImgNode = await page.$('.JDJRV-bigimg >img')
                bigImgNodeBox = await bigImgNode.boundingBox() || {}
                log(chalk.yellow('bigImgNodeBox'),bigImgNodeBox)
                smallImgNode = await page.$('.JDJRV-smallimg >img')
                smallImgNodeBox = await smallImgNode.boundingBox() || {}
                log(chalk.yellow('smallImgNodeBox'),smallImgNodeBox)


                await mouseParent.mouse.move(end,slideTop,{steps:20})
                boundingBoxEnd1 = await slideBtn.boundingBox() || {}
                log(' move end boundingBoxEnd1.x, initX', chalk.yellow(boundingBoxEnd1.x, initX ))
                log('boundingBoxEnd5', chalk.yellow(boundingBoxEnd1.x - slideLeft - spaceEnd ))
                log('boundingBoxEnd5', chalk.yellow(boundingBoxEnd1.x - initX - spaceEnd ))
                bigImgNode = await page.$('.JDJRV-bigimg >img')
                bigImgNodeBox = await bigImgNode.boundingBox() || {}
                log(chalk.yellow('bigImgNodeBox'),bigImgNodeBox)
                smallImgNode = await page.$('.JDJRV-smallimg >img')
                smallImgNodeBox = await smallImgNode.boundingBox() || {}
                log(chalk.yellow('smallImgNodeBox'),smallImgNodeBox)


                // let i = 0
                // let rightSpaceList = [[1,2]]
                // while(i < 600){
                //     console.log(i)
                //     const boundingBoxEnd = await slideBtn.boundingBox() || {}
                //     console.log('btn location', boundingBoxEnd.x, boundingBoxEnd.y )
                //     let minusVal = boundingBoxEnd.x - boundingBox.x
                //     if(minusVal > 0){
                //         rightSpaceList.push([boundingBoxEnd.x - boundingBox.x, boundingBoxEnd.y - boundingBox.y])
                //     }
                //     console.log('startstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstartstart'  )

                //     let minusNextStart= rightSpaceList.length -100
                //     let minusNextEnd= rightSpaceList.length -1
                //     console.log('minusNext', rightSpaceList.slice(minusNextStart,minusNextEnd) )
                //     console.log('xLen', +minX, keyClientWidth, keyWidth )
                //     console.log('myVal', ( (+minX) *(keyClientWidth/keyWidth)).toFixed(2) )
                //     console.log('rightSpace', rightSpace)

                //     i++
                // }
                // let now = new Date().getTime() + ''
                // let fileName = rightSpaceList[(rightSpaceList.length -1)][0] + '-' + now+ '.png'
                // let len = smallImg.length - 150
                // let textRes = {
                //     imgStart:smallImg.substring(0,150),
                //     imgMid:smallImg.substring(300,400),
                //     imgEnd:smallImg.substring(len),
                //     rightSpace:rightSpaceList[(rightSpaceList.length -1)][0],
                //     imgName:fileName
                // }
                // let repeat = []
                // Array.isArray(rightSpaceLocalList) && rightSpaceLocalList.map( (v,i) =>{
                //     if(v.imgStart === textRes.imgStart && v.imgMid === textRes.imgMid && v.imgEnd === textRes.imgEnd && v.rightSpace === textRes.rightSpace){
                //         repeat.push(v)
                //         log(chalk.red('重复重复重复重复重复重复重复重复重复重复重复重复重复',repeat))
                //     }

                // })
                // path = 'imgTxt.txt' 
                // let content = JSON.stringify(textRes)+ ',' + '\r\n'
                // try{
                //     fs.readFile(path, function(err,readData) {
                //         if (err) {
                //             throw err;
                //         }else{
                //             writeData = readData + content
                //             fs.writeFile(path, writeData,function(err,data) {
                //                 if (err) {
                //                     throw err;
                //                 }else{
                //                     // console.log('write', data)
                //                 }
                //             });
                //         }
                //     })
                    
                //     let imgPath = 'imgs/' + fileName
                    
                //     const bigImgData = bigImg.replace(/^data:image\/\w+;base64,/,"")
                //     let imgData = Buffer.from(bigImgData, "base64")
                //     fs.writeFile(imgPath, imgData,'binary',function(err,data) {
                //         if (err) {
                //             throw err;
                //         }else{
                //             // console.log('write', data)
                //         }
                //     });
                    
                //     let fileNameSmall = rightSpaceList[(rightSpaceList.length -1)][0] + '-'  + now  + '-' + 'small' + '.png'
                //     let imgPathSmall = 'smallImgs/' + fileNameSmall
                //     const smallImgData = smallImg.replace(/^data:image\/\w+;base64,/,"")
                //     let imgSmallData = Buffer.from(smallImgData, "base64")
                //     fs.writeFile(imgPathSmall, imgSmallData,'binary',function(err,data) {
                //         if (err) {
                //             throw err;
                //         }else{
                //             // console.log('write', data)
                //         }
                //     });
                    
                // }catch(e){
                //     console.log(e)
                // }


                const boundingBoxEnd = await slideBtn.boundingBox() || {}
                const smallImgNodeEnd = await page.$('.JDJRV-smallimg >img')
                const keyboundingBoxEnd = await smallImgNodeEnd.boundingBox() || {}
  

                let wucha = end - boundingBoxEnd.x - boundingBox.width * 0.5
                console.log('btn location', boundingBoxEnd.x )
                log(chalk.yellow('wucha end' ),chalk.yellow(wucha))
                console.log('rightSpace', rightSpace)
                
                
                let windowObj = await page.evaluate(() => {
                    let mousePosTemp = window.jdSlide.mousePos
                    let clickProductDataTemp = window.jdSlide.clickProductDataTemp

                    return {mousePosTemp,clickProductDataTemp}

                });
                mousePos = windowObj.mousePosTemp
                clickProductData = windowObj.clickProductDataTemp
                
                await mouseParent.waitForTimeout(500)
                await mouseParent.waitForTimeout(10000)
                await mouseParent.mouse.up();

                
                // validateFlag = true

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
    let url = `http://5403917lb3.51vip.biz/taxiapi/searchjingdong`
    
    
    let response = await axios({
        method: "GET",
        url: url,
        params:query
    })
    const { data:responseData ={} } = response
    const { data = {} } = responseData
    const { goodsList  } = data
    let dataRes = {
        code:200,
        data:{
            goodsList 
        }
    }
    ctx.response.body = dataRes

}

async function testPixel(){
    let i = rightSpaceLocalList.length -1
    while(i){
    // for(let i = 0, rightLen = rightSpaceLocalList.length; i < rightLen; i++){
        // if(i == 4){
            let { imgName, rightSpace } = rightSpaceLocalList[i]
            let nameList = imgName.split('.png')
            let name = nameList[0]
            let smallPath = 'smallImgs/' + name + '-small' + '.png'
            let bigPath = 'imgs/' + name + '.png'
            log(chalk.yellow('rightSpace', rightSpace))
            let res =  await handleImgToPostition(bigPath,smallPath)
            const { keyWidth, minX} = res
            let resSpace =  ( (+minX) *(39/keyWidth)).toFixed(2)
            log(chalk.yellow('res', minX, keyWidth ))
            let end = Math.floor(resSpace)
            log(chalk.yellow('end', end -  rightSpace))
            if(  Math.abs ( resSpace - rightSpace) <= 1){
                log(chalk.yellow('success'))
            }


        // }
        i--

    }
}

function computeSHtml(mouseData){
    var b = new Array();
    for (var e = 0; e < mouseData.length; e++) {
      if (e == 0) {
        b.push(pretreatment(mouseData[e][0] < 262143 ? mouseData[e][0] : 262143, 3, true));
        b.push(
          pretreatment(mouseData[e][1] < 16777215 ? mouseData[e][1] : 16777215, 4, true)
        );
        b.push(
          pretreatment(
            mouseData[e][2] < 4398046511103 ? mouseData[e][2] : 4398046511103,
            7,
            true
          )
        );
      } else {
        var a = mouseData[e][0] - mouseData[e - 1][0];
        var f = mouseData[e][1] - mouseData[e - 1][1];
        var d = mouseData[e][2] - mouseData[e - 1][2];
        b.push(pretreatment(a < 4095 ? a : 4095, 2, false));
        b.push(pretreatment(f < 4095 ? f : 4095, 2, false));
        b.push(pretreatment(d < 16777215 ? d : 16777215, 4, true));
      }
    }
    function pretreatment(d, c, b) {
        var e = string10to64(Math.abs(d));
        var a = "";
        if (!b) {
          a += d > 0 ? "1" : "0";
        }
        a += prefixInteger(e, c);
        return a;
    }
    function prefixInteger(a, length) {
        return (Array(length).join(0) + a).slice(-length);
    }
    function string10to64(d) {
        var c =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-~".split(
                ""
            ),
            b = c.length,
            e = +d,
            a = [];
        do {
            mod = e % b;
            e = (e - mod) / b;
            a.unshift(c[mod]);
        } while (e);
        return a.join("");
    }

    return b.join("");
}

function getFcfUrl(){
    let res = ''
    let jd_shadow__ = ''
    let JDDSecCryptoJS = ''
    navigator = {
      ...navigator,
      appCodeName:"Mozilla",
        userAgent:"5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        platform:'Win32',
        hardwareConcurrency:16,
    }
    console.log(navigator)
    debugger
    let screen = {
      availHeight:824,
      availLeft:0,
      availTop:0,
      availWidth:1536,
      colorDepth:24,
      height:864,
      isExtended:false,
      onchange:null,
      orientation:{angle: 0, type: 'landscape-primary', onchange: null},
      pixelDepth:24,
      width:1536
    }
    
    var n = {},
      g = navigator.userAgent.toLowerCase(),
      x = navigator.language || navigator.browserLanguage;
    -1 != g.indexOf("ipad") ||
      -1 != g.indexOf("iphone os") ||
      -1 != g.indexOf("midp") ||
      -1 != g.indexOf("rv:1.2.3.4") ||
      -1 != g.indexOf("ucweb") ||
      -1 != g.indexOf("android") ||
      -1 != g.indexOf("windows ce") ||
      g.indexOf("windows mobile");
    var t = "NA",
      l = "NA";
    try {
      -1 != g.indexOf("win") &&
        -1 != g.indexOf("95") &&
        ((t = "windows"), (l = "95")),
        -1 != g.indexOf("win") &&
          -1 != g.indexOf("98") &&
          ((t = "windows"), (l = "98")),
        -1 != g.indexOf("win 9x") &&
          -1 != g.indexOf("4.90") &&
          ((t = "windows"), (l = "me")),
        -1 != g.indexOf("win") &&
          -1 != g.indexOf("nt 5.0") &&
          ((t = "windows"), (l = "2000")),
        -1 != g.indexOf("win") &&
          -1 != g.indexOf("nt") &&
          ((t = "windows"), (l = "NT")),
        -1 != g.indexOf("win") &&
          -1 != g.indexOf("nt 5.1") &&
          ((t = "windows"), (l = "xp")),
        -1 != g.indexOf("win") &&
          -1 != g.indexOf("32") &&
          ((t = "windows"), (l = "32")),
        -1 != g.indexOf("win") &&
          -1 != g.indexOf("nt 5.1") &&
          ((t = "windows"), (l = "7")),
        -1 != g.indexOf("win") &&
          -1 != g.indexOf("6.0") &&
          ((t = "windows"), (l = "8")),
        -1 == g.indexOf("win") ||
          (-1 == g.indexOf("nt 6.0") && -1 == g.indexOf("nt 6.1")) ||
          ((t = "windows"), (l = "9")),
        -1 != g.indexOf("win") &&
          -1 != g.indexOf("nt 6.2") &&
          ((t = "windows"), (l = "10")),
        -1 != g.indexOf("linux") && (t = "linux"),
        -1 != g.indexOf("unix") && (t = "unix"),
        -1 != g.indexOf("sun") && -1 != g.indexOf("os") && (t = "sun os"),
        -1 != g.indexOf("ibm") && -1 != g.indexOf("os") && (t = "ibm os/2"),
        -1 != g.indexOf("mac") && -1 != g.indexOf("pc") && (t = "mac"),
        -1 != g.indexOf("aix") && (t = "aix"),
        -1 != g.indexOf("powerpc") && (t = "powerPC"),
        -1 != g.indexOf("hpux") && (t = "hpux"),
        -1 != g.indexOf("netbsd") && (t = "NetBSD"),
        -1 != g.indexOf("bsd") && (t = "BSD"),
        -1 != g.indexOf("osf1") && (t = "OSF1"),
        -1 != g.indexOf("irix") && ((t = "IRIX"), (l = "")),
        -1 != g.indexOf("freebsd") && (t = "FreeBSD"),
        -1 != g.indexOf("symbianos") &&
          ((t = "SymbianOS"),
          (l = g.substring(g.indexOf("SymbianOS/") + 10, 3)));
    } catch (c) {}
    var y = "NA",
      f = "NA",
      k = "";
    try {
      -1 != g.indexOf("msie") &&
        ((y = "ie"),
        (f = g.substring(g.indexOf("msie ") + 5)),
        f.indexOf(";") && (f = f.substring(0, f.indexOf(";"))));
      -1 != g.indexOf("firefox") &&
        ((y = "Firefox"), (f = g.substring(g.indexOf("firefox/") + 8)));
      -1 != g.indexOf("opera") &&
        ((y = "Opera"), (f = g.substring(g.indexOf("opera/") + 6, 4)));
      -1 != g.indexOf("safari") &&
        ((y = "safari"), (f = g.substring(g.indexOf("safari/") + 7)));
      -1 != g.indexOf("chrome") &&
        ((y = "chrome"),
        (f = g.substring(g.indexOf("chrome/") + 7)),
        f.indexOf(" ") &&
          ((k = f = f.substring(0, f.indexOf(" "))),
          "" != k && k.indexOf(".") && (k = f.substring(0, f.indexOf(".")))));
      -1 != g.indexOf("navigator") &&
        ((y = "navigator"), (f = g.substring(g.indexOf("navigator/") + 10)));
      -1 != g.indexOf("applewebkit") &&
        ((y = "applewebkit_chrome"),
        (f = g.substring(g.indexOf("applewebkit/") + 12)),
        f.indexOf(" ") && (f = f.substring(0, f.indexOf(" "))));
      -1 != g.indexOf("sogoumobilebrowser") &&
        (y = "\u641c\u72d7\u624b\u673a\u6d4f\u89c8\u5668");
      if (-1 != g.indexOf("ucbrowser") || -1 != g.indexOf("ucweb"))
        y = "UC\u6d4f\u89c8\u5668";
      if (-1 != g.indexOf("qqbrowser") || -1 != g.indexOf("tencenttraveler"))
        y = "QQ\u6d4f\u89c8\u5668";
      -1 != g.indexOf("metasr") && (y = "\u641c\u72d7\u6d4f\u89c8\u5668");
      -1 != g.indexOf("360se") && (y = "360\u6d4f\u89c8\u5668");
      -1 != g.indexOf("the world") &&
        (y = "\u4e16\u754c\u4e4b\u7a97\u6d4f\u89c8\u5668");
      -1 != g.indexOf("maxthon") && (y = "\u9068\u6e38\u6d4f\u89c8\u5668");
    } catch (error) {}
    let _JdJrTdRiskFpInfo = get_JdJrTdRiskFpInfo()
    let _url_query_str = ""
    let _CurrentPageUrl = (function () {
        let w = undefined
        let _CurrentPageProtocol = "https:" == document.location.protocol ? "https://" : "http://"
        var m = document.location.href.toString();
        try {
          _root_domain =
            /^https?:\/\/(?:\w+\.)*?(\w*\.(?:com\.cn|cn|com|net|id))[\\\/]*/.exec(
              m
            )[1];
        } catch (v) {}
        var r = m.indexOf("?");
        0 < r &&
          ((_url_query_str = m.substring(r + 1)),
          500 < _url_query_str.length &&
            (_url_query_str = _url_query_str.substring(0, 499)),
          (m = m.substring(0, r)));
        m = m.substring(_CurrentPageProtocol.length);
        // var u = m.indexOf("joybuy.com");
        // -1 < u &&
        //   (-1 == r || u < r) &&
        //   (_JdJrTdRiskDomainName = "gia.joybuy.com");
        return m;
      })();
    var z = {
        pin: '',
        oid: '',
        p: "https:" == document.location.protocol ? "s" : "h",
        fp: _JdJrTdRiskFpInfo,
        v: "2.6.15.1",
        f: "1",
    };
    
    z.o = _CurrentPageUrl
    
    debugger
    void 0 !== w &&
    null !== w &&
    0 < w.length &&
    ((_JdEid = w), (_eidFlag = !0));
    "undefined" != typeof _JdEid &&
    0 < _JdEid.length &&
    (z.fc = _JdEid);
   
    z.t = jd_risk_token_id;
    z.qi = ''
    jd_shadow__ = getJd_shadow__()
    z.jtb = jd_shadow__
    z ="?a=" + tdencrypt(z)
    _JdJrRiskClientCollectData = collect();
    let formObjN = [];
    formObjN.g = tdencrypt(n);
    formObjN.d = _JdJrRiskClientCollectData;

    res = {
        url:z,
        formObjN

    }
    function get_JdJrTdRiskFpInfo(){
        debugger
        let options = {}
        
        var a = 1 * f,
            b = [];
        "ie" == y && 7 <= a
            ? (b.push(g),
            b.push(x),
            (n.userAgent = m(g)),
            (n.language = x),
            this.browserRedirect(g))
            : ((b = userAgentKey(b)), (b = languageKey(b)));
        b.push(y);
        b.push(f);
        b.push(t);
        b.push(l);
        n.os = t;
        n.osVersion = l;
        n.browser = y;
        n.browserVersion = f;
        b = colorDepthKey(b);
        b = screenResolutionKey(b);
        b = timezoneOffsetKey(b);
        b = sessionStorageKey(b);
        b = localStorageKey(b);
        b = indexedDbKey(b);
        b = addBehaviorKey(b);
        b = openDatabaseKey(b);
        b = cpuClassKey(b);
        b = platformKey(b);
        b = hardwareConcurrencyKey(b);
        b = audioKey(b);
        b = doNotTrackKey(b);
        b = pluginsKey(b);
        b = canvasKey(b);
        b = webglKey(b);
        console.log('_JdJrTdRiskFpInfo',b)
        a = b.join("~~~");
        a = x64hash128(a, 31);
        console.log('_JdJrTdRiskFpInfo end',a)
        debugger
        function languageKey(c) {
          options.excludeLanguage ||
            (c.push(navigator.language),
            (n.language = replaceAll(navigator.language, " ", "_")));
          return c;
        }
        function replaceAll(c, a, b) {
          for (; 0 <= c.indexOf(a); ) c = c.replace(a, b);
          return c;
        }
        function userAgentKey(c) {
          options.excludeUserAgent ||
            (c.push(navigator.userAgent),
            (n.userAgent = m(navigator.userAgent)),
            browserRedirect(navigator.userAgent));
          return c;
        }
        function m(c) {
          if (null == c || void 0 == c || "" == c) return "undefined";
          if (null == c || void 0 == c || "" == c) var a = "";
          else {
            a = [];
            for (var b = 0; b < 8 * c.length; b += 8)
              a[b >> 5] |= (c.charCodeAt(b / 8) & 255) << b % 32;
          }
          c = 8 * c.length;
          a[c >> 5] |= 128 << c % 32;
          a[(((c + 64) >>> 9) << 4) + 14] = c;
          c = 1732584193;
          b = -271733879;
          for (var d = -1732584194, e = 271733878, h = 0; h < a.length; h += 16) {
            var q = c,
              B = b,
              C = d,
              A = e;
            c = u(c, b, d, e, a[h + 0], 7, -680876936);
            e = u(e, c, b, d, a[h + 1], 12, -389564586);
            d = u(d, e, c, b, a[h + 2], 17, 606105819);
            b = u(b, d, e, c, a[h + 3], 22, -1044525330);
            c = u(c, b, d, e, a[h + 4], 7, -176418897);
            e = u(e, c, b, d, a[h + 5], 12, 1200080426);
            d = u(d, e, c, b, a[h + 6], 17, -1473231341);
            b = u(b, d, e, c, a[h + 7], 22, -45705983);
            c = u(c, b, d, e, a[h + 8], 7, 1770035416);
            e = u(e, c, b, d, a[h + 9], 12, -1958414417);
            d = u(d, e, c, b, a[h + 10], 17, -42063);
            b = u(b, d, e, c, a[h + 11], 22, -1990404162);
            c = u(c, b, d, e, a[h + 12], 7, 1804603682);
            e = u(e, c, b, d, a[h + 13], 12, -40341101);
            d = u(d, e, c, b, a[h + 14], 17, -1502002290);
            b = u(b, d, e, c, a[h + 15], 22, 1236535329);
            c = v(c, b, d, e, a[h + 1], 5, -165796510);
            e = v(e, c, b, d, a[h + 6], 9, -1069501632);
            d = v(d, e, c, b, a[h + 11], 14, 643717713);
            b = v(b, d, e, c, a[h + 0], 20, -373897302);
            c = v(c, b, d, e, a[h + 5], 5, -701558691);
            e = v(e, c, b, d, a[h + 10], 9, 38016083);
            d = v(d, e, c, b, a[h + 15], 14, -660478335);
            b = v(b, d, e, c, a[h + 4], 20, -405537848);
            c = v(c, b, d, e, a[h + 9], 5, 568446438);
            e = v(e, c, b, d, a[h + 14], 9, -1019803690);
            d = v(d, e, c, b, a[h + 3], 14, -187363961);
            b = v(b, d, e, c, a[h + 8], 20, 1163531501);
            c = v(c, b, d, e, a[h + 13], 5, -1444681467);
            e = v(e, c, b, d, a[h + 2], 9, -51403784);
            d = v(d, e, c, b, a[h + 7], 14, 1735328473);
            b = v(b, d, e, c, a[h + 12], 20, -1926607734);
            c = r(b ^ d ^ e, c, b, a[h + 5], 4, -378558);
            e = r(c ^ b ^ d, e, c, a[h + 8], 11, -2022574463);
            d = r(e ^ c ^ b, d, e, a[h + 11], 16, 1839030562);
            b = r(d ^ e ^ c, b, d, a[h + 14], 23, -35309556);
            c = r(b ^ d ^ e, c, b, a[h + 1], 4, -1530992060);
            e = r(c ^ b ^ d, e, c, a[h + 4], 11, 1272893353);
            d = r(e ^ c ^ b, d, e, a[h + 7], 16, -155497632);
            b = r(d ^ e ^ c, b, d, a[h + 10], 23, -1094730640);
            c = r(b ^ d ^ e, c, b, a[h + 13], 4, 681279174);
            e = r(c ^ b ^ d, e, c, a[h + 0], 11, -358537222);
            d = r(e ^ c ^ b, d, e, a[h + 3], 16, -722521979);
            b = r(d ^ e ^ c, b, d, a[h + 6], 23, 76029189);
            c = r(b ^ d ^ e, c, b, a[h + 9], 4, -640364487);
            e = r(c ^ b ^ d, e, c, a[h + 12], 11, -421815835);
            d = r(e ^ c ^ b, d, e, a[h + 15], 16, 530742520);
            b = r(d ^ e ^ c, b, d, a[h + 2], 23, -995338651);
            c = w(c, b, d, e, a[h + 0], 6, -198630844);
            e = w(e, c, b, d, a[h + 7], 10, 1126891415);
            d = w(d, e, c, b, a[h + 14], 15, -1416354905);
            b = w(b, d, e, c, a[h + 5], 21, -57434055);
            c = w(c, b, d, e, a[h + 12], 6, 1700485571);
            e = w(e, c, b, d, a[h + 3], 10, -1894986606);
            d = w(d, e, c, b, a[h + 10], 15, -1051523);
            b = w(b, d, e, c, a[h + 1], 21, -2054922799);
            c = w(c, b, d, e, a[h + 8], 6, 1873313359);
            e = w(e, c, b, d, a[h + 15], 10, -30611744);
            d = w(d, e, c, b, a[h + 6], 15, -1560198380);
            b = w(b, d, e, c, a[h + 13], 21, 1309151649);
            c = w(c, b, d, e, a[h + 4], 6, -145523070);
            e = w(e, c, b, d, a[h + 11], 10, -1120210379);
            d = w(d, e, c, b, a[h + 2], 15, 718787259);
            b = w(b, d, e, c, a[h + 9], 21, -343485551);
            c = z(c, q);
            b = z(b, B);
            d = z(d, C);
            e = z(e, A);
          }
          a = [c, b, d, e];
          c = "";
          for (b = 0; b < 4 * a.length; b++)
            c +=
              "0123456789abcdef".charAt((a[b >> 2] >> ((b % 4) * 8 + 4)) & 15) +
              "0123456789abcdef".charAt((a[b >> 2] >> ((b % 4) * 8)) & 15);
          return c;
        }
        function r(c, a, b, d, e, h) {
          c = z(z(a, c), z(d, h));
          return z((c << e) | (c >>> (32 - e)), b);
        }
        function u(c, a, b, d, e, h, q) {
          return r((a & b) | (~a & d), c, a, e, h, q);
        }
        function v(c, a, b, d, e, h, q) {
          return r((a & d) | (b & ~d), c, a, e, h, q);
        }
        function w(c, a, b, d, e, h, q) {
          return r(b ^ (a | ~d), c, a, e, h, q);
        }
        function z(c, a) {
          var b = (c & 65535) + (a & 65535);
          return (((c >> 16) + (a >> 16) + (b >> 16)) << 16) | (b & 65535);
        }
        function browserRedirect(c) {
          var a = c.toLowerCase();
          c = "ipad" == a.match(/ipad/i);
          var b = "iphone os" == a.match(/iphone os/i),
            d = "midp" == a.match(/midp/i),
            e = "rv:1.2.3.4" == a.match(/rv:1.2.3.4/i),
            h = "ucweb" == a.match(/ucweb/i),
            q = "android" == a.match(/android/i),
            B = "windows ce" == a.match(/windows ce/i);
          a = "windows mobile" == a.match(/windows mobile/i);
          n.origin = c || b || d || e || h || q || B || a ? "mobile" : "pc";
        }

        function colorDepthKey(c) {
          
            options.excludeColorDepth ||
              (c.push(screen.colorDepth), (n.colorDepth = screen.colorDepth));
            return c;
        }
        function screenResolutionKey(c) {
            if (!options.excludeScreenResolution) {
              var a = getScreenResolution();
              "undefined" !== typeof a &&
                (c.push(a.join("x")), (n.screenResolution = a.join("x")));
            }
            return c;
        }
        function getScreenResolution () {
            return options.detectScreenOrientation
              ? screen.height > screen.width
                ? [screen.height, screen.width]
                : [screen.width, screen.height]
              : [screen.height, screen.width];
        }
        function timezoneOffsetKey (c) {
            !options.excludeTimezoneOffset ||
              (c.push(new Date().getTimezoneOffset()),
              (n.timezoneOffset = new Date().getTimezoneOffset() / 60));
            return c;
        }
        function sessionStorageKey (c) {
            !options.excludeSessionStorage &&
              hasSessionStorage() &&
              (c.push("sessionStorageKey"), (n.sessionStorage = !0));
            return c;
        }
        function hasSessionStorage() {
            try {
              return !!window.sessionStorage;
            } catch (c) {
              return !0;
            }
        }
        function localStorageKey (c) {
            !options.excludeSessionStorage &&
            hasLocalStorage() &&
              (c.push("localStorageKey"), (n.localStorage = !0));
            return c;
        }
        function hasLocalStorage() {
            try {
              return !!window.localStorage;
            } catch (c) {
              return !0;
            }
        }
        function indexedDbKey(c) {
            !options.excludeIndexedDB &&
              hasIndexedDB() &&
              (c.push("indexedDbKey"), (n.indexedDb = !0));
            return c;
          }
        function hasIndexedDB () {
            return !!window.indexedDB;
        }
        function addBehaviorKey(c) {
            document.body &&
            !options.excludeAddBehavior &&
            document.body.addBehavior
              ? (c.push("addBehaviorKey"), (n.addBehavior = !0))
              : (n.addBehavior = !1);
            return c;
          }
        function openDatabaseKey (c) {
            !options.excludeOpenDatabase && window.openDatabase
              ? (c.push("openDatabase"), (n.openDatabase = !0))
              : (n.openDatabase = !1);
            return c;
          }
        function  cpuClassKey (c) {
            options.excludeCpuClass ||
              ((n.cpu = getNavigatorCpuClass()), c.push(n.cpu));
            return c;
          }
        function  getNavigatorCpuClass() {
            return navigator.oscpu || navigator.cpuClass
              ? navigator.cpuClass
              : "NA";
          }
        function platformKey(c) {
            n.platform = getNavigatorPlatform();
            c.push(n.platform);
            return c;
          }
        function getNavigatorPlatform  () {
            return navigator.platform ? navigator.platform : "NA";
        }
        function hardwareConcurrencyKey (c) {
            var a = getHardwareConcurrency();
            c.push(a);
            n.ccn = a;
            return c;
          }
        function getHardwareConcurrency () {
            return navigator.hardwareConcurrency
              ? navigator.hardwareConcurrency
              : "NA";
        }
        function audioKey(c) {
            var a = !0;
            "" != k && !isNaN(k) && 47 > parseInt(k) && (a = !1);
            if (a && (a = window.AudioContext || window.webkitAudioContext)) {
              a = new a();
              var b = a.sampleRate.toString();
              c.push(b);
              n.asr = b;
              a.close && a.close();
            }
            return c;
        }
        function doNotTrackKey(c) {
            options.excludeDoNotTrack ||
              ((n.track = getDoNotTrack()), c.push(n.track));
            return c;
          }
        function getDoNotTrack () {
            return navigator.doNotTrack || navigator.msDoNotTrack
              ? navigator.doNotTrack || navigator.msDoNotTrack
              : "NA";
        }
        function pluginsKey (c) {
            var a = getRegularPluginsString();
            c.push(a);
            n.plugins = m(a);
            return c;
          }
        function  getRegularPluginsString() {
            return this.map(
              navigator.plugins,
              function (c) {
                var a = this.map(c, function (b) {
                  return [b.type, b.suffixes].join("~");
                }).join(",");
                return [c.name, c.description, a].join("::");
              },
              this
            ).join(";");
        }
        function canvasKey(c) {
            let use_breakcollect = !0
            let _jdfp_canvas_md5 = ""
            var a = !0;
            if (use_breakcollect) {
              var b = jdtdstorage_local_storage("cfjrrval"),
                d = jdtdstorage_local_storage("cfvalmdjrr"),
                e = jdtdstorage_local_storage("timecfjrr");
              try {
                b &&
                  d &&
                  e &&
                  864e5 >= new Date().getTime() - parseInt(e) &&
                  m(b) == d &&
                  ((a = !1), (_jdfp_canvas_md5 = n.canvas = d), c.push(b));
              } catch (h) {}
            }
            a &&
              !options.excludeCanvas &&
              isCanvasSupported() &&
              ((a = getCanvasFp()),
              (n.canvas = m(a)),
              (_jdfp_canvas_md5 = n.canvas),
              c.push(a),
              use_breakcollect &&
                (jdtdstorage_local_storage("cfjrrval", a),
                jdtdstorage_local_storage(
                  "cfvalmdjrr",
                  _jdfp_canvas_md5
                ),
                jdtdstorage_local_storage(
                  "timecfjrr",
                  new Date().getTime()
                )));
            function jdtdstorage_local_storage (a, b) {
                try {
                  if (v)
                    if (void 0 !== b) v.setItem(a, b);
                    else return v.getItem(a);
                } catch (d) {}
              };
            function isCanvasSupported () {
                var c = document.createElement("canvas");
                return !(!c.getContext || !c.getContext("2d"));
            }
            function getCanvasFp() {
                var c = [],
                  a = document.createElement("canvas");
                a.width = 2e3;
                a.height = 200;
                a.style.display = "inline";
                var b = a.getContext("2d");
                b.rect(0, 0, 10, 10);
                b.rect(2, 2, 6, 6);
                c.push(
                  "cw:" + (!1 === b.isPointInPath(5, 5, "evenodd") ? "yes" : "no")
                );
                b.textBaseline = "alphabetic";
                b.fillStyle = "#f60";
                b.fillRect(125, 1, 62, 20);
                b.fillStyle = "#069";
                b.font = "11pt no-real-font-123";
                b.fillText(
                  "Cwwm aa fjorddbank glbyphs veext qtuiz, \ud83d\ude03",
                  2,
                  15
                );
                b.fillStyle = "rgba(102, 204, 0, 0.2)";
                b.font = "18pt Arial";
                b.fillText(
                  "Cwwm aa fjorddbank glbyphs veext qtuiz, \ud83d\ude03",
                  4,
                  45
                );
                b.globalCompositeOperation = "multiply";
                b.fillStyle = "rgb(255,0,255)";
                b.beginPath();
                b.arc(50, 50, 50, 0, 2 * Math.PI, !0);
                b.closePath();
                b.fill();
                b.fillStyle = "rgb(0,255,255)";
                b.beginPath();
                b.arc(100, 50, 50, 0, 2 * Math.PI, !0);
                b.closePath();
                b.fill();
                b.fillStyle = "rgb(255,255,0)";
                b.beginPath();
                b.arc(75, 100, 50, 0, 2 * Math.PI, !0);
                b.closePath();
                b.fill();
                b.fillStyle = "rgb(255,0,255)";
                b.arc(75, 75, 75, 0, 2 * Math.PI, !0);
                b.arc(75, 75, 25, 0, 2 * Math.PI, !0);
                b.fill("evenodd");
                c.push("cfp:" + a.toDataURL());
                return c.join("~");
              }
            return c;
        }
        function webglKey (c) {
            let _jdfp_webgl_md5 = ''
            var a = !0;
            if (use_breakcollect) {
              var b = jdtdstorage_local_storage("jrrwebglv"),
                d = jdtdstorage_local_storage("webglvmdjrr"),
                e = jdtdstorage_local_storage("timejrrwg");
              try {
                b &&
                  d &&
                  e &&
                  864e5 >= new Date().getTime() - parseInt(e) &&
                  m(b) == d &&
                  ((a = !1), (_jdfp_webgl_md5 = n.webgl = d), c.push(b));
              } catch (h) {}
            }
            a &&
              !options.excludeWebGL &&
              isCanvasSupported() &&
              ((a = getWebglFp()),
              c.push(a),
              (n.webglFp = m(a)),
              (_jdfp_webgl_md5 = n.webglFp),
              use_breakcollect &&
                (jdtdstorage_local_storage("jrrwebglv", a),
                jdtdstorage_local_storage(
                  "webglvmdjrr",
                  _jdfp_webgl_md5
                ),
                jdtdstorage_local_storage(
                  "timejrrwg",
                  new Date().getTime()
                )));
                function getWebglFp () {
                    var c = function (C) {
                      a.clearColor(0, 0, 0, 1);
                      a.enable(a.DEPTH_TEST);
                      a.depthFunc(a.LEQUAL);
                      a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT);
                      return "[" + C[0] + ", " + C[1] + "]";
                    };
                    var a = getWebglCanvas();
                    if (!a) return null;
                    var b = [],
                      d = a.createBuffer();
                    a.bindBuffer(a.ARRAY_BUFFER, d);
                    var e = new Float32Array([
                      -0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.732134444, 0,
                    ]);
                    a.bufferData(a.ARRAY_BUFFER, e, a.STATIC_DRAW);
                    d.itemSize = 3;
                    d.numItems = 3;
                    e = a.createProgram();
                    var h = a.createShader(a.VERTEX_SHADER);
                    a.shaderSource(
                      h,
                      "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}"
                    );
                    a.compileShader(h);
                    var q = a.createShader(a.FRAGMENT_SHADER);
                    a.shaderSource(
                      q,
                      "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}"
                    );
                    a.compileShader(q);
                    a.attachShader(e, h);
                    a.attachShader(e, q);
                    a.linkProgram(e);
                    a.useProgram(e);
                    e.vertexPosAttrib = a.getAttribLocation(e, "attrVertex");
                    e.offsetUniform = a.getUniformLocation(e, "uniformOffset");
                    a.enableVertexAttribArray(e.vertexPosArray);
                    a.vertexAttribPointer(e.vertexPosAttrib, d.itemSize, a.FLOAT, !1, 0, 0);
                    a.uniform2f(e.offsetUniform, 1, 1);
                    a.drawArrays(a.TRIANGLE_STRIP, 0, d.numItems);
                    null != a.canvas && b.push(a.canvas.toDataURL());
                    b.push("extensions:" + a.getSupportedExtensions().join(";"));
                    b.push("w1" + c(a.getParameter(a.ALIASED_LINE_WIDTH_RANGE)));
                    b.push("w2" + c(a.getParameter(a.ALIASED_POINT_SIZE_RANGE)));
                    b.push("w3" + a.getParameter(a.ALPHA_BITS));
                    b.push("w4" + (a.getContextAttributes().antialias ? "yes" : "no"));
                    b.push("w5" + a.getParameter(a.BLUE_BITS));
                    b.push("w6" + a.getParameter(a.DEPTH_BITS));
                    b.push("w7" + a.getParameter(a.GREEN_BITS));
                    b.push(
                      "w8" +
                        (function (C) {
                          var A,
                            D =
                              C.getExtension("EXT_texture_filter_anisotropic") ||
                              C.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
                              C.getExtension("MOZ_EXT_texture_filter_anisotropic");
                          return D
                            ? ((A = C.getParameter(D.MAX_TEXTURE_MAX_ANISOTROPY_EXT)),
                              0 === A && (A = 2),
                              A)
                            : null;
                        })(a)
                    );
                    b.push("w9" + a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
                    b.push("w10" + a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE));
                    b.push("w11" + a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS));
                    b.push("w12" + a.getParameter(a.MAX_RENDERBUFFER_SIZE));
                    b.push("w13" + a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS));
                    b.push("w14" + a.getParameter(a.MAX_TEXTURE_SIZE));
                    b.push("w15" + a.getParameter(a.MAX_VARYING_VECTORS));
                    b.push("w16" + a.getParameter(a.MAX_VERTEX_ATTRIBS));
                    b.push("w17" + a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
                    b.push("w18" + a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS));
                    b.push("w19" + c(a.getParameter(a.MAX_VIEWPORT_DIMS)));
                    b.push("w20" + a.getParameter(a.RED_BITS));
                    b.push("w21" + a.getParameter(a.RENDERER));
                    b.push("w22" + a.getParameter(a.SHADING_LANGUAGE_VERSION));
                    b.push("w23" + a.getParameter(a.STENCIL_BITS));
                    b.push("w24" + a.getParameter(a.VENDOR));
                    b.push("w25" + a.getParameter(a.VERSION));
                    try {
                      var B = a.getExtension("WEBGL_debug_renderer_info");
                      B &&
                        (b.push("wuv:" + a.getParameter(B.UNMASKED_VENDOR_WEBGL)),
                        b.push("wur:" + a.getParameter(B.UNMASKED_RENDERER_WEBGL)));
                    } catch (C) {}
                    if (!a.getShaderPrecisionFormat) return b.join("\u00a7");
                    b.push(
                      "w26" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.HIGH_FLOAT).precision
                    );
                    b.push(
                      "w27" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.HIGH_FLOAT).rangeMin
                    );
                    b.push(
                      "w28" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.HIGH_FLOAT).rangeMax
                    );
                    b.push(
                      "w29" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.MEDIUM_FLOAT)
                          .precision
                    );
                    b.push(
                      "w30" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.MEDIUM_FLOAT).rangeMin
                    );
                    b.push(
                      "w31" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.MEDIUM_FLOAT).rangeMax
                    );
                    b.push(
                      "w32" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.LOW_FLOAT).precision
                    );
                    b.push(
                      "w33" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.LOW_FLOAT).rangeMin
                    );
                    b.push(
                      "w34" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.LOW_FLOAT).rangeMax
                    );
                    b.push(
                      "w35" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.HIGH_FLOAT)
                          .precision
                    );
                    b.push(
                      "w36" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.HIGH_FLOAT).rangeMin
                    );
                    b.push(
                      "w37" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.HIGH_FLOAT).rangeMax
                    );
                    b.push(
                      "w38" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.MEDIUM_FLOAT)
                          .precision
                    );
                    b.push(
                      "w39" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.MEDIUM_FLOAT)
                          .rangeMin
                    );
                    b.push(
                      "w40" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.MEDIUM_FLOAT)
                          .rangeMax
                    );
                    b.push(
                      "w41" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.LOW_FLOAT).precision
                    );
                    b.push(
                      "w42" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.LOW_FLOAT).rangeMin
                    );
                    b.push(
                      "w43" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.LOW_FLOAT).rangeMax
                    );
                    b.push(
                      "w44" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.HIGH_INT).precision
                    );
                    b.push(
                      "w45" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.HIGH_INT).rangeMin
                    );
                    b.push(
                      "w46" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.HIGH_INT).rangeMax
                    );
                    b.push(
                      "w47" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.MEDIUM_INT).precision
                    );
                    b.push(
                      "w48" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.MEDIUM_INT).rangeMin
                    );
                    b.push(
                      "w49" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.MEDIUM_INT).rangeMax
                    );
                    b.push(
                      "w50" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.LOW_INT).precision
                    );
                    b.push(
                      "w51" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.LOW_INT).rangeMin
                    );
                    b.push(
                      "w52" +
                        a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.LOW_INT).rangeMax
                    );
                    b.push(
                      "w53" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.HIGH_INT).precision
                    );
                    b.push(
                      "w54" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.HIGH_INT).rangeMin
                    );
                    b.push(
                      "w55" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.HIGH_INT).rangeMax
                    );
                    b.push(
                      "w56" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.MEDIUM_INT)
                          .precision
                    );
                    b.push(
                      "w57" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.MEDIUM_INT).rangeMin
                    );
                    b.push(
                      "w58" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.MEDIUM_INT).rangeMax
                    );
                    b.push(
                      "w59" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.LOW_INT).precision
                    );
                    b.push(
                      "w60" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.LOW_INT).rangeMin
                    );
                    b.push(
                      "w61" +
                        a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.LOW_INT).rangeMax
                    );
                    function getWebglCanvas() {
                        var c = document.createElement("canvas"),
                          a = null;
                        try {
                          a = c.getContext("webgl") || c.getContext("experimental-webgl");
                        } catch (b) {}
                        a || (a = null);
                        return a;
                    }
                    return b.join("\u00a7");
                }
            return c;
        }
        function x64hash128(c, a) {
            c = c || "";
            a = a || 0;
            var b = c.length % 16,
              d = c.length - b,
              e = [0, a];
            a = [0, a];
            for (
              var h,
                q,
                B = [2277735313, 289559509],
                C = [1291169091, 658871167],
                A = 0;
              A < d;
              A += 16
            )
              (h = [
                (c.charCodeAt(A + 4) & 255) |
                  ((c.charCodeAt(A + 5) & 255) << 8) |
                  ((c.charCodeAt(A + 6) & 255) << 16) |
                  ((c.charCodeAt(A + 7) & 255) << 24),
                (c.charCodeAt(A) & 255) |
                  ((c.charCodeAt(A + 1) & 255) << 8) |
                  ((c.charCodeAt(A + 2) & 255) << 16) |
                  ((c.charCodeAt(A + 3) & 255) << 24),
              ]),
                (q = [
                  (c.charCodeAt(A + 12) & 255) |
                    ((c.charCodeAt(A + 13) & 255) << 8) |
                    ((c.charCodeAt(A + 14) & 255) << 16) |
                    ((c.charCodeAt(A + 15) & 255) << 24),
                  (c.charCodeAt(A + 8) & 255) |
                    ((c.charCodeAt(A + 9) & 255) << 8) |
                    ((c.charCodeAt(A + 10) & 255) << 16) |
                    ((c.charCodeAt(A + 11) & 255) << 24),
                ]),
                (h = x64Multiply(h, B)),
                (h = x64Rotl(h, 31)),
                (h = x64Multiply(h, C)),
                (e = x64Xor(e, h)),
                (e = x64Rotl(e, 27)),
                (e = x64Add(e, a)),
                (e = x64Add(x64Multiply(e, [0, 5]), [0, 1390208809])),
                (q = x64Multiply(q, C)),
                (q = x64Rotl(q, 33)),
                (q = x64Multiply(q, B)),
                (a = x64Xor(a, q)),
                (a = x64Rotl(a, 31)),
                (a = x64Add(a, e)),
                (a = x64Add(x64Multiply(a, [0, 5]), [0, 944331445]));
            h = [0, 0];
            q = [0, 0];
            switch (b) {
              case 15:
                q = x64Xor(
                  q,
                  x64LeftShift([0, c.charCodeAt(A + 14)], 48)
                );
              case 14:
                q = x64Xor(
                  q,
                  x64LeftShift([0, c.charCodeAt(A + 13)], 40)
                );
              case 13:
                q = x64Xor(
                  q,
                  x64LeftShift([0, c.charCodeAt(A + 12)], 32)
                );
              case 12:
                q = x64Xor(
                  q,
                  x64LeftShift([0, c.charCodeAt(A + 11)], 24)
                );
              case 11:
                q = x64Xor(
                  q,
                  x64LeftShift([0, c.charCodeAt(A + 10)], 16)
                );
              case 10:
                q = x64Xor(q, x64LeftShift([0, c.charCodeAt(A + 9)], 8));
              case 9:
                (q = x64Xor(q, [0, c.charCodeAt(A + 8)])),
                  (q = x64Multiply(q, C)),
                  (q = x64Rotl(q, 33)),
                  (q = x64Multiply(q, B)),
                  (a = x64Xor(a, q));
              case 8:
                h = x64Xor(h, x64LeftShift([0, c.charCodeAt(A + 7)], 56));
              case 7:
                h = x64Xor(h, x64LeftShift([0, c.charCodeAt(A + 6)], 48));
              case 6:
                h = x64Xor(h, x64LeftShift([0, c.charCodeAt(A + 5)], 40));
              case 5:
                h = x64Xor(h, x64LeftShift([0, c.charCodeAt(A + 4)], 32));
              case 4:
                h = x64Xor(h, x64LeftShift([0, c.charCodeAt(A + 3)], 24));
              case 3:
                h = x64Xor(h, x64LeftShift([0, c.charCodeAt(A + 2)], 16));
              case 2:
                h = x64Xor(h, x64LeftShift([0, c.charCodeAt(A + 1)], 8));
              case 1:
                (h = x64Xor(h, [0, c.charCodeAt(A)])),
                  (h = x64Multiply(h, B)),
                  (h = x64Rotl(h, 31)),
                  (h = x64Multiply(h, C)),
                  (e = x64Xor(e, h));
            }
            e = x64Xor(e, [0, c.length]);
            a = x64Xor(a, [0, c.length]);
            e = x64Add(e, a);
            a = x64Add(a, e);
            e = x64Fmix(e);
            a = x64Fmix(a);
            e = x64Add(e, a);
            a = x64Add(a, e);
            function x64Multiply(c, a) {
                c = [c[0] >>> 16, c[0] & 65535, c[1] >>> 16, c[1] & 65535];
                a = [a[0] >>> 16, a[0] & 65535, a[1] >>> 16, a[1] & 65535];
                var b = [0, 0, 0, 0];
                b[3] += c[3] * a[3];
                b[2] += b[3] >>> 16;
                b[3] &= 65535;
                b[2] += c[2] * a[3];
                b[1] += b[2] >>> 16;
                b[2] &= 65535;
                b[2] += c[3] * a[2];
                b[1] += b[2] >>> 16;
                b[2] &= 65535;
                b[1] += c[1] * a[3];
                b[0] += b[1] >>> 16;
                b[1] &= 65535;
                b[1] += c[2] * a[2];
                b[0] += b[1] >>> 16;
                b[1] &= 65535;
                b[1] += c[3] * a[1];
                b[0] += b[1] >>> 16;
                b[1] &= 65535;
                b[0] += c[0] * a[3] + c[1] * a[2] + c[2] * a[1] + c[3] * a[0];
                b[0] &= 65535;
                return [(b[0] << 16) | b[1], (b[2] << 16) | b[3]];
            }
            function x64Rotl(c, a) {
                a %= 64;
                if (32 === a) return [c[1], c[0]];
                if (32 > a)
                  return [
                    (c[0] << a) | (c[1] >>> (32 - a)),
                    (c[1] << a) | (c[0] >>> (32 - a)),
                  ];
                a -= 32;
                return [
                  (c[1] << a) | (c[0] >>> (32 - a)),
                  (c[0] << a) | (c[1] >>> (32 - a)),
                ];
            }
            function x64Xor (c, a) {
                return [c[0] ^ a[0], c[1] ^ a[1]];
            }
            function x64Add(c, a) {
                c = [c[0] >>> 16, c[0] & 65535, c[1] >>> 16, c[1] & 65535];
                a = [a[0] >>> 16, a[0] & 65535, a[1] >>> 16, a[1] & 65535];
                var b = [0, 0, 0, 0];
                b[3] += c[3] + a[3];
                b[2] += b[3] >>> 16;
                b[3] &= 65535;
                b[2] += c[2] + a[2];
                b[1] += b[2] >>> 16;
                b[2] &= 65535;
                b[1] += c[1] + a[1];
                b[0] += b[1] >>> 16;
                b[1] &= 65535;
                b[0] += c[0] + a[0];
                b[0] &= 65535;
                return [(b[0] << 16) | b[1], (b[2] << 16) | b[3]];
            }
            function x64LeftShift (c, a) {
                a %= 64;
                return 0 === a
                  ? c
                  : 32 > a
                  ? [(c[0] << a) | (c[1] >>> (32 - a)), c[1] << a]
                  : [c[1] << (a - 32), 0];
            }
            function x64Fmix(c) {
                c = x64Xor(c, [0, c[0] >>> 1]);
                c = x64Multiply(c, [4283543511, 3981806797]);
                c = x64Xor(c, [0, c[0] >>> 1]);
                c = x64Multiply(c, [3301882366, 444984403]);
                return (c = x64Xor(c, [0, c[0] >>> 1]));
            }

            return (
              ("00000000" + (e[0] >>> 0).toString(16)).slice(-8) +
              ("00000000" + (e[1] >>> 0).toString(16)).slice(-8) +
              ("00000000" + (a[0] >>> 0).toString(16)).slice(-8) +
              ("00000000" + (a[1] >>> 0).toString(16)).slice(-8)
            );
        }






        return a
          
    }
    function getJd_shadow__(){
        JDDSecCryptoJS = getJDDSecCryptoJS(Math);
        var m = JDDSecCryptoJS,
        r = [];
        r.push(_CurrentPageUrl);
        var u = m.lib.UUID.generateUuid();
        r.push(u);
        var v = new Date().getTime();
        r.push(v);
        var w = m.SHA1(r.join("")).toString().toUpperCase();
        r = [];
        r.push("JD1");
        r.push(w);
        var z = new JDDMAC().mac(r.join(""));
        r.push(z);
        var n = m.enc.Hex.parse("30313233343536373839616263646566"),
            g = m.enc.Hex.parse("4c5751554935255042304e6458323365"),
            x = r.join("");
        return m.AES.encrypt(m.enc.Utf8.parse(x), g, {
            mode: m.mode.CBC,
            padding: m.pad.Pkcs7,
            iv: n,
        }).ciphertext.toString(m.enc.Base32);
    }
    function getJDDSecCryptoJS(m, r){
        var u = {},
        v = (u.lib = {}),
        w = (v.Base = (function () {
                            function f() {}
                            return {
                                extend: function (k) {
                                f.prototype = this;
                                var p = new f();
                                k && p.mixIn(k);
                                p.hasOwnProperty("init") ||
                                (p.init = function () {
                                    p.$super.init.apply(this, arguments);
                                });
                                p.init.prototype = p;
                                p.$super = this;
                                return p;
                                },
                                create: function () {
                                var k = this.extend();
                                k.init.apply(k, arguments);
                                return k;
                                },
                                init: function () {},
                                mixIn: function (k) {
                                for (var p in k) k.hasOwnProperty(p) && (this[p] = k[p]);
                                k.hasOwnProperty("toString") && (this.toString = k.toString);
                                },
                                clone: function () {
                                return this.init.prototype.extend(this);
                                },
                            };
        })()),
        z = (v.WordArray = w.extend({
            init: function (f, k) {
                f = this.words = f || [];
                this.sigBytes = k != r ? k : 4 * f.length;
            },
            toString: function (f) {
                return (f || g).stringify(this);
            },
            concat: function (f) {
                var k = this.words,
                p = f.words,
                c = this.sigBytes;
                f = f.sigBytes;
                this.clamp();
                if (c % 4)
                for (var a = 0; a < f; a++)
                    k[(c + a) >>> 2] |=
                    ((p[a >>> 2] >>> (24 - (a % 4) * 8)) & 255) <<
                    (24 - ((c + a) % 4) * 8);
                else if (65535 < p.length)
                for (a = 0; a < f; a += 4) k[(c + a) >>> 2] = p[a >>> 2];
                else k.push.apply(k, p);
                this.sigBytes += f;
                return this;
            },
            clamp: function () {
                var f = this.words,
                k = this.sigBytes;
                f[k >>> 2] &= 4294967295 << (32 - (k % 4) * 8);
                f.length = m.ceil(k / 4);
            },
            clone: function () {
                var f = w.clone.call(this);
                f.words = this.words.slice(0);
                return f;
            },
            random: function (f) {
                for (var k = [], p = 0; p < f; p += 4)
                k.push((4294967296 * m.random()) | 0);
                return new z.init(k, f);
            },
            }));
        v.UUID = w.extend({
            generateUuid: function () {
            for (
                var f = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split(""),
                k = 0,
                p = f.length;
                k < p;
                k++
            )
                switch (f[k]) {
                case "x":
                    f[k] = m.floor(16 * m.random()).toString(16);
                    break;
                case "y":
                    f[k] = (m.floor(4 * m.random()) + 8).toString(16);
                }
            return f.join("");
            },
        });
        var n = (u.enc = {}),
            g = (n.Hex = {
            stringify: function (f) {
                var k = f.words;
                f = f.sigBytes;
                var p = [];
                for (var c = 0; c < f; c++) {
                var a = (k[c >>> 2] >>> (24 - (c % 4) * 8)) & 255;
                p.push((a >>> 4).toString(16));
                p.push((a & 15).toString(16));
                }
                return p.join("");
            },
            parse: function (f) {
                for (var k = f.length, p = [], c = 0; c < k; c += 2)
                p[c >>> 3] |= parseInt(f.substr(c, 2), 16) << (24 - (c % 8) * 4);
                return new z.init(p, k / 2);
            },
            }),
            x = (n.Latin1 = {
            stringify: function (f) {
                var k = f.words;
                f = f.sigBytes;
                for (var p = [], c = 0; c < f; c++)
                p.push(
                    String.fromCharCode((k[c >>> 2] >>> (24 - (c % 4) * 8)) & 255)
                );
                return p.join("");
            },
            parse: function (f) {
                for (var k = f.length, p = [], c = 0; c < k; c++)
                p[c >>> 2] |= (f.charCodeAt(c) & 255) << (24 - (c % 4) * 8);
                return new z.init(p, k);
            },
            }),
            t = (n.Utf8 = {
            stringify: function (f) {
                try {
                return decodeURIComponent(escape(x.stringify(f)));
                } catch (k) {
                throw Error("Malformed UTF-8 data");
                }
            },
            parse: function (f) {
                return x.parse(unescape(encodeURIComponent(f)));
            },
            }),
            l = (v.BufferedBlockAlgorithm = w.extend({
            reset: function () {
                this._data = new z.init();
                this._nDataBytes = 0;
            },
            _append: function (f) {
                "string" == typeof f && (f = t.parse(f));
                this._data.concat(f);
                this._nDataBytes += f.sigBytes;
            },
            _process: function (f) {
                var k = this._data,
                p = k.words,
                c = k.sigBytes,
                a = this.blockSize,
                b = c / (4 * a);
                b = f ? m.ceil(b) : m.max((b | 0) - this._minBufferSize, 0);
                f = b * a;
                c = m.min(4 * f, c);
                if (f) {
                for (var d = 0; d < f; d += a) this._doProcessBlock(p, d);
                d = p.splice(0, f);
                k.sigBytes -= c;
                }
                return new z.init(d, c);
            },
            clone: function () {
                var f = w.clone.call(this);
                f._data = this._data.clone();
                return f;
            },
            _minBufferSize: 0,
            }));
        v.Hasher = l.extend({
            cfg: w.extend(),
            init: function (f) {
            this.cfg = this.cfg.extend(f);
            this.reset();
            },
            reset: function () {
            l.reset.call(this);
            this._doReset();
            },
            update: function (f) {
            this._append(f);
            this._process();
            return this;
            },
            finalize: function (f) {
            f && this._append(f);
            return this._doFinalize();
            },
            blockSize: 16,
            _createHelper: function (f) {
            return function (k, p) {
                return new f.init(p).finalize(k);
            };
            },
            _createHmacHelper: function (f) {
            return function (k, p) {
                return new y.HMAC.init(f, p).finalize(k);
            };
            },
        });
        var y = (u.algo = {});
        return u;
    }
    function tdencrypt(n) {
        n = JSON.stringify(n);
        n = encodeURIComponent(n);
        var g = "",
          x = 0;
        do {
          var t = n.charCodeAt(x++);
          var l = n.charCodeAt(x++);
          var y = n.charCodeAt(x++);
          var f = t >> 2;
          t = ((t & 3) << 4) | (l >> 4);
          var k = ((l & 15) << 2) | (y >> 6);
          var p = y & 63;
          isNaN(l) ? (k = p = 64) : isNaN(y) && (p = 64);
          g =
            g +
            "23IL<N01c7KvwZO56RSTAfghiFyzWJqVabGH4PQdopUrsCuX*xeBjkltDEmn89.-".charAt(
              f
            ) +
            "23IL<N01c7KvwZO56RSTAfghiFyzWJqVabGH4PQdopUrsCuX*xeBjkltDEmn89.-".charAt(
              t
            ) +
            "23IL<N01c7KvwZO56RSTAfghiFyzWJqVabGH4PQdopUrsCuX*xeBjkltDEmn89.-".charAt(
              k
            ) +
            "23IL<N01c7KvwZO56RSTAfghiFyzWJqVabGH4PQdopUrsCuX*xeBjkltDEmn89.-".charAt(
              p
            );
        } while (x < n.length);
        return g + "/";
      };
    function collect() {
        var n = new Date();
        try {
          var g = document.createElement("div"),
            x = {},
            t =
              "ActiveBorder ActiveCaption AppWorkspace Background ButtonFace ButtonHighlight ButtonShadow ButtonText CaptionText GrayText Highlight HighlightText InactiveBorder InactiveCaption InactiveCaptionText InfoBackground InfoText Menu MenuText Scrollbar ThreeDDarkShadow ThreeDFace ThreeDHighlight ThreeDLightShadow ThreeDShadow Window WindowFrame WindowText".split(
                " "
              );
          if (window.getComputedStyle)
            for (var l = 0; l < t.length; l++)
              document.body.appendChild(g),
                (g.style.color = t[l]),
                (x[t[l]] = window
                  .getComputedStyle(g)
                  .getPropertyValue("color")),
                document.body.removeChild(g);
        } catch (q) {}
        g = { ca: {}, ts: {}, m: {} };
        t = g.ca;
        t.tdHash = _jdfp_canvas_md5;
        t.webglHash = _jdfp_webgl_md5;
        var y = !1;
        if (window.WebGLRenderingContext) {
          var f = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
            k = [],
            p;
          for (l = 0; l < f.length; l++)
            try {
              var c = !1;
              (c = document
                .createElement("canvas")
                .getContext(f[l], { stencil: !0 })) &&
                c &&
                ((p = c), k.push(f[l]));
            } catch (q) {}
          k.length && (y = { name: k, gl: p });
        }
        if (y) {
          l = y.gl;
          t.contextName = y.name.join();
          t.webglversion = l.getParameter(l.VERSION);
          t.shadingLV = l.getParameter(l.SHADING_LANGUAGE_VERSION);
          t.vendor = l.getParameter(l.VENDOR);
          t.renderer = l.getParameter(l.RENDERER);
          p = [];
          try {
            (p = l.getSupportedExtensions()), (t.extensions = p);
          } catch (q) {}
          try {
            var a = l.getExtension("WEBGL_debug_renderer_info");
            a &&
              ((t.wuv = l.getParameter(a.UNMASKED_VENDOR_WEBGL)),
              (t.wur = l.getParameter(a.UNMASKED_RENDERER_WEBGL)));
          } catch (q) {}
        }
        g.m.documentMode = document.documentMode;
        g.m.compatMode = document.compatMode;
        a = [];
        t = new r();
        for (l = 0; l < w.length; l++)
          (p = w[l]), t.checkSupportFont(p) && a.push(p);
        g.fo = a;
        l = {};
        a = [];
        for (var b in navigator)
          "object" != typeof navigator[b] && (l[b] = navigator[b]), a.push(b);
        l.enumerationOrder = a;
        l.javaEnabled = navigator.javaEnabled();
        try {
          l.taintEnabled = navigator.taintEnabled();
        } catch (q) {}
        g.n = l;
        l = navigator.userAgent.toLowerCase();
        if ((b = l.match(/rv:([\d.]+)\) like gecko/))) var d = b[1];
        if ((b = l.match(/msie ([\d.]+)/))) d = b[1];
        b = [];
        if (d)
          for (
            d =
              "AcroPDF.PDF;Adodb.Stream;AgControl.AgControl;DevalVRXCtrl.DevalVRXCtrl.1;MacromediaFlashPaper.MacromediaFlashPaper;Msxml2.DOMDocument;Msxml2.XMLHTTP;PDF.PdfCtrl;QuickTime.QuickTime;QuickTimeCheckObject.QuickTimeCheck.1;RealPlayer;RealPlayer.RealPlayer(tm) ActiveX Control (32-bit);RealVideo.RealVideo(tm) ActiveX Control (32-bit);rmocx.RealPlayer G2 Control;Scripting.Dictionary;Shell.UIHelper;ShockwaveFlash.ShockwaveFlash;SWCtl.SWCtl;TDCCtl.TDCCtl;WMPlayer.OCX".split(
                ";"
              ),
              l = 0;
            l < d.length;
            l++
          ) {
            var e = d[l];
            try {
              var h = new ActiveXObject(e);
              a = {};
              a.name = e;
              try {
                a.version = h.GetVariable("$version");
              } catch (q) {}
              try {
                a.version = h.GetVersions();
              } catch (q) {}
              (a.version && 0 < a.version.length) || (a.version = "");
              b.push(a);
            } catch (q) {}
          }
        else {
          d = navigator.plugins;
          a = {};
          for (l = 0; l < d.length; l++)
            (e = d[l]), (a[e.name] = 1), b.push(u(e));
          for (l = 0; l < z.length; l++)
            (h = z[l]), a[h] || ((e = d[h]), e && b.push(u(e)));
        }
        d =
          "availHeight availWidth colorDepth bufferDepth deviceXDPI deviceYDPI height width logicalXDPI logicalYDPI pixelDepth updateInterval".split(
            " "
          );
        e = {};
        for (l = 0; d.length > l; l++)
          (h = d[l]), void 0 !== screen[h] && (e[h] = screen[h]);
        d = ["devicePixelRatio", "screenTop", "screenLeft"];
        a = {};
        for (l = 0; d.length > l; l++)
          (h = d[l]), void 0 !== window[h] && (a[h] = window[h]);
        g.p = b;
        g.w = a;
        g.s = e;
        g.sc = x;
        g.tz = n.getTimezoneOffset();
        g.lil = v.sort().join("|");
        g.wil = "";
        n = {};
        try {
          (n.cookie = navigator.cookieEnabled),
            (n.localStorage = !!window.localStorage),
            (n.sessionStorage = !!window.sessionStorage),
            (n.globalStorage = !!window.globalStorage),
            (n.indexedDB = !!window.indexedDB);
        } catch (q) {}
        g.ss = n;
        g.ts.deviceTime = start_time;
        g.ts.deviceEndTime = new Date().getTime();
        return tdencrypt(g);
    }
    return res
}


module.exports = {
    'GET /taxiapi/searchjingdong': searchJingDongFn,
    'GET /taxiapi/searchgoodsjd': searchGooodsJDFn,
    'GET /taxiapi/loginjingdong': loginJingDongFn,
    'GET /taxiapi/test': testPixel,
};