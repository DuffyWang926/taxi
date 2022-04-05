import { combineReducers } from 'redux'
import home from './home'
import search from './search'
import mine from './mine'


export default combineReducers({
  home,
  search,
  mine
})