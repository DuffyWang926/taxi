var cache = { logDate:'1' }

exports.cacheObj = function( obj ){
    const { logDate } = obj || {}
    if(logDate ){
        cache['logDate'] = logDate
    }
    
    console.log('cache', cache)
    return cache
}