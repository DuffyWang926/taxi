import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
// import { AtIcon, AtButton, AtToast } from "taro-ui";
import './index.scss'
import { connect } from "../../utils/connect";

import { history } from '@tarojs/router'
import getUrlCode from "../../utils/getUrlCode";
import {
  postLogin,
  recordTime
} from "../../actions/home";
const bannerImg = require("../../assets/banner/banner3.png")
const mapStateToProps = (state)=>{
  const { home } = state
  const { userId } = home
  return {
    userId
  }

}
const mapDispatchToProps = (dispatch) =>{
  return {
    postLogin:(payload)=>{
      dispatch(postLogin(payload));
    },
    recordTime:(payload)=>{
      dispatch(recordTime(payload));
    },
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class Index extends Component {

  componentDidMount(){
    let url = window.location.href
    let code = getUrlCode(url)
    if(code){
      this.props.postLogin({code})
    }
  }



  onRedClick = () =>{
    // const { userId } = this.props
    let userId = sessionStorage.getItem('userId')
    const { path } = getCurrentInstance()?.router || {};
    if(!userId){
      let url = 'pages/login/index?oldUrl=' + path
      Taro.navigateTo({
        url
      })
    }else{
      let clickTime = new Date().getTime() + ''
      this.props.recordTime({userId, clickTime})
      let url = "https://activity01.yunzhanxinxi.com/link/6dfca0bd3c0f799d36b2666973e1c42b"
      window.location.href = url
    }
    
  }

  

  render () {
    const title = '滴滴'
    return (
      <View className='eLeMe'>
        <View className='eLeMeTop'>
          {title}
        </View>
        <Image className='eLeMeMid' src={bannerImg}></Image>

        <View className='eLeMeBtn' onClick={() => this.onRedClick()}>
          领红包打车
          {/* <a href="https://activity01.yunzhanxinxi.com/link/6dfca0bd3c0f799d36b2666973e1c42b" className='redText'>领红包打车</a> */}
        </View>
      </View>
    )
  }
}
