

  
  const INITIAL_STATE = {
    imgData:'',
  }
  
  export default function home (state = INITIAL_STATE, action) {
    if(action.type ==  "CODEIMG"){
      const { data = {} } = action.payload
      const { imgData } = data
     

      return {
        ...state,
        imgData,
      }

    }
    return state
    
  }
  