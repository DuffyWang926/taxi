import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'

import { View, Image } from '@tarojs/components'
import './index.scss'
import { connect } from "../../utils/connect";
import {
  getCodeImg

} from "../../actions/mine";
const mapStateToProps = (state)=>{
  const { mine, home } = state
  const { userInfo } = home
  const { userCode } = userInfo
  const { imgData } = mine
  return {
    imgData,
    userCode
  }

}
const mapDispatchToProps = (dispatch) =>{
  return {
    getCodeImg:(payload)=>{
      dispatch(getCodeImg(payload));
    },
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class Index extends Component {

  constructor(){
    super()
    
  }
  componentDidMount(){
    const { userCode } = this.props
    let url = 'https://www.mengshikejiwang.top/#/pages/login/index?upCode='  + userCode
    this.props.getCodeImg({url})
  }


  render () {
    const { imgData } =this.props
    
    return (
      <View className='share'>
        <View className='shareTop'>
         请用微信扫二维码
        </View>
        <View className='shareCon'>
          <Image src={imgData}></Image>
        </View>
      </View>
    )
  }
}
