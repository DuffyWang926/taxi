const model = require('../model');
const axios = require('axios');
const aesCount = require('../utils/aesCount')

const fn_countMei = async (ctx, next) => {
    let body = ctx.request.body
    const { code } = body
    let requestId = '246057'
    let utmSource = '102907'
    let timestamp = new Date().getTime() + ''
    console.log('timestamp',timestamp)
    let size = 10
    let accessTokenStr = utmSource + parseInt(timestamp/1000)
    console.log('accessTokenStr',accessTokenStr)
    let accessToken = aesCount(accessTokenStr)
    let initUrl = 'https://union.dianping.com/api/province/all'
    // let initUrl = 'https://union.dianping.com/data/promote/verify/cpa'
    let url = `${initUrl}?requestId=${requestId}&utmSource=${utmSource}&version=2.0&accessToken=${accessToken}&timestamp=${timestamp}`
    // let url = `${initUrl}?requestId=${requestId}&utmSource=${utmSource}&version=2.0&accessToken=${accessToken}&timestamp=${timestamp}&size=${size}`
    console.log('code',url)
    let response = await axios({
        method: "GET",
        url: url,
    })
    const { data={} } = response
    const {  refresh_token } = data
     console.log(data, 'data')
    ctx.response.body = {
                        code:200,
                       
                    }
    
};

const fn_countMeiUrl = async (ctx, next) => {
    let body = ctx.request.body
    const { code } = body
    let requestId = '246057'
    let utmSource = '102907'
    let timestamp = new Date().getTime() + ''
    console.log('timestamp',timestamp)
    let size = 10
    let accessTokenStr = utmSource + parseInt(timestamp/1000)
    console.log('accessTokenStr',accessTokenStr)
    let accessToken = aesCount(accessTokenStr)
    let url = `https://union.dianping.com/data/promote/verify/cpa?requestId=${requestId}&utmSource=${utmSource}&version=2.0&accessToken=${accessToken}&timestamp=${timestamp}&size=${size}`
    console.log('code',url)
    let response = await axios({
        method: "GET",
        url: url,
    })
    const { data={} } = response
    const {  refresh_token } = data
     console.log(data, 'data')
    ctx.response.body = {
                        code:200,
                       
                    }
    
};



module.exports = {
    'GET /taxiapi/countMei': fn_countMei,
    'GET /taxiapi/countMeiUrl': fn_countMeiUrl,

};