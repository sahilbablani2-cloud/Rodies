const KEY="rodies_v2_products", CART="rodies_v2_cart", ADMIN="rodies_v2_admin";
const ADMIN_PASSWORD="1a2b3c4d5";
const MAX_PHOTOS=6;

const starter=[
{id:1,name:"Rodies Runner",price:899,colors:["Black","White"],sizes:["6","7","8","9"],
 photos:[
  {color:"Black",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"},
  {color:"White",image:"https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=900&q=80"}
 ]},
{id:2,name:"Street Classic",price:1499,colors:["Black","Blue"],sizes:["7","8","9","10"],
 photos:[
  {color:"Black",image:"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80"},
  {color:"Blue",image:"https://images.unsplash.com/photo-1554130841-5a3d3a7a3e9d?auto=format&fit=crop&w=900&q=80"}
 ]},
{id:3,name:"Everyday Flex",price:1999,colors:["Grey","White"],sizes:["6","7","8","9","10"],
 photos:[
  {color:"Grey",image:"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80"},
  {color:"White",image:"https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=900&q=80"}
 ]}
];

function normalizeProducts(list){
 return (list||[]).map(p=>{
   if(Array.isArray(p.photos) && p.photos.length){
     const photos=p.photos.slice(0,MAX_PHOTOS).map((x,i)=>({
       color:String(x.color||((p.colors||[])[i]||`Colour ${i+1}`)),
       image:x.image
     }));
     return {...p,photos,colors:photos.map(x=>x.color)};
   }
   if(p.image){
     const color=(p.colors&&p.colors[0])||"Default";
     return {...p,photos:[{color,image:p.image}],colors:[color]};
   }
   return {...p,photos:[],colors:p.colors||[]};
 });
}

if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(starter));
else localStorage.setItem(KEY,JSON.stringify(normalizeProducts(JSON.parse(localStorage.getItem(KEY)||"[]"))));

const getP=()=>normalizeProducts(JSON.parse(localStorage.getItem(KEY)||"[]"));
const getCart=()=>JSON.parse(localStorage.getItem(CART)||"[]");
const money=n=>"₹"+Number(n).toLocaleString("en-IN");

function firstImage(p){return p.photos?.[0]?.image||p.image||"https://via.placeholder.com/900x700?text=Rodies"}

function render(){
 const el=document.getElementById("products");if(!el)return;
 let a=getP(),q=(document.getElementById("search")?.value||"").toLowerCase(),b=document.getElementById("budget")?.value,s=document.getElementById("sort")?.value;
 a=a.filter(p=>p.name.toLowerCase().includes(q)||(p.colors||[]).join(" ").toLowerCase().includes(q));
 if(b)a=a.filter(p=>p.price<+b);
 if(s==="asc")a.sort((x,y)=>x.price-y.price);
 if(s==="desc")a.sort((x,y)=>y.price-x.price);
 el.innerHTML=a.map(p=>`<article class="card">
 <a href="product.html?id=${p.id}"><img src="${firstImage(p)}" alt="${escapeHtml(p.name)}"></a>
 <div class="card-body"><h3>${escapeHtml(p.name)}</h3><div class="price">${money(p.price)}</div>
 <p class="muted">Colours: ${(p.colors||[]).map(escapeHtml).join(", ")}<br>Sizes: ${(p.sizes||[]).map(escapeHtml).join(", ")}</p>
 <button class="btn" onclick="addCart(${p.id})">Add to cart</button></div></article>`).join("")||"<p>No shoes found.</p>";
 renderCart();updateCount();
}

