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
            // headless: false,
            headless: true,
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
        // let cookie1 = {
        //   name:'test',
        //   value:'1',
        //   domain:'https://union.jd.com',
        //   path:'/',
        //   expire:Date.now() + 3600*1000
        // }
        // await firstPage.setCookie(cookie1)
       
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
                    let nextUrl = 'https://gia.jd.com/fcf.html' + result.url
                    log(chalk.green('url',url))
                    log(chalk.green('nextUrl',nextUrl))
                    debugger
                    let postData = `g=${result.formObjN.g}&d=${result.formObjN.d}`
                    request.continue({url:nextUrl,postData,headers:nextHeaders})
                
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
                        log(chalk.red('s.html response url', url))
                        log(chalk.red('s.html response log', body))
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
        let cookies = await firstPage.cookies()
        console.log('cookies',cookies)
        
        
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
    
    

    let name = '9263'
    let pwd = '19919263'
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

                //只执行一次
                validateFlag = true

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
    // let _JdJrTdRiskFpInfo = get_JdJrTdRiskFpInfo()
    let _url_query_str = ""
    let _CurrentPageUrl = (function () {
        let w = undefined
        let _CurrentPageProtocol = "https://"
        var m = 'https://passport.jd.com/common/loginPage?from=media&ReturnUrl=https%3A%2F%2Funion.jd.com%2Foverview';
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
    jd_shadow__ = getJd_shadow__()
    // z.jtb = jd_shadow__
    var z = {
        f: "1",
        // fp: _JdJrTdRiskFpInfo,
        fp: "3ecb1cd2c2d623a7123da42097f54b88",
        jtb:jd_shadow__,
        // jtb:"VIELZRHB4CSSEGP4XSQ36DLLXHSFKMNCONFF5IXP5YPLYI7G74UHCUCWC5OSIXCEZ4S7EBDFLC45SOR3DRFJ456D3E63DLC765OJOXA",
        o:_CurrentPageUrl,
        oid: '',
        p: "s",
        pin: '',
        qi:"",
        qs:"",
        t:jd_risk_token_id,
        // t:"KU7NWC43MDG5SYPA2K3B5XJIAYFWUYQZRN74MC37PMHYVZMDAFW4TSPT4EBZLWO2OWWDHQOO6IXWE",
        v: "2.6.15.1",
    };
    
    // void 0 !== w &&
    // null !== w &&
    // 0 < w.length &&
    // ((_JdEid = w), (_eidFlag = !0));
    // "undefined" != typeof _JdEid &&
    // 0 < _JdEid.length &&
    // (z.fc = _JdEid);
    
    // z ="?a=" + tdencrypt(z)
    z ="?a="  + '7TJI7TceW0Pu7Tce7TZ37Tce7Tce7T7L7TcezlP47Tce7TZ37Tce7Tce7T7L7TceWIAewGAB6SAewdwPwHcPw4wPwH7QWIAewGAB6SAewHZPilcxil6eiB74ZHcBiTWxwHZ4iT6ewL4tFHAjiHaD7Tce7T7L7TceJGAewGAB6SAewHcuZGDxZSDx7Tce7T7L7TceFGAewGAB6SAewH<PwHcPw4wPwH7X7Tce7TZ37TceW0NBWt3XWd6uyQ6uil9C7T70il9Czg9u7T70z09dygE6igJP7Tce7T7L7TceWhwPwHcPwj<PwH7QWQ9C7TZ<zgf4yg<PwHFSFhRkWQEfWQ*PwjRoJ1R*WeAeZTZ37Tckw4iPwHAeRdfuyg9uvQp4vQZXzSAeZT70ztFPWdFpFhWPwHcPw4wPwH7QieAewGAB6SAewPZgSP3yfA8jTjFgfHWkZjJ5APfKSNpSTAEyZjRy6kfKZ4ZZATRATA73gAbcZ46jZ4R56jbIfNRcTPZygPAkwj7vZjx1gLJSgfAjS4CTTHilwHJFTk7TTPpwRSAewGAe6eAewd6PwHcPwj<PwH7ygfRRZ4xKTAJ1T<pRgHFLZ4NiTjxfg4*tR4Ccg<PZfAkZT4ZA6PbNg4DlZAEITP3LSTZ<T<7fAAE3STRSw4bFAANKfAf0Akf5SNpiwGAewGAe6eAewdNp7Tce7TZ37Tce7Tce7T7L7TceydRG7Tce7TZ37TcegfckAA4tZNAj64JL6kPKT4akZNFIRPAjZ4ZiSfb16APhTHZIfLZZTkbhT4PKTjRFf<NR6TF0A4pOTLfggNf1SA8BAHFTg<b3fBFSg4DjfBF<ff7<AjNhRNfSf4We6kfSTffgAAR1ASAewGAtR2/'
    // _JdJrRiskClientCollectData = collect();
    _JdJrRiskClientCollectData = '7TJI7Tceil<PwHcPwj<PZjcPwH7jF<bbWlaPwHcPwj<PwHctOTiDwHAlOgRGw0AxO0iBwTWDwB2*wH6BilR4ilN4ZSAewGAe6eAewdJPiQJsS0NByIAewGAB6SAewH4EOL7GiBW*ZTN4OLNHil<BO0R4OgF4Z0fGFgAjiQc*7Tce7T7L7Tceil9uJ0fDJ<EbzgAPwHcPwj<PwH7tFg7dzIAe6lfDW0feygkPzdRbzIktFg7dzIAewGAe6eAewdJPiQJsJQfeWlPXzGAewGAB6SAewPJPi4Jw7Tc*wSD*7Tc*K<9*FgE1TIAew<fT7Tc*wGD*7Tc*6lbezlkpJgjp7Tce7T7L7TceWlbbF0PuFjxg7Tce7TZ37TceflfGRj*PwH31TNZw7Tc*RfwPwH2xvH2PwH2oTt3Pz4Jw7Tc*RfwPwH31TNZw7Tc*RfwPwH2xvH2PwH3Ly17XzgPkzS4PwHcPw4wPwH7lFgE4ztcPwHcPwj<PwH7hFg7vyh6PwHcPw4wPwH7eFgE4Fh7PWGAewGAB6SAewPJPi4CpJIAewNJPi4Jw7Tce7T7L7TceFhbjFgEByg9uWeAewGAB6SAk6GAew4NORjxNhlPuWtRbzQZPFN9bWd7bqhwPwHcPw4wPwH7NgNRViQxPzQRVzgPuzgND7Tce7T7L7TceRfbAhlZXz09ehl7kFQFPWP9oigxQhlFszlNj7Tce7T7L7TceRfbAhlRpWlpXygEjhtRpzgfehtNkFh7E7Tce7T7L7TceRfbAhlFszlNjhl7sFgE47Tce7T7L7TceRfbAhlFeigJVF0f*J0aPwHcPw4wPwH7NgNRVWlbbF0fehtRPq1RkWQfVz0947Tce7T7L7TceRfbAhtRPq1RkWQfVil9CW17PWtZpzlEVid3jieAewGAe6eAew4fifN9jFhbjJh7PhlZXzh3eFhZByg9uht7dJ0wPwHcPw4wPwH7NgNRVJ0fDJ1feFf9QygxjFh7VigEpWl9jWQ9*ygwPwHcPw4wPwH7NgNRVWk716GAewGAe6eAew4CcAP9*ih7bz0xPzN9By0N4Fh7Vil9CW0PsFSAewGAe6eAew49NAk9Pz0fCFgEjhlPuF0fDhtfpzd6PwHcPw4wPwH75RfZVFQ7Xht7PzQRPWP9Cyh3Cih2PwHcPw4wPwH75RfZVWtRbzQRbWQRVF0feyhFbJ0PlFhwPwHcPw4wPwH75RfZVJ0fDJ1feFf9Qz09bJIAewGAe6eAew49NAk9jFhbjJh7PhlFszlNjhlxpzQfbWGAewGAe6eAew49NAk9jFhbjJh7Phlbbz0FVFQxXih6PwHcPw4wPwH75RfZVJ0fDJ1feFf9oigxQhlFszlNjhlxpzQfbWGAewGAe6eAew49NAk9lFh7jFhbVih7eihPVzl7UFgZj7Tce7T7L7TcefjfIRjxVil9szt7VidfQFQfehlFszlNj7Tce7T7L7TcefjfIRjxVil9CW17PWtZPFN9jFhbjJh7PhtwBJ0wPwHcPw4wPwH7hRA71TN9Hzlk*WQfBWlf4htRPq1RkWQfVWBZjik9BWQJG7Tce7T7L7TcefjfIRjxVF0fGJgJVWQfuF0feFh7VygEQzeAewGAe6eAewPJN64JwhlRPidfdhtZoigRPWdwPwHcPw4wPwH7hRA71TN94Fh3jyN9jFhbjJh7P7Tce7T7L7TcefjfIRjxVF17bJk9GJgFQFh7B7Tce7T7L7TcefjfIRjxVz09BFf9HzlEjFhbj7Tce7T7L7TcefjfIRjxVzhfsJ0PVF17bJeAewGAkRIAe6eAewdJkJGAewGAB6SAew4JXzlJsFSAew<PuieDPwH2oSgEjFg*p7Tce7T7L7TceJtfe7Tce7TZ37Tce6AE1T<APwH2oSgEjFg*Pw4wPwH37zdRPzIbSKSAewNfcRIAew<Jeih3oygZB7Tc*R0PeFgZjwj6xwSAew1FBhBfVwIAew13BhBfVwIAe6eAew<6BRL<xKSAewGAtRIAe6eAewdRB7Tce7TZ37TJI7TceF0flygZPf0PCFSAewGAB6T<lZBc*wH4kOL<lwTiPw4wPwH74FhFpilfNzQRAygkP7Tce7TZ3wTitwH2eOTADwH2EZGAtRIAe6eAewQjPwHcPwj<PZjcPwH7Hzlk*ihRZzlRP7Tce7TZ37Tce6kZTwAZXzh3bJIAewGAtRIAe6eAewQFX7Tce7TZ37TfI7Tce6gRXiQAPwH30igEdWl9uFeAewNZjFIAewGAe6eAew4N4zl7P7Tc*S0fGWQft7Tce7T7L7Tce6gRXiQAPwH3ZygEd7Tc*AtR47Tce7T7L7Tce6gJPzQZE7Tc*R4cPwHcPw4wPwH73WQPbzIAew<7sigZr7Tce7T7L7Tce6QNky0NkWeAewL4B7Tce7T7L7Tce6QfszIAew<kA7Tce7T7L7Tce6Q94zlEp7Tc*Tf6PwHcPw4wPwH7Izl9rzgNu7Tc*Tlx47Tc*AtREz0APwHcPw4wPwH7IWQ9bF1JbqSAewGAe6eAew4Zbz0PGWQ4PwHcPw4wPwH7LigxpFQ9ezQPbzGAew<FI7Tce7T7L7Tce6lNBJ0fsz0Ne7Tce7T7L7Tce6lfuJ0NkWGAewGAe6eAew4ZPzdRkWd4PwH31ztRoygwPwHcPw4wPwH7LzlxXzQEb7Tc*Tf6PwHcPw4wPwH7Lzt3*Fh7*z0NjFSAew<JXJ0bpieAew<xpFlbj7Tce7T7L7TceRgEdWQNlFh7B7Tc*Tf6PwHcPw4wPwH70igEdAl9uFeAewGAe6eAew4FXWdRP7Tce7T7L7TceRd7bzQCsygDPwH31ztRoygwPwH3cFgNlqSAewGAe6eAew4FeFgEHyIAewNZHWQP*JIAew<kA7Tce7T7L7TceRlNGWQPXz0<PwHcPw4wPwH71ygJp7Tce7T7L7TceRl9kF14PwH35z06PwH3TJ1PsFSAewGAe6eAew4bbFhRjFgEBilbtFgPsFhcPwHcPw4wPwH7cih7eygEdJ09u7Tce7T7L7TceSgk*igZj7Tce7T7L7TceSgEQzt7Cig*PwH3SzlkbzGAewGAe6eAew4CXqdfriSAew<JXJ0bpieAewN3eZ4DPwHcPw4wPwH7wJgZpF0<PwH3IWQPdy16PwHcPw4wPwH7wJgZpF0<PwH30ihaPwHcPw4wPwH7ZigJuFhRX7Tce7T7L7TceTgNsFtfu7Tc*Rl9jy0PH7Tce7T7L7TceTgNjJh7b7Tc*Tf6PwH3Tit7pW16PwH3Lih3pJ0NsWeAewGAe6eAew4kpzQJwyfACRhbj6GAewGAe6eAew4kT7Tc*AQfQFh7PzQZP7Tc*AlNuWeAewNZPWQPQ7Tce7T7L7TceTQPbFlNeiSAewNZXz0P47Tce7T7L7TceA0NsigZP7Tc*AlZeyh3j7Tc*Tf6PwHcPw4wPwH76ih3EWdfB7Tce7T7L7TceA0feW0fjJg<PwHcPw4wPwH76z0NEiQPszIAewGAe6eAewP7XilCtFgxs7Tce7T7L7TceAlfdzlAPwH36WQPuJIAewGAe6eAewPZoztJHih747Tc*Rl9jy0PH7Tce7T7L7TceAlPCS0fp7Tce7T7L7TceAlEbWIAew<PA6eAewGAe6eAewPFsigRpzgPe7Tc*AlZeyh3j7Tce7T7L7TceflP4FSAew<xbJ0Pu7Tce7Tf<7T7L7TcezGAewGAB6SAt6GAewdFPzQRXWPZkiGAewGAB6SAewGAewGAe6eAewd3ezlRkitRTJgcPwHcPwj<PwHcewL2BwL<*ZeAewGAe6eAewdFPzQRXWGAewGAB6SAew4JXzlJsFSAew<PuieDPwHcPw4wPwH7CihbAztfHyN3XygEjWeAewGAB6T2Pw4wPwH7*F0FgygftFh7NzQNGz0f47Tce7TZ3J17kFSAe6eAewQbbWQRtih7P6l9uitfeWQfuit4PwHcPwj<xZGAe6eAewQZXzlCpFAfuig7sFg6PwHcPwjNjWdfP7T7L7Tceih3*6l94FAEbzgAPwHcPwj<PwH7Zztppz0xb7Tce7T7L7Tceih3*TQNCFSAewGAB6SAew4EPJ1ZHih3P7Tce7T7L7Tceih3*fQfeWlPXzGAewGAB6SAewHAuwIAewIbhygE4ztJB7Tc*TP6PwH2xwID*7TZI7Tc*flPuZH6PwjcPwH3DZH6p7Tc*6h3*z0fhFg7vyh6Pw4ikwBWuwBiPwH2oSjbATA*Pw4wPwH3sygCP7Tc*RlfHyl8p7Tc*6lbezlkP7T70wT2DvH2uwID*7Tc*AlNQih7p7T70ZTwtvHwl7Tce7T7L7TceW0xbJ0FXWQjPwHcPwj<PwH7hygDBwGAewGAe6eAewd3ezlRkit6PwHcPwj<PwH71FgZrzeAewGAe6eAewdfBFh73FlfuJIAewGAB6SAew4kXqQPsz0<Pw4ikvH2PwH2oflPuF09tWeAew<EA7Tc*wT2uwIAB6GAewNJpzHij7TZI7Tc*qLijKSAew<N*W0xPflfGSlPj7T70ZTwtvHwl7Tc*K<Ccf<kw7T7L7Tc*z0PrFSAew<JPilCXKSAew<ZoWQ9CFSAeRH<*OID*vH2uwIAewNZbFQNeySAeRHABZeDBZGAewGAe6eAewQxbzQJkigJP7Tce7TZ37TceqQaC6jDPwHcPw4wPwH7Xz4xpzQAPwHcPwjNjWdfP7T7L7TceJlfGF17pJQfe7Tce7TZ3FQNsWlAPw4wPwH7UihFbRgEbiQxPFIAewGAB6gFbz1ZP7T7L7TceF0flygZPTgfCzt7E7Tce7TZ3OIAe6eAewQfuJgkPWQNjyg9uTt74FhcPwHcPwj<PZAcPwH7lFgE4zt7TJgcPwHcPw4wPwH7*WQ94JgZjAtfG7Tce7T7L7TceJQfuF09e7Tce7T7L7TcezgNDf09kilb6zlPuJ1wPwHcPw4wPwH7BilbPF1fsygEd7Tce7T7L7TceJhZPW4NHJ0PlihRpzlDPwHcPw4wPwH74zjEXJNReigZr7Tce7T7L7TceFlfXz09HihRpzlDPwHcPw4wPwH7HzlEuFgZjyg9u7Tce7T7L7TceW0xkFlPuWeAewGAe6eAewQkpzgfAqh3PWeAewGAe6eAewd34FPFpFhJPW4fuig7sFg6PwHcPw4wPwH7tFg7ryhRAFgk*zt7bWdPTJ09eigJP7Tce7T7L7TceJlfGylPjA0feWlPBJ0fuJNZjzt7bFlAPwHcPw4wPwH7oih74JlNeFAZXzQZkWd7PzQZE7Tce7T7L7Tceil9XylPPRgEbiQxPFIAewGAe6eAewQN*W<ZXF0fOigkP7Tce7T7L7Tceih3*TQNCFSAewGAe6eAewQN*WNFPWdZpzlDPwHcPw4wPwH7*z0NjFQ9ezSAewGAe6eAewd3ezlRkit6PwHcPw4wPwH7kWlfe6gJPzd6PwHcPw4wPwH7sigEdJgNdFSAewGAe6eAewQxbzQJkigJPWeAewGAe6eAewQ9uT0PuFSAewGAe6eAewdJPiQReyhFPWGAewGAe6eAewQJPJ<Jbzgf*igRB7Tce7T7L7TceyQNliAfuig7sFg6PwHcPw4wPwH7BFgE46Qfbil9u7Tce7T7L7TceJQPGWQNjFSAewGAe6eAewQ7sJgfjzl9jyIAewGAe6eAewQZsyh3GzlNeFIAewGAe6eAewQZeFgRPzdRpigxB7Tce7T7L7TceylfEiQ9bWQ6PwHcPw4wPwH7CigEbFlf47Tce7T7L7Tcezgf4ygN<FhFpilfB7Tce7T7L7TceWtRXWQNdFSAewGAe6eAewdZPWdFpilfhzt7rFhcPwHcPw4wPwH7lyh7jJgNsSlfEiQ9bWQ6PwHcPw4wPwH7tigCPT09HyeAewGAe6eAewQRPJQPHFAkPzg9eqSAewGAe6eAewQPuyeAewGAe6eAewQbpFIAewGAe6eAewQxXilCB7Tce7T7L7Tcezgf4ygNLih3biQPsyhRpFhwPwHcPw4wPwH7CFgRpifZPWtZpzlDPwHcPw4wPwH7*Fh7CyhZByg9uWeAewGAe6eAewd3eFhZPzdRbJ0PXzGAewGAe6eAewdZPWQPbzIAewGAe6eAewdfBiGAewGAe6eAewdJpzQRXJjZXzdRezlxBTtFPWQxbqSAewGAe6eAewdbe7Tce7T7L7TceJhZPW4NdFgEjR0NjiSAewGAe6eAewQZbzPZoih7P7Tce7T7L7TceWlbbWQAPwHcPw4wPwH7Hz0fbW4N*W<7bF0JP7Tce7T7L7TceFlfj6QNjJ0feqSAewGAe6eAewQJPJNfBFh7ZFgRpiSAewGAe6eAewd7PWhfPWtRZSAR76gZHFhZB7Tce7T7L7TceWQfxJgfBJ<kPF0PbSlfEAtPBJ0fC6gZHFhZB7Tce7T7L7TceWlfj6h3*6QN4FlAPwHcPw4wPwH7tFg7ryhR1FhRfWlfeTgf4yg<PwHcPw4wPwH7dFhR7zdZjigxsFgRSFgxbJ0f46h3*WeAewGAe6eAewd7PFlPBJ0feA17XJ09HzlxcigE4z0fe7Tce7T7L7TceJgEeFgJpWtRPWP3eztRXil9sS0NuF0xPWGAewGAkRIAtRIAe6eAewd2PwHcPwj<PZAcPZjcPwH7uigkP7Tce7TZ37TceA<R07Tc*fQPPJlfe7Tce7T7L7TceFQPsFgEbzgAPwHcPwj<PwH7pzdRPWQEbzIk*F0iCJQPPJlfe7Tce7T7L7TceF0fBit7pW1RpzlDPwHcPwj<PwH76zt7jig7sFSAew<RXitfCFgEj7Tc*RQ9ezgNj7Tce7T7L7TcezgPCFfREW0fB7Tce7TZ37TfI7TJI7TceF0fBit7pW1RpzlDPwHcPwj<PwH76zt7jig7sFSAew<RXitfCFgEj7Tc*RQ9ezgNj7Tce7T7L7TceWtfQFQPDFhwPwHcPwj<PwH7*F0iPwHcPw4wPwH7jqh3P7Tce7TZ37Tceih3*z0PHihRpzlDPw4F*F0iPwHcPZj6Pw4wPZjcPwH74FhZHWQP*J0PXzGAewGAB6SAewP3XWdRbiQxP7Tc*R09HJgkPzd6PwH30zt7Cih6PwHcPw4wPwH7BJgFQyhbPWeAewGAB6SAewd34FGAewGAe6eAewdREW0APwHcPwj<PwH7jFhbj7T70W0RQ7Tce7TJ<7Tf<7TJ<7T7L7TJI7TcezQNCFSAewGAB6SAew4ZoWQ9CFSAewN3<RGAewNFpFhJPWGAewGAe6eAewQFpz0fuigkP7Tce7TZ37TceygEjFh7uig*CW0RQvhFpFhJPWGAewGAe6eAewQRPWlZeyh3jyg9u7Tce7TZ37TceA09eJ0NGz0APwH3<zlZkzgfuJIAew<FXWQkbJIAewGAe6eAewQkpzgfAqh3PWeAewGAB6SAk6GAt6GAewQRPWlZeyh3jyg9u7Tce7TZ37TceA09eJ0NGz0APwH3<zlZkzgfuJIAew<FXWQkbJIAewGAe6eAewdZkFQFpq0fB7Tce7TZ37TceW0RQ7Tce7T7L7TceJ1P*FSAewGAB6SAewQN*W0xpilNjyg9u7T70W0RQ7Tce7TJ<7T7L7TJI7TceF0fBit7pW1RpzlDPwHcPwj<PwH76zt7jig7sFSAew<RXitfCFgEj7Tc*RQ9ezgNj7Tce7T7L7TceWtfQFQPDFhwPwHcPwj<PwH7*F0iPwHcPw4wPwH7jqh3P7Tce7TZ37TceJ0fDJIAeRd34FGAewGAtRIAkRIAtRIAe6eAt6GAewQEbzgAPwHcPwj<PwH7Ly17XzgPkzSAewN3<RGAewNFpFhJPWGAewGAe6eAewQFpz0fuigkP7Tce7TZ37TceygEjFh7uig*CW0RQvhFpFhJPWGAewGAe6eAewQRPWlZeyh3jyg9u7Tce7TZ37TceA09eJ0NGz0APwH3<zlZkzgfuJIAew<FXWQkbJIAewGAe6eAewQkpzgfAqh3PWeAewGAB6SAk6GAt6GAewQRPWlZeyh3jyg9u7Tce7TZ37TceA09eJ0NGz0APwH3<zlZkzgfuJIAew<FXWQkbJIAewGAe6eAewdZkFQFpq0fB7Tce7TZ37TceW0RQ7Tce7T7L7TceJ1P*FSAewGAB6SAewQN*W0xpilNjyg9u7T70W0RQ7Tce7TJ<7T7L7TJI7TceF0fBit7pW1RpzlDPwHcPwj<PwH76zt7jig7sFSAew<RXitfCFgEj7Tc*RQ9ezgNj7Tce7T7L7TceWtfQFQPDFhwPwHcPwj<PwH7*F0iPwHcPw4wPwH7jqh3P7Tce7TZ37TceJ0fDJIAeRd34FGAewGAtRIAkRIAtRIAe6eAt6GAewQEbzgAPwHcPwj<PwH7ZygZeztZXFd6PwH3NF0JP7Tc*A<R07Tc*fQPPJlfe7Tce7T7L7TceFQPsFgEbzgAPwHcPwj<PwH7pzdRPWQEbzIk*F0iCJQPPJlfe7Tce7T7L7TceF0fBit7pW1RpzlDPwHcPwj<PwH76zt7jig7sFSAew<RXitfCFgEj7Tc*RQ9ezgNj7Tce7T7L7TcezgPCFfREW0fB7Tce7TZ37TfI7TJI7TceF0fBit7pW1RpzlDPwHcPwj<PwH76zt7jig7sFSAew<RXitfCFgEj7Tc*RQ9ezgNj7Tce7T7L7TceWtfQFQPDFhwPwHcPwj<PwH7*F0iPwHcPw4wPwH7jqh3P7Tce7TZ37Tceih3*z0PHihRpzlDPw4F*F0iPwHcPZj6Pw4wPZjcPwH74FhZHWQP*J0PXzGAewGAB6SAewP3XWdRbiQxP7Tc*R09HJgkPzd6PwH30zt7Cih6PwHcPw4wPwH7BJgFQyhbPWeAewGAB6SAewd34FGAewGAe6eAewdREW0APwHcPwj<PwH7jFhbj7T70W0RQ7Tce7TJ<7Tf<7TJ<7T7L7TJI7TcezQNCFSAewGAB6SAewPJPi4CpJIAew07kygxjvgPu7Tc*A<R07Tce7T7L7TceFQPsFgEbzgAPwHcPwj<PwH7pzdRPWQEbzIk*F0iCJQPPJlfe7Tce7T7L7TceF0fBit7pW1RpzlDPwHcPwj<PwH76zt7jig7sFSAew<RXitfCFgEj7Tc*RQ9ezgNj7Tce7T7L7TcezgPCFfREW0fB7Tce7TZ37TfI7TJI7TceF0fBit7pW1RpzlDPwHcPwj<PwH76zt7jig7sFSAew<RXitfCFgEj7Tc*RQ9ezgNj7Tce7T7L7TceWtfQFQPDFhwPwHcPwj<PwH7*F0iPwHcPw4wPwH7jqh3P7Tce7TZ37Tceih3*z0PHihRpzlDPw4F*F0iPwHcPZj6Pw4wPZjcPwH74FhZHWQP*J0PXzGAewGAB6SAewP3XWdRbiQxP7Tc*R09HJgkPzd6PwH30zt7Cih6PwHcPw4wPwH7BJgFQyhbPWeAewGAB6SAewd34FGAewGAe6eAewdREW0APwHcPwj<PwH7jFhbj7T70W0RQ7Tce7TJ<7Tf<7TJ<7Tf<7T7L7TceJeAewGAB6SAt6GAewQRPJQPHFf3pq0fsAQNjyg8PwHcPwj<xvHck7T7L7TceWlZeFgfuf09*7Tce7TZ3wIAe6eAewdZHWQfPz4xPFd6PwHcPwj<*7TJ<7T7L7TceWeAewGAB6SAt6GAewQNligPsS0fpFlbj7Tce7TZ3OLcj7T7L7TceihFbygxhygRjyIAewGAB6T<kwBiPw4wPwH7HzlxXW4RPW1Ro7Tce7TZ3wH6Pw4wPwH7oFgPdy16PwHcPwj<DZH6Pw4wPwH7tygRjyIAewGAB6T<kwBiPw4wPwH7*yhbPz<RPW1Ro7Tce7TZ3wH6PZj6Pw4wPwH7BieAewGAB6SAt6GAew4NHJ0PlFA7XWQRPWGAewGAB6SAewd7diGa*7T7L7Tc*wIAe6eAewL2p7Tce7T7L7Tce6gZjyhFP6lN*J0PXzGAewGAB6SAewd7diGa*7T7L7Tc*wIAe6eAewL2p7Tce7T7L7Tce6h3*fl9eytZ*igZP7Tce7TZ37TceWQJGKLckZSAe6eAewLckZSAe6eAewLckZS4PwHcPw4wPwH7IigZrFt7XJgE47Tce7TZ37TceWQJGKLckZSAe6eAewLckZSAe6eAewLckZS4PwHcPw4wPwH7IJhRjzlE0igZP7Tce7TZ37TceWQJGKLcjwIAe6eAewLcjwIAe6eAewLcjwI4PwHcPw4wPwH7IJhRjzlEcygJoz0Pdy16PwHcPwj<PwH7eFlcowH6*7T7L7Tc*wH6*7T7L7Tc*wH6*KSAewGAe6eAew47kJ1RXzPZoigRXJeAewGAB6SAewd7diGaeZL2Pw4wPwH2eZL2Pw4wPwH2eZL2p7Tce7T7L7Tce6dfjJ09uf0fDJIAewGAB6SAewd7diGa*7T7L7Tc*wIAe6eAewL2p7Tce7T7L7Tce6lN*J0PXzPRPq16PwHcPwj<PwH7eFlcowIAe6eAewL2Pw4wPwH2*KSAewGAe6eAew4JeihPAFhbj7Tce7TZ37TceWQJGKL<*OSAe6eAewL<*OSAe6eAewL<*OS4PwHcPw4wPwH7cygJoz0Pdy16PwHcPwj<PwH7eFlcowIAe6eAewL<ewIAe6eAewLcxZS4PwHcPw4wPwH7cygJoz0Pdy1RAFhbj7Tce7TZ37TceWQJGKLckZSAe6eAewLckZSAe6eAewLckZS4PwHcPw4wPwH77zQNHJ0PlFA7XWQRPWGAewGAB6SAewd7diGa*7T7L7Tc*wIAe6eAewL2p7Tce7T7L7TceSgEbitRpJQfLih3jyg9u7Tce7TZ37TceWQJGKLckZSAe6eAewLckZSAe6eAewLckZS4PwHcPw4wPwH77zQNHJ0PlFAZbW1RpzlEAFhbj7Tce7TZ37TceWQJGKL<eOIAe6eAewL<eOIAe6eAewL<eOI4PwHcPw4wPwH77zQFX6QNHylJeztfuFIAewGAB6SAewd7diGaeZTAPw4wPwH2eZTAPw4wPwH2eZTAp7Tce7T7L7TceSgEQzkRPq16PwHcPwj<PwH7eFlcowIAe6eAewL2Pw4wPwH2*KSAewGAe6eAew4kPzdAPwHcPwj<PwH7eFlcowHAk7T7L7Tc*wHAk7T7L7Tc*wHAkKSAewGAe6eAew4kPzdfAFhbj7Tce7TZ37TceWQJGKL2Pw4wPwH2*7T7L7Tc*wI4PwHcPw4wPwH7Tit7Xz0xGihcPwHcPwj<PwH7eFlcowHAk7T7L7Tc*wHAk7T7L7Tc*wHAkKSAewGAe6eAewPRoWQfPR<RbWQCTy0N4ztWPwHcPwj<PwH7eFlcowIAe6eAewL2Pw4wPwH2*KSAewGAe6eAewPRoWQfPR<FbilAPwHcPwj<PwH7eFlcowH6*7T7L7Tc*wH6*7T7L7Tc*wH6*KSAewGAe6eAewPRoWQfPR<bpFlbsygJoJIAewGAB6SAewd7diGa*7T7L7Tc*wIAe6eAewL2p7Tce7T7L7Tcef0beFgf<T0Pdy1RTy0N4ztWPwHcPwj<PwH7eFlcowIAe6eAewL2Pw4wPwH2*KSAewGAe6eAewPRoWQfPRNZoigRXJeAewGAB6SAewd7diGa*7T7L7Tc*wIAe6eAewL2p7Tce7T7L7TceflPuF09t7Tce7TZ37TceWQJGKLckZSAe6eAewLckZSAe6eAewLckZS4PwHcPw4wPwH7hygE4ztJ0WQNCFSAewGAB6SAewd7diGa*7T7L7Tc*wIAe6eAewL2p7Tce7T7L7TceflPuF09tf0fDJIAewGAB6SAewd7diGa*7T7L7Tc*wIAe6eAewL2p7Tce7TJ<7T7L7TceJ1oPwHcPwj<CZLa*7T7L7Tcez0Ps7Tce7TZ37Tce7Tce7T7L7TceJlPs7Tce7TZ37Tce7Tce7T7L7TceWtwPwHcPwj<PZjcPwH7Hzl9rygAPwHcPwjNjWdfP7T7L7Tcez09HigxTJ09eigJP7Tce7TZ3J17kFSAe6eAewdZPWtZpzlETJ09eigJP7Tce7TZ3J17kFSAe6eAewQJszl7bzNZjzt7bFlAPwHcPwjNQigxBFSAe6eAewQPuF0fDFgR<6GAewGAB6hReJgAPZj6PZj6/'
    let formObjN = [];
    // formObjN.g = tdencrypt(n);
    formObjN.g = '7TJI7TceJhZPW4NdFgEj7Tce7TZ37TceiTaxO0NGwBAEOL2jZT<tFHckZLPPOTRHOLb4wLZHw0cPwHcPw4wPwH7XWQPdygDPwHcPwj<PwH7*ieAewGAe6eAewQxbzQJkigJP7Tce7TZ37TceqQaC6jDPwHcPw4wPwH7XWeAewGAB6SAewdJpzQRXJtwPwHcPw4wPwH7XWkFPWdZpzlDPwHcPwj<PwH7OfIAewGAe6eAewQ7eztJBFhcPwHcPwj<PwH7bW13sFhJPiQCpJN9Hy17XzgAPwHcPw4wPwH7GWQ9tWlfefQfeWlPXzGAewGAB6SAewHABZeDBZGAewGAe6eAewQZXz09eR0f*J0aPwHcPwj<eZIAe6eAewdZHWQfPzP7PWl9sJhRpzlDPwHcPwj<PwHcDZHRDwTABZGAewGAe6eAewdRpzgfmzlEPTlFQWlfj7Tce7TZ3vTaPw4wPwH7BFhZByg9uAtRXWQNdFSAewGAB6hReJgAPw4wPwH7szlZbzNZjzt7bFlAPwHcPwjNjWdfP7T7L7TceygE4FhbPF<RG7Tce7TZ3J17kFSAe6eAewQN4F<7Py0Nlyg9e7Tce7TZ3FQNsWlAPw4wPwH7XW0fuR0Njig7bWlAPwHcPwjNjWdfP7T7L7Tceit3k7Tce7TZ37TceT4<PwHcPw4wPwH7*z0NjFQ9ezSAewGAB6SAewPJpzHwe7Tce7T7L7TceilZu7Tce7TZ3wTiPw4wPwH7bWtcPwHcPwj<PwHcjOL2*wIAewGAe6eAewdReigZr7Tce7TZ37TceT4<PwHcPw4wPwH7*z1fdygEB7Tce7TZ37TcewBalwH2tZBAeilc*FH7bFQ6*wBbGZTRHO0ieiHNGwH4PwHcPw4wPwH7HigElihwPwHcPwj<PwHctOTiDwHAlOgRGw0AxO0iBwTWDwB2*wH6BilR4ilN4ZSAewGAe6eAewdJPiQJs7Tce7TZ37TceOT4DwQ7HZB2kwg6DwgZHiTwDF06EFQ6jFg7PFTRGiH2PwHcPZj6/';

    formObjN.d = _JdJrRiskClientCollectData;
    console.log('consolez',z)
    console.log('formObjN',formObjN)
    debugger

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
            // document.body &&
            // !options.excludeAddBehavior &&
            // document.body.addBehavior
            //   ? (c.push("addBehaviorKey"), (n.addBehavior = !0))
            //   : (n.addBehavior = !1);
            n.addBehavior = !1
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
                // var c = document.createElement("canvas");
                // return !(!c.getContext || !c.getContext("2d"));
                return true;
            }
            function getCanvasFp() {
                // var c = [],
                //   a = document.createElement("canvas");
                // a.width = 2e3;
                // a.height = 200;
                // a.style.display = "inline";
                // var b = a.getContext("2d");
                // b.rect(0, 0, 10, 10);
                // b.rect(2, 2, 6, 6);
                // c.push(
                //   "cw:" + (!1 === b.isPointInPath(5, 5, "evenodd") ? "yes" : "no")
                // );
                // b.textBaseline = "alphabetic";
                // b.fillStyle = "#f60";
                // b.fillRect(125, 1, 62, 20);
                // b.fillStyle = "#069";
                // b.font = "11pt no-real-font-123";
                // b.fillText(
                //   "Cwwm aa fjorddbank glbyphs veext qtuiz, \ud83d\ude03",
                //   2,
                //   15
                // );
                // b.fillStyle = "rgba(102, 204, 0, 0.2)";
                // b.font = "18pt Arial";
                // b.fillText(
                //   "Cwwm aa fjorddbank glbyphs veext qtuiz, \ud83d\ude03",
                //   4,
                //   45
                // );
                // b.globalCompositeOperation = "multiply";
                // b.fillStyle = "rgb(255,0,255)";
                // b.beginPath();
                // b.arc(50, 50, 50, 0, 2 * Math.PI, !0);
                // b.closePath();
                // b.fill();
                // b.fillStyle = "rgb(0,255,255)";
                // b.beginPath();
                // b.arc(100, 50, 50, 0, 2 * Math.PI, !0);
                // b.closePath();
                // b.fill();
                // b.fillStyle = "rgb(255,255,0)";
                // b.beginPath();
                // b.arc(75, 100, 50, 0, 2 * Math.PI, !0);
                // b.closePath();
                // b.fill();
                // b.fillStyle = "rgb(255,0,255)";
                // b.arc(75, 75, 75, 0, 2 * Math.PI, !0);
                // b.arc(75, 75, 25, 0, 2 * Math.PI, !0);
                // b.fill("evenodd");
                // c.push("cfp:" + a.toDataURL());
                // return c.join("~");
                let result = 'cw:yes~cfp:data:image/png;base64,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a69enXf+clxOfWxCJjxPq1/dROMvXZ3r3rQh91x4ULbMan60/e4k9yRZUKVq/u1FgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAkMsMGID9B1d69Tj+wL14/KS3x2fsU2QfuOTedfi/XLsvw4Y1D3cvdff84Ppa3PrmS/Oxjetz+Ovmp/krr7AfN2g3kszAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEBgUgZ4J0HemVafeJ8kxOXDRSamWnpD1f5mWFz28NYcs+1cO/0udI9bvkamPjc2k5Jl381rR91760o15eNzTeeTgKn8+Yq/8Y8qojDt4STL1zvx1RvMs83urVJsGZUuaECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgEDrAj0doLeu6wYECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgUIyAAL2YVRmUAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBNoUEKC3qas3AQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBQjIEAvZlUGJUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIE2BQToberqTYAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQLFCAjQi1mVQQkQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgTQEBepu6ehMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAMQIC9GJWZVACBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQaFNAgN6mrt4ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgUIyAAL2YVRmUAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBNoUEKC3qas3AQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBQjIEAvZlUGJUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIE2BQToberqTYAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQLFCAjQi1mVQQkQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgTQEBepu6ehMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAMQIC9GJWZVACBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQaFNAgN6mrt4ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgUIyAAL2YVRmUAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBNoUEKC3qas3AQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBQjIEAvZlUGJUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIE2BQToberqTYAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQLFCAjQi1mVQQkQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgTQEBepu6ehMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAMQIC9GJWZVACBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQaFNAgN6mrt4ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgUIyAAL2YVRmUAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBNoUEKC3qas3AQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBQjIEAvZlUGJUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIE2BQToberqTYAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQLFCAjQi1mVQQkQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgTQEBepu6ehMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAMQIC9GJWZVACBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQaFNAgN6mrt4ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgUIyAAL2YVRmUAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBNoUEKC3qas3AQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBQjIEAvZlUGJUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIE2BQToberqTYAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQLFCAjQi1mVQQkQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgTQEBepu6ehMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAMQIC9GJWZVACBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQaFNAgN6mrt4ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgUIyAAL2YVRmUAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBNoUEKC3qas3AQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBQjIEAvZlUGJUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIE2BQToberqTYAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQLFCAjQi1mVQQkQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgTQEBepu6ehMgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAMQIC9GJWZVACBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQaFNAgN6mrt4ECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgUIyAAL2YVRmUAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBNoU+A9b5lDlsgD3nwAAAABJRU5ErkJggg=='
                return result

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
        //完善JDDSecCryptoJS
        JDDSecCryptoJS.lib.Cipher ||
        (function (m) {
          var r = JDDSecCryptoJS,
            u = r.lib,
            v = u.Base,
            w = u.WordArray,
            z = u.BufferedBlockAlgorithm,
            n = (u.Cipher = z.extend({
              cfg: v.extend(),
              createEncryptor: function (f, k) {
                return this.create(this._ENC_XFORM_MODE, f, k);
              },
              init: function (f, k, p) {
                this.cfg = this.cfg.extend(p);
                this._xformMode = f;
                this._key = k;
                this.reset();
              },
              reset: function () {
                z.reset.call(this);
                this._doReset();
              },
              process: function (f) {
                this._append(f);
                return this._process();
              },
              finalize: function (f) {
                f && this._append(f);
                return this._doFinalize();
              },
              keySize: 4,
              ivSize: 4,
              _ENC_XFORM_MODE: 1,
              _DEC_XFORM_MODE: 2,
              _createHelper: (function () {
                return function (f) {
                  return {
                    encrypt: function (k, p, c) {
                      var a = "string" != typeof p ? y : void 0;
                      return a.encrypt(f, k, p, c);
                    },
                  };
                };
              })(),
            })),
            g = (r.mode = {}),
            x = (u.BlockCipherMode = v.extend({
              createEncryptor: function (f, k) {
                return this.Encryptor.create(f, k);
              },
              init: function (f, k) {
                this._cipher = f;
                this._iv = k;
              },
            }));
          g = g.CBC = (function () {
            var f = x.extend();
            f.Encryptor = f.extend({
              processBlock: function (k, p) {
                var c = this._cipher,
                  a = c.blockSize,
                  b = this._iv;
                b ? (this._iv = m) : (b = this._prevBlock);
                for (var d = 0; d < a; d++) k[p + d] ^= b[d];
                c.encryptBlock(k, p);
                this._prevBlock = k.slice(p, p + a);
              },
            });
            return f;
          })();
          var t = ((r.pad = {}).Pkcs7 = {
            pad: function (f, k) {
              k *= 4;
              k -= f.sigBytes % k;
              for (
                var p = (k << 24) | (k << 16) | (k << 8) | k, c = [], a = 0;
                a < k;
                a += 4
              )
                c.push(p);
              k = w.create(c, k);
              f.concat(k);
            },
            unpad: function (f) {
              f.sigBytes -= f.words[(f.sigBytes - 1) >>> 2] & 255;
            },
          });
          u.BlockCipher = n.extend({
            cfg: n.cfg.extend({ mode: g, padding: t }),
            reset: function () {
              n.reset.call(this);
              var f = this.cfg,
                k = f.iv;
              f = f.mode;
              if (this._xformMode == this._ENC_XFORM_MODE)
                var p = f.createEncryptor;
              else (p = f.createDecryptor), (this._minBufferSize = 1);
              this._mode = p.call(f, this, k && k.words);
            },
            _doProcessBlock: function (f, k) {
              this._mode.processBlock(f, k);
            },
            _doFinalize: function () {
              var f = this.cfg.padding;
              if (this._xformMode == this._ENC_XFORM_MODE) {
                f.pad(this._data, this.blockSize);
                var k = this._process(!0);
              } else (k = this._process(!0)), f.unpad(k);
              return k;
            },
            blockSize: 4,
          });
          var l = (u.CipherParams = v.extend({
            init: function (f) {
              this.mixIn(f);
            },
            toString: function (f) {
              return (f || this.formatter).stringify(this);
            },
          }));
          r.format = {};
          var y = (u.SerializableCipher = v.extend({
            cfg: v.extend({}),
            encrypt: function (f, k, p, c) {
              c = this.cfg.extend(c);
              var a = f.createEncryptor(p, c);
              k = a.finalize(k);
              a = a.cfg;
              return l.create({
                ciphertext: k,
                key: p,
                iv: a.iv,
                algorithm: f,
                mode: a.mode,
                padding: a.padding,
                blockSize: f.blockSize,
                formatter: c.format,
              });
            },
            _parse: function (f, k) {
              return "string" == typeof f ? k.parse(f, this) : f;
            },
          }));
        })();
        //完善2
        (function () {
          var m = JDDSecCryptoJS,
            r = m.lib.BlockCipher,
            u = m.algo,
            v = [],
            w = [],
            z = [],
            n = [],
            g = [],
            x = [],
            t = [],
            l = [],
            y = [];
          (function () {
            for (var k = [], p = 0; 256 > p; p++)
              k[p] = 128 > p ? p << 1 : (p << 1) ^ 283;
            var c = 0,
              a = 0;
            for (p = 0; 256 > p; p++) {
              var b = a ^ (a << 1) ^ (a << 2) ^ (a << 3) ^ (a << 4);
              b = (b >>> 8) ^ (b & 255) ^ 99;
              v[c] = b;
              var d = k[c],
                e = k[d],
                h = k[e],
                q = (257 * k[b]) ^ (16843008 * b);
              w[c] = (q << 24) | (q >>> 8);
              z[c] = (q << 16) | (q >>> 16);
              n[c] = (q << 8) | (q >>> 24);
              g[c] = q;
              q = (16843009 * h) ^ (65537 * e) ^ (257 * d) ^ (16843008 * c);
              x[b] = (q << 24) | (q >>> 8);
              t[b] = (q << 16) | (q >>> 16);
              l[b] = (q << 8) | (q >>> 24);
              y[b] = q;
              c ? ((c = d ^ k[k[k[h ^ d]]]), (a ^= k[k[a]])) : (c = a = 1);
            }
          })();
          var f = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
          u = u.AES = r.extend({
            _doReset: function () {
              var k = this._key,
                p = k.words,
                c = k.sigBytes / 4;
              k = 4 * ((this._nRounds = c + 6) + 1);
              for (var a = (this._keySchedule = []), b = 0; b < k; b++)
                if (b < c) a[b] = p[b];
                else {
                  var d = a[b - 1];
                  b % c
                    ? 6 < c &&
                      4 == b % c &&
                      (d =
                        (v[d >>> 24] << 24) |
                        (v[(d >>> 16) & 255] << 16) |
                        (v[(d >>> 8) & 255] << 8) |
                        v[d & 255])
                    : ((d = (d << 8) | (d >>> 24)),
                      (d =
                        (v[d >>> 24] << 24) |
                        (v[(d >>> 16) & 255] << 16) |
                        (v[(d >>> 8) & 255] << 8) |
                        v[d & 255]),
                      (d ^= f[(b / c) | 0] << 24));
                  a[b] = a[b - c] ^ d;
                }
              p = this._invKeySchedule = [];
              for (c = 0; c < k; c++)
                (b = k - c),
                  (d = c % 4 ? a[b] : a[b - 4]),
                  (p[c] =
                    4 > c || 4 >= b
                      ? d
                      : x[v[d >>> 24]] ^
                        t[v[(d >>> 16) & 255]] ^
                        l[v[(d >>> 8) & 255]] ^
                        y[v[d & 255]]);
            },
            encryptBlock: function (k, p) {
              this._doCryptBlock(k, p, this._keySchedule, w, z, n, g, v);
            },
            _doCryptBlock: function (k, p, c, a, b, d, e, h) {
              for (
                var q = this._nRounds,
                  B = k[p] ^ c[0],
                  C = k[p + 1] ^ c[1],
                  A = k[p + 2] ^ c[2],
                  D = k[p + 3] ^ c[3],
                  E = 4,
                  I = 1;
                I < q;
                I++
              ) {
                var F =
                    a[B >>> 24] ^
                    b[(C >>> 16) & 255] ^
                    d[(A >>> 8) & 255] ^
                    e[D & 255] ^
                    c[E++],
                  G =
                    a[C >>> 24] ^
                    b[(A >>> 16) & 255] ^
                    d[(D >>> 8) & 255] ^
                    e[B & 255] ^
                    c[E++],
                  H =
                    a[A >>> 24] ^
                    b[(D >>> 16) & 255] ^
                    d[(B >>> 8) & 255] ^
                    e[C & 255] ^
                    c[E++];
                D =
                  a[D >>> 24] ^
                  b[(B >>> 16) & 255] ^
                  d[(C >>> 8) & 255] ^
                  e[A & 255] ^
                  c[E++];
                B = F;
                C = G;
                A = H;
              }
              F =
                ((h[B >>> 24] << 24) |
                  (h[(C >>> 16) & 255] << 16) |
                  (h[(A >>> 8) & 255] << 8) |
                  h[D & 255]) ^
                c[E++];
              G =
                ((h[C >>> 24] << 24) |
                  (h[(A >>> 16) & 255] << 16) |
                  (h[(D >>> 8) & 255] << 8) |
                  h[B & 255]) ^
                c[E++];
              H =
                ((h[A >>> 24] << 24) |
                  (h[(D >>> 16) & 255] << 16) |
                  (h[(B >>> 8) & 255] << 8) |
                  h[C & 255]) ^
                c[E++];
              D =
                ((h[D >>> 24] << 24) |
                  (h[(B >>> 16) & 255] << 16) |
                  (h[(C >>> 8) & 255] << 8) |
                  h[A & 255]) ^
                c[E++];
              k[p] = F;
              k[p + 1] = G;
              k[p + 2] = H;
              k[p + 3] = D;
            },
            keySize: 8,
          });
          m.AES = r._createHelper(u);
        })();
        //完善3
        (function () {
          var m = JDDSecCryptoJS,
            r = m.lib,
            u = r.WordArray,
            v = r.Hasher,
            w = [];
          r = m.algo.SHA1 = v.extend({
            _doReset: function () {
              this._hash = new u.init([
                1732584193, 4023233417, 2562383102, 271733878, 3285377520,
              ]);
            },
            _doProcessBlock: function (z, n) {
              for (
                var g = this._hash.words,
                  x = g[0],
                  t = g[1],
                  l = g[2],
                  y = g[3],
                  f = g[4],
                  k = 0;
                80 > k;
                k++
              ) {
                if (16 > k) w[k] = z[n + k] | 0;
                else {
                  var p = w[k - 3] ^ w[k - 8] ^ w[k - 14] ^ w[k - 16];
                  w[k] = (p << 1) | (p >>> 31);
                }
                p = ((x << 5) | (x >>> 27)) + f + w[k];
                p =
                  20 > k
                    ? p + (((t & l) | (~t & y)) + 1518500249)
                    : 40 > k
                    ? p + ((t ^ l ^ y) + 1859775393)
                    : 60 > k
                    ? p + (((t & l) | (t & y) | (l & y)) - 1894007588)
                    : p + ((t ^ l ^ y) - 899497514);
                f = y;
                y = l;
                l = (t << 30) | (t >>> 2);
                t = x;
                x = p;
              }
              g[0] = (g[0] + x) | 0;
              g[1] = (g[1] + t) | 0;
              g[2] = (g[2] + l) | 0;
              g[3] = (g[3] + y) | 0;
              g[4] = (g[4] + f) | 0;
            },
            _doFinalize: function () {
              var z = this._data,
                n = z.words,
                g = 8 * this._nDataBytes,
                x = 8 * z.sigBytes;
              n[x >>> 5] |= 128 << (24 - (x % 32));
              n[(((x + 64) >>> 9) << 4) + 14] = Math.floor(g / 4294967296);
              n[(((x + 64) >>> 9) << 4) + 15] = g;
              z.sigBytes = 4 * n.length;
              this._process();
              return this._hash;
            },
            clone: function () {
              var z = v.clone.call(this);
              z._hash = this._hash.clone();
              return z;
            },
          });
          m.SHA1 = v._createHelper(r);
          m.HmacSHA1 = v._createHmacHelper(r);
        })();
        //完善3
        (function () {
          var m = JDDSecCryptoJS,
            r = m.lib.WordArray;
          m.enc.Base32 = {
            stringify: function (u) {
              var v = u.words,
                w = u.sigBytes,
                z = this._map;
              u.clamp();
              u = [];
              for (var n = 0; n < w; n += 5) {
                for (var g = [], x = 0; 5 > x; x++)
                  g[x] = (v[(n + x) >>> 2] >>> (24 - ((n + x) % 4) * 8)) & 255;
                g = [
                  (g[0] >>> 3) & 31,
                  ((g[0] & 7) << 2) | ((g[1] >>> 6) & 3),
                  (g[1] >>> 1) & 31,
                  ((g[1] & 1) << 4) | ((g[2] >>> 4) & 15),
                  ((g[2] & 15) << 1) | ((g[3] >>> 7) & 1),
                  (g[3] >>> 2) & 31,
                  ((g[3] & 3) << 3) | ((g[4] >>> 5) & 7),
                  g[4] & 31,
                ];
                for (x = 0; 8 > x && n + 0.625 * x < w; x++) u.push(z.charAt(g[x]));
              }
              if ((v = z.charAt(32))) for (; u.length % 8; ) u.push(v);
              return u.join("");
            },
            parse: function (u) {
              return r.create();
            },
            _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
          };
        })();
        function JDDMAC() {
          var m = (function () {
              for (
                var u = [],
                  v =
                    "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D".split(
                      " "
                    ),
                  w = 0;
                w < v.length;
                w++
              )
                u.push(parseInt(v[w], 16));
              return u;
            })(),
            r = function () {};
          r.prototype = {
            mac: function (u) {
              for (var v = -1, w = 0, z = u.length; w < z; w++)
                v = (v >>> 8) ^ m[(v ^ u.charCodeAt(w)) & 255];
              return (v ^ -1) >>> 0;
            },
          };
          return r;
        };

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
        let JDDMACSon = new new JDDMAC()
        var z = JDDMACSon.mac(r.join(""));
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
        //r
        function r() {
          function n(y) {
            var f = {};
            t.style.fontFamily = y;
            document.body.appendChild(t);
            f.height = t.offsetHeight;
            f.width = t.offsetWidth;
            document.body.removeChild(t);
            return f;
          }
          var g = ["monospace", "sans-serif", "serif"],
            x = [],
            t = document.createElement("span");
          t.style.fontSize = "72px";
          t.style.visibility = "hidden";
          t.innerHTML = "mmmmmmmmmmlli";
          for (var l = 0; l < g.length; l++) x[l] = n(g[l]);
          this.checkSupportFont = function (y) {
            for (var f = 0; f < x.length; f++) {
              var k = n(y + "," + g[f]),
                p = x[f];
              if (k.height !== p.height || k.width !== p.width) return !0;
            }
            return !1;
          };
        }
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
        // t.tdHash = _jdfp_canvas_md5;
        t.tdHash = '79682569db0e18f3178300243cddcad5';
        
        // t.webglHash = _jdfp_webgl_md5;
        t.webglHash = '9982bc7051d81cca38dd9fd4ebee4bb0';
        
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
        console.log(g)
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