const puppeteer = require('puppeteer')
const axios = require('axios')
let browser = null
const log = console.log
let loginData = null
let cookieAll = null
let loginYunZhanFn = async (ctx, next) => {
    let url = '	https://alliance.yunzhanxinxi.com/login'
    let data = {
        usrName:'15321830653',
        passWord:'6afe2db279dc446f563b0a13296c6334'
    }
    let header = {
        'user-agent':' Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
        'accept':'application/json, text/plain, */*',
        'accept-language':'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'accept-encoding':'gzip, deflate, br',
        'content-type':'application/x-www-form-urlencoded',
        'content-length':'61',
        'origin':'https://pub.yunzhanxinxi.com',
        'cookie':'PHPSESSID=1bc04c695179ecd1f2e2cbaaaf059f92',
        'sec-fetch-dest':'empty',
        'sec-fetch-mode':'cors',
        'sec-fetch-site':'same-site',
        'te':'trailers'
    }

    let response = await axios({
        method: "POST",
        url: url,
        data,
        header
    })
    // console.log('response', response)
    const { headers } = response
    loginData = response?.data
    console.log('headers', headers)
    console.log('loginData', loginData)
    cookieAll = headers['set-cookie']
    console.log('cookieAll', cookieAll)



    
};

async function searchGoods(ctx, next){
    // console.log('ctx',ctx)
    console.log('ctx.request',ctx.request)
    // if(!loginData){
    //     await loginYunZhanFn()
    // }
    // let cookie = 'PHPSESSID=b53309c2e09f5ee5d0f4bb0fe070c191;'
    // Array.isArray(cookieAll) && cookieAll.map( (v,i) =>{
    //     if(v.includes('PHPSESSID')){
    //         // let valList = v && v.split(';')
    //         // let val = valList?.length > 0 && valList[0]
    //         // cookie += val + ';'
    //     }else{
    //         cookie += v + ';'

    //     }
    // })
    // log('search cookie', cookie)
    
    // let header = {
    //     'user-agent':' Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
    //     'accept':'application/json, text/plain, */*',
    //     'accept-language':'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
    //     'accept-encoding':'gzip, deflate, br',
    //     'content-type':'application/x-www-form-urlencoded',
    //     'content-length':'80',
    //     'origin':'https://pub.yunzhanxinxi.com',
    //     'cookie':cookie,
    //     'sec-fetch-dest':'empty',
    //     'sec-fetch-mode':'cors',
    //     'sec-fetch-site':'same-site',
    //     'te':'trailers'
    // }
    let testCookie = `PHPSESSID=a534cb6674641ad2327f22772ba58810; _Tlogin=bb95def92bace05b964a65f8f28fbdd369f3c8110822bc39a8d2cf24fe98ca0fa%3A2%3A%7Bi%3A0%3Bs%3A7%3A%22_Tlogin%22%3Bi%3A1%3Bs%3A1%3A%22T%22%3B%7D; _uN=8189aac99365567509ab78b0eb0f280a75b5d6dd640d69b5e29bf7b941e9e0aba%3A2%3A%7Bi%3A0%3Bs%3A3%3A%22_uN%22%3Bi%3A1%3Bs%3A11%3A%2215321830653%22%3B%7D; _iS=d458dabfda50ac253bf63f326b417e88342f380ae2873260bb5c12ff9c948786a%3A2%3A%7Bi%3A0%3Bs%3A3%3A%22_iS%22%3Bi%3A1%3Bs%3A1%3A%221%22%3B%7D; _sk=440aa2373d300bc19c483d9a58ddec124fddaaf996e70bc17cd775d8ebc32cbaa%3A2%3A%7Bi%3A0%3Bs%3A3%3A%22_sk%22%3Bi%3A1%3Bs%3A32%3A%221673c1bcb438e6159818a7616152b5e3%22%3B%7D; _aI=44885902af050c311dc5b15987a07ff441a519b8acc9f58397b9c39b927f7801a%3A2%3A%7Bi%3A0%3Bs%3A3%3A%22_aI%22%3Bi%3A1%3Bs%3A5%3A%2211673%22%3B%7D; _uI=44952f7974a589a4303a56c2874991bef03457c9765f3dd7940065c627e4e72ea%3A2%3A%7Bi%3A0%3Bs%3A3%3A%22_uI%22%3Bi%3A1%3Bs%3A5%3A%2212555%22%3B%7D`
    let testHeader = {
        'content-length':'80',
        'sec-ch-ua':'"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
        'accept':'application/json, text/plain, */*',
        'content-type':'application/x-www-form-urlencoded',
        'sec-ch-ua-mobile':'?0',
        'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'sec-ch-ua-platform':'"Windows"',
        'origin':'https://pub.yunzhanxinxi.com',
        'sec-fetch-site':'same-site',
        'sec-fetch-mode':'cors',
        'sec-fetch-dest':'empty',
        'accept-encoding':'gzip, deflate, br',
        'accept-language':'zh-CN,zh;q=0.9',
        'cookie':testCookie,
        
    }
    let url = 'https://alliance.yunzhanxinxi.com/ecommerce/jd/goods/list'
    let data = {
        keyword:"面膜",
        sortName:'',      
        sort:'asc',
        category_id:'',
        page:'1',
        sortFieldName:''
    }
    let responseHeader = await axios({
        method: "POST",
        url: url,
        data,
        header:testHeader
    })
    log('searchGoods responseHeader',responseHeader)

    ctx.response.body = {
                        code:200,
                        
                        
                    }


    
}

module.exports = {
    'GET /taxiapi/loginYunZhan': loginYunZhanFn,
    'GET /taxiapi/yunSearchJD': searchGoods,

};