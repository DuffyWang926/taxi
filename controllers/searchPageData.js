const model = require('../model');
const _ = require('lodash')
const puppeteer = require('puppeteer')
const chalk = require('chalk')
const log = console.log
let page = null
let browser = null
const searchJDPageData = async (ctx, next) => {
    let params = ctx.query || {}
    log(chalk.yellow('searchJDPageData start params', JSON.stringify(params) ))
    
    let { goodName, type = 1 } = params
    if( !goodName ){
        params.goodName = '面膜'
    }
    
    let dataList = []
    try {
        if(!page){
            await login()
        }
        
        dataList =  await menuClick(type, params)
        

        
        let dataRes = {
            code:200,
            data:{dataList}
        }
            
        ctx.response.body = dataRes

    } catch (error) {
        // 出现任何错误，打印错误消息并且关闭浏览器
        console.log(error)
        log(chalk.red('服务意外终止'))
        // await browser.close()
    } finally {
        // 最后要退出进程
        // await browser.close()
        log(chalk.green('服务正常结束'))
        let dataRes = {
            code:200,
            data:{dataList}
        }
            
        ctx.response.body = dataRes
        // process.exit(0)
        
    }
};

async function login(){
    browser = await puppeteer.launch({
        headless: false,
        // headless: true,
        args: ['--no-sandbox']
    })
    let url = 'https://pub.yunzhanxinxi.com'
    page = await browser.newPage()
    await page.goto(url)
    log(chalk.yellow('云瞻开放平台页面初次加载完毕'))
    await page.content();
    //登录
    await page.waitForTimeout(2000)
    await page.waitForSelector('.offline-btn')
    // await page.click('.offline-btn')
    await page.click('.login_type-item:nth-last-child(1)')
    let phone = '15321830653'
    let pwd = 'Wef1991926'
    await page.type('.login_wrapper >input:first-child', phone)
    await page.type('.login_wrapper >input:nth-child(2)', pwd)
    await page.click('.login_btn')
    //处理弹窗
    await page.waitForSelector('.group-popper-wrapper >div:nth-last-of-type(1)')
    await page.click('.group-popper-wrapper>div:nth-last-of-type(1)')
    await page.waitForSelector('.close')
    await page.waitForTimeout(1000)
    await page.click('.close>.dark')

}

async function menuClick(type, params){
    if(!page){
        await login()
    }
    let dataList = []
    //菜单
    if(type == 0){
        //详情
        
        await page.click('.layout_menu-items>li:nth-child(2)')
        await page.waitForTimeout(1000)
        

    }else if(type == 1){
        await page.click('.layout_menu>li:nth-child(5)')
        await page.waitForTimeout(1000)
        await page.click('.layout_menu>li:nth-child(5)>ul>li:nth-child(2)')
        await page.waitForTimeout(1000)

    }
    dataList = await handlePage(type, params)
    return dataList
     
}

async function handlePage(type, params){
    let dataList = []
    if(type == 0){
        dataList = await handleDetailPage(params)
    }else if(type == 1){
        dataList = await handleJDPage(params)
    }
    return dataList
}

