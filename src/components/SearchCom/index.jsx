import Taro from "@tarojs/taro";
import { View, Input, Text } from "@tarojs/components";
import { useState } from "react";
import "./index.scss";



const SearchCom = ({props}) => {
  const { url, searchClick, changeTab } = props
  const [inputVal, setInputVal] = useState("");
  const boxClick = () =>{
    if(url){
      Taro.redirectTo({
        url
      });
      changeTab()
    }
  }
  const inputChange = (e) =>{
    const { value } = e.detail;
    setInputVal(value)
  }

  const onSearchClick = () =>{
    if(url){
      boxClick
    }else{
      searchClick(inputVal)
    }
  }

  return (
    <View className="searchBox" onClick={ () =>{boxClick()}}>
      <Input 
        className="searchInput"
        placeholder="请输入关键字"
        onInput={(e) => {
          inputChange(e);
        }}
      ></Input>
      <Text
        className="searchTxt"
        onClick={ () =>{onSearchClick()}}
      >搜索</Text>
    </View>
  );
};

export default SearchCom
