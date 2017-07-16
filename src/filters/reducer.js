import {Map, Record, List} from 'immutable';
import { types } from '../constants';

const filtersShape = Record({
  name: String(''),
  price: List([0,1]),
  groups: Map({}),
  forms: Map({}),
  company: Map({}),
  ingredients: Map({}),
})

export const initialState = new filtersShape({});

export function filtersReducer(state = initialState, action){
  if(action.type === types.CLEAR) return initialState;

  if(action.type === types.UPDATE) return state.set(action.key, action.value);
  
  return state;
}