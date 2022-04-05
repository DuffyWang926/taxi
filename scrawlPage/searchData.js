const axios = require('axios');
const model = require('../model');
const {formatLimit} = require('../utils/formatDate')
const { searchPageData } = require('../scrawlPage/searchPageData')
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
        let userOrderDays = []
        let userOrderDayList = []
        let initDay = ''
        //按天分类用户点击
        for(let i = 0, len = userOrders.length; i < len;i++){
            let v = userOrders[i]
            let beginTime = v && v.clickTime
            let beginTimeFormat = formatLimit(beginTime)
            if(!initDay){
                initDay = beginTimeFormat
                userOrderDayList.push(v)
            }else if(initDay == beginTimeFormat){
                userOrderDayList.push(v)
                if(i == (len - 1)){
                    userOrderDays.push(_.cloneDeep(userOrderDayList))
                }
            }else{
                userOrderDays.push(_.cloneDeep(userOrderDayList))
                initDay =  beginTimeFormat
                userOrderDayList = []
                userOrderDayList.push(v)
            }

        }
        console.log('userOrderDays',userOrderDays?.length)

        for(let i = 0, len = userOrderDays.length; i < len;i++){
            let item  = userOrderDays[i]
            let checkResList = []
            let orderList = []
            let isSearchDayOrder = false
            let beginDay = []
            let orderDaysModel = model.orderDays

            for(let j = 0, lenj = item.length; j < lenj;j++){
                //查询当天订单数据
                let v  = item[j]
                let beginTime = v && v.clickTime
                let beginTimeFormat = formatLimit(beginTime)
                let now = new Date().getTime()
                let nowDay = formatLimit(now)
                if(nowDay != beginTimeFormat){
                    //查询是否已经查过
                    
                    beginDay = await orderDaysModel.findAll({
                        where:{
                            orderDay:beginTimeFormat
                        }
                    })
                    console.log('beginDay',beginDay?.length)
                    if(beginDay && beginDay.length == 0){
                        let newOrderDay = {
                            id:beginTimeFormat,
                            orderDay:beginTimeFormat,
                            isCheck:1,
                        }
        
                        await orderDaysModel.create(newOrderDay)
                    }
                    //获取订单数据
                    // beginTime = '2022-03-14 00:00:00'
                    if(!isSearchDayOrder){
                        orderList = await searchPageData(beginTime)
                    }
                    isSearchDayOrder = true
                    console.log('orderList',orderList)
                    let updateFlag = true
                    if(orderList?.length > 0){
                        //计算佣金
                        if(orderList.length !== item.length){
                            let  checkRes  = await computeAmount(v, orderList)
                            checkResList.push(checkRes)
                        }else{
                            await computeListAmount(item, orderList, true)
                        }
                    }
                    if(updateFlag){
                        //更新时间为查过
                        let userUpdateOrders = await userOrdersModel.findAll({
                            where:{
                                clickTime:v.clickTime
                            },
                        })
                        if(userUpdateOrders?.length ==  1){
                            let userUpdateOrder = userUpdateOrders[0]
                            const {id, userId, clickTime} = userUpdateOrder
                            userUpdateOrder.isCheck = updateFlag
                            let nextUserOrder ={
                                id:userId,
                                userId,
                                clickTime,
                                isCheck:updateFlag
                            }
                            await userOrdersModel.update(nextUserOrder,{where:{id}})
                        }

                    }
                    
                }
                
            }
            //更新时间为查过
            if(beginDay && beginDay.length > 0){
                let updateDay = beginDay[0]
                const { id, orderDay } = updateDay
                let nextUpdateDay = {
                    id,
                    orderDay,
                    isCheck:true
                }
                await orderDaysModel.update(nextUpdateDay,{where:{id}})
            }
            
            //分配佣金
            let userIdSum = 0
            let amountLeft = '0'
            let lenCheck = checkResList.length
            for(let checkIndex = 0; checkIndex < lenCheck; checkIndex++){
                let v = checkResList[checkIndex]
                const { order_no, userId , settle_amount} = v
                if(settle_amount){
                    await updateAmount(userId, settle_amount)
                }else{
                    userIdSum += 1
                    orderList.forEach( item =>{
                        let orderOrder_no  = item?.order_no
                        let orderSettle_amount = item?.settle_amount
                        if(orderOrder_no === order_no){
                            amountLeft = +amountLeft + orderSettle_amount
                        }
                    })
                }

            }
            for(let checkIndex = 0; checkIndex < lenCheck; checkIndex++){
                let v = checkResList[checkIndex]
                const {  userId , settle_amount} = v
                if(!settle_amount){
                    if(userIdSum < orderList?.length * 2){
                        let shareAmount = parseInt(amountLeft * 100 / userIdSum)/100
                        await updateAmount(userId, shareAmount)
                    }
                }
            }
        }
        
    }
    ctx.response.body = {
                            code:200,
                            data:{
                                
                            }
                        }
    
    
};

