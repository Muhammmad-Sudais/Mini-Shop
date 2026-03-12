// Admin Functionality

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (localStorage.getItem('adminToken') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Initialize data
    initData();
    updateDashboardStats();
    
    // Render all sections immediately so data is visible
    renderAdminProducts();
    renderAdminCategories();
    renderAdminSlider();
    renderAdminOrders();
    renderAdminMessages();
    
    // Bind forms
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
    document.getElementById('slider-form').addEventListener('submit', handleSliderSubmit);
});

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

function logoutAndGoToShop() {
    localStorage.removeItem('adminToken');
    window.location.href = 'shop.html';
}

function showSection(sectionId) {
    document.getElementById('sec-dashboard').style.display = 'none';
    document.getElementById('sec-products').style.display = 'none';
    document.getElementById('sec-categories').style.display = 'none';
    document.getElementById('sec-slider').style.display = 'none';
    document.getElementById('sec-orders').style.display = 'none';
    document.getElementById('sec-messages').style.display = 'none';
    
    document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
    
    // Handle Navigation Highlights
    if (sectionId === 'dashboard') {
        document.getElementById('sec-dashboard').style.display = 'block';
        document.querySelector('.admin-menu a:nth-child(1)').classList.add('active');
        updateDashboardStats();
    } else if (sectionId === 'products') {
        document.getElementById('sec-products').style.display = 'block';
        document.querySelector('.admin-menu a:nth-child(2)').classList.add('active');
        renderAdminProducts();
    } else if (sectionId === 'categories') {
        document.getElementById('sec-categories').style.display = 'block';
        document.querySelector('.admin-menu a:nth-child(3)').classList.add('active');
        renderAdminCategories();
    } else if (sectionId === 'slider') {
        document.getElementById('sec-slider').style.display = 'block';
        document.querySelector('.admin-menu a:nth-child(4)').classList.add('active');
        renderAdminSlider();
    } else if (sectionId === 'orders') {
        document.getElementById('sec-orders').style.display = 'block';
        document.querySelector('.admin-menu a:nth-child(5)').classList.add('active');
        renderAdminOrders();
    } else if (sectionId === 'messages') {
        document.getElementById('sec-messages').style.display = 'block';
        document.querySelector('.admin-menu a:nth-child(6)').classList.add('active');
        renderAdminMessages();
    }
}

// ==== Products Management ==== //

let adminProducts = [];

function initData() {
    adminProducts = JSON.parse(localStorage.getItem('products')) || [];
    
    // Initialize empty categories if none exist (admin will add manually)
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify([]));
    }
    
    // Initialize empty slider if none exist (admin will add manually)
    if (!localStorage.getItem('sliderImages')) {
        localStorage.setItem('sliderImages', JSON.stringify([]));
    }
}

function saveAdminProducts() {
    localStorage.setItem('products', JSON.stringify(adminProducts));
}

function renderAdminProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = adminProducts.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><img src="${p.image}" alt="${p.name}" width="50" style="border-radius:4px;"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>Rs. ${p.price.toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-sm" style="background:#dc3545; color:white;" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-title').textContent = 'Add New Product';
    updateCategorySelect();
    document.getElementById('product-modal').classList.add('show');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('show');
    document.getElementById('prod-preview').style.display = 'none';
}

function previewProductImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('prod-image').value = e.target.result;
            document.getElementById('prod-preview').src = e.target.result;
            document.getElementById('prod-preview').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function updateCategorySelect() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const select = document.getElementById('prod-category');
    select.innerHTML = categories.map(c => `<option value="${c.name.toLowerCase()}">${c.name}</option>`).join('');
}

function handleProductSubmit(e) {
    e.preventDefault();
    const idField = document.getElementById('prod-id').value;
    
    const productData = {
        name: document.getElementById('prod-name').value,
        category: document.getElementById('prod-category').value,
        price: Number(document.getElementById('prod-price').value),
        image: document.getElementById('prod-image').value,
        badge: null,
        featured: false
    };

    if (idField) {
        // Edit
        const index = adminProducts.findIndex(p => p.id == idField);
        if (index > -1) {
            adminProducts[index] = { ...adminProducts[index], ...productData };
        }
    } else {
        // Add
        productData.id = Date.now(); // Generate unique ID
        adminProducts.unshift(productData);
    }

    saveAdminProducts();
    closeProductModal();
    renderAdminProducts();
    updateDashboardStats();
}

