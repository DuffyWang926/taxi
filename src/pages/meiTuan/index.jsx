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
const bannerImg = require("../../assets/banner/banner2.png")
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
    const { userId } = this.props
    const { path } = getCurrentInstance()?.router || {};
    if(!userId){
      let url = 'pages/login/index?oldUrl=' + path
      Taro.navigateTo({
        url
      })
    }else{
      let clickTime = new Date().getTime() + ''
      this.props.recordTime({userId, clickTime})
      let url = "https://activity01.yunzhanxinxi.com/link/426441e5060dafbf0a675c0c19a3b74a"
      // let url = 'https://click.meituan.com/t?t=1&c=1&p=OWMpZ-uzIFOVe6JyOONs3VzolOCHG2b7aH-XB09jFlbbAeBCxOxg6qjsKAN88woEkZYzZDP64QRosOy-Pv9ZI_OIA_uJvyrPLDW4guO-wTEoMJGll3yyPnhntqf2jLDs2DEAEewf2rZAVl6wn1Vi5uKxpLK7qljPx3XlEIqOxbfr5Vc_18wRTFRw0PexH1KOEdlIsv988GLPtscJpJBJSAjnYs9YcBibZndKENj3mZmLidarb34UOVJ0swx4SHouIGbd3U8IqiFqd6jriv4rjtBC8mcfb2U6Vb3bR7dv0YDCLD4NrJc9mZlNwODwxXeUmXecmg68JQJ0-gSY-iOil84inHivR1W3pUs2sSjL-zo_Jzek-0e2Coas1a40FRe9cG7B7Tx6TIc_Dr7FZo893dI2_B8-8ciOCvmmgTkhmpQHqqyBBIdjadVhjoujoLV6gAUBHM4CKqjwe8utXvFrtlb79ccTzIkMI9tv-lKtx7rtGm89xhz9VPtVvGcC8rKk5vqf7tfBHpbW6GigpPkjYW15d_IJ_Flm5yTCL7Fe6H8k5JVG8BFfi4ugHQ4351-E5V07ssuTdVS_W57dB7-kNXCMa7bEFPic7c5CVEIt_TM'
      window.location.href = url
    }
  }

  render () {
    const title = '美团'
    return (
      <View className='eLeMe'>
        <View className='eLeMeTop'>
          {title}
        </View>
        <Image className='eLeMeMid' src={bannerImg}></Image>

        <View className='eLeMeBtn' onClick={() => this.onRedClick()}>
          领红包点外卖
          {/* <a href="https://activity01.yunzhanxinxi.com/link/426441e5060dafbf0a675c0c19a3b74a" className='redText'>领红包点外卖</a> */}
        </View>
      </View>
    )
  }
}
