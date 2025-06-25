document.addEventListener('DOMContentLoaded', function () {
  const productContainer = document.getElementById('product-list-NikeH');
  let allProducts = [];

  fetch('collection/Nike/NikeH.json')
    .then(res => res.json())
    .then(data => {
      allProducts = data.products;

      let slidesHTML = '';

      data.products.forEach((product, index) => {
        slidesHTML += `
          <div class="swiper-slide">
            <div class="best_shoes" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
              <p class="best_text"><strong>${product.name}</strong></p>
              <div class="shoes_icon">
                <img src="${product.image_url}" alt="${product.name}" class="img-responsive" style="width:100%;">
              </div>
              <div class="star_text">
                <div class="left_part">
                  <ul style="list-style: none; padding-left: 0;">
                    ${'<li style="display:inline;"><img src="images/star-icon.png" alt="star"></li>'.repeat(product.rating)}
                  </ul>
                </div>
                <div class="right_part">
                  <div class="shoes_price">Price: $<span style="color: #ff4e5b;">${product.price}</span></div>
                </div>
              </div>
              <div class="text-center mt-2">
                <button class="btn btn-success" onclick="showProductDetail(${index})">View Detail</button>
              </div>
            </div>
          </div>
        `;
      });

      productContainer.innerHTML = slidesHTML;

      // Init Swiper AFTER products are loaded
      new Swiper('.mySwiper', {
        slidesPerView: 3,
        spaceBetween: 20,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
      });
    });

  window.showProductDetail = function (index) {
    const product = allProducts[index];
    const modalBody = document.getElementById('modal-content');

    // Generate dropdowns
    let colorOptions = '';
    product.colors.forEach((c, i) => {
      colorOptions += `<option value="${i}">${c.color}</option>`;
    });

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
          <h3>${product.name}</h3>
          <p><strong>Price:</strong> $${product.price}</p>
          <div class="form-group">
            <label>Color:</label>
            <select class="form-control" id="color-select">${colorOptions}</select>
          </div>
          <div class="form-group">
            <label>Size:</label>
            <select class="form-control" id="size-select">${sizeOptions}</select>
          </div>
          <button class="btn btn-success mt-2" onclick="addToCart(${index})">Add to cart</button>
        </div>
      </div>
    `;

    // Update gallery on color change
    setTimeout(() => {
      document.getElementById('color-select').addEventListener('change', (e) => {
        const colorIndex = parseInt(e.target.value);
        const newImages = product.colors[colorIndex].images;
        document.querySelector('.image-gallery').innerHTML = generateThumbnailGallery(newImages);
      });
    }, 10);

    $('#productModal').modal('show');
  };

  window.generateThumbnailGallery = function (images) {
    const mainImgId = `main-img-${Date.now()}`;
    let thumbsHTML = '';

    images.forEach(img => {
      thumbsHTML += `<img src="${img}" class="img-thumbnail m-1 thumb-img" style="width: 70px; cursor: pointer;" onclick="document.getElementById('${mainImgId}').src='${img}'">`;
    });

    return `
      <div class="text-center">
        <img id="${mainImgId}" src="${images[0]}" class="img-fluid mb-2" style="max-height: 300px;">
        <div class="d-flex justify-content-center flex-wrap">${thumbsHTML}</div>
      </div>
    `;
  };

  window.addToCart = function (index) {
    const product = allProducts[index];
    const colorIndex = document.getElementById('color-select')?.value;
    const size = document.getElementById('size-select')?.value;

    if (!colorIndex || !size) {
      alert("Please select color and size");
      return;
    }

    const selectedColor = product.colors[colorIndex];
    const cartItem = {
      name: product.name,
      price: product.price,
      color: selectedColor.color,
      size: size,
      image_url: selectedColor.images[0]
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    alert("Added to cart!");
    $('#productModal').modal('hide');
  };
});