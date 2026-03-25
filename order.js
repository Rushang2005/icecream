// 🔥 FIREBASE IMPORTS (CDN VERSION)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔑 FIREBASE CONFIG (same as admin.js)
const firebaseConfig = {
  apiKey: "AIzaSyBevJD66yLYAjR17Gb_Y55-ocXCW4nYSVo",
  authDomain: "icecream-shop-b7dc5.firebaseapp.com",
  projectId: "icecream-shop-b7dc5",
  storageBucket: "icecream-shop-b7dc5.firebasestorage.app",
  messagingSenderId: "946401398052",
  appId: "1:946401398052:web:f8ec8aa9d17fda8536f7b1",
  measurementId: "G-DNFZ0JE6JR"
};

// 🚀 INIT FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ order.js loaded");


// 🔄 LOAD ORDERS FUNCTION
async function loadOrders(searchTerm = "") {
  const container = document.getElementById("orderList");

  if (!container) return;

  container.innerHTML = "<p>Loading orders...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "orders"));

    container.innerHTML = "";

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No orders found 📦</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const o = docSnap.data();

      // 🔍 SEARCH FILTER
      const search = searchTerm.toLowerCase();

      const match =
        (o.customerName || "").toLowerCase().includes(search) ||
        (o.email || "").toLowerCase().includes(search) ||
        (o.phone || "").toLowerCase().includes(search) ||
        (o.date || "").toLowerCase().includes(search);

      if (!match) return;

      let itemsHTML = "";

      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(item => {
          itemsHTML += `
            <li>${item.name} (₹${item.price} × ${item.qty})</li>
          `;
        });
      }

      const div = document.createElement("div");
      div.className = "order-card";

      div.innerHTML = `
        <h3>👤 ${o.customerName || "No Name"}</h3>
        <p>📧 ${o.email || "-"}</p>
        <p>📞 ${o.phone || "-"}</p>
        <p>📍 ${o.address || "-"}</p>

        <h4>🧾 Order Items:</h4>
        <ul>${itemsHTML}</ul>

        <p><b>💰 Total: ₹${o.total || 0}</b></p>
        <p>📅 ${o.date || "-"}</p>
        <p>📦 Status: ${o.status || "Pending"}</p>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>❌ Failed to load orders</p>";
  }
}


// 🚀 CALL FUNCTION
loadOrders();


document.getElementById("searchOrder").addEventListener("input", function () {
  loadOrders(this.value);
});