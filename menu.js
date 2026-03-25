// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc   // 🔥 ADD THIS
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔑 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBevJD66yLYAjR17Gb_Y55-ocXCW4nYSVo",
  authDomain: "icecream-shop-b7dc5.firebaseapp.com",
  projectId: "icecream-shop-b7dc5",
  storageBucket: "icecream-shop-b7dc5.firebasestorage.app",
  messagingSenderId: "946401398052",
  appId: "1:946401398052:web:f8ec8aa9d17fda8536f7b1",
  measurementId: "G-DNFZ0JE6JR"
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🌐 GLOBAL PRODUCTS
let allProducts = [];
let currentCategory = "all";


// 🔄 LOAD PRODUCTS
async function loadMenu() {
  const container = document.getElementById("menuContainer");
  container.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "products"));

  allProducts = [];

  querySnapshot.forEach((docSnap) => {
    const item = docSnap.data();
    allProducts.push(item);
  });

  applyFilters();
}


// 🎨 RENDER PRODUCT
function renderProduct(item) {
  const container = document.getElementById("menuContainer");

  const div = document.createElement("div");
  div.className = "catalog-card";

  div.innerHTML = `
    <div class="card-img">
      <img src="${item.image}">
    </div>
    <div class="card-body">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
     <button onclick="addToCart('${item.name}', ${item.price}, '${item.image}')">
        Add to Cart
      </button>
    </div>
  `;

  container.appendChild(div);
}


// 🔄 LOAD CATEGORIES
async function loadCategories() {
  const container = document.getElementById("menuCategories");
  container.innerHTML = "";

  // ALL BUTTON
  const allBtn = document.createElement("div");
  allBtn.className = "category-item";
  allBtn.innerHTML = `<span>🍨</span><p>All</p>`;
  allBtn.onclick = () => filterCategory("all");
  container.appendChild(allBtn);

  const querySnapshot = await getDocs(collection(db, "categories"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.className = "category-item";

    div.innerHTML = `
      <span>🍦</span>
      <p>${data.name}</p>
    `;

    div.onclick = () => filterCategory(data.name);

    container.appendChild(div);
  });
}


// 🔍 FILTER CATEGORY
window.filterCategory = function (category) {
  currentCategory = category;
  applyFilters();
};


// 🔍 SEARCH PRODUCT
window.searchProduct = function () {
  applyFilters();
};


// 🎯 APPLY FILTERS (CATEGORY + SEARCH)
function applyFilters() {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();

  const container = document.getElementById("menuContainer");
  container.innerHTML = "";

  let filtered = allProducts;

  // category filter
  if (currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // search filter
  if (searchValue) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchValue)
    );
  }

  filtered.forEach(renderProduct);
}


// 🛒 ADD TO CART
window.addToCart = function (name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, image, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();



  alert("✅ Added to cart!");
};


// 🔄 UPDATE CART UI
function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const list = document.getElementById("cartList");
  const count = document.querySelector(".cart-count");

  if (!list) return;

  list.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;

    const li = document.createElement("li");

    li.innerHTML = `
  <div class="cart-item">

    <img src="${item.image}" class="cart-img">

    <div class="cart-info">
      <b>${item.name}</b>
      <p>₹${item.price}</p>
    </div>

    <div class="cart-controls">
      <button onclick="decreaseQty(${index})">−</button>
      <span>${item.qty}</span>
      <button onclick="increaseQty(${index})">+</button>
    </div>

  </div>
`;

    list.appendChild(li);
  });

  // update count
  if (count) {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    count.textContent = totalItems;
  }

  // total price
  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = "Total: ₹" + total;
}

// ➕ INCREASE QUANTITY//
window.increaseQty = function (index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart[index].qty += 1;

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
};
  // ➖ DECREASE QUANTITY//
window.decreaseQty = function (index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    cart.splice(index, 1); // remove if 0
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
};


// ❌ REMOVE ITEM
window.removeItem = function (index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartUI();
};


// 🛒 OPEN CART
window.openCart = function () {
  document.getElementById("cartSidebar").classList.add("active");
  document.getElementById("cartOverlay").classList.add("active");
};


// ❌ CLOSE CART
window.closeCart = function () {
  document.getElementById("cartSidebar").classList.remove("active");
  document.getElementById("cartOverlay").classList.remove("active");
};


// 🧾 CHECKOUT
window.checkout = function () {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  const container = document.getElementById("checkoutItems");
  const totalEl = document.getElementById("checkoutTotal");

  container.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "checkout-item";

    div.innerHTML = `
      <img src="${item.image}" class="checkout-img">
      <div>
        <b>${item.name}</b>
        <p>₹${item.price} × ${item.qty}</p>
      </div>
    `;

    container.appendChild(div);
  });

  totalEl.innerText = "Total: ₹" + total;

  document.getElementById("checkoutPopup").style.display = "flex";
  document.body.classList.add("popup-open");
};


// ❌ CLOSE CHECKOUT
window.closeCheckout = function () {
  document.getElementById("checkoutPopup").style.display = "none";
  document.body.classList.remove("popup-open");
};


// 📦 PLACE ORDER
const form = document.getElementById("checkoutForm");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

const name = document.getElementById("custName").value;
const email = document.getElementById("custEmail").value;
const phone = document.getElementById("custPhone").value;
const address = document.getElementById("custAddress").value;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // 🧮 calculate total
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
    });

    const order = {
  customerName: name,
  email: email,   // 🔥 added
  phone: phone,
  address: address,
      items: cart,
      total: total,
      payment: "Cash on Delivery",
      status: "Pending",
      date: new Date().toLocaleString()
    };

    try {
      // 🔥 SAVE TO FIREBASE
      await addDoc(collection(db, "orders"), order);

      await fetch("https://script.google.com/macros/s/AKfycby7mfrFmxju0M-WPhxG62t4umuCaDcDVvg5t0eHGHw-9hEdp5fkuBwcYHrfGElYrFXj/exec", {
  method: "POST",
  body: JSON.stringify({
    name,
    email,
    phone,
    address,
    items: cart,
    total
  })
});

      alert("✅ Order placed successfully!");

      // clear cart
      localStorage.removeItem("cart");
      updateCartUI();

      closeCheckout();
      form.reset();

    } catch (error) {
      console.error(error);
      alert("❌ Failed to place order");
    }
  });
}


// 🚀 INITIAL LOAD
loadMenu();
loadCategories();
updateCartUI();