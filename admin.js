




// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";





// 🔑 FIREBASE CONFIG (REPLACE WITH YOURS)
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


// 🔑 IMGBB API KEY
const API_KEY = "9d945200026298fb65615ef2197c9c81";


import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // ❌ not logged in → redirect
    window.location.href = "login.html";
  }
});


import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.querySelector(".logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});


// 📤 UPLOAD IMAGE WITH PROGRESS
document.getElementById("imageFile").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  // 🔥 COMPRESS
  const compressedFile = await compressImage(file);

  // 🖼 PREVIEW
  const preview = document.getElementById("previewImg");
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";

  const formData = new FormData();
  formData.append("image", compressedFile);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `https://api.imgbb.com/1/upload?key=${API_KEY}`);

  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      document.getElementById("progressBar").style.width = percent + "%";
      document.getElementById("progressText").innerText = percent + "% uploading...";
    }
  };

  xhr.onload = function () {
    const res = JSON.parse(xhr.responseText);

    if (res.success) {
      document.getElementById("image").value = res.data.url;
      document.getElementById("progressText").innerText = "✅ Upload Complete";
    } else {
     showToast("Upload failed", "error");
    }
  };

  xhr.onerror = function () {
    showToast("Error occure", "error");
  };

  xhr.send(formData);




  function resetImageUpload() {
  // 🖼 Hide preview
  const preview = document.getElementById("previewImg");
  preview.src = "";
  preview.style.display = "none";

  // 📁 Clear file input
  document.getElementById("imageFile").value = "";

  // 📊 Reset progress bar
  document.getElementById("progressBar").style.width = "0%";
  document.getElementById("progressText").innerText = "";

  // 🔗 Clear image URL field
  document.getElementById("image").value = "";
}





  
});


// ➕ ADD PRODUCT
window.addProduct = async function () {

  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value.trim();
  const image = document.getElementById("image").value.trim();
  const category = document.getElementById("category").value;

  // ❌ VALIDATION
  if (!name || !price || !image || !category) {
   showToast("Please fill all fields", "warning");
    return;
  }

  // ✅ ADD TO FIREBASE
  await addDoc(collection(db, "products"), {
    name,
    price,
    image,
    category
  });

 showToast("Product added successfully!", "success");

  clearForm();
  resetImageUpload(); // important
  loadProducts();
};


function highlightError(inputId) {
  const field = document.getElementById(inputId);
  field.style.border = "2px solid red";

  setTimeout(() => {
    field.style.border = "none";
  }, 2000);
}



// 🔄 LOAD PRODUCTS
async function loadProducts(searchTerm = "") {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "products"));

  querySnapshot.forEach((docSnap) => {
    const p = docSnap.data();

    // 🔍 FILTER LOGIC
    if (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      const div = document.createElement("div");
      div.className = "product-item";

      div.innerHTML = `
        <img src="${p.image}" class="admin-img">

        <div class="product-info">
          <b>${p.name}</b>
          <p>₹${p.price}</p>
          <small>${p.category}</small>
        </div>

        <div class="actions">
          <button onclick="editProduct('${docSnap.id}', '${p.name}', '${p.price}', '${p.image}', '${p.category}')">
            ✏️ Edit
          </button>
          <button onclick="deleteProduct('${docSnap.id}')">
            ❌ Delete
          </button>
        </div>
      `;

      container.appendChild(div);
    }
  });
}


// ❌ DELETE PRODUCT (WITH CONFIRM)
window.deleteProduct = async function (id) {
  const confirmDelete = confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  await deleteDoc(doc(db, "products", id));
  loadProducts();
};


// ✏️ OPEN EDIT POPUP
window.editProduct = function (id, name, price, image, category) {
  document.getElementById("editName").value = name;
  document.getElementById("editPrice").value = price;
  document.getElementById("editImage").value = image;
  document.getElementById("editCategory").value = category;

  window.editId = id;

  document.getElementById("editPopup").style.display = "flex";
};


// 🔄 UPDATE PRODUCT (FIXED)
window.updateProduct = async function () {

  if (!window.editId) {
    alert("No product selected!");
    return;
  }

  const name = document.getElementById("editName").value;
  const price = document.getElementById("editPrice").value;
  const image = document.getElementById("editImage").value;
  const category = document.getElementById("editCategory").value;

  try {
    await updateDoc(doc(db, "products", window.editId), {
      name,
      price,
      image,
      category
    });

   showToast("Product Updated!", "success");

    closePopup();
    loadProducts();

  } catch (err) {
    console.error(err);
   showToast("Upload failed", "error");
  }
};


// ❌ CLOSE POPUP
window.closePopup = function () {
  document.getElementById("editPopup").style.display = "none";
};


// 🧹 CLEAR FORM
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";
  document.getElementById("category").value = "";

  document.getElementById("progressBar").style.width = "0%";
  document.getElementById("progressText").innerText = "";
}


// 🔄 INITIAL LOAD
loadProducts();


window.addCategory = async function () {
  const name = document.getElementById("categoryName").value;

  if (!name) {
    alert("Enter category name");
    return;
  }

  await addDoc(collection(db, "categories"), {
    name
  });

  document.getElementById("categoryName").value = "";

  loadCategories();
};


async function loadCategories() {
  const dropdown = document.getElementById("category");
  const list = document.getElementById("categoryList");

  dropdown.innerHTML = "";
  list.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "categories"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    // DROPDOWN
    const option = document.createElement("option");
    option.value = data.name;
    option.textContent = data.name;
    dropdown.appendChild(option);

    // LIST VIEW
    const div = document.createElement("div");
    div.innerHTML = `
  <div class="category-item-row">
    <span>${data.name}</span>
    <button onclick="deleteCategory('${docSnap.id}')">✖</button>
  </div>
`;
    list.appendChild(div);
  });
}


window.deleteCategory = async function (id) {
  const confirmDelete = confirm("Delete this category?");
  if (!confirmDelete) return;

  await deleteDoc(doc(db, "categories", id));
  loadCategories();
};

loadCategories();







// 🔥 IMAGE COMPRESSION FUNCTION//
async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (e) => img.src = e.target.result;

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const MAX_WIDTH = 800;
      const scale = MAX_WIDTH / img.width;

      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.7);
    };
  });
}



document.getElementById("searchInput").addEventListener("input", function () {
  const searchValue = this.value;
  loadProducts(searchValue);
});



function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.4s forwards";
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

