var cache = { logDate:'' }

exports.cacheObj = function( obj ){
    const { logDate } = obj || {}
    if(logDate ){
        cache['logDate'] = logDate
    }
    cache = { ...obj, ...cache }
    
    console.log('cache', cache)
    return cache
}