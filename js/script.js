// ==================== //
// Product Data
// ==================== //
let products = JSON.parse(localStorage.getItem('products'));
if (!products) {
    // Start with empty array - admin will add products manually
    products = [];
    localStorage.setItem('products', JSON.stringify(products));
}

// Slider images data - load from localStorage or use defaults
function getSliderImages() {
    let sliderImages = JSON.parse(localStorage.getItem('sliderImages'));
    if (!sliderImages) {
        // Start with empty array - admin will add manually
        sliderImages = [];
        localStorage.setItem('sliderImages', JSON.stringify(sliderImages));
    }
    // Sort by order
    return sliderImages.sort((a, b) => a.order - b.order);
}

// Categories data - load from localStorage
function getCategories() {
    let categories = JSON.parse(localStorage.getItem('categories'));
    if (!categories) {
        // Start with empty array - admin will add manually
        categories = [];
        localStorage.setItem('categories', JSON.stringify(categories));
    }
    return categories;
}

function renderCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    
    const categories = getCategories();
    
    container.innerHTML = categories.map(c => `
        <a href="shop.html?category=${c.name.toLowerCase()}" class="category-card">
            <div class="category-icon">${c.icon}</div>
            <h3>${c.name}</h3>
            <p>${c.desc}</p>
        </a>
    `).join('') + `
        <a href="shop.html" class="category-card">
            <div class="category-icon">🎁</div>
            <h3>All Products</h3>
            <p>View Everything</p>
        </a>
    `;
}

function renderShopFilters() {
    const filterSelect = document.getElementById('category-filter');
    if (!filterSelect) return;
    
    const categories = getCategories();
    
    // Keep "All Categories" option and add dynamic ones
    filterSelect.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(c => `<option value="${c.name.toLowerCase()}">${c.name}</option>`).join('');
}

function renderFooterCategories() {
    const footerList = document.getElementById('footer-categories');
    if (!footerList) return;
    
    const categories = getCategories();
    
    if (categories.length === 0) {
        footerList.innerHTML = '<li><a href="shop.html">All Products</a></li>';
        return;
    }
    
    footerList.innerHTML = categories.map(c => 
        `<li><a href="shop.html?category=${c.name.toLowerCase()}">${c.name}</a></li>`
    ).join('');
}

// ==================== //
// Cart Functions
// ==================== //
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElements.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    showNotification('Item removed from cart', 'success');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    renderCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartSubtotal() {
    return getCartTotal();
}