function editProduct(id) {
    const p = adminProducts.find(product => product.id == id);
    if (!p) return;
    
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    updateCategorySelect();
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-image').value = p.image;
    
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('product-modal').classList.add('show');
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        adminProducts = adminProducts.filter(p => p.id != id);
        saveAdminProducts();
        renderAdminProducts();
        updateDashboardStats();
    }
}


// ==== Categories Management ==== //

let adminCategories = [];

function renderAdminCategories() {
    adminCategories = JSON.parse(localStorage.getItem('categories')) || [];
    const tbody = document.getElementById('categories-table-body');
    
    if (adminCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No categories found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminCategories.map(c => `
        <tr>
            <td>${c.id}</td>
            <td style="font-size: 1.5rem;">${c.icon}</td>
            <td>${c.name}</td>
            <td>${c.desc}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editCategory(${c.id})">Edit</button>
                <button class="btn btn-sm" style="background:#dc3545; color:white;" onclick="deleteCategory(${c.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openCategoryModal() {
    document.getElementById('category-form').reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-modal-title').textContent = 'Add Category';
    document.getElementById('category-modal').classList.add('show');
}

function closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('show');
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const idField = document.getElementById('cat-id').value;
    
    const categoryData = {
        icon: document.getElementById('cat-icon').value,
        name: document.getElementById('cat-name').value,
        desc: document.getElementById('cat-desc').value
    };

    if (idField) {
        const index = adminCategories.findIndex(c => c.id == idField);
        if (index > -1) {
            adminCategories[index] = { ...adminCategories[index], ...categoryData };
        }
    } else {
        categoryData.id = Date.now();
        adminCategories.push(categoryData);
    }

    localStorage.setItem('categories', JSON.stringify(adminCategories));
    closeCategoryModal();
    renderAdminCategories();
}

function editCategory(id) {
    const c = adminCategories.find(cat => cat.id == id);
    if (!c) return;
    
    document.getElementById('cat-id').value = c.id;
    document.getElementById('cat-icon').value = c.icon;
    document.getElementById('cat-name').value = c.name;
    document.getElementById('cat-desc').value = c.desc;
    
    document.getElementById('cat-modal-title').textContent = 'Edit Category';
    document.getElementById('category-modal').classList.add('show');
}

function deleteCategory(id) {
    if (confirm("Are you sure you want to delete this category?")) {
        adminCategories = adminCategories.filter(c => c.id != id);
        localStorage.setItem('categories', JSON.stringify(adminCategories));
        renderAdminCategories();
    }
}

// ==== Slider Management ==== //

let adminSlider = [];

function renderAdminSlider() {
    adminSlider = JSON.parse(localStorage.getItem('sliderImages')) || [];
    adminSlider.sort((a, b) => a.order - b.order);
    
    const tbody = document.getElementById('slider-table-body');
    
    if (adminSlider.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No slider images found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminSlider.map((s, index) => `
        <tr>
            <td>${s.order}</td>
            <td><img src="${s.image}" alt="Slide ${index + 1}" width="80" style="border-radius:4px;"></td>
            <td>${s.headline}</td>
            <td>${s.subtext || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="moveSliderUp(${s.id})">↑</button>
                <button class="btn btn-sm btn-outline" onclick="moveSliderDown(${s.id})">↓</button>
                <button class="btn btn-sm btn-outline" onclick="editSlider(${s.id})">Edit</button>
                <button class="btn btn-sm" style="background:#dc3545; color:white;" onclick="deleteSlider(${s.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openSliderModal() {
    document.getElementById('slider-form').reset();
    document.getElementById('slider-id').value = '';
    document.getElementById('slider-modal-title').textContent = 'Add Slider Image';
    document.getElementById('slider-modal').classList.add('show');
}

function closeSliderModal() {
    document.getElementById('slider-modal').classList.remove('show');
    document.getElementById('slider-preview').style.display = 'none';
}

function previewSliderImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('slider-image').value = e.target.result;
            document.getElementById('slider-preview').src = e.target.result;
            document.getElementById('slider-preview').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function handleSliderSubmit(e) {
    e.preventDefault();
    const idField = document.getElementById('slider-id').value;
    
    const sliderData = {
        image: document.getElementById('slider-image').value,
        headline: document.getElementById('slider-headline').value,
        subtext: document.getElementById('slider-subtext').value,
        order: parseInt(document.getElementById('slider-order').value)
    };

    if (idField) {
        const index = adminSlider.findIndex(s => s.id == idField);
        if (index > -1) {
            adminSlider[index] = { ...adminSlider[index], ...sliderData };
        }
    } else {
        sliderData.id = Date.now();
        adminSlider.push(sliderData);
    }

    localStorage.setItem('sliderImages', JSON.stringify(adminSlider));
    closeSliderModal();
    renderAdminSlider();
}

function editSlider(id) {
    const s = adminSlider.find(slide => slide.id == id);
    if (!s) return;
    
    document.getElementById('slider-id').value = s.id;
    document.getElementById('slider-image').value = s.image;
    document.getElementById('slider-headline').value = s.headline;
    document.getElementById('slider-subtext').value = s.subtext || '';
    document.getElementById('slider-order').value = s.order;
    
    document.getElementById('slider-modal-title').textContent = 'Edit Slider';
    document.getElementById('slider-modal').classList.add('show');
}

function deleteSlider(id) {
    if (confirm("Are you sure you want to delete this slider image?")) {
        adminSlider = adminSlider.filter(s => s.id != id);
        adminSlider.sort((a, b) => a.order - b.order);
        adminSlider.forEach((s, i) => s.order = i);
        localStorage.setItem('sliderImages', JSON.stringify(adminSlider));
        renderAdminSlider();
    }
}

function moveSliderUp(id) {
    const index = adminSlider.findIndex(s => s.id == id);
    if (index > 0) {
        const temp = adminSlider[index].order;
        adminSlider[index].order = adminSlider[index - 1].order;
        adminSlider[index - 1].order = temp;
        localStorage.setItem('sliderImages', JSON.stringify(adminSlider));
        renderAdminSlider();
    }
}

function moveSliderDown(id) {
    const index = adminSlider.findIndex(s => s.id == id);
    if (index < adminSlider.length - 1) {
        const temp = adminSlider[index].order;
        adminSlider[index].order = adminSlider[index + 1].order;
        adminSlider[index + 1].order = temp;
        localStorage.setItem('sliderImages', JSON.stringify(adminSlider));
        renderAdminSlider();
    }
}


// ==== Orders Management ==== //

let adminOrders = [];

function renderAdminOrders() {
    adminOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const tbody = document.getElementById('orders-table-body');
    
    if (adminOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>';
        return;
    }

    tbody.innerHTML = adminOrders.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${new Date(o.date).toLocaleDateString()}</td>
            <td>${o.customerInfo.name}</td>
            <td>Rs. ${o.total.toLocaleString()}</td>
            <td><span style="background:${o.status==='Pending'?'#ffc107':'#28a745'}; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.85rem;">${o.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewOrder('${o.id}')">View Details</button>
            </td>
        </tr>
    `).join('');
}

let viewingOrderId = null;

function viewOrder(orderId) {
    const o = adminOrders.find(ord => ord.id === orderId);
    if (!o) return;
    
    viewingOrderId = orderId;
    
    const content = `
        <div style="margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
            <h3>Customer Info</h3>
            <p><strong>Name:</strong> ${o.customerInfo.name}</p>
            <p><strong>Phone:</strong> ${o.customerInfo.phone}</p>
            <p><strong>Address:</strong> ${o.customerInfo.address}</p>
            <p><strong>Method:</strong> ${o.customerInfo.paymentMethod.toUpperCase()}</p>
        </div>
        <div>
            <h3>Items Ordered</h3>
            <ul style="list-style:none; padding:0;">
                ${o.items.map(item => `<li style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                </li>`).join('')}
            </ul>
            <h3 style="text-align:right; margin-top:1rem; border-top:2px solid; padding-top:1rem;">Total: Rs. ${o.total.toLocaleString()}</h3>
        </div>
    `;
    
    document.getElementById('order-details-content').innerHTML = content;
    
    const btn = document.getElementById('mark-shipped-btn');
    if (o.status === 'Pending') {
        btn.style.display = 'inline-block';
        btn.onclick = () => markOrderShipped(o.id);
    } else {
        btn.style.display = 'none';
    }
    
    document.getElementById('order-modal').classList.add('show');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.remove('show');
    viewingOrderId = null;
}

function markOrderShipped(orderId) {
    const index = adminOrders.findIndex(o => o.id === orderId);
    if (index > -1) {
        adminOrders[index].status = 'Shipped';
        localStorage.setItem('orders', JSON.stringify(adminOrders));
        closeOrderModal();
        renderAdminOrders();
    }
}


// ==== Dashboard Stats ==== //

function updateDashboardStats() {
    adminProducts = JSON.parse(localStorage.getItem('products')) || [];
    adminOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const totalRev = adminOrders.reduce((sum, o) => sum + o.total, 0);
    
    document.getElementById('stat-products').textContent = adminProducts.length;
    document.getElementById('stat-orders').textContent = adminOrders.length;
    document.getElementById('stat-revenue').textContent = `Rs. ${totalRev.toLocaleString()}`;
    
    // Update unread messages count on dashboard if element exists
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const unreadCount = messages.filter(m => !m.read).length;
    const msgStatEl = document.getElementById('stat-messages');
    if (msgStatEl) msgStatEl.textContent = unreadCount;
}


// ==== Messages Management ==== //

let adminMessages = [];

function renderAdminMessages() {
    adminMessages = JSON.parse(localStorage.getItem('messages')) || [];
    const tbody = document.getElementById('messages-table-body');
    
    if (adminMessages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No messages found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminMessages.map(m => {
        const preview = m.message.length > 30 ? m.message.substring(0, 30) + '...' : m.message;
        const statusBadge = m.read 
            ? '<span style="background:#28a745; color:white; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.85rem;">Read</span>'
            : '<span style="background:#ffc107; color:black; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.85rem;">New</span>';
        return `
        <tr style="${m.read ? '' : 'background:#fffbeb;'}">
            <td>${new Date(m.date).toLocaleDateString()}</td>
            <td>${m.name}</td>
            <td>${m.email}</td>
            <td>${m.phone || '-'}</td>
            <td>${preview}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewMessage(${m.id})">View</button>
                <button class="btn btn-sm" style="background:#dc3545; color:white;" onclick="deleteMessage(${m.id})">Delete</button>
            </td>
        </tr>
    `}).join('');
}

let viewingMessageId = null;

function viewMessage(id) {
    const m = adminMessages.find(msg => msg.id == id);
    if (!m) return;
    
    viewingMessageId = id;
    
    // Mark as read
    if (!m.read) {
        m.read = true;
        localStorage.setItem('messages', JSON.stringify(adminMessages));
        renderAdminMessages();
    }
    
    const content = `
        <div style="margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
            <h3>Message from ${m.name}</h3>
            <p><strong>Email:</strong> ${m.email}</p>
            <p><strong>Phone:</strong> ${m.phone || 'Not provided'}</p>
            <p><strong>Date:</strong> ${new Date(m.date).toLocaleString()}</p>
        </div>
        <div>
            <h4>Message:</h4>
            <p style="white-space: pre-wrap; background:#f5f5f5; padding:1rem; border-radius:4px;">${m.message}</p>
        </div>
    `;
    
    document.getElementById('order-details-content').innerHTML = content;
    document.getElementById('mark-shipped-btn').style.display = 'none';
    document.getElementById('order-modal').classList.add('show');
}

function deleteMessage(id) {
    if (confirm("Are you sure you want to delete this message?")) {
        adminMessages = adminMessages.filter(m => m.id != id);
        localStorage.setItem('messages', JSON.stringify(adminMessages));
        renderAdminMessages();
    }
}
