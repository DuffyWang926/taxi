const axios = require('axios');
const model = require('../model');
const {formatLimit} = require('../utils/formatDate')
const { menuClick } = require('./searchPageData')
const _ = require('lodash')
const log = console.log

const searchDataFn = async (ctx, next) => {
    log('/taxiapi/searchData')
    
    //查询处理用户点击
    let userOrdersModel = model.userOrders
    let userOrders = await userOrdersModel.findAll({
        where:{
            isCheck:0
        },
        order:[['clickTime', 'ASC']],
    })
    console.log('userOrders', userOrders?.length)
    if(userOrders && userOrders.length){
        let len = userOrders.length
        // let userOrderDays = []
        // let userOrderDayList = []
        // let initDay = ''
        let startOrder = userOrders[0]
        let endOrder = userOrders[len -1]
        let startDay = startOrder && startOrder.clickTime
        let endDay = endOrder && endOrder.clickTime
        let nowDay = new Date().getDate()
        let endDaySys = endOrder && new Date(endOrder.clickTime).getDate()
        let startDaySys = endOrder && new Date(endOrder.clickTime).getDate()
        let orderList = []
        if(startDaySys != nowDay){
            if(endDaySys == nowDay){
                endDay = endDay.replace(String(nowDay),String(nowDay-1))
                userOrders = userOrders.filter( (v) =>{
                    let tempDay = new Date(v.clickTime).getDate()
                    if( tempDay !== nowDay ){
                        return true
                    }else{
                        return false
                    }
                    
                })
            }
            orderList = await menuClick(0,{startTime:startDay,endTime:endDay})
            orderList.sort( (a,b) =>{
                return a.paid_time - b.paid_time
            })
            for(let i = 0; i < len;i++){
                let order = userOrders[i]
                debugger
                for(let j = 0,lenj = orderList.length; j < lenj; j++){
                    let detailOrder = orderList[j]
                    let userAccount = await computeSingleAmount(order, detailOrder)
                    debugger
                    if( userAccount){
                        orderList[j].isCount = true
                        await updateAmount(userAccount)
                        break;

                    }

                }
                // if(orderList && orderList.length > 0){
                //     await updateOrder(order)
                // }
                
            }

        }

        //按天分类用户点击
        // for(let i = 0; i < len;i++){
        //     let v = userOrders[i]
        //     let beginTime = v && v.clickTime
        //     let beginTimeFormat = formatLimit(beginTime)
        //     if(!initDay){
        //         initDay = beginTimeFormat
        //         userOrderDayList.push(v)
        //     }else if(initDay == beginTimeFormat){
        //         userOrderDayList.push(v)
        //         if(i == (len - 1)){
        //             userOrderDays.push(_.cloneDeep(userOrderDayList))
        //         }
        //     }else{
        //         userOrderDays.push(_.cloneDeep(userOrderDayList))
        //         initDay =  beginTimeFormat
        //         userOrderDayList = []
        //         userOrderDayList.push(v)
        //     }

        // }
        // console.log('userOrderDays',userOrderDays?.length)

        // for(let i = 0, len = userOrderDays.length; i < len;i++){
        //     let item  = userOrderDays[i]
        //     let checkResList = []
            
        //     let isSearchDayOrder = false
        //     let beginDay = []
        //     let orderDaysModel = model.orderDays
        //     debugger

        //     // for(let j = 0, lenj = item.length; j < lenj;j++){
        //         //查询当天订单数据
        //         let v  = item[0]
        //         // let v  = item[j]
        //         let beginTime = v && v.clickTime
        //         let beginTimeFormat = formatLimit(beginTime)
        //         let now = new Date().getTime()
        //         let nowDay = formatLimit(now)
        //         // if(nowDay != beginTimeFormat){
        //             if(true){
        //             //查询是否已经查过
                    
        //             beginDay = await orderDaysModel.findAll({
        //                 where:{
        //                     orderDay:beginTimeFormat
        //                 }
        //             })
        //             console.log('beginDay',beginDay?.length)
        //             if(beginDay && beginDay.length == 0){
        //                 let newOrderDay = {
        //                     id:beginTimeFormat,
        //                     orderDay:beginTimeFormat,
        //                     isCheck:1,
        //                 }
        
        //                 await orderDaysModel.create(newOrderDay)
        //             }
        //             //获取订单数据
        //             // beginTime = '2022-03-14 00:00:00'
        //                debugger
        //             if(!isSearchDayOrder){
                        
        //             }
        //             isSearchDayOrder = true
        //             console.log('orderList',orderList)
        //             let updateFlag = true
        //             if(orderList?.length > 0){
        //                 //计算佣金
        //                 if(orderList.length !== item.length){
        //                     // let  checkRes  = await computeAmount(v, orderList)
        //                     // checkResList.push(checkRes)
        //                 }else{
        //                     // await computeListAmount(item, orderList, true)
        //                 }
        //             }
                    
        //         }
                
        //     }
        //     //更新orderDays时间为查过
        //     if(beginDay && beginDay.length > 0){
        //         let updateDay = beginDay[0]
        //         const { id, orderDay } = updateDay
        //         let nextUpdateDay = {
        //             id,
        //             orderDay,
        //             isCheck:true
        //         }
        //         await orderDaysModel.update(nextUpdateDay,{where:{id}})
        //     }
            
        //     分配佣金
        //     let userIdSum = 0
        //     let amountLeft = '0'
        //     let lenCheck = checkResList.length
        //     for(let checkIndex = 0; checkIndex < lenCheck; checkIndex++){
        //         let v = checkResList[checkIndex]
        //         const { order_no, userId , openid, settle_amount} = v
        //         if(settle_amount){
        //             let amountParams = {
        //                 userId,
        //                 amount:settle_amount,
        //                 openid
        //             }
        //             await updateAmount(amountParams)
        //         }else{
        //             userIdSum += 1
        //             orderList.forEach( item =>{
        //                 let orderOrder_no  = item?.order_no
        //                 let orderSettle_amount = item?.settle_amount
        //                 if(orderOrder_no === order_no){
        //                     amountLeft = +amountLeft + orderSettle_amount
        //                 }
        //             })
        //         }

        //     }
        //     for(let checkIndex = 0; checkIndex < lenCheck; checkIndex++){
        //         let v = checkResList[checkIndex]
        //         const {  userId , settle_amount, openid} = v
        //         if(!settle_amount){
        //             if(userIdSum < orderList?.length * 2){
        //                 let shareAmount = parseInt(amountLeft * 100 / userIdSum)/100
        //                 let amountParams = {
        //                     userId,
        //                     amount:shareAmount,
        //                     openid
        //                 }
        //                 await updateAmount(amountParams)
        //             }
        //         }
        //     }
        // }
        
    }
    ctx.response.body = {
                            code:200,
                            data:{
                                
                            }
                        }
    
    
};

