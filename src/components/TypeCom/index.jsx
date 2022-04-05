import Taro from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";

import "./index.scss";
import ImageCom from "../ImageCom";
const eLeMeImg = require("../../assets/logo/logo1.jpg")
const meiTuanImg = require("../../assets/logo/logo2.png")
const didiImg = require("../../assets/logo/logo3.png")
const huaXiaoZhuImg = require("../../assets/logo/logo4.jpg")
const xingBaKeImg = require("../../assets/logo/logo5.jpg")
const kenDeJiImg = require("../../assets/logo/logo6.jpg")
const qianZhuImg = require("../../assets/logo/logo7.jpg")
const dianFeiImg = require("../../assets/logo/logo8.png")



const TypeItem = ({props}) => {
  const { url, typeId, title='' } = props
  let imgSrc = ''
  if(typeId == 1){
    imgSrc = eLeMeImg
  }else if(typeId == 2){
    imgSrc = meiTuanImg
  }else if(typeId == 3){
    imgSrc = didiImg
  }else if(typeId == 4){
    imgSrc = huaXiaoZhuImg
  }else if(typeId == 5){
    imgSrc = xingBaKeImg
  }else if(typeId == 6){
    imgSrc = kenDeJiImg
  }else if(typeId == 7){
    imgSrc = qianZhuImg
  }else if(typeId == 8){
    imgSrc = dianFeiImg
  }
  
  const typeClick = () =>{
    const { url } = props
    if(url){
      Taro.navigateTo({
        url
      });
    }
  }

  return (
    <View className="typeItem" onClick={ () =>{typeClick()}}>
      <Image className="itemTop" src={imgSrc}></Image>
      <View className="itemFoot" >
        {title}
      </View>
    </View>
  );
};

export default TypeItem
