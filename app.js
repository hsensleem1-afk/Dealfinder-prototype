// Update frontend to use API-driven deals. Preserve UI structure.

let cat='All',q='';
const feed=document.querySelector('#feed');

async function fetchDeals(){
  try{
    const r = await fetch('/api/deals');
    if(!r.ok) throw new Error('API error');
    const data = await r.json();
    if(Array.isArray(data)) return data;
    if(data && data.deals) return data.deals;
    // if message indicates no sources
    if(data && data.message==='NO_SOURCES_CONFIGURED') return [];
    return [];
  }catch(e){
    console.warn('Could not fetch deals:', e.message);
    return [];
  }
}

function renderEmpty(){
  feed.innerHTML = `<div class="empty">No live deals connected yet.<br><small>Connect a feed in the backend to populate live deals.</small></div>`;
}

async function render(){
  const ds = await fetchDeals();
  if(!ds || ds.length===0){
    renderEmpty();
    return;
  }
  let a = ds.filter(d=>(cat==='All'||d.category===cat||d.merchant===cat)|| (cat==='All'));
  // simple random sort to vary
  a = a.sort(()=>Math.random()-.5);
  feed.innerHTML = a.map(d=>{
    const pct = d.discountPercent!=null?Math.round(d.discountPercent):0;
    const img = d.imageUrl || 'https://via.placeholder.com/300x200?text=Deal';
    const price = d.price!=null?`$${d.price}`:'—';
    const orig = d.originalPrice?`$${d.originalPrice}`:'';
    return `<article class="card" onclick="deal('${d.dealId||d.deal_id||d.id}')"><img class="pic" src="${img}"><div class="info"><div class="fr"><h3>${d.title||''}</h3><div class="meta">${d.merchant||''}</div></div><div class="price">${price}<small>${orig}</small></div></div><div class="badge">${pct}%</div></article>`;
  }).join('');
}

function deal(id){
  toast('Deal clicked: ' + id);
}

function toast(t){let x=document.querySelector('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}

document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.chips button').forEach(x=>x.classList.remove('active'));b.classList.add('active');cat=b.dataset.cat;render()});

document.querySelector('#search').oninput=e=>{q=e.target.value;render()};
document.querySelector('#clear').onclick=()=>{q='';document.querySelector('#search').value='';render()};
document.querySelector('#refresh').onclick=()=>{render();toast('Feed refreshed — deals re-ranked')};

setInterval(render,15000);
render();
