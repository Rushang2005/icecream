import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBevJD66yLYAjR17Gb_Y55-ocXCW4nYSVo",
  authDomain: "icecream-shop-b7dc5.firebaseapp.com",
  projectId: "icecream-shop-b7dc5",
  storageBucket: "icecream-shop-b7dc5.firebasestorage.app",
  messagingSenderId: "946401398052",
  appId: "1:946401398052:web:f8ec8aa9d17fda8536f7b1",
  measurementId: "G-DNFZ0JE6JR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    // ✅ redirect to admin
    window.location.href = "admin.html";

  } catch (err) {
    alert("Invalid login");
  }
};