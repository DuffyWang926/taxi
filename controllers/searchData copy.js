// const axios = require('axios');
// const model = require('../model');
// const {formatLimit} = require('../utils/formatDate')
// const { searchPageData } = require('../scrawlPage/searchPageData')
// const _ = require('lodash')
// const log = console.log

// const searchDataFn = async (ctx, next) => {
//     log('/taxiapi/searchData')
//     //查询处理用户点击
//     let userOrdersModel = model.userOrders
//     let userOrders = await userOrdersModel.findAll({
//         where:{
//             isCheck:0
//         },
//         order:[['clickTime', 'ASC']],
//     })
//     console.log('userOrders', userOrders?.length)
//     if(userOrders && userOrders.length){
//         let userOrderDays = []
//         let userOrderDayList = []
//         let initDay = ''
//         //按天分类用户点击
//         userOrders.forEach( v =>{
//             let beginTime = v && v.clickTime
//             let beginTimeFormat = formatLimit(beginTime)
//             if(!initDay){
//                 initDay = beginTimeFormat
//                 userOrderDayList.push(v)
//             }else if(initDay == beginTimeFormat){
//                 userOrderDayList.push(v)
//             }else{
//                 userOrderDays.push(_.cloneDeep(userOrderDayList))
//                 initDay =  beginTimeFormat
//                 userOrderDayList = []
//                 userOrderDayList.push(v)
//             }
//         })
//         for(let i = 0, len = userOrderDays.length; i < len;i++){
//             let item  = userOrderDays[i]
//             let checkResList = []
//             let orderList = []
//             for(let j = 0, lenj = item.length; j < lenj;j++){
//                 //查询当天订单数据
//                 let v  = item[j]
//                 let beginTime = v && v.clickTime
//                 let beginTimeFormat = formatLimit(beginTime)
//                 let now = parseInt(new Date().getTime()/1000)
//                 let nowDay = formatLimit(now)
//                 if(nowDay != beginTimeFormat){
//                     //查询是否已经查过
//                     let orderDaysModel = model.orderDays
//                     let beginDay = await orderDaysModel.findAll({
//                         where:{
//                             orderDay:beginTimeFormat
//                         }
//                     })
//                     console.log('beginDay',beginDay?.length)
//                     if(beginDay && beginDay.length == 0){
//                         let newOrderDay = {
//                             id:beginTimeFormat,
//                             orderDay:beginTimeFormat,
//                             isCheck:0,
//                         }
        
//                         await orderDaysModel.create(newOrderDay)
//                     }else{
//                         let { isCheck } = beginDay[0]
//                         if(isCheck == 0){
//                             //获取订单数据
//                             // beginTime = '2022-03-14 00:00:00'
//                             orderList = await searchPageData(beginTime)
//                             // orderList = await checkDayOrder(beginTime,nextCookie)
//                             console.log('orderList',orderList)
//                             let updateFlag = true
//                             if(orderList?.length > 0){
//                                 //计算佣金
//                                 if(orderList.length !== item.length){
//                                     let  checkRes  = await computeAmount(v, orderList)
//                                     checkResList.push(checkRes)
//                                 }else{
//                                     await computeListAmount(item, orderList, true)
//                                 }
//                             }
//                             if(updateFlag){
//                                 //更新时间为查过
//                                 let updateDay = beginDay[0]
//                                 updateDay.isCheck = updateFlag
//                                 await orderDaysModel.update(updateDay)
        
//                                 let userUpdateOrders = await userOrdersModel.findAll({
//                                     where:{
//                                         clickTime:v.clickTime
//                                     },
//                                 })
//                                 if(userUpdateOrders?.length ==  1){
//                                     let userUpdateOrder = userUpdateOrders[0]
//                                     userUpdateOrder.isCheck = updateFlag
//                                     await userOrdersModel.update(userUpdateOrder)
//                                 }
        
//                             }
                            
//                         }