async function computeAmount(userOrder, orderList){
    const { clickTime, userId } = userOrder
    orderList.sort( (a,b) =>{
        return a.paid_time - b.paid_time
    })
    let res = {}
    for(let i = 0, len = orderList.length; i < len; i++){
        let v = orderList[i]
        const { order_no, paid_time, settle_amount } = v
        let paidTime = new Date(paid_time).getTime()
        let timeDiff = parseInt((paidTime - clickTime)/1000/60)
        if(timeDiff < 10){
            res = {
                userId,
                settle_amount,
                order_no
            }
        }else{
            res = {
                userId,
                settle_amount:'',
                order_no
            }
        }

    }
    return res

}
async function computeListAmount(userOrders, orderList){
    orderList.sort( (a,b) =>{
        return a.paid_time - b.paid_time
    })
    for(let i = 0, len = orderList.length; i < len; i++){
        let item = orderList[i]
        const { settle_amount } = item
        for(let j = 0, lenj = userOrders.length; j < lenj; j++){
            let v = userOrders[j]
            const { userId } = v
            await updateAmount(userId,settle_amount)
        }
    }

    
}

async function updateAmount(userId, amount, isParent){
    let nextamount= +amount
    let usersModel = model.user
    let users = await usersModel.findAll({
        where:{
            userId:userId
        }
    })
    let upId = ''
    if(users && users.length > 0){
            upId  = users[0] && users[0].upId || ''
    }
    let userAccountsModel = model.userAccounts

    let userAccounts = await userAccountsModel.findAll({
        where: {
            userId:userId
        }
    })
    let amnountNow = Math.floor(nextamount * 0.3 * 0.6 *100) /100 + ''
    if(upId){
        amnountNow = Math.floor(nextamount * 100 * 0.3 * 0.7  ) /100
    }
    if(isParent){
        amnountNow = amount 
    }

    
    if(userAccounts && userAccounts.length == 0){
        let newAccount = {
            id:userId,
            userId:userId,
            upId,
            amount:amnountNow,
        }
        await userAccountsModel.create(newAccount)
        if(upId){
            let upNextAmount = Math.floor(amnountNow *100 /0.7 *0.3 )/100
            await updateAmount(upId, upNextAmount,true)
        }
    }else{
        let userAccount = userAccounts[0]
        let { id, userId, upId = "", amount} = userAccount
        
        let nextAmount = +amount + amnountNow + ''
        userAccount.amount = nextAmount
        
        let nextUserAccount={
            id,
            userId,
            upId,
            amount:nextAmount
        }
        await userAccountsModel.update(nextUserAccount,{where:{userId}})
        if(upId){
            let upNextAmount = Math.floor(amnountNow *100 /0.7 *0.3 )/100
            await updateAmount(upId, upNextAmount,true)
        }
    }
}

module.exports = {
    searchDataFn,
};