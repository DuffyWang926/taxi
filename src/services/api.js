import Taro from '@tarojs/taro'
import { HTTP_STATUS } from '../constants/status'
import { logError } from '../utils/error'

// import {baseUrl} from '../../config'

const baseUrl= 'https://www.mengshikejiwang.top/taxiapi'
// const baseUrl= 'http://127.0.0.1:3001/taxiapi'


export default {
  baseOptions(params, method = 'GET') {
    let { url, data } = params
    let contentType = 'application/json'
    contentType = params.contentType || contentType
    
    const setCookie = (res) => {
      if (res.cookies && res.cookies.length > 0 && url.indexOf('login/cellphone') !== -1) {
        let cookies = '';
        res.cookies.forEach((cookie, index) => {
          // windows的微信开发者工具返回的是cookie格式是有name和value的,在mac上是只是字符串的
          if (cookie.name && cookie.value) {
            cookies += index === res.cookies.length - 1 ? `${cookie.name}=${cookie.value};expires=${cookie.expires};path=${cookie.path}` : `${cookie.name}=${cookie.value};`
          } else {
            cookies += `${cookie}`
          }
        });
        Taro.setStorageSync('cookies', cookies)
      }
      
    }
    data = {
      ...data,
      timestamp: new Date().getTime()
    }
    const option = {
      url: url.indexOf('http') !== -1 ? url : baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': contentType,
        cookie: Taro.getStorageSync('cookies')
      },
      xhrFields: { withCredentials: true },
      success(res) {
        console.log('res', res)
        setCookie(res)
        if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
          return logError('api', '请求资源不存在')
        } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
          return logError('api', '服务端出现了问题')
        } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
          return logError('api', '没有权限访问')
        } else if (res.statusCode === HTTP_STATUS.AUTHENTICATE) {
          Taro.clearStorage()
          Taro.navigateTo({
            url: '/pages/login/index'
          })
          return logError('api', '请先登录')
        } else if (res.statusCode === HTTP_STATUS.SUCCESS) {
          let result = res.data
          return result
        }
      },
      error(e) {
        logError('api', '请求接口出现问题', e)
      }
    }
    
    let next = new Promise( (res,rej) =>{
      Taro.request(option).then((result) =>{
        res(result.data)
      })
    })
    // return Taro.request(option)
    return next
  },
  get(url, data) {
    let option = { url, data }
    return this.baseOptions(option)
  },
  post: function (url, data, contentType) {
    let params = { url, data, contentType }
    return this.baseOptions(params, 'POST')
  },
  put(url, data) {
    let option = { url, data }
    return this.baseOptions(option, 'PUT')
  },
  delete(url, data) {
    let option = { url, data }
    return this.baseOptions(option, 'DELETE')
  }
}
