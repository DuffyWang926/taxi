const fs = require('fs')
const axios = require('axios')
const request = require('request-promise')
const model = require('../model');
const chalk = require('chalk')
const log = console.log
var searchJDFn = async (ctx, next) => {
    let url = 'https://union.jd.com/api/goods/search'

    let headers = {
        ":authority": "union.jd.com",
        ":method": "POST",
        ":path": "/api/goods/search",
        ":scheme": "https",
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-length": 440,
        "content-type": "application/json;charset=UTF-8",
        "cookie": '__jdu=16520980101651659015197; shshshfpa=5cb6a543-946d-a543-e407-b327249d4c9a-1653718826; shshshfpb=qPg5b57-bsZnnMJeE_BgnKA; shshshfp=f0dbdebd79422e94cd9c74abbf485bef; TrackID=1s5mFfsZBi3hAIlN_CsiB5ZFEsVUZowJceC3xtmIxLTCqU_nZa0PVzbIXCfkAZ8LUVq-Rd8c-2p9Bnzkcux4uca9mlnBoFND7NJ8uOcv3Ow3_T0qejiGetVCYsRxq0LzG; __jdv=209449046|direct|-|none|-|1667614686721; sidebarStatus=1; pinId=75pKMTs5fvqc19Nhgpl_Bw; pin=%E7%AD%89%E8%8A%B1%E5%BC%80926; unick=%E7%AD%89%E8%8A%B1%E5%BC%80926; ceshi3.com=000; _tp=eXwfBiYMzzN0AUPhjMpfW2fm%2B%2FgbTVnkWtfjg5N6ONA%3D; _pst=%E7%AD%89%E8%8A%B1%E5%BC%80926; 3AB9D23F7A4B3C9B=SVJPZUO4OFVV757GORUJHZRMNZ7DZCUJ6CMQ4TMBAYHH6D46DOCHBTTHNSZZU53BK7LGX7RYU4JKSN6627YORSNZLE; __jda=209449046.16520980101651659015197.1652098010.1668226905.1668229232.22; __jdc=209449046; login=true; MMsgId%E7%AD%89%E8%8A%B1%E5%BC%80926=9037997; MNoticeId%E7%AD%89%E8%8A%B1%E5%BC%80926=538; ssid="YsZGW/RLSqqqzjHGW+r0VQ=="; thor=BBDFC6C5A145FA2D5A4295E6C2338931F88A2846BC79BCF6F4422DB057EAC51AB97E352E18B51960E80FB2E2045BD062EE0C80DE4B4FA68A9938F3539DF706ADBF8D7EF069366770D1C347BC4714AB259263343A226B868DC5A891D09E0A8250B2444606AE97D6F3E4848F8A8C124D0789364D211630B68C60727E9E5E0C73E4; __jdb=209449046.39.16520980101651659015197|22.1668229232; RT="z=1&dm=jd.com&si=3xj7vko1c98&ss=ladgm094&sl=u&tt=gr4&ld=vm3t&ul=v1fm&hd=v1ft&nu=3d2f85352c70c73af100bf1449967844&cl=vkqu"',
        "origin": "https://union.jd.com",
        "referer": "https://union.jd.com/proManager/index?keywords=%E6%89%8B%E6%9C%BA&pageNo=1",
        "sec-ch-ua": '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'

    }
    let data = {"pageNo":1,"pageSize":60,"searchUUID":"64f625ef9f954b62a8379609bf1adb38","data":{"bonusIds":null,"categoryId":null,"cat2Id":null,"cat3Id":null,"deliveryType":0,"fromCommissionRatio":null,"toCommissionRatio":null,"fromPrice":null,"toPrice":null,"hasCoupon":0,"isHot":null,"preSale":0,"isPinGou":0,"jxFlag":0,"isZY":0,"isCare":0,"lock":0,"orientationFlag":0,"sort":null,"sortName":null,"key":"手机","searchType":"st1","keywordType":"kt1"}}

    // let response = await axios({
    //     method:'post',
    //     url:url,
    //     headers,
    //     data
    // })
    let response = await request({
        uri:url,
        method:'post',
        url:url,
        headers,
        data
    })
    log(chalk.yellow(response))
    log(chalk.yellow(response.data))

    
   
    ctx.response.body = {
        code:200,
    }

};

module.exports = {
    'GET /taxiapi/searchJD': searchJDFn
};