async function handleDetailPage(params){
    const { startTime } = params
    log(chalk.yellow('handleDetailPage start startTime', startTime))
    let dataList = []
    log(chalk.yellow('startTime', startTime))
    //时间设置
    let inputNode = await page.$('.el-range-input')
    inputNode.click()
    await page.waitForTimeout(1000)
    let headerText = await page.$eval('.el-date-range-picker__header>div', e => e.innerHTML)
    let initHeaderText = headerText.replace(/\s*/g,"")
    let headerList = initHeaderText.split('年')
    let headerMonth = ''
    if(headerList?.length){
        let headerMonthList = headerList[1].split('月')
        headerMonth = headerMonthList?.length && headerMonthList[0]
    }
    let startMonth = new Date(+startTime).getMonth() + 1
    let startDay = new Date(+startTime).getDate()
    // let endDay = new Date().getDate()
    log(headerText)
    if(startMonth < headerMonth){
        await page.click('.el-date-range-picker__header>button:nth-child(2)')
        await page.waitForTimeout(1000)
    }else if(startMonth > headerMonth){
        await page.click('.is-right>.el-date-range-picker__header>button:nth-child(2)')
        await page.waitForTimeout(1000)
    }
    let rowList = await page.$$('.is-left>.el-date-table>tbody>.el-date-table__row>.available')
    await rowList[+startDay-1].click()
    await rowList[+startDay -1].click()
    await page.waitForTimeout(1000)
    //获取数据
    let tableRow = await page.$$('.el-table__fixed-body-wrapper>.el-table__body>tbody>.el-table__row') || []
    for(let i = 0 ,len = tableRow.length; i < len; i++){
        let tdList = await tableRow[i].$$('td') || []
        log('tdList', tdList.length)
        let data = {}
        for(let j = 0, lenj = tdList.length; j < lenj; j++){
            let text = await tdList[j].$eval('div', e => e.innerHTML)
            if(j == 1){
                data.order_no = text
            }else if(j == 2){
                data.goods_name = text
            }else if(j == 5){
                data.paid_time = text
            }else if(j == 11){
                data.settle_time = text
            }else if(j == 12){
                data.settle_amount = text
            }
        }
        dataList.push(data)
    }
    
    return dataList
}

async function handleJDPage(params){
    log(chalk.yellow('handleJDPage start'))
    const { goodName, num, pageNum = 1 } = params
    let dataList = []
    await page.type('.keywordInput', goodName)
    await page.click('.search .button')
    await page.waitForTimeout(1000)
    if( pageNum !==1){
        let pagePath = '.el-pager>li:nth-child('+ pageNum + ')'
        await page.click(pagePath)
        await page.waitForTimeout(1000)
    }
    let goodsList = await page.$$('.commodity-list .commodity-item') || []
    let len = goodsList.length
    if(num < len){
        len = num
    }
    
    for(let i = 0 ; i < len; i++){
        let item = goodsList[i]
        //img
        let imgUrl = await item.$eval('img', el => el.src); 
        //title
        let title = await item.$eval('.title', el => el.textContent); 
        let oldPrice = await item.$eval('.original-price', el => el.textContent); 
        oldPrice.replace('￥','')
        let nowPrice = await item.$eval('.money>div>span', el => el.textContent); 
        nowPrice.replace('￥','')
        let makeMoney = await item.$eval('.money>div:nth-child(2)>span', el => el.textContent); 
        makeMoney.replace('￥','')
        let makeMoneyPercent = await item.$eval('.money>div:nth-child(3)>span', el => el.textContent); 
        makeMoneyPercent.replace('￥','')
        let couponMoney = await item.$eval('.discountMoney>span:nth-of-type(2)', el => el.textContent); 
        couponMoney.replace('元','')
        let buttonPath = '.commodity-list>div:nth-child(1)>div:nth-of-type(5)>div' 
        await page.click(buttonPath)
        await page.waitForTimeout(1000)
        let linkObj = await getGoodLink(couponMoney)
        const { link, couponLink } = linkObj

        let res = {
            imgUrl,
            title,
            oldPrice,
            nowPrice,
            makeMoney,
            makeMoneyPercent,
            couponMoney,
            link,
            couponLink
        }
        dataList.push(res)

    }

    return dataList
}
async function getGoodLink(couponMoney){
    await page.click('.promotiontype>div:nth-child(2)')
    let link = await page.$eval('.promotioncontent>a', el => el.textContent) || ''; 
    log(chalk.yellow('link',link))
    let couponLink = ''
    if(+couponMoney > 0){
        let couponLink = await page.$eval('.promotioncontent>a:nth-of-type(2)', el => el.textContent) || ''; 
        log(chalk.yellow('couponLink',couponLink))
    }
    

    await page.click('.breadcrumb-back')
    await page.waitForTimeout(1000)
    return {
        link,
        couponLink
    }
}




module.exports = {
    'GET /taxiapi/searchJDPageData': searchJDPageData,
    menuClick
    
};