const { scheduleCronstyle } = require('../scrawlPage/scheduleOrder')
var sheduleFn = async (ctx, next) => {
    scheduleCronstyle()
    ctx.response.body = {
        code:200,
        data:{
            
        }
    }
    
};

module.exports = {
    'GET /taxiapi/shedule': sheduleFn,
};