function addCart(id){
 let c=getCart(),p=getP().find(x=>x.id===id);if(!p)return;
 c.push({id:p.id,name:p.name,price:p.price});
 localStorage.setItem(CART,JSON.stringify(c));renderCart();updateCount()
}
function removeCart(i){let c=getCart();c.splice(i,1);localStorage.setItem(CART,JSON.stringify(c));renderCart();updateCount()}
function renderCart(){
 const el=document.getElementById("cartItems");if(!el)return;
 let c=getCart();
 el.innerHTML=c.length?c.map((x,i)=>`<div class="cart-row"><span>${escapeHtml(x.name)}</span><b>${money(x.price)} <button class="btn secondary" onclick="removeCart(${i})">Remove</button></b></div>`).join(""):"<p class='muted'>Your cart is empty.</p>";
 let t=c.reduce((s,x)=>s+x.price,0),total=document.getElementById("cartTotal");
 if(total)total.innerHTML=`<h3>Total: ${money(t)}</h3>`
}
function updateCount(){const e=document.getElementById("cartCount");if(e)e.textContent=getCart().length}
function checkout(){
 let c=getCart();if(!c.length)return alert("Add a shoe first.");
 let text="Hello Rodies! I would like to order:%0A"+c.map(x=>`• ${x.name} - ${money(x.price)}`).join("%0A")+`%0A%0ATotal: ${money(c.reduce((s,x)=>s+x.price,0))}`;
 window.open("https://wa.me/?text="+text,"_blank")
}

function renderProduct(){
 const e=document.getElementById("product");if(!e)return;
 let id=Number(new URLSearchParams(location.search).get("id")),p=getP().find(x=>x.id===id);
 if(!p){e.innerHTML="<h2>Product not found</h2>";return}
 const photos=p.photos?.length?p.photos:[{color:"Default",image:firstImage(p)}];
 const first=photos[0];
 e.innerHTML=`<div class="product-detail">
 <div class="product-gallery">
   <img id="mainProductImage" class="main-product-image" src="${first.image}" alt="${escapeHtml(p.name)}">
   <div class="colour-thumbs" id="colourThumbs">
     ${photos.map((x,i)=>`<button class="colour-choice ${i===0?'active':''}" onclick="selectColour(${i})">
       <img src="${x.image}" alt="${escapeHtml(x.color)}">
       <span>${escapeHtml(x.color)}</span>
     </button>`).join("")}
   </div>
 </div>
 <div>
   <p class="eyebrow">RODIES</p><h1>${escapeHtml(p.name)}</h1><div class="price">${money(p.price)}</div>
   <h3>Colours</h3><div class="colour-buttons">
     ${photos.map((x,i)=>`<button class="colour-btn ${i===0?'active':''}" onclick="selectColour(${i})">${escapeHtml(x.color)}</button>`).join("")}
   </div>
   <p id="selectedColour" class="muted">Selected colour: ${escapeHtml(first.color)}</p>
   <h3>Sizes</h3>${(p.sizes||[]).map(x=>`<span class="option">${escapeHtml(x)}</span>`).join("")}
   <br><button class="btn" onclick="addCart(${p.id})">Add to cart</button>
 </div></div>`;
 window.currentProductPhotos=photos;updateCount()
}
function selectColour(index){
 const photos=window.currentProductPhotos||[];
 if(!photos[index])return;
 const img=document.getElementById("mainProductImage");
 if(img){img.src=photos[index].image;img.alt=photos[index].color}
 document.querySelectorAll(".colour-btn").forEach((b,i)=>b.classList.toggle("active",i===index));
 document.querySelectorAll(".colour-choice").forEach((b,i)=>b.classList.toggle("active",i===index));
 const s=document.getElementById("selectedColour");if(s)s.textContent="Selected colour: "+photos[index].color;
}

function loginAdmin(){
 if(document.getElementById("adminPassword").value===ADMIN_PASSWORD){
   sessionStorage.setItem(ADMIN,"1");showAdmin()
 }else document.getElementById("loginMsg").textContent="Incorrect password."
}
function initAdmin(){if(sessionStorage.getItem(ADMIN)==="1")showAdmin()}
function showAdmin(){
 const login=document.getElementById("adminLogin"),dash=document.getElementById("dashboard");
 if(login)login.hidden=true;if(dash)dash.hidden=false;
 setupPhotoRows();renderAdmin()
}
function logoutAdmin(){sessionStorage.removeItem(ADMIN);location.reload()}

