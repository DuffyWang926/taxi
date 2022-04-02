import { Component } from 'react'
import { View, TabBar, Swiper, SwiperItem, Image } from '@tarojs/components'
// import { AtIcon, AtButton, AtToast } from "taro-ui";
import './index.scss'
import { connect } from "../../utils/connect";
import {
  getHomeDetail,
} from "../../actions/home";
// import { AtTabBar } from "taro-ui";
import SearchCom from "../../components/SearchCom";
import HomeItem from "../../components/HomeItem";
import TapCom from "../../components/TapCom";

const homeImg = require("../../assets/thanks.jpg")
const mapStateToProps = (state)=>{
  const { home } = state
  const { itemList } = home
    return {
      itemList,
    }

}
const mapDispatchToProps = (dispatch) =>{
  return {
    getHomeDetail:(payload)=>{
      dispatch(getHomeDetail(payload));
    }
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class Index extends Component {

  componentDidMount(){
    this.props.getHomeDetail()
  }

  

  


  

  

  render () {
    const { itemList } = this.props
    debugger
    const itemListView = itemList.length > 0 && itemList.map( (v,i) =>{
      v.url = '/pages/productList/index'
      let res = (
        <HomeItem key={v.type} props={v}></HomeItem>
      )
      return res
    })
    const searchProps ={
      url:'/pages/search/index'
    }
    return (
      <View className='home'>
        <Swiper
          className='homeSwiper'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          vertical={false}
          circular
          indicatorDots
          autoplay>
          <SwiperItem key='SwiperItem1'>
            <Image src={homeImg} className='homeImg' ></Image>
          </SwiperItem>
          <SwiperItem key='SwiperItem2'>
            <Image src={homeImg} className='homeImg' ></Image>
          </SwiperItem>
        </Swiper>
        <View className='homeSearch'>
          <SearchCom props={searchProps}></SearchCom>
        </View>
        <View className='homeList'>
          { itemListView }
        </View>
        <TapCom></TapCom>
      </View>
    )
  }
}
