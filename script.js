document.addEventListener('DOMContentLoaded', function () {
  const productContainer = document.getElementById('product-list-container');
  let allProducts = [];

  fetch('http://localhost:5000/api/products')
    .then(res => res.json())
    .then(data => {
      allProducts = data.products;
      data.products.forEach((product, index) => {
        
        const productCardHTML = `
          <div class="col-sm-4">
            <div class="best_shoes" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
              <p class="best_text">${product.name}</p>
              <div class="shoes_icon">
                <img src="${product.image_url}" alt="${product.name}" class="img-responsive">
              </div>
              <div class="star_text">
                <div class="left_part">
                  <ul style="list-style: none; padding-left: 0;">
                    ${'<li style="display:inline;"><img src="images/star-icon.png" alt="star"></li>'.repeat(product.rating)}
                  </ul>
                </div>
                <div class="right_part">
                  <div class="shoes_price">Price : <span style="color: #ff4e5b;">$${product.price}</span></div>
                </div>
              </div>
              <div class="text-center" style="margin-top: 10px;">
                <button class="btn" style="background-color: green; color: white;" onclick="showProductDetail(${index})">View Detail</button>

              </div>
            </div>
          </div>
        `;
        productContainer.innerHTML += productCardHTML;
      });
    });

    
    function generateThumbnailGallery(images) {
      const mainImgId = `main-img-${Date.now()}`; // unique ID
      let thumbsHTML = '';
    
      images.forEach((img, i) => {
        thumbsHTML += `
          <img src="${img}" class="img-thumbnail m-1 thumb-img" style="width: 70px; cursor: pointer;" onclick="document.getElementById('${mainImgId}').src='${img}'">
        `;
      });
    
      return `
        <div class="text-center">
          <img id="${mainImgId}" src="${images[0]}" class="img-fluid mb-2" style="max-height: 300px;">
          <div class="d-flex justify-content-center flex-wrap">${thumbsHTML}</div>
        </div>
      `;
    }
    
  
    window.showProductDetail = function(index) {
      const product = allProducts[index];
      const modalBody = document.getElementById('modal-content');
    
      // สร้าง dropdown สี
      let colorOptions = '';
      product.colors.forEach((c, i) => {
        colorOptions += `<option value="${i}">${c.color}</option>`;
      });
    
      // สร้าง dropdown ไซส์
      let sizeOptions = '';
      (product.sizes || ["8US", "9US", "10US"]).forEach(size => {
        sizeOptions += `<option value="${size}">${size}</option>`;
      });
    
      const selectedColor = product.colors[0];
      const galleryHTML = generateThumbnailGallery(selectedColor.images);
    
      modalBody.innerHTML = `
        <div class="row">
          <div class="col-sm-6 image-gallery">
            ${galleryHTML}
          </div>
          <div class="col-sm-6">
            <p class="text-product">${product.name}</p>
            <p class="text-black"Price:</p>
            <p class="text-red">$${product.price}</p>
            <div class="form-group">
              <label class="text-black">Color:</label>
              <select class="form-control" id="color-select">
                ${colorOptions}
              </select>
            </div>
            <div class="form-group">
              <label class="text-black">Size:</label>
              <select class="form-control" id="size-select">
                ${sizeOptions}
              </select>
            </div>
            <button class="btn btn-success mt-2" onclick="addToCart(${index})">Add To Cart</button>
          </div>
        </div>
      `;
    
      // Event เปลี่ยนสีรองเท้า
      setTimeout(() => {
        document.getElementById('color-select').addEventListener('change', (e) => {
          const colorIndex = parseInt(e.target.value);
          const newImages = product.colors[colorIndex].images;
          const newGalleryHTML = generateThumbnailGallery(newImages);
          document.querySelector('.image-gallery').innerHTML = newGalleryHTML;
        });
      }, 0);
    
      $('#productModal').modal('show');
    };
    
    
    
    

    window.addToCart = function(index) {
      const product = allProducts[index];
    
      const selectedColorIndex = document.getElementById('color-select')?.value;
      const selectedSize = document.getElementById('size-select')?.value;
    
      // ตรวจสอบว่าผู้ใช้เลือก color และ size แล้ว
      if (selectedColorIndex === null || selectedColorIndex === '' || selectedSize === null || selectedSize === '') {
        alert("Select color or size");
        return;
      }
    
      const selectedColor = product.colors[selectedColorIndex];
    
      // สร้าง item พร้อมสี + ไซส์
      const cartItem = {
        name: product.name,
        price: product.price,
        color: selectedColor.color,
        size: selectedSize,
        image_url: selectedColor.images[0] // เอาภาพแรกของสีที่เลือก
      };
    
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));
    
      alert("Add to cart Successful!");
      $('#productModal').modal('hide');
    };
    
    document.getElementById('buyNowBtn').addEventListener('click', function () {
    // ไปหน้า shoes.html
    window.location.href = 'shoes.html';
    });
  
    document.getElementById('seeMoreBtn').addEventListener('click', function () {
      // ไปหน้า shoes.html
      window.location.href = 'shoes.html';
      });

  // โหลดข้อมูล Air Jordan 1 mid หน้า index
  fetch('http://localhost:5000/api/products')
    .then(response => response.json())
    .then(data => {
      const products = data.products;

      // หาผลิตภัณฑ์ที่ชื่อ "Nike Air Jordan 1 Mid"
      const product = products.find(p => p.name === "Nike Air Jordan 1 Mid");

      if (product) {
        // สมมุติว่าใช้ภาพแรกของสี Chicago Toe
        const imageSrc = product.colors.find(c => c.color === "Chicago Toe")?.images[2] || product.image_url;

        // ตั้งค่า src ให้ <img>
        const bannerImage = document.getElementById('bannerImage');
        if (bannerImage) {
          bannerImage.src = imageSrc;
          bannerImage.alt = product.name;
        }
      } else {
        console.warn("Product not found!");
      }
    })
    .catch(error => {
      console.error("Error loading product data:", error);
    });
  
    // โหลดข้อมูล Puma หน้า index
    fetch('http://localhost:5000/api/products')
    .then(response => response.json())
    .then(data => {
    const product = data.products.find(p => p.name === "Puma Speedcat");

    if (product) {
      const redColor = product.colors.find(c => c.color === "Red");
      const blueColor = product.colors.find(c => c.color === "Blue");

      const redStars = document.getElementById('speedcatRedStars');
      const blueStars = document.getElementById('speedcatBlueStars');

      // สร้างดาวตาม rating
      const createStars = (element, rating) => {
        element.innerHTML = ''; // เคลียร์ของเดิม
        for (let i = 0; i < rating; i++) {
          const li = document.createElement('li');
          const img = document.createElement('img');
          img.src = 'images/star-icon.png';
          li.appendChild(img);
          element.appendChild(li);
        }
      };

      if (redColor) {
        document.getElementById('speedcatRedImg').src = redColor.images[0];
        document.getElementById('speedcatRedName').textContent = "Speedcat Red";
        document.getElementById('speedcatRedPrice').textContent = product.price;
        createStars(redStars, product.rating);
      }

      if (blueColor) {
        document.getElementById('speedcatBlueImg').src = blueColor.images[0];
        document.getElementById('speedcatBlueName').textContent = "Speedcat Blue";
        document.getElementById('speedcatBluePrice').textContent = product.price;
        createStars(blueStars, product.rating);
      }
    }
  })
  .catch(error => {
    console.error("Error loading product data:", error);
  });

  // โหลดข้อมูล Adidas Gazelle หน้า index
    fetch('http://localhost:5000/api/products')
    .then(response => response.json())
    .then(data => {
      const product = data.products.find(p => p.name === "Adidas Gazelle");

      if (product) {
        const blueColor = product.colors.find(c => c.color === "Blue");

        if (blueColor) {
          // รูปภาพ
          document.getElementById('gazelleImage').src = blueColor.images[1] || blueColor.images[0];

          // ข้อมูลข้อความ
          document.getElementById('gazelleBrand').textContent = product.brand;
          document.getElementById('gazelleName').textContent = product.name;
          document.getElementById('gazellePrice').textContent = product.price;
        }
      } else {
        console.warn("Adidas Gazelle not found in product.json");
      }
    })
    .catch(error => {
      console.error("Error loading product data:", error);
    });

   
});
