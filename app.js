const KEY="pptech_laptop_manager_v1";
let db=JSON.parse(localStorage.getItem(KEY)||'{"laptops":[],"sales":[]}');
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});
const today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(db));renderAll()}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function page(name){
  $$(".page").forEach(x=>x.classList.remove("active")); $("#"+name).classList.add("active");
  $$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===name));
  const titles={dashboard:"Dashboard",inventory:"Inventory",sales:"Sales",customers:"Customers",reports:"Reports"};
  $("#pageTitle").textContent=titles[name]||"Dashboard";
}
$$(".nav").forEach(b=>b.onclick=()=>{page(b.dataset.page);$(".sidebar").classList.remove("show")});
$$("[data-page-jump]").forEach(b=>b.onclick=()=>page(b.dataset.pageJump));
$("#mobileMenu").onclick=()=>$(".sidebar").classList.toggle("show");

function openModal(id){$("#"+id).classList.add("open")}
function closeModal(id){$("#"+id).classList.remove("open")}
$("#quickAdd").onclick=()=>openLaptop();
$("#addLaptopBtn").onclick=()=>openLaptop();
$("#closeModal").onclick=$("#cancelModal").onclick=()=>closeModal("modal");
$("#closeSale").onclick=$("#cancelSale").onclick=()=>closeModal("saleModal");

function openLaptop(){
  $("#laptopForm").reset(); $("#laptopForm").elements.purchaseDate.value=today();
  $("#laptopForm").elements.id.value="LAP-"+String(db.laptops.length+1).padStart(3,"0");
  openModal("modal");
}
$("#laptopForm").onsubmit=e=>{
 e.preventDefault(); const f=new FormData(e.target), o=Object.fromEntries(f.entries());
 o.purchasePrice=+o.purchasePrice||0;o.repairCost=+o.repairCost||0;o.otherCost=+o.otherCost||0;o.sellingPrice=+o.sellingPrice||0;
 o.totalCost=o.purchasePrice+o.repairCost+o.otherCost;o.createdAt=new Date().toISOString();
 const idx=db.laptops.findIndex(x=>x.id===o.id);
 if(idx>=0) db.laptops[idx]={...db.laptops[idx],...o}; else db.laptops.push(o);
 closeModal("modal");save();
};

$("#sellLaptopBtn").onclick=()=>{
 const available=db.laptops.filter(x=>x.status!=="Sold");
 $("#saleLaptop").innerHTML=available.length?available.map(x=>`<option value="${esc(x.id)}">${esc(x.id)} — ${esc(x.brand)} ${esc(x.model)}</option>`).join(""):"<option value=''>No unsold laptops</option>";
 $("#saleForm").reset();$("#saleForm").elements.saleDate.value=today();$("#saleForm").elements.salePrice.value=available[0]?.sellingPrice||"";
 openModal("saleModal");
};
$("#saleLaptop").onchange=()=>{const l=db.laptops.find(x=>x.id===$("#saleLaptop").value);if(l)$("#saleForm").elements.salePrice.value=l.sellingPrice||""};
$("#saleForm").onsubmit=e=>{
 e.preventDefault();const f=new FormData(e.target),o=Object.fromEntries(f.entries());o.salePrice=+o.salePrice||0;
 const l=db.laptops.find(x=>x.id===o.laptopId);if(!l)return alert("Please select a laptop.");
 l.status="Sold";l.soldDate=o.saleDate;l.customer=o.customer;l.customerMobile=o.mobile;l.salePrice=o.salePrice;l.invoice=o.invoice;l.payment=o.payment;l.emiProvider=o.emiProvider;l.warranty=o.warranty;
 db.sales.push({...o,laptopId:l.id,brand:l.brand,model:l.model,totalCost:l.totalCost,profit:o.salePrice-l.totalCost});
 closeModal("saleModal");save();
};

