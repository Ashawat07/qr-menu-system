/* ===============================
   BASIC ELEMENTS
================================ */
const menu = document.getElementById("categories");
const cartBar = document.getElementById("cart");
const countEl = document.getElementById("count");

const cartModal = document.getElementById("cartModal");
const cartItemsBox = document.getElementById("cartItems");
const totalPriceEl = document.getElementById("totalPrice");

const searchInput = document.getElementById("searchInput");

/* ===============================
   CART DATA
================================ */
let cart = {};
let totalCount = 0;

/* ===============================
   RENDER CATEGORIES
================================ */
categories.forEach(cat => {
  const section = document.createElement("div");
  section.className = "category";
  section.setAttribute("data-cat", cat.id); // 🔥 IMPORTANT

  section.innerHTML = `
    <div class="category-card">
      <img src="${cat.image}">
      <div class="overlay">${cat.name}</div>
    </div>
    <div class="items"></div>
  `;

  const card = section.querySelector(".category-card");
  const itemsBox = section.querySelector(".items");

  let loaded = false;

  card.addEventListener("click", async () => {

    if (!loaded) {
      await loadCategoryItems(cat, itemsBox);
      loaded = true;
      itemsBox.dataset.loaded = "true";
    }

    if (itemsBox.style.maxHeight) {
      itemsBox.style.maxHeight = null;
    } else {
      closeAll();
      itemsBox.style.maxHeight = itemsBox.scrollHeight + "px";
    }
  });

  menu.appendChild(section);
});

/* ===============================
   LOAD CATEGORY ITEMS
================================ */
async function loadCategoryItems(cat, itemsBox) {
  const res = await fetch(cat.file);
  const data = await res.json();

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.setAttribute("data-search", item.name.toLowerCase());

    div.innerHTML = `
      <span class="item-name">${item.name}</span>
      <span class="item-price">₹${item.price}</span>

      <div class="qty-control">
        <button class="minus">−</button>
        <span class="qty">0</span>
        <button class="plus">+</button>
      </div>
    `;

    const qtyEl = div.querySelector(".qty");

    div.querySelector(".plus").onclick = (e) => {
      e.stopPropagation();
      updateItem(item.name, item.price, 1, qtyEl);
    };

    div.querySelector(".minus").onclick = (e) => {
      e.stopPropagation();
      updateItem(item.name, item.price, -1, qtyEl);
    };

    itemsBox.appendChild(div);
  });
}

/* ===============================
   CLOSE ALL CATEGORIES
================================ */
function closeAll() {
  document.querySelectorAll(".items").forEach(box => {
    box.style.maxHeight = null;
  });
}

/* ===============================
   UPDATE ITEM QTY
================================ */
function updateItem(name, price, change, qtyEl) {

  if (!cart[name]) {
    if (change < 0) return;
    cart[name] = { qty: 0, price };
  }

  cart[name].qty += change;

  if (cart[name].qty <= 0) {
    delete cart[name];
    qtyEl.innerText = 0;
  } else {
    qtyEl.innerText = cart[name].qty;
  }

  totalCount += change;
  if (totalCount < 0) totalCount = 0;

  countEl.innerText = totalCount;
  cartBar.style.bottom = totalCount > 0 ? "0" : "-80px";
}

/* ===============================
   CART BAR CLICK
================================ */
cartBar.onclick = () => openCart();

/* ===============================
   OPEN CART MODAL
================================ */
function openCart() {
  cartItemsBox.innerHTML = "";
  let total = 0;

  for (let item in cart) {
    const row = document.createElement("div");
    row.className = "cart-row";

    total += cart[item].qty * cart[item].price;

    row.innerHTML = `
      <span>${item}</span>
      <div class="qty-control">
        <button onclick="cartChange('${item}', -1)">−</button>
        <span>${cart[item].qty}</span>
        <button onclick="cartChange('${item}', 1)">+</button>
      </div>
    `;

    cartItemsBox.appendChild(row);
  }

  totalPriceEl.innerText = total;
  cartModal.style.display = "flex";
}

/* ===============================
   CART QTY CHANGE
================================ */
function cartChange(item, change) {
  cart[item].qty += change;
  totalCount += change;

  if (cart[item].qty <= 0) {
    delete cart[item];
  }

  if (totalCount < 0) totalCount = 0;

  countEl.innerText = totalCount;

  if (totalCount === 0) {
    cartBar.style.bottom = "-80px";
    closeCart();
  } else {
    openCart();
  }
}

/* ===============================
   CLOSE CART
================================ */
function closeCart() {
  cartModal.style.display = "none";
}

/* ===============================
   SEARCH – AUTO LOAD ALL CATEGORIES
================================ */
let searchLoaded = false;

searchInput.addEventListener("keyup", async function () {
  const value = this.value.toLowerCase().trim();

  if (value && !searchLoaded) {
    await loadAllCategoriesForSearch();
    searchLoaded = true;
  }

  document.querySelectorAll(".item").forEach(item => {
    const text = item.getAttribute("data-search");
    item.style.display = text.includes(value) ? "flex" : "none";
  });

  document.querySelectorAll(".items").forEach(box => {
    box.style.maxHeight = value ? box.scrollHeight + "px" : null;
  });
});

/* ===============================
   LOAD ALL CATEGORIES (SEARCH)
================================ */
async function loadAllCategoriesForSearch() {
  const sections = document.querySelectorAll(".category");

  for (let section of sections) {
    const itemsBox = section.querySelector(".items");

    if (itemsBox.dataset.loaded === "true") continue;

    const catId = section.getAttribute("data-cat");
    const cat = categories.find(c => c.id === catId);
    if (!cat) continue;

    await loadCategoryItems(cat, itemsBox);
    itemsBox.dataset.loaded = "true";
  }
}
