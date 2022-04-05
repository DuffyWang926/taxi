import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
// import { AtIcon, AtButton, AtToast } from "taro-ui";
import './index.scss'
import { connect } from "../../utils/connect";

import { history } from '@tarojs/router'
const serviceImg = require("../../assets/service.jpg")
const mapStateToProps = (state)=>{
  
    return {
     
    }

}
const mapDispatchToProps = (dispatch) =>{
  return {
    
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class Index extends Component {

  render () {
    const title = '提现'
    return (
      <View className='withdraw'>
        <View className='withdrawTop'>
          {title}
        </View>
        <View className='withdrawMid'>
          <View className='midTip'>
            请添加客服微信
          </View>
          <View className='midList'>
            <Image className='midImg' src={serviceImg}></Image>
          </View>
        </View>
      </View>
    )
  }
}
