const model = require('../model');
const _ = require('lodash')
const puppeteer = require('puppeteer')
const chalk = require('chalk')
const { cacheObj } = require('../constants/cache')
const log = console.log
let page = null
let browser = null
let initDate = 0
const searchJDPageData = async (ctx, next) => {
    let params = ctx.query || {}
    log(chalk.yellow('searchJDPageData start params', JSON.stringify(params) ))
    initDate = new Date().getTime()
    let { goodName, type = 1, num, pageNum} = params
    if( !goodName ){
        params.goodName = '面膜'
    }
    
    let dataList = []
    try {
        if(!page){
            await login()
        }
        let lastCache = cacheObj()
        const { cacheGoods } = lastCache || {}
        let goodsList = []
        let lastNum = 0
        if( cacheGoods && (cacheGoods.goodName == goodName) && (cacheGoods.pageNum == pageNum)){
            goodsList = cacheGoods.goodsList
            lastNum = cacheGoods.lastNum
            let goodListParams = {
                start:lastNum,
                end:(+lastNum) + (+num),
                goodsList
            }
            let gap = ( new Date().getTime() - initDate)/1000
            log('cahe gap', gap)
            dataList = await handleGoodList(goodListParams)
            gap = ( new Date().getTime() - initDate)/1000
            log('cahe end gap', gap)
            log('cache goodsList')
        }else{
            dataList =  await menuClick(type, params)

        }
        
        

        
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
    await page.waitForTimeout(1000)
    // await page.waitForSelector('.offline-btn')
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
    await page.waitForTimeout(500)
    await page.click('.close>.dark')

}

async function menuClick(type, params){
    let lastCache = cacheObj()
    let lastDate = lastCache?.logDate
    let now = new Date().getTime()
    let timeGap = parseInt( (now - lastDate)/1000 )
    if(!page){
        let nowCache = cacheObj({logDate:now})
        log('nowCache',nowCache)
        await login()
        
    }else if( timeGap > 3600 &&  lastDate){
        let nowCache = cacheObj({logDate:now})
        log('nowCache timeGap',nowCache)
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
    const { startTime, endTime } = params
    log(chalk.yellow('handleDetailPage start startTime', startTime, endTime))
    let dataList = []
    
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
    let endDay = new Date(+endTime).getDate()
    log(headerText)
    log(chalk.yellow('startDay ', startDay, endDay))
    if(startMonth < headerMonth){
        await page.click('.el-date-range-picker__header>button:nth-child(2)')
        await page.waitForTimeout(1000)
    }else if(startMonth > headerMonth){
        await page.click('.is-right>.el-date-range-picker__header>button:nth-child(2)')
        await page.waitForTimeout(1000)
    }
    let rowList = await page.$$('.is-left>.el-date-table>tbody>.el-date-table__row>.available')
    log(chalk.yellow('rowList ', rowList))
    await rowList[+startDay-1].click()
    await rowList[+endDay -1].click()
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
    
    await page.type('.keywordInput', goodName)
    await page.click('.search .button')
    await page.waitForTimeout(1000)
    if( pageNum !==1){
        let pagePath = '.el-pager>li:nth-child('+ pageNum + ')'
        await page.click(pagePath)
        await page.waitForTimeout(1000)
    }
    let goodsList = await page.$$('.commodity-list .commodity-item') || []
    
    let cacheGoodsNext = {
        goodName,
        pageNum,
        goodsList,
        lastNum:num
    }
    cacheObj({cacheGoods:cacheGoodsNext })
    
    let len = goodsList.length
    if(num < len){
        len = num
    }
    let gap = ( new Date().getTime() - initDate)/1000
    log('cicle gap', gap)
    let goodListparams = {
        start:0,
        end:num,
        goodsList
    }
    let dataList = await handleGoodList(goodListparams)
    

    return dataList
}
async function handleGoodList(params){
    const { start, end, goodsList } = params
    log('handleGoodList start params ', params)
    let dataList = []
    for(let i = start ; i < end; i++){
        let item = goodsList[i]
        let imgUrl = await item.$eval('img', el => el.src); 
        let title = await item.$eval('.title', el => el.textContent); 
        let oldPrice = await item.$eval('.original-price', el => el.textContent); 
        oldPrice = oldPrice.substring(1)
        let nowPrice = await item.$eval('.money>div>span', el => el.textContent);
        nowPrice = nowPrice.substring(1) 
        let makeMoney = await item.$eval('.money>div:nth-child(2)>span', el => el.textContent); 
        makeMoney = makeMoney.substring(1) 
        if(makeMoney){
            makeMoney = (Math.floor( (+makeMoney)  *100 * 0.6 ) /100).toFixed(2) + ''
        }
        
        let makeMoneyPercent = await item.$eval('.money>div:nth-child(3)>span', el => el.textContent); 
        let couponMoney = await item.$eval('.discountMoney>span:nth-of-type(2)', el => el.textContent); 
        couponMoney.replace('元','')
        let buttonPath = '.commodity-list>div:nth-child(1)>div:nth-of-type(5)>div' 
        await page.click(buttonPath)
        let gap = ( new Date().getTime() - initDate)/1000
        log('cicle buttonPath', gap)
        await page.waitForTimeout(100)
        let linkObj = await getGoodLink(couponMoney)
        gap = ( new Date().getTime() - initDate)/1000
        log('cicle couponMoney end', gap)
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
    await page.waitForTimeout(600)
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