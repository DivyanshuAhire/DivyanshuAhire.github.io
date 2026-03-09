const outfits = [

{
name:"Wedding Lehenga",
price:2500,
location:"Mumbai",
image:"https://picsum.photos/400?1"
},

{
name:"Designer Saree",
price:1500,
location:"Pune",
image:"https://picsum.photos/400?2"
},

{
name:"Party Gown",
price:1800,
location:"Delhi",
image:"https://picsum.photos/400?3"
},

{
name:"Sherwani",
price:2200,
location:"Bangalore",
image:"https://picsum.photos/400?4"
},

{
name:"Bridal Lehenga",
price:3200,
location:"Delhi",
image:"https://picsum.photos/400?5"
},

{
name:"Silk Saree",
price:1700,
location:"Mumbai",
image:"https://picsum.photos/400?6"
},

{
name:"Cocktail Dress",
price:1400,
location:"Pune",
image:"https://picsum.photos/400?7"
},

{
name:"Indo Western Suit",
price:2000,
location:"Bangalore",
image:"https://picsum.photos/400?8"
},

{
name:"Festival Kurta Set",
price:1200,
location:"Mumbai",
image:"https://picsum.photos/400?9"
},

{
name:"Designer Gown",
price:2600,
location:"Delhi",
image:"https://picsum.photos/400?10"
}

];

const catalog = document.getElementById("catalog");

const search = document.getElementById("search");
const sort = document.getElementById("sortPrice");
const locationFilter = document.getElementById("locationFilter");

function display(data){

catalog.innerHTML="";

data.forEach(p=>{

catalog.innerHTML += `

<div class="card"
onclick="openProduct('${p.name}','${p.price}','${p.location}','${p.image}')">

<img src="${p.image}">

<div class="card-info">

<h3>${p.name}</h3>
<p>₹${p.price}</p>
<p>${p.location}</p>

<button onclick="addWishlist(event,'${p.name}')">❤️</button>

</div>

</div>

`;

});

}

function openProduct(name,price,location,image){

window.location.href =
`product.html?name=${name}&price=${price}&location=${location}&image=${image}`;

}

function addWishlist(e,name){

e.stopPropagation();

let w = JSON.parse(localStorage.getItem("wishlist")) || [];

w.push(name);

localStorage.setItem("wishlist",JSON.stringify(w));

alert("Added to wishlist");

}

function filter(){

let data=[...outfits];

if(search.value){

data=data.filter(p =>
p.name.toLowerCase().includes(search.value.toLowerCase())
);

}

if(locationFilter.value){

data=data.filter(p => p.location===locationFilter.value);

}

if(sort.value==="low"){

data.sort((a,b)=>a.price-b.price);

}

if(sort.value==="high"){

data.sort((a,b)=>b.price-a.price);

}

display(data);

}

search.addEventListener("keyup",filter);
sort.addEventListener("change",filter);
locationFilter.addEventListener("change",filter);

display(outfits);


/* AUTH */

let mode="login";

function openLogin(){

mode="login";

document.getElementById("authModal").style.display="flex";

document.getElementById("authTitle").innerText="Login";

}

function openSignup(){

mode="signup";

document.getElementById("authModal").style.display="flex";

document.getElementById("authTitle").innerText="Signup";

}

function submitAuth(){

const username=document.getElementById("username").value;

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

if(mode==="signup"){

localStorage.setItem("user",JSON.stringify({username,email,password}));

alert("Account created");

}

else{

const user=JSON.parse(localStorage.getItem("user"));

if(user && user.email===email && user.password===password){

alert("Login success");

}

else{

alert("Wrong login");

}

}

document.getElementById("authModal").style.display="none";

}