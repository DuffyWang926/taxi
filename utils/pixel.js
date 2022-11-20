let getPixelPromise = require('get-pixel-promise')
const { add } = require('lodash')

async function handleImg(path, goalNums){
    let width = 0
    let height = 0
    let minX = 0
    let minY = 0
    let maxX = 0
    let maxY = 0
    try{
       let pixels = await getPixelPromise(path)
       if(pixels.data){
            let { shape } = pixels
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
            let repleatShallowList = []
            for(var i=0; i<len; ++i) {
                for(var j=0; j<lenj; ++j) {
                    for(var k=0; k<3; ++k) {
                        let pixel = pixels.get(i,j,k)
                        pList.push(pixel)
                    }
                    if( (pList[0] == 0) && (pList[1] == 0) && (pList[2] == 0)  ){

                    }else{
                        let shallowColorFlag = 90
                        let aShallowFlag = pList[0] < shallowColorFlag
                        let bShallowFlag = pList[1] < shallowColorFlag
                        let cShallowFlag = pList[2] < shallowColorFlag
                        let colorShallowFlag = aShallowFlag && bShallowFlag && cShallowFlag
                        if(colorShallowFlag && goalNums){
                                // debugger
                            //浅颜色处理
                            if( repleatShallowList.length == 0 ){
                                let locationObject ={}
                                let locationList = []
                                locationList.push([i,j])
                                locationObject[i] = {
                                    sum:1,
                                    start:j,
                                    end:j,
                                    locationList

                                }
                                let initShallow = {
                                    list:pList,
                                    colorList:[pList],
                                    sum:1,
                                    locationList:[[i,j]],
                                    locationObject,
                                    locationLimit:{
                                        minX:i,
                                        maxX:i,
                                        minY:j,
                                        maxY:j
                                    }
                                    
                                }
                                repleatShallowList.push(initShallow)
                            }else{
                                let isPush = false
                                
                                for(let m = 0, lenm = repleatShallowList.length; m < lenm; m ++){
                                    let { sum, locationLimit, locationObject } = repleatShallowList[m]
                                    let addflag = false
                                    let locationLimitNext = {}
                                    let locationGap = 10
                                    let isDelete = false
                                    //判断位置区域
                                    let { 
                                            minX,
                                            maxX,
                                            minY,
                                            maxY
                                        } = locationLimit
                                    if( sum == 0){
                                        addflag = true
                                        locationLimitNext = {
                                            minX:i,
                                            maxX:i,
                                            minY:j,
                                            maxY:j
                                        }

                                    }else{
                                        let flagX = true
                                        let flagY = true
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
                                        }
                                        if(flagX && flagY){
                                            addflag = true
                                            locationLimitNext = {
                                                minX,
                                                maxX,
                                                minY,
                                                maxY
                                            }

                                        }
                                    }
        
                                    if( addflag){

                                    // debugger
                                        isPush = true
                                        let lastIndex = i -1
                                        if( !locationObject[i]){
                                            let locationList = []
                                            locationList.push([i,j])
                                            locationObject[i] = {
                                                sum:1,
                                                start:j,
                                                end:j,
                                                locationList
                                            }
                                            
                                            if( locationObject[lastIndex]){
                                                const { sum } = locationObject[lastIndex]
                                                if(sum < 20){
                                                    isDelete = true 
                                                }else{
                                                    isDelete = false
                                                }
                                            }
                                        }else{
                                            let { sum, start, end, locationList} = locationObject[i]
                                            
                                            if( j < start ){
                                                start = j
                                            }else if ( j > end){
                                                end = j
                                            }
                                            sum += 1
                                            locationList.push([i,j])
                                            locationObject[i]={
                                                sum,
                                                start,
                                                end,
                                                locationList
                                            }
                                        }
                                        if(isDelete){
                                            let { 
                                                minX,
                                                maxX,
                                                minY,
                                                maxY
                                            } = locationLimitNext
                                            if( minX == lastIndex){
                                                minX = i
                                            }
                                            locationLimitNext ={
                                                minX,
                                                maxX,
                                                minY,
                                                maxY
                                            }
                                        }

                                        
                                        repleatShallowList[m].sum = +sum + 1
                                        repleatShallowList[m].locationList.push([i,j])
                                        repleatShallowList[m].locationLimit = locationLimitNext
                                        repleatShallowList[m].locationObject = locationObject
                                        
                                    }else{
                                        isPush = false
                                    }
                                }
                                
                                if(!isPush){
                                    let locationObject ={}
                                    let locationList = []
                                    locationList.push([i,j])
                                    locationObject[i] = {
                                        sum:1,
                                        start:j,
                                        end:j,
                                        locationList

                                    }
                                    let shallowTemp = {
                                        list:pList,
                                        colorList:[pList],
                                        sum:1,
                                        locationList:[[i,j]],
                                        locationObject,
                                        locationLimit:{
                                            minX:i,
                                            maxX:i,
                                            minY:j,
                                            maxY:j
                                        }
                                        
                                    }
                                    repleatShallowList.push(shallowTemp)
        
                                }

                            }
                            
                            

                        }else{
                            if( repleatObjList.length == 0 ){
                                let init = {
                                    list:pList,
                                    colorList:[pList],
                                    sum:1,
                                    locationList:[[i,j]],
                                    locationLimit:{
                                        minX:-1,
                                        maxX:-1,
                                        minY:-1,
                                        maxY:-1
                                    }
                                    
                                }
                                repleatObjList.push(init)
    
                            }else{
                                let isPush = false
                                for(let m = 0, lenm = repleatObjList.length; m < lenm; m ++){
                                    let { sum } = repleatObjList[m]
                                    let addflag = false
                                    //比较色值，判断坐标是否连续
                                    let locationLimit = repleatObjList[m].locationLimit
                                    let listInit = repleatObjList[m].list
                                    let locationLimitNext = {}
                                    let colorGap = 10
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
                                        if( sum === 1){
                                            addflag = true
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
                                            }
                                            // else{
                                            //     flagX = true
                                            // }
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
                                            }
                                            // else{
                                            //     flagY = true
                                            // }
                                            if(flagX && flagY){
                                                addflag = true
                                                locationLimitNext = {
                                                    minX,
                                                    maxX,
                                                    minY,
                                                    maxY
                                                }
        
                                            }
        
                                        }
                                        
        
                                    }
                                    if( addflag){
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
                                if(!isPush && repleatObjList.length > 1){
                                    let tempRepleat = {
                                        list:pList,
                                        colorList:[pList],
                                        sum:1,
                                        locationList:[[i,j]],
                                        locationLimit:{
                                            minX:-1,
                                            maxX:-1,
                                            minY:-1,
                                            maxY:-1
                                        }
                                        
                                    }
                                    repleatObjList.push(tempRepleat)
                                }

                            }
                            

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
            let goalLocationInit = []
            let goalGap = 90
            repleatObjList.forEach( (v,i) =>{
                let { list, sum } = v
                let flagA =  list[0]  < goalGap
                let flagB =  list[1]  < goalGap
                let flagC =  list[2]  < goalGap
                if(flagA && flagB && flagC){
                    goalLocationInit.push(v)
                }
            })
            
            if(goalLocationInit.length > 0 ){
                let locationLimitList = []
                goalLocationInit.forEach( (v,i) => {
                    let goalLocation = v.locationList
                    if( i >= 0 && i <= 2){
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
                minX = minXEnd
                locationLimitList.forEach( (v,i) =>{
                    if(minXEnd ==  v.minX){
                        minY = v.minY
                        maxX = v.maxX
                        maxY = v.maxY
                    }
                })
            }
            if(goalNums){
                // console.log(repleatShallowList)
                // debugger
                repleatShallowList.forEach( (v,i) =>{
                    const { locationLimit, sum, locationObject } = v
                    let objectKeys = Object.keys(locationObject)
                    let len = objectKeys.length-1
                    let yEndObj = {}
                    let yEnd = ''
                    let tempMinX = ''
                    while(len){
                        const { sum, end } = locationObject[objectKeys[len]]
                        if(yEnd){
                            if(sum > 18){
                                
                                if( yEnd - end < 1){
                                    if( objectKeys[len] < tempMinX){
                                        tempMinX = objectKeys[len] 
                                        // debugger
                                    }
                                    
                                }
                            }

                        }else{
                            if(sum > 40){
                                if( !yEndObj[end]){
                                    yEndObj[end] = 1
                                }else{
                                    yEndObj[end] += 1
                                    if( yEndObj[end] > 5){
                                        yEnd = end
                                        tempMinX = objectKeys[len]
                                    }
                                }
                            }

                        }

                        len--
                    }
                    // if(Math.abs( sum - goalNums) < 500){
                        minX = tempMinX
                    // }
                    // debugger

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
    }catch(e){
        throw(e)
    }
    
}
async function handleImgToPostition(bigImg,smallImg){
    let resultKey =  await handleImg(smallImg)
    const keyWidth = resultKey?.width
    const keyheight = resultKey?.height
    const goalNums = keyWidth * keyheight

    let result =  await handleImg(bigImg, goalNums)
    
    const { minX, maxX, width, height } = result || {}
    if(minX == 0){
        return false
    }else{
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