// ==================== //
// Notification System
// ==================== //
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${type === 'success' ? '✓' : '✗'}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== //
// Product Rendering
// ==================== //
function createProductCard(product) {
    return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Product+Image'">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-wishlist">♡</div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span class="price-current">Rs. ${product.price.toLocaleString()}</span>
                    ${product.oldPrice ? `<span class="price-old">Rs. ${product.oldPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">
                        🛒 Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    const featuredProducts = products.filter(p => p.featured).slice(0, 12);
    container.innerHTML = featuredProducts.map(createProductCard).join('');
}

function renderAllProducts(filteredProducts = products) {
    const container = document.getElementById('shop-products');
    if (!container) return;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(createProductCard).join('');
}

// ==================== //
// Shop Page Functions
// ==================== //
function filterProducts() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const category = document.getElementById('category-filter')?.value || 'all';
    const sortBy = document.getElementById('sort-filter')?.value || 'default';
    
    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory;
    });
    
    // Sort products
    switch(sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    renderAllProducts(filtered);
}

// ==================== //
// Cart Page Functions
// ==================== //
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="shop.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        if (summaryContainer) {
            summaryContainer.style.display = 'none';
        }
        return;
    }
    
    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100x100?text=Product'">
            </div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>Rs. ${item.price.toLocaleString()} each</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-price">
                <span>Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        </div>
    `).join('');
    
    if (summaryContainer) {
        summaryContainer.style.display = 'block';
        const subtotal = getCartSubtotal();
        const shipping = subtotal > 5000 ? 0 : 200;
        const total = subtotal + shipping;
        
        document.getElementById('cart-subtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
        document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : `Rs. ${shipping}`;
        document.getElementById('cart-total').textContent = `Rs. ${total.toLocaleString()}`;
    }
}

// ==================== //
// Checkout Page Functions
// ==================== //
function renderOrderSummary() {
    const container = document.getElementById('order-items');
    if (!container) return;
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60?text=Product'">
            </div>
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity}</p>
            </div>
            <div class="order-item-price">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
        </div>
    `).join('');
    
    const subtotal = getCartSubtotal();
    const shipping = subtotal > 5000 ? 0 : 200;
    const total = subtotal + shipping;
    
    document.getElementById('order-subtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
    document.getElementById('order-shipping').textContent = shipping === 0 ? 'FREE' : `Rs. ${shipping}`;
    document.getElementById('order-total').textContent = `Rs. ${total.toLocaleString()}`;
}

function handlePaymentMethodChange() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const easypaisaDetails = document.getElementById('easypaisa-details');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            option.querySelector('input').checked = true;
            
            if (option.dataset.method === 'easypaisa') {
                easypaisaDetails.classList.add('show');
            } else {
                easypaisaDetails.classList.remove('show');
            }
        });
    });
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const name = formData.get('fullName');
    const phone = formData.get('phone');
    const address = formData.get('address');
    const paymentMethod = formData.get('paymentMethod');
    
    if (!name || !phone || !address || !paymentMethod) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Save order to localStorage
    const newOrder = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toISOString(),
        customerInfo: { name, phone, address, paymentMethod },
        items: [...cart],
        total: getCartTotal() + (getCartTotal() > 5000 ? 0 : 200),
        status: 'Pending'
    };
    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Show success modal
    showOrderSuccessModal({
        name,
        phone,
        address,
        paymentMethod,
        total: newOrder.total
    });
    
    // Clear cart
    cart = [];
    saveCart();
}

function showOrderSuccessModal(orderDetails) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <div class="modal-icon">✓</div>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your order, ${orderDetails.name}!</p>
            </div>
            <div class="modal-body">
                <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Easypaisa'}</p>
                <p><strong>Total Amount:</strong> Rs. ${orderDetails.total.toLocaleString()}</p>
                <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
                <p style="margin-top: 1rem; color: var(--text-light);">We will contact you at ${orderDetails.phone} to confirm your order.</p>
            </div>
            <div class="modal-footer">
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 100);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// ==================== //
// Hero Slider
// ==================== //
let currentSlide = 0;
let slideInterval;

function initSlider() {
    const sliderContainer = document.getElementById('slider-container');
    const dotsContainer = document.getElementById('slider-dots');
    
    if (!sliderContainer || !dotsContainer) return;
    
    const sliderImages = getSliderImages();
    
    // Create slides
    sliderContainer.innerHTML = sliderImages.map((slide, index) => `
        <div class="slide ${index === 0 ? 'active' : ''}">
            <img src="${slide.image}" alt="Slide ${index + 1}" class="slide-image" onerror="this.src='https://via.placeholder.com/1200x600?text=Shop+Image'">
            <div class="slide-overlay">
                <div class="slide-content">
                    <h1>${slide.headline}</h1>
                    <p>${slide.subtext}</p>
                    <a href="shop.html" class="btn btn-primary btn-lg">Shop Now</a>
                </div>
            </div>
        </div>
    `).join('');
    
    // Create dots
    dotsContainer.innerHTML = sliderImages.map((_, index) => `
        <div class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');
    
    // Add dot click handlers
    dotsContainer.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.index));
        });
    });
    
    // Start auto-slide
    startSlideInterval();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    resetSlideInterval();
}

function nextSlide() {
    goToSlide(currentSlide + 1);
}

function prevSlide() {
    goToSlide(currentSlide - 1);
}

function startSlideInterval() {
    slideInterval = setInterval(nextSlide, 3000);
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    startSlideInterval();
}

// ==================== //
// Mobile Navigation
// ==================== //
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navToggle || !navMenu) return;
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// ==================== //
// Contact Form
// ==================== //
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Save message to localStorage
        const message = {
            id: Date.now(),
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            message: document.getElementById('contact-message').value,
            date: new Date().toISOString(),
            read: false
        };
        
        let messages = JSON.parse(localStorage.getItem('messages')) || [];
        messages.unshift(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        form.reset();
    });
}

// ==================== //
// Initialize
// ==================== //
document.addEventListener('DOMContentLoaded', () => {
    // Update cart count
    updateCartCount();
    
    // Initialize mobile navigation
    initMobileNav();
    
    // Page specific initializations
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        initSlider();
        renderCategories();
        renderFeaturedProducts();
        initContactForm();
    }
    
    if (currentPage === 'shop.html') {
        renderAllProducts();
        renderShopFilters();
        renderFooterCategories();
        
        // Add event listeners for filters
        document.getElementById('search-input')?.addEventListener('input', filterProducts);
        document.getElementById('category-filter')?.addEventListener('change', filterProducts);
        document.getElementById('sort-filter')?.addEventListener('change', filterProducts);
        document.getElementById('search-btn')?.addEventListener('click', filterProducts);
    }
    
    if (currentPage === 'cart.html') {
        renderCart();
    }
    
    if (currentPage === 'checkout.html') {
        renderOrderSummary();
        handlePaymentMethodChange();
        
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', handleCheckoutSubmit);
        }
    }
});
