
(()=>{"use strict";
const C=window.LINGKODPOS_CONFIG,$=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(Number(n)||0);
let pin="";
function toast(x){const t=$("toast");t.textContent=x;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),3000)}
async function call(body){const r=await fetch(`${C.SUPABASE_URL}/functions/v1/admin-product`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+C.SUPABASE_ANON_KEY,"apikey":C.SUPABASE_ANON_KEY},body:JSON.stringify({...body,pin})});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Request failed");return d}
async function load(){try{const d=await call({action:"orders"});$("list").innerHTML=(d.orders||[]).map(o=>`<div class="adminitem"><span><b>Order #${o.order_number}</b><br>${new Date(o.created_at).toLocaleString()} · ${o.payment_method.toUpperCase()} · ${o.status}</span><b>${money(o.total)}</b></div>`).join("")||"<p class='sub'>No orders yet.</p>"}catch(e){toast(e.message)}}
async function unlock(){pin=$("pin").value.trim();if(!pin)return toast("Enter the PIN.");try{await call({action:"check"});$("lock").classList.add("hidden");$("ui").classList.remove("hidden");load()}catch(e){toast(e.message)}}
$("unlock").onclick=unlock;$("pin").onkeydown=e=>{if(e.key==="Enter")unlock()};
})();
