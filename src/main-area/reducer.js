import {Map} from 'immutable'
import {types} from '../constants';

export function drugsReducer(state={}, action){
  if(action.type === types.LOAD_DRUGS) return Map(action.payload);
  
  return state;
}