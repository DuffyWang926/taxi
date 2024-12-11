const model = require('../model');
const fs = require('fs');
const attendWelfare = async (ctx, next) => {
    let body = ctx.request.body
    let { userId,
        points,
        nickName,
        headUrl,
        date
    } = body

    const today = new Date();

    const dayOfWeek = today.getDay(); 

    console.log('dayOfWeek', dayOfWeek)

    let nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + (5 - dayOfWeek + 7) % 7);
    nextFriday.setHours(20, 0, 0, 0);
    let nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (6 - dayOfWeek + 7) % 7);
    nextSaturday.setHours(20, 0, 0, 0);
    console.log('date', date.toString())
    console.log('nextFriday', nextFriday.toString())
    console.log('nextSaturday', nextSaturday.toString())
    let startDay = ''
    let endDay = ''
    const thisSaturday = new Date(today);
    thisSaturday.setDate(thisSaturday.getDate() + 1);
    thisSaturday.setHours(20, 0, 0, 0); 
    const thisFriday = new Date(today);
    thisFriday.setDate(thisFriday.getDate() - 1);
    thisFriday.setHours(20, 0, 0, 0); 
    today.setHours(20, 0, 0, 0); 

    if(dayOfWeek == 5){
      startDay = today
      endDay = thisSaturday
    }else if(dayOfWeek == 6){
      startDay = thisFriday
      endDay = today
    }else{
      startDay = nextFriday
      endDay = nextSaturday
    }
    console.log('startDay', startDay.toString())
    console.log('endDay', endDay.toString())

    if(points >= 10){
        let nextFridayTime = startDay.getTime()
        let nextSaturdayTime = endDay.getTime()
        console.log('date >= nextFridayTime', date >= nextFridayTime)
        console.log('date <= nextSaturdayTime', date <= nextSaturdayTime)
        console.log('date >= nextFridayTime', date, nextFridayTime)

        console.log('date <= nextSaturdayTime',  nextSaturdayTime)

        if( date >= nextFridayTime && date <= nextSaturdayTime ){
            let userModel = model.user
            let users = await  userModel.findAll({
                where: {
                    userId
                }
            })
            if(users && users.length > 0){
                let user = users.length && users[0]
                let oldPoints = user.points
                if(oldPoints >= 10){
                    let nextPoints = oldPoints - 10
                    await userModel.update(
                        {
                            ...user,
                            points:nextPoints
                        },
                        {
                            where: { userId },
                        }
                    );
                }


                    
            }
            let welfareAttendersModel = model.welfareAttenders
            let attenders = await  welfareAttendersModel.findAll({
                where: {
                    userId
                }
            })
            console.log('userId', userId)
            console.log('attenders && attenders.length', attenders && attenders.length)
            if(attenders && attenders.length == 0){
                let newAttender = {
                    userId,
                    date:''+date,
                    points:''+points,
                    nickName,
                    headUrl,
                }
                console.log('newAttender', newAttender)
                await  welfareAttendersModel.create(newAttender) 

            }
            
        }
    }

        
    ctx.response.body = {
        code:200,
    }
};