function renderDashboard(){
 const month=new Date().toISOString().slice(0,7);
 const ms=db.sales.filter(s=>(s.saleDate||"").startsWith(month));
 $("#kpiStock").textContent=db.laptops.filter(x=>x.status==="Available").length;
 $("#kpiSold").textContent=ms.length;
 $("#kpiRevenue").textContent=money(ms.reduce((a,s)=>a+s.salePrice,0));
 $("#kpiProfit").textContent=money(ms.reduce((a,s)=>a+s.profit,0));
 const recent=[...db.sales].sort((a,b)=>(b.saleDate||"").localeCompare(a.saleDate||"")).slice(0,5);
 $("#recentSales").innerHTML=recent.length?`<div class="tablewrap"><table><thead><tr><th>Date</th><th>Laptop</th><th>Customer</th><th>Sale</th><th>Profit</th></tr></thead><tbody>${recent.map(s=>`<tr><td>${esc(s.saleDate)}</td><td><strong>${esc(s.brand)} ${esc(s.model)}</strong></td><td>${esc(s.customer)}</td><td>${money(s.salePrice)}</td><td>${money(s.profit)}</td></tr>`).join("")}</tbody></table></div>`:"<p class='summary'>No sales recorded yet.</p>";
 drawCharts();
}
let charts={};
function makeChart(id,type,labels,data,label){
 if(charts[id])charts[id].destroy();
 charts[id]=new Chart($("#"+id),{type,data:{labels,datasets:[{label,data,borderWidth:2,tension:.35,backgroundColor:type==="doughnut"?["#2563eb","#06b6d4","#8b5cf6","#22c55e","#f59e0b"]:undefined}]},options:{responsive:true,plugins:{legend:{display:type==="doughnut"}}}});
}
function drawCharts(){
 const months=[];for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);months.push(d.toISOString().slice(0,7))}
 const labels=months.map(m=>new Date(m+"-01").toLocaleString("en-IN",{month:"short"}));
 makeChart("salesChart","line",labels,months.map(m=>db.sales.filter(s=>(s.saleDate||"").startsWith(m)).length),"Sales");
 makeChart("revenueChart","line",labels,months.map(m=>db.sales.filter(s=>(s.saleDate||"").startsWith(m)).reduce((a,s)=>a+s.salePrice,0)),"Revenue");
 const brands={};db.sales.forEach(s=>brands[s.brand]=(brands[s.brand]||0)+1);const top=Object.entries(brands).sort((a,b)=>b[1]-a[1]).slice(0,5);
 makeChart("brandChart","bar",top.map(x=>x[0]),top.map(x=>x[1]),"Sold");
 const st={};db.laptops.forEach(l=>st[l.status]=(st[l.status]||0)+1);makeChart("stockChart","doughnut",Object.keys(st),Object.values(st),"Stock");
}
function renderInventory(){
 const q=$("#inventorySearch").value.toLowerCase(), st=$("#inventoryStatus").value;
 const rows=db.laptops.filter(l=>(!st||l.status===st)&&[l.id,l.brand,l.model,l.serial,l.processor].join(" ").toLowerCase().includes(q));
 $("#inventoryBody").innerHTML=rows.length?rows.map(l=>`<tr><td><strong>${esc(l.id)}</strong></td><td>${esc(l.brand)} ${esc(l.model)}<br><small>${esc(l.serial||"")}</small></td><td>${esc(l.processor||"-")}<br>${esc(l.ram||"-")} / ${esc(l.storage||"-")}</td><td>${esc(l.purchaseDate||"-")}</td><td>${money(l.totalCost)}</td><td>${money(l.sellingPrice)}</td><td><span class="badge ${l.status==="Sold"?"sold":l.status==="Under Repair"?"repair":""}">${esc(l.status)}</span></td><td><button class="action" onclick="editLaptop('${esc(l.id)}')">Edit</button> <button class="action" onclick="deleteLaptop('${esc(l.id)}')">Delete</button></td></tr>`).join(""):"<tr><td colspan='8'>No laptops found.</td></tr>";
}
function editLaptop(id){
 const l=db.laptops.find(x=>x.id===id);if(!l)return;const f=$("#laptopForm");Object.keys(l).forEach(k=>{if(f.elements[k])f.elements[k].value=l[k]});openModal("modal");
}
function deleteLaptop(id){if(confirm("Delete this laptop record?")){db.laptops=db.laptops.filter(x=>x.id!==id);db.sales=db.sales.filter(x=>x.laptopId!==id);save()}}
function renderSales(){
 const q=$("#salesSearch").value.toLowerCase();
 const rows=db.sales.filter(s=>[s.invoice,s.customer,s.laptopId,s.brand,s.model].join(" ").toLowerCase().includes(q)).sort((a,b)=>(b.saleDate||"").localeCompare(a.saleDate||""));
 $("#salesBody").innerHTML=rows.length?rows.map(s=>`<tr><td>${esc(s.saleDate)}</td><td>${esc(s.invoice||"-")}</td><td>${esc(s.brand)} ${esc(s.model)}<br><small>${esc(s.laptopId)}</small></td><td>${esc(s.customer)}<br><small>${esc(s.mobile||"")}</small></td><td>${money(s.salePrice)}</td><td>${money(s.profit)}</td><td>${esc(s.payment)}</td></tr>`).join(""):"<tr><td colspan='7'>No sales found.</td></tr>";
}
function renderCustomers(){
 const q=$("#customerSearch").value.toLowerCase(), map={};
 db.sales.forEach(s=>{const key=s.mobile||s.customer;if(!map[key])map[key]={name:s.customer,mobile:s.mobile,count:0,total:0,last:""};map[key].count++;map[key].total+=s.salePrice;map[key].last=s.saleDate>map[key].last?s.saleDate:map[key].last});
 const rows=Object.values(map).filter(x=>(x.name+" "+x.mobile).toLowerCase().includes(q));
 $("#customersBody").innerHTML=rows.length?rows.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.mobile||"-")}</td><td>${x.count}</td><td>${money(x.total)}</td><td>${esc(x.last)}</td></tr>`).join(""):"<tr><td colspan='5'>No customers found.</td></tr>";
}
function renderReports(){
 const cost=db.laptops.reduce((a,l)=>a+l.totalCost,0), sales=db.sales.reduce((a,s)=>a+s.salePrice,0), profit=db.sales.reduce((a,s)=>a+s.profit,0);
 $("#rInvestment").textContent=money(cost);$("#rSales").textContent=money(sales);$("#rProfit").textContent=money(profit);$("#rAvg").textContent=money(db.sales.length?profit/db.sales.length:0);
 $("#reportSummary").innerHTML=`<p><b>Total laptops purchased/entered:</b> ${db.laptops.length}</p><p><b>Available stock:</b> ${db.laptops.filter(x=>x.status==="Available").length}</p><p><b>Sold laptops:</b> ${db.sales.length}</p><p><b>Reserved:</b> ${db.laptops.filter(x=>x.status==="Reserved").length}</p><p><b>Under repair:</b> ${db.laptops.filter(x=>x.status==="Under Repair").length}</p>`;
}
function renderAll(){renderDashboard();renderInventory();renderSales();renderCustomers();renderReports()}
["inventorySearch","salesSearch","customerSearch"].forEach(id=>$("#"+id).oninput=renderAll);
$("#inventoryStatus").onchange=renderInventory;

$("#backupBtn").onclick=()=>{
 const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="PPTech-Laptop-Backup-"+today()+".json";a.click();
};
$("#restoreInput").onchange=e=>{
 const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.laptops||!x.sales)throw Error();db=x;save();alert("Backup restored successfully.")}catch{alert("Invalid backup file.")}};r.readAsText(file);
};
$("#csvBtn").onclick=()=>{
 const head=["Date","Invoice","Laptop ID","Brand","Model","Customer","Mobile","Sale Price","Cost","Profit","Payment","EMI Provider"];
 const lines=[head,...db.sales.map(s=>[s.saleDate,s.invoice,s.laptopId,s.brand,s.model,s.customer,s.mobile,s.salePrice,s.totalCost,s.profit,s.payment,s.emiProvider])].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(","));
 const blob=new Blob([lines.join("\n")],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="PPTech-Sales-Report.csv";a.click();
};
renderAll();
