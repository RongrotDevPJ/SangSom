const productContainer = document.querySelector(".product-list");

if  (productContainer) {
    displayProducts();
}


function displayProducts() {
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <div class"img-box">
                <img src="${product.colors[0].mainImage}">
            </div>
            <h2 class="title">${product.title}</h2>
            <span class="price">${product.price}</span>
        `;
        productContainer.appendChild(productCard);

        const imgBox = productCard.querySelector(".img-box");
        imgBox.addEventListener("click", () => {
            sessionStorage.setItem("selectedProduct", JSON.stringify(product));
            window.location.href = "product-detail.html"
        })
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const productContainer = document.getElementById('product-list-container');
    let allProducts = [];
  
    // โหลดข้อมูลจาก local JSON หรือ API (เปลี่ยน path ตามจริง)
    fetch('data/product.json')
      .then(res => res.json())
      .then(data => {
        allProducts = data.products;
  
        data.products.forEach((product, index) => {
          const productCardHTML = `
            <div class="col-md-4">
              <div class="card mb-4 shadow-sm">
                <img src="${product.image_url}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                  <h5 class="card-title">${product.name}</h5>
                  <p class="card-text text-muted">${product.brand}</p>
                  <p class="card-text text-danger">$${product.price}</p>
                  <button class="btn btn-primary btn-block" onclick="showProductDetail(${index})">View Detail</button>
                </div>
              </div>
            </div>
          `;
          productContainer.innerHTML += productCardHTML;
        });
      });
  
    // ฟังก์ชันดูรายละเอียดสินค้า
    window.showProductDetail = function (index) {
      const product = allProducts[index];
      const modalBody = document.getElementById('modal-content');
  
      let colorOptions = '';
      product.colors.forEach((c, i) => {
        colorOptions += `<option value="${i}">${c.color}</option>`;
      });
  
      let sizeOptions = '';
      (product.sizes || ["8US", "9US", "10US"]).forEach(size => {
        sizeOptions += `<option value="${size}">${size}</option>`;
      });
  
      modalBody.innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <img src="${product.colors[0].images[0]}" class="img-fluid" alt="${product.name}">
          </div>
          <div class="col-md-6">
            <h4>${product.name}</h4>
            <p>Brand: ${product.brand}</p>
            <p>Price: $${product.price}</p>
            <div class="form-group">
              <label for="color-select">Color</label>
              <select class="form-control" id="color-select">${colorOptions}</select>
            </div>
            <div class="form-group">
              <label for="size-select">Size</label>
              <select class="form-control" id="size-select">${sizeOptions}</select>
            </div>
            <button class="btn btn-success" onclick="addToCart(${index})">Add to Cart</button>
          </div>
        </div>
      `;
  
      $('#productModal').modal('show');
    };
  
    // ฟังก์ชันเพิ่มของลงตะกร้า
    window.addToCart = function (index) {
      const product = allProducts[index];
      const colorSelect = document.getElementById('color-select');
      const sizeSelect = document.getElementById('size-select');
  
      const selectedColorIndex = colorSelect?.value;
      const selectedSize = sizeSelect?.value;
  
      if (!selectedColorIndex || !selectedSize) {
        alert("Please select color and size.");
        return;
      }
  
      const selectedColor = product.colors[selectedColorIndex];
  
      const cartItem = {
        name: product.name,
        brand: product.brand,
        price: product.price,
        color: selectedColor.color,
        size: selectedSize,
        image_url: selectedColor.images[0]
      };
  
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
  
      alert("Product added to cart!");
      $('#productModal').modal('hide');
    };
  });
  