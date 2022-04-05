import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'

import { View, Input, Image } from '@tarojs/components'
import './index.scss'
import { connect } from "../../utils/connect";
import {
  postLogin
} from "../../actions/home";
import getUrlCode from "../../utils/getUrlCode";

const logoImg = require("../../assets/logo/logo.jpg")
const mapStateToProps = (state)=>{
  
    return {
      
    }

}
const mapDispatchToProps = (dispatch) =>{
  return {
    postLogin:(payload)=>{
      dispatch(postLogin(payload));
    }
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class Index extends Component {

  constructor(){
    super()
    const { oldUrl } = getCurrentInstance()?.router?.params || {};
    this.state={
      oldUrl,
      upCode:''
    }
  }

  componentDidMount(){
    let url = window.location.href
    let nextList = url.split('?')
    let nextUrl = nextList.length > 0 && nextList[1]
    let paramsList = nextUrl && nextUrl.split('&')
    let upCode = ''
    Array.isArray(paramsList) && paramsList.map( (v,i) =>{
      let endList = v && v.split('=')
      if(endList.length > 0){
        if(endList[0] == 'upCode'){
          upCode = endList[1]
        }
      }
      
    })
    this.setState({
      upCode
    })
    sessionStorage.setItem('upCode',upCode)
    
  }

  

  onInputChange = (e) =>{
    let val = e.target.value
    sessionStorage.setItem('upCode',val)

  }

  

  render () {

    // let appid = 'wxe52a97ff5cbcfc9a'
    // let redirectUrl = 'https://www.mengshikejiwang.top/#/pages/mine/index'
    // let encodeUrl = encodeURIComponent(redirectUrl)
    // let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeUrl}&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`

    // const { oldUrl = '/pages/index/index', upCode } = this.state
    const { oldUrl = '/pages/mine/index', upCode } = this.state
    let redirectUrl = 'https://www.mengshikejiwang.top/#' + oldUrl + '?upCode=' + upCode
    console.log('redirectUrl', redirectUrl)
    let REDIRECT_URI = encodeURIComponent(redirectUrl)
    console.log('REDIRECT_URI', REDIRECT_URI)
    
    // let url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx512bb00bd04fa445&redirect_uri=https%3A%2F%2Fwx.lanjingv.com%2Fh5%2F%23%2Fpages%2Flogin%2Flogin&response_type=code&scope=snsapi_userinfo&state=123&connect_redirect=1#wechat_redirect'
    let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe52a97ff5cbcfc9a&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
    
    return (
      <View className='login'>
        <View className='loginTop'>
          登录
        </View>
        <View className='loginMid'>
          <Image className='midImg' src={logoImg} ></Image>
          <View className='midTitle'>
            打车券每天领
          </View>
          <View className='midTip'>
            省一点,赚一点,越赚越快乐
          </View>
        </View>
        <View className='recommend' >
          <span>推荐码:</span>
          <View >
            <Input onInput={this.onInputChange} value={upCode} className="recommendInput"></Input>
            <span className='recommendTip'>填写推荐码(推荐人的ID)会有更多佣金</span>
          </View>
        </View>
        <View className='loginBtn' >
          <a href={url} className='loginText'>微信登录</a>
        </View>
      </View>
    )
  }
}
