import { Component } from 'react'
import Taro from "@tarojs/taro";
import { View, TabBar, Swiper, SwiperItem, Image } from '@tarojs/components'
// import { AtIcon, AtButton, AtToast } from "taro-ui";
import './index.scss'
import { connect } from "../../utils/connect";
import {
  changeHomeData,
  postLogin

} from "../../actions/home";

// import { AtTabBar } from "taro-ui";
import SearchCom from "../../components/SearchCom";
import TypeCom from "../../components/TypeCom";
import HomeItem from "../../components/HomeItem";
import TapCom from "../../components/TapCom";
const bannerImgA = require("../../assets/banner/banner1.png")
const bannerImgB = require("../../assets/banner/banner2.png")
const bannerImgC = require("../../assets/banner/banner3.png")
const bannerImgD = require("../../assets/banner/banner4.jpg")

const homeImg = require("../../assets/thanks.jpg")
const mapStateToProps = (state)=>{
  const { home } = state
  const { itemList, tapCurrent } = home
    return {
      itemList,
      tapCurrent
    }

}
const mapDispatchToProps = (dispatch) =>{
  return {
    changeHomeData:(payload)=>{
      dispatch(changeHomeData(payload));
    },
    postLogin:(payload)=>{
      dispatch(postLogin(payload));
    },
    
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class Index extends Component {

  constructor(props) {
    super(props);
    const bannerList = [
      {
        url:'pages/eLeMe/index',
        imgSrc:bannerImgA
      },
      {
        url:'pages/meiTuan/index',
        imgSrc:bannerImgB
      },
      {
        url:'pages/diDi/index',
        imgSrc:bannerImgC
      },
      {
        url:'pages/huaXiaoZhu/index',
        imgSrc:bannerImgD
      },
    ]

    this.state={
      bannerList,
      bannerCurrent:0
    }
  }

  componentDidMount(){
    let url = window.location.href
    let code = ''
    let nextList = url.split('?')
    let nextUrl = nextList.length > 0 && nextList[1]
    let paramsList = nextUrl && nextUrl.split('&')
    let urlUpCode = ''
    Array.isArray(paramsList) && paramsList.map( (v,i) =>{
      let endList = v && v.split('=')
      if(endList.length > 0){
        if(endList[0] == 'upCode'){
          urlUpCode = endList[1]
        }else if(endList[0] == 'code'){
          code = endList[1]
        }
      }
      
    })
    let upCode = sessionStorage.getItem('upCode') || urlUpCode

    if(code){
      this.props.postLogin({code,upCode})
    }
  }

  
 
  changeTab= ()=>{
    this.props.changeHomeData({ tapCurrent:1})
  }
  onBannerClick = (obj) => {
    const { bannerList, bannerCurrent } = this.state
    let  url  = ''
    Array.isArray(bannerList) && bannerList.map( (v,i) =>{
      if(i == bannerCurrent){
        url = v.url
      }
    })
    if(url){
      Taro.navigateTo({
        url
      });
    }

  }
  onBannerChange = (e) => {
    const { current } = e.detail
    this.setState({
      bannerCurrent:current
    })

  }

  


  

  render () {
    const { bannerList } = this.state
    
    const searchProps ={
      url:'/pages/search/index',
      changeTab:this.changeTab
    }
    const typeProps =[
      {
        typeId:1,
        url:'pages/eLeMe/index',
        title:'饿了么'
      },
      {
        typeId:2,
        url:'pages/meiTuan/index',
        title:'美团'
      },
      {
        typeId:3,
        url:'pages/diDi/index',
        title:'滴滴打车'
      },
      {
        typeId:4,
        url:'pages/huaXiaoZhu/index',
        title:'花小猪打车'
      },
      {
        typeId:5,
        url:'pages/xingBaKe/index',
        title:'星巴克'
      },
      {
        typeId:6,
        url:'pages/kenDeJi/index',
        title:'肯德基'
      },
      {
        typeId:7,
        url:'pages/qianZhu/index',
        title:'千猪电影'
      },
      {
        typeId:8,
        url:'pages/dianFei/index',
        title:'充电费'
      },
    ]
    const typeListCom = Array.isArray(typeProps) && typeProps.map( (v,i) =>{
      let res = (<TypeCom props={v} key={i + "type"}></TypeCom>)
      return res
    })
    

    const bannerListCom = Array.isArray(bannerList) && bannerList.map( (v,i) =>{
      const {imgSrc } = v
      let res = (<SwiperItem key='SwiperItem1' key={i + 'swiperItem'} >
      <Image src={imgSrc} className='homeImg' ></Image>
    </SwiperItem>)
      return res
    })
    return (
      <View className='home'>
        <Swiper
          onClick={ () => this.onBannerClick()}
          onChange={ (e) => this.onBannerChange(e)}
          className='homeSwiper'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          vertical={false}
          circular
          indicatorDots
          autoplay>
          {bannerListCom}
        </Swiper>
        {/* <View className='homeSearch'>
          <SearchCom props={searchProps}></SearchCom>
        </View> */}
        <View className='typeList'>
          {typeListCom}
        </View>
        
        <TapCom ></TapCom>
      </View>
    )
  }
}
