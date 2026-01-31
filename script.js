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

/* ITEM DETAIL MODAL */
const itemModal = document.getElementById("itemModal");
const itemImg = document.getElementById("itemImg");
const itemNameEl = document.getElementById("itemName");
const itemIngredientsEl = document.getElementById("itemIngredients");
const itemServesEl = document.getElementById("itemServes");
const itemPriceEl = document.getElementById("itemPrice");
const modalQtyEl = document.getElementById("modalQty");
const addToCartBtn = document.getElementById("addToCartBtn");

/* ===============================
   STATE
================================ */
let cart = {}; // { name: { qty, price } }
let totalCount = 0;

let currentItem = null;
let modalQty = 1;
let searchLoaded = false;

/* ===============================
   RENDER CATEGORIES
================================ */
categories.forEach(cat => {
  const section = document.createElement("div");
  section.className = "category";
  section.setAttribute("data-cat", cat.id);

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

  card.onclick = async () => {
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
  };

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
    `;

    /* ITEM CLICK → OPEN MODAL */
    div.onclick = () => openItemModal(item);

    itemsBox.appendChild(div);
  });
}

/* ===============================
   CLOSE ALL CATEGORIES
================================ */
function closeAll() {
  document.querySelectorAll(".items").forEach(b => b.style.maxHeight = null);
}

/* ===============================
   ITEM DETAIL MODAL
================================ */
function openItemModal(item) {
  currentItem = item;
  modalQty = 1;

  itemImg.src = item.image;
  itemNameEl.innerText = item.name;
  itemIngredientsEl.innerText = item.ingredients;
  itemServesEl.innerText = "Serves: " + item.serves;
  itemPriceEl.innerText = item.price;
  modalQtyEl.innerText = modalQty;

  itemModal.style.display = "flex";
}

function closeItemModal() {
  itemModal.style.display = "none";
}

/* MODAL QTY */
document.getElementById("modalPlus").onclick = () => {
  modalQty++;
  modalQtyEl.innerText = modalQty;
};

document.getElementById("modalMinus").onclick = () => {
  if (modalQty > 1) {
    modalQty--;
    modalQtyEl.innerText = modalQty;
  }
};

/* ADD TO CART FROM MODAL */
addToCartBtn.onclick = () => {
  addToCart(currentItem.name, currentItem.price, modalQty);
  closeItemModal();
};

/* ===============================
   CART LOGIC
================================ */
function addToCart(name, price, qty) {
  if (!cart[name]) {
    cart[name] = { qty: 0, price };
  }
  cart[name].qty += qty;
  totalCount += qty;

  countEl.innerText = totalCount;
  cartBar.style.bottom = "0";
}

cartBar.onclick = () => openCart();

/* CART MODAL */
function openCart() {
  cartItemsBox.innerHTML = "";
  let total = 0;

  for (let name in cart) {
    total += cart[name].qty * cart[name].price;

    const row = document.createElement("div");
    row.className = "cart-row";

    row.innerHTML = `
      <span>${name}</span>
      <div class="qty-control">
        <button onclick="cartChange('${name}', -1)">−</button>
        <span>${cart[name].qty}</span>
        <button onclick="cartChange('${name}', 1)">+</button>
      </div>
    `;

    cartItemsBox.appendChild(row);
  }

  totalPriceEl.innerText = total;
  cartModal.style.display = "flex";
}

function cartChange(name, change) {
  cart[name].qty += change;
  totalCount += change;

  if (cart[name].qty <= 0) delete cart[name];
  if (totalCount < 0) totalCount = 0;

  countEl.innerText = totalCount;

  if (totalCount === 0) {
    cartBar.style.bottom = "-80px";
    closeCart();
  } else {
    openCart();
  }
}

function closeCart() {
  cartModal.style.display = "none";
}

/* ===============================
   SEARCH (AUTO LOAD ALL)
================================ */
searchInput.addEventListener("keyup", async () => {
  const value = searchInput.value.toLowerCase().trim();

  if (value && !searchLoaded) {
    await loadAllCategoriesForSearch();
    searchLoaded = true;
  }

  document.querySelectorAll(".item").forEach(item => {
    item.style.display =
      item.getAttribute("data-search").includes(value)
        ? "flex"
        : "none";
  });

  document.querySelectorAll(".items").forEach(box => {
    box.style.maxHeight = value ? box.scrollHeight + "px" : null;
  });
});

async function loadAllCategoriesForSearch() {
  document.querySelectorAll(".category").forEach(async section => {
    const itemsBox = section.querySelector(".items");
    if (itemsBox.dataset.loaded === "true") return;

    const catId = section.getAttribute("data-cat");
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    await loadCategoryItems(cat, itemsBox);
    itemsBox.dataset.loaded = "true";
  });
}