async function updateOrder(userOrder){
    let userOrdersModel = model.userOrders
    const { id } = userOrder
    let nextUserOrder = { ...userOrder, isCheck:true}
    await userOrdersModel.update(nextUserOrder,{where:{id}})
}

async function computeSingleAmount(userOrder, detailOrder){
    console.log('computeSingleAmount start')
    const { clickTime, userId, goodName, openid } = userOrder
    
    let res = null
   
    const { paid_time, settle_amount, goods_name, isCount } = detailOrder
    let isRight = false
    if(goodName){
        if(goods_name.includes(goodName)){
            isRight = true
        }
    }else{
        let paidTime = new Date(paid_time).getTime()
        let timeDiff = parseInt((paidTime - clickTime)/1000/60)
        debugger
        if(timeDiff < 15 && timeDiff > 0){
            isRight = true
        }
    }
    if(isRight && !isCount){
        debugger
        res = {
            userId,
            openid,
            amount:settle_amount,
        }
    }
    
    return res

}
async function computeAmount(userOrder, orderList){
    console.log('computeAmount start')
    const { clickTime, userId, goodName, openid } = userOrder
    
    let res = null
    for(let i = 0, len = orderList.length; i < len; i++){
        let v = orderList[i]
        const { paid_time, settle_amount, goods_name } = v
        let isRight = false
        if(goodName){
            if(goods_name.includes(goodName)){
                isRight = true
            }
        }else{
            let paidTime = new Date(paid_time).getTime()
            let timeDiff = parseInt((paidTime - clickTime)/1000/60)
            debugger
            if(timeDiff < 15){
                isRight = true
            }
        }
        if(isRight){
            res = {
                userId,
                openid,
                amount:settle_amount,
            }
            break;
        }
    }
    return res

}
async function computeListAmount(userOrders, orderList){
    console.log('computeListAmount start')
    orderList.sort( (a,b) =>{
        return a.paid_time - b.paid_time
    })
    for(let i = 0, len = orderList.length; i < len; i++){
        let item = orderList[i]
        const { settle_amount, paid_time, goods_name } = item
        let paid_timeTime = new Date(paid_time).getTime()
        let countFlag = false
        debugger

        for(let j = 0, lenj = userOrders.length; j < lenj; j++){
            let v = userOrders[j]
            const { openid, clickTime, goodName } = v
            let isRight = false
            if(goodName){
                if(goods_name.includes(goodName)){
                    isRight = true
                }
            }else{
                let gap = paid_timeTime - clickTime
                if( gap < 1500000){
                    isRight = true
                }

            }
            debugger
            if(isRight && !countFlag){
                countFlag = true
                let amountParams = {
                    amount:settle_amount,
                    openid
                }
                await updateAmount(amountParams)

            }

            
        }
    }

    
}

