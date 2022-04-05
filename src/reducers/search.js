

  
  const INITIAL_STATE = {
    imgList: [
          {
            id:'1',
            imgUrl:1,
            type:'',
            name:'',
            emotion:''
          },
          {
            id:'2',
            imgUrl:2,
            type:'',
            name:'',
            emotion:''
          },
          {
            id:'3',
            imgUrl:3,
            type:'',
            name:'',
            emotion:''
          }
        ]
  }
  
  export default function home (state = INITIAL_STATE, action) {
    switch (action.type) {
      case "HOMEDETAIL":
        const { data } = action.payload
        const { imgList=[], imgListNext=[]} = data
        return {
          ...state,
          imgList
        }
      default:
        return state
    }
  }
  