import { Component } from 'react'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
// import { AtIcon, AtButton, AtToast } from "taro-ui";
import './index.scss'
import { connect } from "../../utils/connect";
import {
  postSearchList,
} from "../../actions/search";
import SearchCom from "../../components/SearchCom";
import ImageCom from "../../components/ImageCom";
import TapCom from "../../components/TapCom";
const homeImg = require("../../assets/thanks.jpg")
const mapStateToProps = (state)=>{
  const { search } = state
  const { imgList } = search
    return {
      imgList,
    }

}
const mapDispatchToProps = (dispatch) =>{
  return {
    postSearchList:(payload)=>{
      dispatch(postSearchList(payload));
    }
  }
}
@connect( mapStateToProps , mapDispatchToProps )
export default class Index extends Component {

  componentDidMount(){
    this.props.postSearchList()
  }
 
  searchClick = (val) =>{
    this.props.postSearchList({
      keyword:val
    })

  }
 
  

  render () {
    const { imgList } = this.props
    let imgListView = imgList.length > 0 && imgList.map( (v,i) =>{
      let res = (
        <ImageCom 
          className='searchImg'
          props={v}
        ></ImageCom>
      )
      return res
    })
    const searchProps ={
      searchClick:this.searchClick
    }
    
    return (
      <View className='search'>
        <View className='searchTop'>
          <SearchCom props={searchProps}></SearchCom>
        </View>
        <View className='searchList'>
          { imgListView }
        </View>
        <TapCom ></TapCom>
      </View>
    )
  }
}