const getWelfareList = async (ctx, next) => {
    let data = []

    const today = new Date();
    let day = today.getDay()
    // 设置为这周六晚上8点
    const thisSaturday = new Date(today);
    thisSaturday.setDate(thisSaturday.getDate() + (6 - thisSaturday.getDay()));
    thisSaturday.setHours(20, 0, 0, 0);
    console.log('thisSaturday',thisSaturday.toString())
  
    let thisFriday = new Date(today);
    thisFriday.setDate(today.getDate() + (5 - today.getDay()));
    thisFriday.setHours(20, 0, 0, 0);
    console.log('thisFriday',thisFriday.toString())

    const lastSaturday = new Date(today);
    const daysToLastSaturday = (today.getDay() + 1);
    lastSaturday.setDate(lastSaturday.getDate() - daysToLastSaturday);
    lastSaturday.setHours(20, 0, 0, 0); // 设置时间为20:00:00
    console.log('lastSaturday',lastSaturday.toString())

    let welfareListModel = model.welfareList

    let welfareList = await  welfareListModel.findAll({
        where: {},
        order: [['date', 'DESC']],
        limit: 10
    })
    let dateOld = ''
    let drawFlag = false
    if(welfareList && welfareList.length > 0){
        let welfareLatest = welfareList[0]
        dateOld = welfareLatest.date
    }else{
        drawFlag = true
    }
    if (day < 6) {
        if (today < thisFriday) {
            console.log('dateOld',dateOld)
            console.log('lastSaturday',lastSaturday.getTime())
            console.log('dateOld > lastSaturday.getTime()',dateOld > lastSaturday.getTime())
            console.log('dateOld',lastSaturday.toString())
            if (dateOld > lastSaturday.getTime() && !drawFlag) {
                console.log('dateOld > lastSaturday.getTime() && !drawFlag')
                data = welfareList
            }else{
                console.log('handleLottery')

                await handleLottery()
                let welfareListNew = await  welfareListModel.findAll({
                    where: {},
                    order: [['date', 'DESC']],
                    limit: 10
                })
                data = welfareListNew

            }
        
        }  
        
    }else{
        if (today > thisSaturday) {
            if (dateOld > thisSaturday.getTime() && !drawFlag) {
                data = welfareList
            }else{
                await handleLottery()
                let welfareListNew = await  welfareListModel.findAll({
                    where: {},
                    order: [['date', 'DESC']],
                    limit: 10
                })
                data = welfareListNew
            }
        
        } 
    }
   
    
        

    
    let dataRes = {
        code:200,
        data
    }
        
    ctx.response.body = dataRes
};
async function handleLottery() {
    let { winners, attendSum } = await drawLottery();
    if(winners.length > 0){
        const today = new Date().getTime()
        let newList = Array.isArray(winners) && winners.map( v => {
            let res = {
                userId:v.userId,
                date:today+'',
                nickName: v.nickName,
                headUrl: v.headUrl,
                attendSum: attendSum + ''
            }
            return res
        })
        let welfareListModel = model.welfareList


        try {
            // 使用bulkCreate方法批量插入数据
            await welfareListModel.bulkCreate(newList, {
                // 如果需要，可以在这里设置bulkCreate的选项，例如ignoreDuplicates或updateOnDuplicate
            });

            console.log('获奖者数据已成功插入到welfareList表');
            const welfareAttendersModel = model.welfareAttenders;
            try {
                // 使用destroy方法删除所有记录
                await welfareAttendersModel.destroy({
                    where: {}, // 没有条件，删除所有记录
                    truncate: false // 设置为false，使用delete而不是truncate
                });
        
                console.log('welfareAttenders表的数据已清空');
            } catch (error) {
                console.error('清空表失败:', error);
            }
        } catch (error) {
            console.error('插入数据失败:', error);
        }

    }
    
    
    return { winners }
}
async function drawLottery() {
    let welfareAttendersModel = model.welfareAttenders
    //test
    // let testData = []
    // for (let i = 0; i < 50; i++) {
    //     let res = {
    //         userId: 'user'+i,
    //         date: '2024-11-12',
    //         nickName: 'Nick'+i,
    //         headUrl: 'http://example.com/head1.jpg',
    //         points: '100'
    //     }
    //     testData.push(res)
    // }
    // await welfareAttendersModel.bulkCreate(testData)
    // .then(() => {
    //     console.log('测试数据添加成功');
    // })
    // .catch((error) => {
    //     console.error('添加测试数据失败', error);
    // });


    let attenders = await  welfareAttendersModel.findAll({
        where: {
        }
    })
    const winners = [];
    const numberOfWinners = 1; // 假设我们要抽取3个获奖者
    if(attenders.length > 0){

        // 洗牌算法，打乱参与者数组
        for (let i = attenders.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [attenders[i], attenders[j]] = [attenders[j], attenders[i]];
        }

        // 抽取获奖者
        for (let i = 0; i < numberOfWinners; i++) {
            winners.push(attenders[i]);
        }

    }
    
    return { winners, attendSum:attenders.length }
}
module.exports = {
    'POST /taxiapi/attendWelfare': attendWelfare,
    'POST /taxiapi/getWelfareList': getWelfareList,
};