function setupPhotoRows(){
 const box=document.getElementById("photoRows");if(!box)return;
 if(!box.children.length)addPhotoRow();
 updatePhotoCounter();
}
function addPhotoRow(){
 const box=document.getElementById("photoRows");if(!box)return;
 if(box.children.length>=MAX_PHOTOS){alert("You can upload a maximum of 6 photos per shoe.");return}
 const i=box.children.length+1;
 const row=document.createElement("div");row.className="photo-row";
 row.innerHTML=`<div class="photo-number">${i}</div>
 <input class="photo-color" type="text" placeholder="Colour name (e.g. Black)">
 <input class="photo-file" type="file" accept="image/*" onchange="updatePhotoCounter()">
 <button type="button" class="remove-photo" onclick="removePhotoRow(this)">Remove</button>`;
 box.appendChild(row);updatePhotoCounter()
}
function removePhotoRow(btn){btn.closest(".photo-row").remove();renumberPhotoRows();updatePhotoCounter()}
function renumberPhotoRows(){document.querySelectorAll(".photo-row .photo-number").forEach((x,i)=>x.textContent=i+1)}
function updatePhotoCounter(){
 const rows=[...document.querySelectorAll(".photo-row")];
 const count=rows.filter(r=>r.querySelector(".photo-file")?.files?.length).length;
 const msg=document.getElementById("photoLimitMsg");if(msg)msg.textContent=`${count} / ${MAX_PHOTOS} photos selected`;
}

function addProduct(){
 if(sessionStorage.getItem(ADMIN)!=="1")return;
 const name=document.getElementById("pName").value.trim(),price=+document.getElementById("pPrice").value;
 const sizes=csv("pSizes");
 if(!name||!price)return alert("Enter name and price.");

 const rows=[...document.querySelectorAll(".photo-row")];
 const selected=rows.filter(r=>r.querySelector(".photo-file")?.files?.length);
 if(selected.length>MAX_PHOTOS)return alert("Maximum 6 photos allowed.");
 if(selected.some(r=>!r.querySelector(".photo-color").value.trim()))return alert("Please enter a colour name for every uploaded photo.");

 const readAll=async()=>{
   const photos=[];
   for(const row of selected){
     const file=row.querySelector(".photo-file").files[0];
     const color=row.querySelector(".photo-color").value.trim();
     photos.push({color,image:await fileToDataURL(file)});
   }
   let a=getP();
   a.unshift({id:Date.now(),name,price,colors:photos.map(x=>x.color),sizes,photos,image:photos[0]?.image||"https://via.placeholder.com/900x700?text=Rodies"});
   try{
     localStorage.setItem(KEY,JSON.stringify(a));
   }catch(err){
     alert("The photos are too large for browser storage. Please use smaller/compressed images and try again.");
     return;
   }
   clearProductForm();renderAdmin();
 };
 readAll();
}
function fileToDataURL(file){
 return new Promise((resolve,reject)=>{
   const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)
 })
}
function clearProductForm(){
 document.getElementById("pName").value="";
 document.getElementById("pPrice").value="";
 document.getElementById("pSizes").value="";
 document.getElementById("photoRows").innerHTML="";
 addPhotoRow();
}
function csv(id){return document.getElementById(id).value.split(",").map(x=>x.trim()).filter(Boolean)}

function renderAdmin(){
 const e=document.getElementById("adminProducts");if(!e)return;
 e.innerHTML=getP().map(p=>`<article class="card">
 <img src="${firstImage(p)}" alt="${escapeHtml(p.name)}">
 <div class="card-body"><h3>${escapeHtml(p.name)}</h3><div class="price">${money(p.price)}</div>
 <p class="muted">${(p.colors||[]).map(escapeHtml).join(", ")} · Sizes ${(p.sizes||[]).map(escapeHtml).join(", ")}<br>${p.photos?.length||1} photo(s)</p>
 <button class="btn delete" onclick="deleteProduct(${p.id})">Delete</button></div></article>`).join("")
}
function deleteProduct(id){
 if(confirm("Delete this product?")){
   localStorage.setItem(KEY,JSON.stringify(getP().filter(p=>p.id!==id)));renderAdmin()
 }
}

function openAdminAccess(){
 const box=document.getElementById("adminAccess");if(box){box.hidden=false;setTimeout(()=>document.getElementById("quickAdminPassword")?.focus(),50)}
}
function closeAdminAccess(){const box=document.getElementById("adminAccess");if(box)box.hidden=true}
function quickAdminLogin(){
 const input=document.getElementById("quickAdminPassword"),msg=document.getElementById("quickLoginMsg");
 if(input?.value===ADMIN_PASSWORD){
   sessionStorage.setItem(ADMIN,"1");location.href="admin.html"
 }else if(msg)msg.textContent="Incorrect password."
}
function escapeHtml(s){
 return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))
}

render();
