import Taro from '@tarojs/taro'

// Taro.getStorage({
//   key: 'keywordsList'
// })

// export const formatNumber = (n) => {
//   n = n.toString()
//   return n[1] ? n : '0' + n
// }

export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 格式化时间戳为日期
// export const formatTimeStampToTime = (timestamp) => {
//   const date = new Date(timestamp);
//   const year = date.getFullYear();
//   const month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
//   const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
//   // const hour = date.getHours() + ':';
//   // const minutes = date.getMinutes() + ':';
//   // const second = date.getSeconds();
//   return `${year}-${month}-${day}`
// }