//                     }
//                 }
//             }
//             //分配佣金
//             let userIdSum = 0
//             let amountLeft = '0'
//             let lenCheck = checkResList.length
//             for(let checkIndex = 0; checkIndex < lenCheck; checkIndex++){
//                 let v = checkResList[checkIndex]
//                 const { order_no, userId , settle_amount} = v
//                 if(settle_amount){
//                     await updateAmount(userId, settle_amount)
//                 }else{
//                     userIdSum += 1
//                     orderList.forEach( item =>{
//                         let orderOrder_no  = item?.order_no
//                         let orderSettle_amount = item?.settle_amount
//                         if(orderOrder_no === order_no){
//                             amountLeft = +amountLeft + orderSettle_amount
//                         }
//                     })
//                 }

//             }
//             for(let checkIndex = 0; checkIndex < lenCheck; checkIndex++){
//                 let v = checkResList[checkIndex]
//                 const {  userId , settle_amount} = v
//                 if(!settle_amount){
//                     if(userIdSum < orderList?.length * 2){
//                         let shareAmount = parseInt(amountLeft * 100 / userIdSum)/100
//                         await updateAmount(userId, shareAmount)
//                     }
//                 }
//             }
//         }
        
//     }
//     ctx.response.body = {
//                             code:200,
//                             data:{
                                
//                             }
//                         }
    
    
// };

// const login = async (ctx, next) => {
//     let url = `https://alliance.yunzhanxinxi.com/login`
//     let usrName = '15321830653'
//     let passWord = '6afe2db279dc446f563b0a13296c6334'
//     let response = await axios({
//         method: "POST",
//         url: url,
//         data:{
//             usrName,
//             passWord

//         }
//     })
//     const { code, data, message, headers} = response
//     const cookie = headers['set-cookie']
//     let result = {
//         code,
//         data,
//         message,
//         cookie
//     }

//     return result

// } 

// async function getList({param,cookie}){
//     let detailUrl = 'https://alliance.yunzhanxinxi.com/order/list/index'
//     let response = {}
//     param = {
//         page: 1,
//         platform:'', 
//         orderStatus:'', 
//         settleStartTime: '',
//         settleEndTime:'', 
//         orderNo:'', 
//         // payStartTime: new Date("2022-03-20 00:00:00").getTime(),
//         payStartTime:"2022-03-20 00:00:00",
//         payEndTime:"2022-03-26 23:59:59",
//         // payEndTime: new Date("2022-03-26 23:59:59").getTime(),
//         promotionId:'', 
//         allianceAffiliation:'', 
//         rebateType: '',
//         commissionType: '',
//     }
//     response= await axios({
//         method: "POST",
//         url: detailUrl,
//         data:param,
//         headers:{
//             // ':authority': 'alliance.yunzhanxinxi.com',
//             // ':method': 'POST',
//             // ':path': "/order/list/index",
//             // ":scheme": "https",
//             "accept":" application/json, text/plain, */*",
//             "accept-encoding": "gzip, deflate, br",
//             "accept-language": "zh-CN,zh;q=0.9",
//             "content-length": "208",
//             "content-type": "application/x-www-form-urlencoded",
//             Cookie:cookie,
//             "origin": "https://pub.yunzhanxinxi.com",
//             "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
//             "sec-ch-ua-mobile": "?0",
//             "sec-ch-ua-platform": "Windows",
//             "sec-fetch-dest": "empty",
//             "sec-fetch-mode": "cors",
//             "sec-fetch-site": "same-site",
//             "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36"
        
//         }
//     })
//     let responseData = response.data
//     const { code, data } = responseData
//     let tableData = data
//     let tableList = []
//     let isNext = false
//     console.log('responseData',responseData)

//     if(code == 200){
//         const { total, pageCount, pageSize, page, data } =tableData
//         tableList = data || []
//         console.log('tableList',tableList)
//         tableList.forEach(v =>{
//             saveOrder(v)
//         })
//         if(total > (pageSize * page)){
//             isNext = true 
//         }
//     }
//     return { isNext, tableList}


// }

