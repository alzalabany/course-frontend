const express = require('express')
const apicache = require('apicache');
const app = express();
const database = require('./database.json');


const cache = apicache.middleware
app.use(cache('5 minutes'))

const getEmptyDb = () => ({
  forms:{},
  companies:{},
  groups:{},
  ingredients:{},
  sizes:{},
  drugs:{},
});

app.get('/download', function (req, res) {
  res.send(Object.assign({},database,{drugs:undefined}));
})

function getPartOfDatabase(array_of_drug_ids){
  const data = getEmptyDb();
  return array_of_drug_ids.reduce(function reducer(carry,id){
    let drug = database.drugs[id];
    carry.drugs[id] = drug;
    carry.forms[drug.form_id] = Object.assign({}, database.forms[drug.form_id],{drugs:undefined});
    carry.companies[drug.company_id] = Object.assign({}, database.companies[drug.company_id],{drugs:undefined});
    carry.groups[drug.group_id] = Object.assign({}, database.groups[drug.group_id],{drugs:undefined});
    carry.sizes[drug.size_id] = Object.assign({}, database.sizes[drug.size_id],{drugs:undefined});
    carry.ingredients[id] = drug.ingredients.reduce((all,i)=>Object.assign(all,{
      [i]: Object.assign({}, database.ingredients[i],{drugs:undefined})
    }), {});
    
    return carry;
  },data)
}
function analyze(db){
  return {};
}

app.get('/', function (req, res) {
  const allowed_filters = ['companies','forms','groups','sizes'];
  const filters_map = {
    'companies':'company_id',
    'forms':'form_id',
    'groups':'group_id',
    'sizes':'size_id'
  };
  let filters = allowed_filters.filter(name=>Boolean(req.query[name]));
  const query = filters.reduce((q,i)=>Object.assign(q,{[filters_map[i]]:req.query[i].split(',').map(Number)}),{});

  const page = isNaN(Number(req.query.page)) ? 1 : Number(req.query.page);
  const count = isNaN(Number(req.query.count)) ? 100 : Number(req.query.count) > 100 ? 100 : Number(req.query.count);
  const lower = (page-1) * count;
  const upper = page * count;
  let drug_ids = Object.keys(database.drugs);
  
  const arrays = [];
  filters.map(i=>{
    arrays.push( 
      [].concat.apply([],  
        query[filters_map[i]].map(x=>database[i][x].drugs)
      )
    )
  })
  var shortest = arrays.reduce((p,c)=>p.length>c.length?c:p,drug_ids);
  
  //step2 make sure this list pass all filters
  const drugs = shortest.filter(id=>{
    const score = arrays.filter(list=>list.includes(id)).length;
    //console.log(`id ${id} ${score===arrays.length?'pased':'failed'} with score:[${score}]/${arrays.length}`);
    
    if(req.query.price){
      const prices = req.query.price.split(':');
      if(prices.length===2){
        if(
          database.drugs[id].price > prices[1] ||
          database.drugs[id].price < prices[0]
        )return false;
      }
    }
    if(req.query.name){
      if(
          database.drugs[id].tradename.toLowerCase().indexOf(req.query.name.toLowerCase()) === -1
      )return false;
    }
    
    return score===arrays.length;
  });
  
  //step3 make sure this list pass price filter
  console.log('returning list of',drugs.length);
  const db = getPartOfDatabase(drugs.slice( lower, upper));
  db.length = drugs.length;
  db.count = count;
  db.page = page;
  db.offset = page * count;
  
  res.send(db);
})

app.listen(1233, function () {
  console.log('Example app listening on port 1234!')
})

module.exports = app;