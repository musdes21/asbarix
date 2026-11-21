import {test} from 'node:test';
import assert from 'node:assert/strict';
process.env.KV_REST_API_URL='https://redis.test';
const {calculateQuote,materials,defaultPolicy,catalog,PRICE_KEY}=await import('../api/_pricing.js');
const item=id=>({...materials.find(x=>x.id===id),retail:materials.find(x=>x.id===id).rate,individual:null,cost:null,designerCanEdit:false,pricingMode:'approved-selling'});
const quote=(id,body={})=>calculateQuote({qty:1,width:10,height:15,client:'retail',...body},item(id),defaultPolicy);
test('approved sheet examples: 2mm 40x10 qty2 gives 11.20 and individuals 22.40',()=>{
 assert.equal(quote('3',{width:40,height:10,qty:2}).total,11.2);
 assert.equal(quote('3',{width:40,height:10,qty:2,client:'individual'}).total,22.4);
 assert.equal(quote('3',{width:22,height:10,qty:2}).total,6.16);
});
test('4mm uses .025 selling rate without purchase cost or margin',()=>{
 assert.equal(quote('5',{qty:100,margin:70,cost:4,customRate:999}).total,375);
 assert.equal(quote('5',{qty:100,client:'individual'}).total,750);
 assert.equal(quote('5',{width:12.5,height:8.2,qty:4}).total,10.25);
});
test('empty prices stay unavailable; numeric string sticker source is normalized',()=>{
 assert.equal(quote('9').error,'price_missing');
 assert.equal(quote('49',{width:29,height:12}).total,2.44);
});
test('circle uses bounding square; assembly uses quantity only',()=>{
 assert.equal(quote('5',{width:5,height:99,circle:true,qty:4}).total,2.5);
 assert.equal(quote('43',{width:0,height:0,qty:3}).total,30);
});
test('invalid sizes and quantities cannot create quotes',()=>{
 for(const body of [{width:0},{width:-1},{height:401},{width:'x'},{qty:0},{qty:1.5},{qty:1000001}])assert.equal(quote('5',body).error,'invalid_dimensions');
});
test('custom prices require permission and never undercut approved sale rate',()=>{
 const m={...item('5'),designerCanEdit:true};
 const body={qty:1,width:10,height:10,customRate:.024};
 assert.equal(calculateQuote(body,m,defaultPolicy).error,'price_limit');
 assert.equal(calculateQuote({...body,customRate:.03},m,defaultPolicy).total,3);
 assert.equal(calculateQuote({...body,client:'individual',customRate:.03},m,defaultPolicy).error,'price_limit');
});
test('approved catalog ignores old experimental prices while preserving future admin overrides',async()=>{
 const before=globalThis.fetch;
 let saved=null;
 globalThis.fetch=async(url,options)=>({ok:true,json:async()=>JSON.parse(options.body).map(([cmd,key])=>({result:key==='montage:prices'?JSON.stringify({items:[{id:'5',retail:999,cost:4}]}):key===PRICE_KEY?saved:null}))});
 try{
  let data=await catalog();assert.equal(data.items.find(x=>x.id==='5').retail,.025);
  assert.equal(calculateQuote({qty:100,width:10,height:15},data.items.find(x=>x.id==='5'),data.policy).total,375);
  saved=JSON.stringify({items:[{id:'5',retail:.03,individual:.07,cost:null,designerCanEdit:false}]});
  data=await catalog();assert.equal(data.items.find(x=>x.id==='5').retail,.03);
  assert.equal(calculateQuote({qty:1,width:10,height:10,client:'individual'},data.items.find(x=>x.id==='5'),data.policy).total,7);
 }finally{globalThis.fetch=before;}
});
