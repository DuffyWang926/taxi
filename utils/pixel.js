let getPixelPromise = require('get-pixel-promise')

async function handleImg(path){
    let width = 0
    let height = 0
    let minX = 0
    let minY = 0
    let maxX = 0
    let maxY = 0
    try{
       let res = await getPixelPromise(path)
       const pixels = res
       if(res.data){
            let { shape } = pixels
            console.log('shape', shape)
            let len = 0
            let lenj = 0
            let lenk = 0
            if(shape.length > 2){
                len = shape[0]
                lenj = shape[1]
                lenk = shape[2]
                width = shape[0]
                height = shape[1]
            }
            let result = []
            let pList = []
            let repleatObjList = []
            
            for(var i=0; i<len; ++i) {
                for(var j=0; j<lenj; ++j) {
                    for(var k=0; k<4; ++k) {
                        let pixel = pixels.get(i,j,k)
                        pList.push(pixel)
                    }
                    
                    if( (pList[0] == 0) && (pList[1] == 0) && (pList[2] == 0)  ){

                    }else{
                        let isPush = false
                        // debugger
                        for(let m = 0, lenm = repleatObjList.length; m < lenm; m ++){
                            let { sum } = repleatObjList[m]
                            let flag = false
                            //比较色值，判断坐标是否连续
                            let locationLimit = repleatObjList[m].locationLimit
                            let listInit = repleatObjList[m].list
                            let locationListInit = repleatObjList[m].locationList
                            let location = [i,j]
                            let locationLimitNext = {}
                            let colorGap = 15
                            let aFlag = Math.abs( listInit[0]-pList[0]) < colorGap 
                            let bFlag = Math.abs( listInit[1]-pList[1]) < colorGap
                            let cFlag = Math.abs( listInit[2]-pList[2]) < colorGap
                            let colorFlag = aFlag && bFlag && cFlag
                            let locationGap = 10
                            if(colorFlag){
                                let { 
                                        minX,
                                        maxX,
                                        minY,
                                        maxY
                                    } = locationLimit
                                if( minX === -1){
                                    flag = true
                                    locationLimitNext = {
                                        minX:i,
                                        maxX:i,
                                        minY:j,
                                        maxY:j
                                    }

                                }else{
                                    let flagX = false
                                    let flagY = false
                                    if(i <= minX){
                                        if((minX - i) < locationGap){
                                            minX = i
                                            flagX = true
                                        }
                                    }else if( i >= maxX){
                                        if((i - maxX) < locationGap){
                                            maxX = i
                                            flagX = true
                                        }
                                    }else{
                                        flagX = true
                                    }
                                    if(j <= minY){
                                        if((minY - j) < locationGap){
                                            minY = j
                                            flagY = true
                                        }
                                    }else if( j >= maxY){
                                        if((j - maxY) < locationGap){
                                            maxY = j
                                            flagY = true
                                        }
                                    }else{
                                        flagY = true
                                    }
                                    if(flagX && flagY){
                                        flag = true
                                        locationLimitNext = {
                                            minX,
                                            maxX,
                                            minY,
                                            maxY
                                        }

                                    }

                                }
                                

                            }
                            
                            if(flag){
                                let listLast = repleatObjList[m].list
                                let listNext = []
                                for(let i = 0,len = listLast.length; i< len; i++){
                                    let adverage = null 
                                    adverage = Math.round((listLast[i] + pList[i])/2)
                                    listNext.push(adverage)
                                }
                                repleatObjList[m].sum = +sum + 1
                                repleatObjList[m].locationList.push([i,j])
                                // repleatObjList[m].colorList.push(pList)
                                repleatObjList[m].locationLimit = locationLimitNext
                                repleatObjList[m].list = listNext

                                isPush = true
                            }
                        }
                        if(!isPush){
                            let res = {
                                list:pList,
                                colorList:[pList],
                                sum:0,
                                locationList:[[i,j]],
                                locationLimit:{
                                    minX:-1,
                                    maxX:-1,
                                    minY:-1,
                                    maxY:-1
                                }
                                
                            }
                            repleatObjList.push(res)

                        }
                        location = [i,j]
                        result.push({
                            location,
                            pList:pList
                        })
                    }
                    pList = []
                }
            }
            repleatObjList.sort( (a,b) =>{
                return  b.sum - a.sum
            })
            // console.log('result',result)
            // console.log('repleatObjList[0]',repleatObjList[0])
            // console.log('repleatObjList[1]',repleatObjList[1])
            // console.log('repleatObjList[2]',repleatObjList[2])
            let goalLocation = []
            let goalLocationInit = []
            let goalGap = 90
            // debugger
            repleatObjList.forEach( (v,i) =>{
                let { list } = v
                // let flagA = Math.abs( list[0] - 88) < goalGap
                // let flagB = Math.abs( list[1] - 51) < goalGap
                // let flagC = Math.abs( list[2] - 34) < goalGap
                let flagA =  list[0]  < goalGap
                let flagB =  list[1]  < goalGap
                let flagC =  list[2]  < goalGap
                if(flagA && flagB && flagC){
                    goalLocationInit.push(v)
                }
                
            })
            // debugger
            
            if(goalLocationInit.length > 0 ){
                goalLocationInit.sort( (a,b) =>{
                    return b.sum - a.sum
                })
                
                let locationLimitList = []

                goalLocationInit.forEach( (v,i) => {
                    let goalLocation = v.locationList
                    if( i >= 0 && i <= 2){
                        console.log('goalLocationInit', )
                        let goalLocationLimit = getLocationLimit(goalLocation)
                        locationLimitList.push(goalLocationLimit)
                    }
                })
                let minXEnd = 1000
                locationLimitList.forEach( (v,i) =>{
                    let temp  = v.minX
                    if(temp < minXEnd){
                        minXEnd = temp
                    }
                })
                console.log('locationLimitList',locationLimitList)
                minX = minXEnd
                locationLimitList.forEach( (v,i) =>{
                    if(minXEnd ==  v.minX){
                        minY = v.minY
                        maxX = v.maxX
                        maxY = v.maxY
                    }
                })



    
                
                
                
                
                
            }
            
            let res = {
                width,
                height,
                minX,
                minY,
                maxX,
                maxY
            }
        
            return res
       }
        console.log('res',res)
    }catch(e){
        throw(e)
    }
    
}
async function handleImgToPostition(bigImg,smallImg){
    let result =  await handleImg(bigImg)
    let resultKey =  await handleImg(smallImg)
    console.log('handle result', result)
    console.log('handle resultKey', resultKey)
    const { minX, maxX, width } = result || {}
    if(maxX == 0){
        return false
    }else{
        const keyWidth = resultKey?.width
        let end = { minX, keyWidth }
        return end
    }
}
function getLocationLimit(goalLocation){
    let minX = 0
    let minY = 0
    let maxX = 0
    let maxY = 0

    goalLocation.forEach( v =>{
        let x = v[0]
        let y = v[1]
        if(!minX){
            minX = x
        }else if( x < minX ){
            minX = x
        }
        if(!maxY){
            maxY = y
        }else if( y > maxY ){
            maxY = y
        }
    })
    
    goalLocation.forEach( v =>{
        let x = v[0]
        let y = v[1]
        if( x - minX < 50){
            if(!minY){
                minY = y
            }else if( y < minY){
                minY = y
            }
        }
        if( maxY - y < 50){
            if(!maxX){
                maxX = x
            }else if( x > maxX){
                maxX = x
            }
        }
    })
    console.log('min', minX, maxX, minY, maxY)
    let goalRes = {}
    goalLocation.forEach( v =>{
        let val = v[0]
        let res = []
        if(!goalRes[val]){
            res.push(v[1])
            goalRes[val] = res
        }else{
            res = goalRes[val]
            res.push(v[1])
            goalRes[val] = res
        }
    })
    let res = {
        minX,
        minY,
        maxX,
        maxY
    }
    return res
    
}

module.exports = {
    handleImgToPostition
}


// a b c d [ 119, 88 ] [ 279, 134 ] [ 119, 126 ] [ 285, 115 ]
// efgh [ 157, 88 ] [ 119, 88 ] [ 279, 134 ] [ 281, 134 ]
// min 119 285 88 134
// end 119 285 77 134
// 1746
// #583223
// 88,51,35
// #583323
// 88,51,35
// #573121
// 87,49,33
// #583222
// 88,50,34