
(() => {
"use strict";
const C=window.LINGKODPOS_CONFIG,$=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(Number(n)||0);
let pin="";
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function toast(x){const t=$("toast");t.textContent=x;t.classList.remove("hidden");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.add("hidden"),3000)}
async function call(body){const r=await fetch(`${C.SUPABASE_URL}/functions/v1/admin-product`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+C.SUPABASE_ANON_KEY,"apikey":C.SUPABASE_ANON_KEY},body:JSON.stringify({...body,pin})});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Request failed");return d}
async function unlock(){pin=$("pin").value.trim();if(!pin)return toast("Enter the PIN.");try{await call({action:"check"});$("lock").classList.add("hidden");$("ui").classList.remove("hidden");await list()}catch(e){toast(e.message)}}
async function add(e){e.preventDefault();try{await call({action:"create",product:{name:$("name").value.trim(),price:Number($("price").value),stock:Number($("stock").value),category:$("category").value.trim()||"Other",sku:$("sku").value.trim()||null}});e.target.reset();toast("Product added.");await list()}catch(e){toast(e.message)}}
async function list(){try{const d=await call({action:"list"});$("list").innerHTML=(d.products||[]).map(p=>`<div class="adminitem"><span><b>${esc(p.name)}</b><br>${money(p.price)} · Stock ${p.stock} · ${p.active?"Active":"Inactive"}</span>${p.active?`<button class="btn danger" data-id="${esc(p.id)}">Deactivate</button>`:""}</div>`).join("")||"<p class='sub'>No products yet.</p>";document.querySelectorAll(".adminitem button").forEach(b=>b.onclick=async()=>{if(!confirm("Deactivate this product?"))return;try{await call({action:"deactivate",id:b.dataset.id});await list()}catch(e){toast(e.message)}})}catch(e){toast(e.message)}}
$("unlock").onclick=unlock;$("pin").onkeydown=e=>{if(e.key==="Enter")unlock()};$("form").onsubmit=add;
})();
