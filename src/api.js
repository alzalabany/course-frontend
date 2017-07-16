import {create} from 'apisauce'

// define the api
const api = create({
  baseURL: 'http://localhost:1233',
  headers: {'Accept': 'application/json'}
})

export default api;
