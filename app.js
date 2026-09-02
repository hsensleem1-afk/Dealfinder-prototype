const deals=[
['Electronics','Wireless Noise-Cancelling Headphones','Tech Store',79,129,94,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'],
['Fashion','Premium Everyday Sneakers','Fashion Hub',48,89,91,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80'],
['Travel','Weekend Hotel Stay — 2 Nights','Travel Deals',119,199,96,'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80'],
['Home','Smart LED Floor Lamp','Home Market',34,69,88,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80'],
['Electronics','Portable Bluetooth Speaker','Audio Store',29,55,93,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80'],
['Fashion','Minimal Leather Backpack','Urban Shop',42,78,90,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80']
];
let cat='All',q='';
const feed=document.querySelector('#feed');
function render(){let a=deals.filter(d=>(cat==='All'||d[0]===cat)&&d[1].toLowerCase().includes(q.toLowerCase())).sort(()=>Math.random()-.5);
feed.innerHTML=a.map((d,i)=>{let pct=Math.round((1-d[3]/d[4])*100);return `<article class="card" onclick="deal(${deals.indexOf(d)})"><img class="pic" src="${d[6]}"><div class="info"><div class="fresh">${i<2?'✦ AI DISCOVERED JUST NOW':'FRESH DEAL'}</div><div class="title">${d[1]}</div><div class="merchant">${d[2]} · ${d[0]}</div><div class="price"><b class="now">$${d[3]}</b><span class="old">$${d[4]}</span><span class="save">-${pct}%</span></div><div class="bar"><span style="width:${d[5]}%"></span></div></div></article>`}).join('')||'<p style="padding:25px 18px;color:#87909e">No matching deals found.</p>'}
function deal(i){let d=deals[i],p=Math.round((1-d[3]/d[4])*100);if(confirm(`${d[1]}\n\n$${d[3]} instead of $${d[4]} — save ${p}%.\n\nAdd to Price Watch?`))toast('Price Watch enabled ✓')}
function toast(t){let x=document.querySelector('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.chips button').forEach(x=>x.classList.remove('active'));b.classList.add('active');cat=b.dataset.cat;render()});
document.querySelector('#search').oninput=e=>{q=e.target.value;render()};
document.querySelector('#clear').onclick=()=>{q='';document.querySelector('#search').value='';render()};
document.querySelector('#refresh').onclick=()=>{render();toast('Feed refreshed — deals re-ranked')};
setInterval(render,15000);render();