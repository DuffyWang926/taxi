import { View, Image } from "@tarojs/components";
import Taro, { getCurrentInstance } from '@tarojs/taro'
import "./index.scss";
const reMenImgA = require("../../assets/product/1.jpg")
const reMenImgB = require("../../assets/product/2.jpg")
const reMenImgC = require("../../assets/product/3.jpg")
const zuiXinImgA = require("../../assets/product/4.jpg")
const zuiXinImgB = require("../../assets/product/5.jpg")
const zuiXinImgC = require("../../assets/product/6.jpg")

const ImageCom = ({props}) => {
  const { imgId, imgUrl  } = props

  const onImgClick = () =>{
    Taro.navigateTo({
      url:`/pages/product/index?id=${imgId}`
    });
    
  }
  let urlEnd = ''
  if(imgUrl == 1){
    urlEnd = reMenImgA
  }else if(imgUrl == 2){
    urlEnd = reMenImgB
  }else if(imgUrl == 3){
    urlEnd = reMenImgC
  }else if(imgUrl == 4){
    urlEnd = zuiXinImgA
  }else if(imgUrl == 5){
    urlEnd = zuiXinImgB
  }else if(imgUrl == 6){
    urlEnd = zuiXinImgC
  }else{
    urlEnd = imgUrl
  }



  return (
    <View className="imageCom" >
      <Image
       src={urlEnd}
       key={urlEnd}
       onClick = { () => {onImgClick()}}
       className="imageComImg"
      ></Image>
    </View>
  );
};

export default ImageCom
