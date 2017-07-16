const express = require('express')
const app = express();
const fs = require('fs');
const database = require('../src/database.json');

function readJSONFile(filename, callback) {
  fs.readFile(filename, function (err, data) {
    if(err) {
      callback(err);
      return;
    }
    try {
      callback(null, JSON.parse(data));
    } catch(exception) {
      callback(exception);
    }
  });
}
const getEmptyDb = () => ({
  forms:{},
  companies:{},
  groups:{},
  ingredients:{},
  sizes:{},
  drugs:{},
});
function intersect(a, b) {
  if(Array.isArray(a) && Array.isArray(b))return a.filter(Set.prototype.has, new Set(b));
  return (a.drugs||[]).filter(ai=>b[ai]?true:false);
}

function HomeRoute(req, res, nolimit){
   console.log('A request to get database, will send him everything');
  let filters = [];
  
  Object.keys(req.query||{}).map(q=>[q,req.query[q].split(',')]).map(([key,val])=>{
    console.log(key+' filters was',filters);
    
    let n =  val.reduce(
        (carry,item)=>carry.concat( (database[key][item]||{}).drugs ),[]).filter(Boolean)
    filters = (filters.length) ? intersect(n, filters) : n;
    
    console.log('filters became '+n.length,filters);
  })

  if(req.params.name){
    filters = req.params.name.split(',');
  }
  
  const ids = filters.length ? filters : nolimit===true ?  Object.keys(database.drugs) : Object.keys(database.drugs).slice(0,100);
  return getDb(ids);
}

function getDb(ids){
  const data = getEmptyDb();
  const lookup = ids.reduce((c,i)=>(c[i]=true,c),{});
  ids.reduce((carry,id)=>{
    let drug = database.drugs[id];
    carry.drugs[id] = drug;
    carry.forms[drug.form_id] = Object.assign({},database.forms[drug.form_id],{drugs:intersect(database.forms[drug.form_id],lookup)});
    carry.companies[drug.company_id] = Object.assign({},database.companies[drug.company_id],{drugs:intersect(database.companies[drug.company_id],lookup)});
    carry.groups[drug.group_id] = Object.assign({},database.groups[drug.group_id],{drugs:intersect(database.groups[drug.group_id],lookup)});
    carry.sizes[drug.size_id] = Object.assign({},database.sizes[drug.size_id],{drugs:intersect(database.sizes[drug.size_id],lookup)});
    drug.ingredients.map(i=>{
      carry.ingredients[i]  = Object.assign({},database.ingredients[i],{drugs:intersect(database.ingredients[i],lookup)});
    });
    carry.sizes[drug.size_id] = Object.assign({},database.sizes[drug.size_id],{drugs:intersect(database.sizes[drug.size_id],lookup)});
    return carry;
  },data)
  return data;
}
app.get('/:name?/:stats?', function (req, res) {
  if(req.params.stats){
    const db = HomeRoute(req, res);
    db.stats = Object.keys(db).reduce((carry,i)=>Object.assign({},carry,{[i]:Object.keys(db[i]).length}),{});
    res.send(
      db
    );  
  } else {
    res.send(HomeRoute(req, res));
  }
})

app.get('/stats', function (req, res) {
  const db = HomeRoute(req,res,true);
  res.send(
    Object.keys(db).reduce((carry,i)=>Object.assign({},carry,{[i]:Object.keys(db[i]).length}),{})
  )
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})