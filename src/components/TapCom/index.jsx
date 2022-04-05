import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import { Component } from 'react'

import "./index.scss";
import {
  changeHomeData
} from "../../actions/home";
import { connect } from "../../utils/connect";
const mapStateToProps = (state)=>{
  const { home } = state
  const {  tapCurrent } = home
    return {
      tapCurrent
    }

}
const mapDispatchToProps = (dispatch) =>{
  return {
    changeHomeData:(payload)=>{
      dispatch(changeHomeData(payload));
    }
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class TapCom extends Component{

  onTapClick = (val) =>{
    const { url, type } = val
    Taro.redirectTo({
      url
    });
    this.props.changeHomeData({ tapCurrent:type})
  }
  

  render () {
    const { tapCurrent  } = this.props || {}
    const tapList = [
      {
        url:`/pages/index/index`,
        type:0,
        title:'首页'
      },
      {
        url:`/pages/mine/index`,
        type:2,
        title:'我的'
      },
      

    ]

  const tapListNode = Array.isArray(tapList) && tapList.map((v,i) =>{
    const { title } = v
    let style = "tapItem"
    if(v.type == tapCurrent){
      style = "tapItem tapCurrent"
    }
    let res = (
      <View className={style} key={title} onClick={() =>{ this.onTapClick(v)}}>{title}</View>
    )
    return res
  })

  return (
    <View className="tapCom" >
      {tapListNode}
    </View>
  );

  } 
  
};

