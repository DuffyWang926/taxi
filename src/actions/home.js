  
import api from '../services/api'
export const postLogin = (payload) => {
  return async dispatch => {
    var userId = sessionStorage.getItem("userId");
    // if(userId){
    //   let res = await api.post('/postUserInfo',{
    //     userId
    //   })
    //   dispatch({
    //     type: 'POSTUSERINFO',
    //     payload: res
    //   })

    // }else{
      let res = await api.post('/login',payload)
      dispatch({
        type: 'LOGIN',
        payload: res
      })
    // }
  }
}

export const changeHomeData = (payload) => {
  return {
    type: 'CHANGEHOMEDATA',
    payload
  }
}

export const recordTime = (payload) => {
  return async dispatch => {
    let res = await api.post('/recordTime',payload)
    debugger
    
    
  }
}
  
