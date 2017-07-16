var fs = require('fs');
var request = require('request');
var progress = require('request-progress');

// variables for this file
var store = {
    companies: { cursor: 1, data: {} }, 
    forms: { cursor: 1, data: {} },
    ingredients: { cursor: 1, data: {} },
    groups: { cursor: 1, data: {} },
    drugs: { },
    drug_ingredient: { },
  };
var url = 'https://dawaey.com/app/assets/db/drugs2052017.min.json';
//var url = 'http://mysafeinfo.com/api/data?list=englishmonarchs&format=json';

function normalize(name) {
  return String(name).split(' ').join('').toLowerCase();
}

// return null if no conc, or string contain conc.
function getConcFromName(name) {
  let match = /[0-9][0-9.,]* ?([a-zA-Z]{2}|%|[A-Za-z.]{0,5})/.exec(name);
  return Array.isArray(match) ? match[0] : '-';
}

function exportDb(name = 'dawaya') {
  return {
    companies: store.companies.data,
    forms: store.forms.data,
    ingredients: store.ingredients.data,
    groups: store.groups.data,
    drugs: store.drugs,
    drug_ingredient: store.drug_ingredient,
  };
}

function DrugTransformFactory(data = {}) {
  const base = {
    id: Number(data.id),
    name: String(data.tradename),
    price: Number(data.price / 1),
    howmany: String(data.howmany),
  };

  const temp1 = String(data.activeingredient).split('\n');
  temp1.reduce((carry, item) => {
    if(carry[normalize(item)]){
      carry[normalize(item)].drugs.push(base.id);
      return carry
    };
    return Object.assign(carry, {
    [normalize(item)]: {
      id: store.ingredients.cursor++,
      name: item,
      conc: getConcFromName(item),
      drugs:[base.id],
    },
  })}, store.ingredients.data);

  base.company_id = store.companies.data[normalize(data.company)] ? store.companies.data[normalize(data.company)].id : store.companies.cursor++;
  base.form_id = store.forms[normalize(data.form)] ? store.forms[normalize(data.form)].id : store.forms.cursor++;
  base.group_id = store.groups[normalize(data.maingp)] ? store.groups[normalize(data.maingp)].id : store.groups.cursor++;
  base.ingredients = temp1.map(normalize).map(key => store.ingredients.data[key].id);
  //base.quantity ?? should we also normalize howmany attribute ???
  if(store.companies.data[normalize(data.company)]){
    store.companies.data[normalize(data.company)].drugs.push(base.id);
  } else {
    store.companies.data[normalize(data.company)] = { id: base.company_id, name: data.company, drugs:[base.id] };
  }
  if(store.forms.data[normalize(data.form)]){
    store.forms.data[normalize(data.form)].drugs.push(base.id);
  } else {
    store.forms.data[normalize(data.form)] = { id: base.form_id, name: data.form , drugs:[base.id]};
  }
  if(store.groups.data[normalize(data.groups)]){
    store.groups.data[normalize(data.maingp)].drugs.push(base.id);
  } else {
    store.groups.data[normalize(data.maingp)] = { id: base.group_id, name: data.maingp, drugs:[base.id] };
  }
  
  store.drugs[base.id] = base;
  base.ingredients.map((id) => {
    store.drug_ingredient[`${id}-${base.id}`] = { drug_id: base.id, ingredient_id: id };
  });


  return base;
}

(function startupGenerator(store){
  store = {
    companies: { cursor: 1, data: {} }, 
    forms: { cursor: 1, data: {} },
    ingredients: { cursor: 1, data: {} },
    groups: { cursor: 1, data: {} },
    drugs: { },
    drug_ingredient: { },
  };
  console.log('Starting new drugs database');;
})(store);

progress(request(url,function (error, response, body) {
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  const data = JSON.parse(body);
  fs.writeFile('./src/original_drugs.json', body, 'utf8', ()=>console.log('saved raw database to drugs.json'));
  data.map(item => DrugTransformFactory(item));
  var json = JSON.stringify(exportDb());
  fs.writeFile('./src/drugs.json', json, 'utf8', ()=>console.log('generated'));
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