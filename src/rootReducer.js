import { drugsReducer } from './main-area/reducer.js'
import { filtersReducer } from './filters/reducer.js'
import { Record } from 'immutable';

export const initialStateShape = new Record({
  drugs: drugsReducer(undefined,{type:'@@getInitialShape'}),
  filters: filtersReducer(undefined,{type:'@@getInitialShape'}),
});

export const initialState = new initialStateShape({});

const reducers = { 
  drugs: drugsReducer,
  filters: filtersReducer,
}

export default function rootReducer(state=initialState, action={type:'@@ERROR'}){
  return Object.keys(reducers).reduce(
    (carry,key)=>reducers[key](carry, action)
    , initialState);
}