async function updateAmount(amountParams){
    console.log('updateAmount start')
    let { userId = '', amount, isParent, openid = '' } = amountParams
    debugger
    let nextamount= amount ? +amount : 0
    let usersModel = model.user
    let users = []
    
    if(!userId){
        users = await usersModel.findAll({
            where:{
                openid:openid
            }
        })

    }else{
        users = await usersModel.findAll({
            where:{
                userId:userId
            }
        })

    }
    
    
    let upId = ''
    if(users && users.length > 0){
            upId  = users[0] && users[0].upId || ''
            openid  = users[0] && users[0].openid || ''
            userId  = users[0] && users[0].userId || ''
    }
    let userAccountsModel = model.userAccounts

    let userAccounts = []
    if(!userId){
        userAccounts = await userAccountsModel.findAll({
            where: {
                openid:openid
            }
        })

    }else{
        userAccounts = await userAccountsModel.findAll({
            where: {
                userId:userId
            }
        })

    }
    
    let amnountNow = (Math.floor(nextamount * 0.7 * 0.6 *100) /100).toFixed(2) + ''
    if(upId){
        amnountNow = (Math.floor(nextamount * 100 * 0.7 * 0.7  ) /100).toFixed(2)
    }
    if(isParent){
        amnountNow = (+amount).toFixed(2) 
    }

    
    if(userAccounts && userAccounts.length == 0){
        let newAccount = {
            id:openid,
            userId:userId,
            openid:openid,
            upId,
            amount:amnountNow,
        }
        await userAccountsModel.create(newAccount)
        if(upId){
            let upNextAmount = (Math.floor(amnountNow *100 /0.7 *0.3 )/100).toFixed(2)
            let amountParams = {
                userId:upId,
                amount:upNextAmount,
                isParent:true
            }
            await updateAmount(amountParams)
        }
    }else{
        let userAccount = userAccounts[0]
        let { id, userId, upId = "", amount, openid} = userAccount
        
        let nextAmount = (+amount + +amnountNow).toFixed(2) + ''
        userAccount.amount = nextAmount
        
        let nextUserAccount={
            id,
            userId,
            upId,
            amount:nextAmount
        }
        if(!userId){
            await userAccountsModel.update(nextUserAccount,{where:{userId}})
        }else{
            await userAccountsModel.update(nextUserAccount,{where:{openid}})
        }
        
        if(upId){
            let upNextAmount = Math.floor(amnountNow *100 /0.7 *0.3 )/100
            let amountParams = {
                userId:upId,
                amount:upNextAmount,
                isParent:true
            }
            
            await updateAmount(amountParams)
        }
    }
}
module.exports = {
    'GET /taxiapi/searchData': searchDataFn,
};