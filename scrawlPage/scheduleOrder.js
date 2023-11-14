const schedule = require('node-schedule');
const { searchDataFn } = require('./searchData')
const  scheduleCronstyle = ()=>{
    schedule.scheduleJob('* * 03 * * *',()=>{
        console.log('schedule',new Date())
        searchDataFn()
    }); 
}

// scheduleCronstyle();

module.exports = {
    scheduleCronstyle
}