// async function saveOrder(data){
//     try{
//         const { 
//             estimate_amount,
//             id,
//             order_no,
//             order_status,
//             paid_time,
//             promotion_id,
//             settle_amount,
//             settle_time,
//         } = data
//         const ordersModel = model.orders
//         let exitOrders = await  ordersModel.findAll({
//             where: {
//                 id:order_no
//             }
//         })
//         if(exitOrders && exitOrders.length < 1){
//             console.log('exitOrders start')
//             let orderInt = 0
//             console.log('exitOrders start')
//             if(order_status === "订单结算"){
//                 orderInt = 1
//             }else{
//                 orderInt = 2
//             }
//             console.log('settle_time',settle_time)
//             const settleTime = parseInt(new Date(settle_time).getTime()/1000+'')
//             const paidTime = parseInt(new Date(paid_time).getTime()/1000+'')
//             console.log('paidTime start', paidTime)
//             const newOrder ={
//                 id:order_no,
//                 orderNo:order_no,
//                 orderStatus: orderInt,
//                 paidTime,
//                 orederId:id,
//                 promotionId:promotion_id,
//                 settleTime,
//                 estimateAmount:estimate_amount,
//                 settleAmount:settle_amount,
//             }
//             console.log('newOrder', newOrder)
//             await ordersModel.create(newOrder)
//         }
//     }catch{
//         console.log('error')
//     }
    

// }

// async function checkDayOrder(beginTime,cookie){
//     let orderList = []
//     let isNextFlag = true
//     let page = 1 

//     let now = parseInt(new Date().getTime()/1000)
//     let beginDay = formatLimit(beginTime)
//     let nowDay = formatLimit(now)
//     if(nowDay != beginDay){
//         console.log('beginDay', beginDay)
//         // let payStartTime = formatLimit(beginTime) + ' 00:00:00'
//         // let payEndTime = formatLimit(beginTime) + ' 23:59:59'
//         let payStartTime = '2022-03-20 00:00:00'
//         let payEndTime = '2022-03-26 23:59:59'
//         console.log('payStartTime', payStartTime, payEndTime)

//         while(isNextFlag){
//             let dataParam = {
//                 page,
//                 platform:'', 
//                 orderStatus:'', 
//                 settleStartTime:'', 
//                 settleEndTime:'', 
//                 orderNo:'',
//                 payStartTime,
//                 payEndTime,
//                 promotionId:'',
//                 allianceAffiliation:'',
//                 rebateType:'',
//                 commissionType:'',
//             }
//             let response = await getList({dataParam, cookie})
//             const { isNext, tableList } =response
//             orderList = orderList.concat(tableList)
//             isNextFlag = isNext
//             page += 1
//         }

    
//     }
//     return orderList
    
// }

// async function computeAmount(userOrder, orderList){
//     const { clickTime, userId } = userOrder
//     orderList.sort( (a,b) =>{
//         return a.paid_time - b.paid_time
//     })
//     let res = {}
//     orderList.forEach( async v =>{
//         const { order_no, paid_time, settle_amount } = v
//         let paidTime = new Date(paid_time).getTime()
//         let timeDiff = parseInt((paidTime - clickTime)/1000/60)
//         if(timeDiff < 10){
//             res = {
//                 userId,
//                 settle_amount,
//                 order_no
//             }
//         }else{
//             res = {
//                 userId,
//                 settle_amount:'',
//                 order_no
//             }
//         }
//     })
//     return res

// }
// async function computeListAmount(userOrders, orderList){
//     orderList.sort( (a,b) =>{
//         return a.paid_time - b.paid_time
//     })
//     for(let i = 0, len = orderList.length; i < len; i++){
//         let item = orderList[i]
//         const { settle_amount } = item
//         for(let j = 0, lenj = userOrders.length; j < lenj; j++){
//             let v = userOrders[j]
//             const { userId } = v
//             await updateAmount(userId,settle_amount)
//         }
//     }

    
// }

