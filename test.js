var fs = require('fs');
var request = require('request');
var progress = require('request-progress');

var url = 'https://dawaey.com/app/assets/db/drugs2052017.min.json';
var store = {
  forms:{},
  companies:{},
  groups:{},
  ingredients:{},
  sizes:{},
  drugs:{},
};
var ids = {
  forms:1,
  i:1,
};
var ci = {

}
function n(name) {
  return String(name).split(' ').join('').toLowerCase();
}
function getId(rval,rname){
  var name = n(rname);
  var val = n(rval);
  if(store[name][val] && store[name][val].id)return store[name][val].id;

  if(!ids[name]) ids[name] = 1;
  store[name][val] = {
    id: ids[name]++,
    name: rval,
    drugs:[],
  };
  
  return store[name][val].id;
}
function getConcFromName(name) {
  let match = /[0-9][0-9.,]* ?(unit|[a-zA-Z]{2}|%|[A-Za-z.]{0,5})\s/.exec(name);
  return Array.isArray(match) ? match[0] : '-';
}

function transform(drug){
  if(store.drugs[drug.id])return store.drugs[drug.id];

  var newDrug = {
    id: drug.id,
    tradename: drug.tradename,
    price: drug.price,
    
    size_id:getId(drug.howmany,'sizes'),
    form_id:getId(drug.form,'forms'),
    company_id:getId(drug.company,'companies'),
    group_id:getId(drug.maingp,'groups'),
    ingredients:[],
  };
  var i = drug.activeingredient.split('\n');
  var igs = i.map(ig=>{
    return {
      name:ig,
      conc: getConcFromName(ig),
      drugs:[],
    }
  });
  newDrug.ingredients = igs.map(ig=>{
    if(!ci[ig.name])ci[ig.name] = ids.i++;
    ig.id = ci[ig.name];
    store.ingredients[ig.id] = ig;
    return ig.id;
  });
  store.drugs[drug.id] = newDrug;
  return newDrug;
}

fs.readFile('./src/original_drugs.json', 'utf8', function (err,body) {
  const data = JSON.parse(body);
  data.map(transform);
  const s = Object.keys(store).reduce((c,k)=>{
    c[k] = Object.keys(store[k])
          .reduce((carry,i)=>Object.assign(carry,{[store[k][i].id]:store[k][i]}),{});
    return c;
  },{});
  Object.keys(s.drugs).map(k=>s.drugs[k]).map(r=>{
    s.companies[r.company_id].drugs.push(r.id);
    s.forms[r.form_id].drugs.push(r.id);
    s.sizes[r.size_id].drugs.push(r.id);
    s.groups[r.group_id].drugs.push(r.id);
    r.ingredients.map(i=>{
      s.ingredients[i].drugs.push(r.id);
    })
  })
  var json = JSON.stringify(s,null,2);
  fs.writeFile('./src/drugs.js', "export default "+json+"\n", 'utf8', ()=>console.log('database generated success :)!'));
  fs.writeFile('./src/database.json', json, 'utf8', ()=>console.log('database generated success :)!'));
})
return;
progress(request(url,function (error, response, body) {
  if(!response)return;
  console.log('statusCode:',  response.statusCode); // Print the response status code if a response was received
  fs.writeFile('./src/original_drugs.json', body, 'utf8', ()=>console.log('saved raw database to original_drugs.json'));

  const data = JSON.parse(body);
  data.map(transform);
  //data.map(item => DrugTransformFactory(item));
  var json = JSON.stringify(store);
  fs.writeFile('./src/drugs.json', json, 'utf8', ()=>console.log('database generated success :)!'));
}))
.on('progress', function (state) {
    console.log('progress speed:'+(state.speed/1024)+'/KB , time:'+JSON.stringify(state.time));
})
.on('error', function (err) {
    console.log('error happened during downloaded original database');
    console.log(err);
})
.on('end', function (e,r) {
  console.log('download ended');
});