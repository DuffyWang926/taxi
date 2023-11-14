function formatDate(val){
    let date = new Date(val)
    const year = date.getFullYear() 
    const month = date.getMonth()+1
    const day = date.getDate()
    const hour = date.getHours() 
    const minute = date.getMinutes()
    const second = date.getSeconds()
    
    let res =  '' + year + '-' + month + '-' + day  + ' ' + hour + ':' + minute + ':' + second 

    return res; 
}

function formatLimit(val){
    let date = new Date(+val)
    const year = date.getFullYear() 
    const month = date.getMonth()+1
    const day = date.getDate()
    
    let res =  '' + year + '-' + month + '-' + day 

    return res; 
}

module.exports = {
    formatDate,
    formatLimit
}