// async function updateAmount(userId, amount){
//     let nextamount= +amount
//     let usersModel = model.user
//     let users = await usersModel.findAll({
//         where:{
//             userId:userId
//         }
//     })
//     let upId = ''
//     if(users && users.length > 0){
//             upId  = users[0] && users[0].upId || ''
//     }
//     let userAccountsModel = model.userAccounts

//     let userAccounts = await userAccountsModel.findAll({
//         where: {
//             userId:userId
//         }
//     })
    
//     if(userAccounts && userAccounts.length == 0){
//         let amount = Math.floor(nextamount * 0.3 * 0.6 *100) /100 + ''
//         let newAccount = {
//             id:userId,
//             userId:userId,
//             upId,
//             amount,
//         }
//         await userAccountsModel.create(newAccount)
//     }else{
//         let userAccount = userAccounts[0]
//         let { id, userId, upId = "", amount} = userAccount
//         let amnountNow = Math.floor(nextamount * 100 * 0.3 * 0.6  ) /100
//         if(upId){
//             if(upId !== '111'){
//                 amnountNow = Math.floor(nextamount * 100 * 0.3 * 0.7  ) /100
//             }
//         }
//         let nextAmount = +amount + amnountNow + ''
//         userAccount.amount = nextAmount
        
//         let nextUserAccount={
//             id,
//             userId,
//             upId,
//             amount:nextAmount
//         }
//         await userAccountsModel.update(nextUserAccount,{where:{userId}})
//         if(upId){
//             let upNextAmount = Math.floor(amnountNow *100 /0.7 *0.3 )/100
//             await updateAmount(upId, upNextAmount)
//         }
//     }
// }

// async function searchDataFn2(){
//     let url = `https://alliance.yunzhanxinxi.com/login`
//     let usrName = '15321830653'
//     let passWord = '6afe2db279dc446f563b0a13296c6334'
//     let response = await axios({
//         method: "POST",
//         url: url,
//         data:{
//             usrName,
//             passWord

//         }
//     })
//     const { code, data, message, headers} = response
//     const cookie = headers['set-cookie']
//     let detailUrl = 'https://alliance.yunzhanxinxi.com/order/list/index'
//     param = {
//         page: 1,
//         platform:'', 
//         orderStatus:'', 
//         settleStartTime: '',
//         settleEndTime:'', 
//         orderNo:'', 
//         // payStartTime: new Date("2022-03-20 00:00:00").getTime(),
//         payStartTime:"2022-03-20 00:00:00",
//         payEndTime:"2022-03-26 23:59:59",
//         // payEndTime: new Date("2022-03-26 23:59:59").getTime(),
//         promotionId:'', 
//         allianceAffiliation:'', 
//         rebateType: '',
//         commissionType: '',
//     }
//     setTimeout( async () =>{
//         response= await axios({
//             method: "POST",
//             url: detailUrl,
//             data:param,
//             headers:{
//                 // ':authority': 'alliance.yunzhanxinxi.com',
//                 // ':method': 'POST',
//                 // ':path': "/order/list/index",
//                 ":scheme": "https",
//                 "accept":" application/json, text/plain, */*",
//                 "accept-encoding": "gzip, deflate, br",
//                 "accept-language": "zh-CN,zh;q=0.9",
//                 "content-length": "208",
//                 "content-type": "application/x-www-form-urlencoded",
//                 Cookie:cookie,
//                 "origin": "https://pub.yunzhanxinxi.com",
//                 "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
//                 "sec-ch-ua-mobile": "?0",
//                 "sec-ch-ua-platform": "Windows",
//                 "sec-fetch-dest": "empty",
//                 "sec-fetch-mode": "cors",
//                 "sec-fetch-site": "same-site",
//                 "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36"
            
//             }
//         })
//         let responseData = response.data
//         console.log('responseData',responseData)

//     },3000)
    


// }
// module.exports = {
//     'GET /taxiapi/searchData': searchDataFn,
//     'GET /taxiapi/searchData2': searchDataFn2,
// };