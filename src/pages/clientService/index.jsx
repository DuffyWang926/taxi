import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
// import { AtIcon, AtButton, AtToast } from "taro-ui";
import './index.scss'
import { connect } from "../../utils/connect";

const clientImg = require("../../assets/clientService.jpg")
const mapStateToProps = (state)=>{
  
}
const mapDispatchToProps = (dispatch) =>{
  return {
    
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class Index extends Component {

  

  

  render () {
    return (
      <View className='client'>
        <View className='clientTop'>
          请扫二维码咨询
        </View>
        <Image className='clientImg' src={clientImg}></Image>
      </View>
    )
  }
}
