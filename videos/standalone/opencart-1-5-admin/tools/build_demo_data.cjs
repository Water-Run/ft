// 独立合成的数据，不能当作 L12 原实验的逐行副本或 CASE-A 数据。
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const orders = Array.from({length:46}, (_, i) => ({order_id:i+1,customer:'演示顾客 '+String(i%12+1).padStart(2,'0'),status:'待处理',total:100+i*5}));
const selected = orders.find(row => row.order_id===7);
const products = [{order_product_id:1,order_id:7,name:'演示商品 A',quantity:2,price:30},{order_product_id:2,order_id:7,name:'演示商品 B',quantity:1,price:40}];
selected.total = products.reduce((sum,row)=>sum+row.quantity*row.price,0);
const histories = [{order_history_id:1,order_id:7,status:'待处理',sequence:1},{order_history_id:2,order_id:7,status:'已发货',sequence:2}];
const sorted=[...orders].sort((a,b)=>b.order_id-a.order_id),pageSize=20;
const data={schema:1,kind:'独立合成示意，不是原实验记录',facts:'FACTS S19-07、S19-09；46 / 20 规模沿用 R1 g2–g8；明细和金额为重新构造',
orders,products,histories,page_size:pageSize,page_count:Math.ceil(orders.length/pageSize),page_2_order_ids:sorted.slice(pageSize,pageSize*2).map(row=>row.order_id),
permission_example:{user:'演示店员',group:'演示店员组',access:['sale/order','sale/customer'],modify:['sale/order']},
read_only_branch:{kind:'按 S19-05 构造的拒绝分支示意',access:['sale/order'],modify:[]},
auth:{password:'DEMO_PASSWORD',session_id:'SESSION_PLACEHOLDER',token:'TOKEN_PLACEHOLDER',digest:'HASH_PLACEHOLDER'}};
assert.equal(new Set(orders.map(row=>row.order_id)).size,46);
assert.equal(data.page_count,3);assert.equal(data.page_2_order_ids.length,20);assert.equal(selected.total,100);
assert(products.every(row=>orders.some(order=>order.order_id===row.order_id)));
assert(histories.every(row=>orders.some(order=>order.order_id===row.order_id)));
const dir=path.join(root,'src/data');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'demo.json'),JSON.stringify(data,null,2)+'\n');
console.log('合成数据已生成：46 条订单、2 条商品项、2 条状态历史；分页与关联检查通过。');
