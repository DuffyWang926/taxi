const model = require('../model');
const _ = require('lodash')
const puppeteer = require('puppeteer')
const chalk = require('chalk')
const log = console.log
async function searchPageData (startTime) {
    const browser = await puppeteer.launch({
        headless: true,
        // headless: false,
        args:['--no-sandbox']
    })
    let url = 'https://pub.yunzhanxinxi.com'
    let dataList = []
    try {
        const page = await browser.newPage()
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

        //菜单
        await page.waitForSelector('.group-popper-wrapper >div:nth-last-of-type(1)')
        await page.click('.group-popper-wrapper>div:nth-last-of-type(1)')
        await page.waitForSelector('.close')
        await page.waitForTimeout(1000)
        await page.click('.close>.dark')
        await page.click('.layout_menu-items>li:nth-child(2)')
        await page.waitForTimeout(1000)
        //时间设置
        // var startTime = '2022-03-14 00:00:00'
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
        log(startTime)
        log(headerText)
        log(startMonth)
        log(headerMonth)
        log(startMonth < headerMonth)
        if(startMonth < headerMonth){
            await page.click('.el-date-range-picker__header>button:nth-child(2)')
            await page.waitForTimeout(1000)
        }else if(startMonth > headerMonth){
            await page.click('.is-right>.el-date-range-picker__header>button:nth-child(2)')
            await page.waitForTimeout(1000)
        }
        let rowList = await page.$$('.is-left>.el-date-table>tbody>.el-date-table__row>.available')
        // await rowList[+startDay-1].click()
        // await rowList[+startDay-1].click()
        // await page.waitForTimeout(1000)
        // //获取数据
        // let tableRow = await page.$$('.el-table__fixed-body-wrapper>.el-table__body>tbody>.el-table__row') || []
        // for(let i = 0 ,len = tableRow.length; i < len; i++){
        //     let tdList = await tableRow[i].$$('td') || []
        //     log('tdList', tdList.length)
        //     let data = {}
        //     for(let j = 0, lenj = tdList.length; j < lenj; j++){
        //         let text = await tdList[j].$eval('div', e => e.innerHTML)
        //         if(j == 1){
        //             data.order_no = text
        //         }else if(j == 5){
        //             data.paid_time = text
        //         }else if(j == 11){
        //             data.settle_time = text
        //         }else if(j == 12){
        //             data.settle_amount = text
        //         }
        //     }
        //     dataList.push(data)
        // }

        // let node = await page.$eval('.el-table__fixed-body-wrapper>.el-table__body>tbody>.el-table__row', e => e.outerHTML)
        // log(node)

    } catch (error) {
        // 出现任何错误，打印错误消息并且关闭浏览器
        console.log(error)
        log(chalk.red('服务意外终止'))
        await browser.close()
    } finally {
        // 最后要退出进程
        await browser.close()
        log(chalk.green('服务正常结束'))
        return dataList
        // process.exit(0)
    }
};

module.exports = { searchPageData }