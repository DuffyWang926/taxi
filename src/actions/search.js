  
  import api from '../services/api'
  export const postSearchList = (payload) => {
    return dispatch => {
      api.post('/search',payload).then((res) => {
        dispatch({
          type: 'HOMEDETAIL',
          payload: res
        })
      })
    }
  }
  
