let products = [];
let orders = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadOrders();
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProductsTable();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        orders = await response.json();
        renderOrdersTable();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function showAdminPage(pageName) {
    document.querySelectorAll('.admin-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    document.getElementById(`${pageName}-admin`).classList.add('active');
    event.target.classList.add('active');
    
    if (pageName === 'products') {
        document.getElementById('page-title').textContent = 'Product Management';
    } else if (pageName === 'orders') {
        document.getElementById('page-title').textContent = 'Order Management';
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.name}" class="product-thumb"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.email}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${order.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="viewOrder(${order.id})">View</button>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 6px; border-radius: 6px; border: 1px solid #ddd;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    editingProductId = null;
    
    if (product) {
        title.textContent = 'Edit Product';
        editingProductId = product.id;
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-original-price').value = product.originalPrice || '';
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-rating').value = product.rating || 0;
        document.getElementById('product-reviews').value = product.reviews || 0;
    } else {
        title.textContent = 'Add Product';
    }
    
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

async function saveProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        originalPrice: parseFloat(document.getElementById('product-original-price').value) || null,
        image: document.getElementById('product-image').value,
        description: document.getElementById('product-description').value,
        stock: parseInt(document.getElementById('product-stock').value),
        rating: parseFloat(document.getElementById('product-rating').value) || 0,
        reviews: parseInt(document.getElementById('product-reviews').value) || 0
    };
    
    try {
        let response;
        if (editingProductId) {
            response = await fetch(`/api/products/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }
        
        if (response.ok) {
            closeProductModal();
            loadProducts();
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        openProductModal(product);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadProducts();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const orderDetail = document.getElementById('order-detail');
    const itemsHTML = order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return `
            <div class="order-item">
                <img src="${product ? product.image : ''}" alt="" class="order-item-image">
                <div class="order-item-info">
                    <p style="font-weight: 600;">${product ? product.name : 'Product'}</p>
                    <p>Quantity: ${item.quantity} x $${item.price.toFixed(2)}</p>
                </div>
                <p style="font-weight: 600;">$${(item.quantity * item.price).toFixed(2)}</p>
            </div>
        `;
    }).join('');
    
    orderDetail.innerHTML = `
        <div class="order-detail-info">
            <div class="order-detail-section">
                <h4>Order Information</h4>
                <div class="order-detail-row">
                    <span class="order-detail-label">Order ID:</span>
                    <span class="order-detail-value">#${order.id}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Date:</span>
                    <span class="order-detail-value">${order.date}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Status:</span>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
            </div>
            <div class="order-detail-section">
                <h4>Customer Information</h4>
                <div class="order-detail-row">
                    <span class="order-detail-label">Name:</span>
                    <span class="order-detail-value">${order.customer}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Email:</span>
                    <span class="order-detail-value">${order.email}</span>
                </div>
            </div>
            <div class="order-detail-section">
                <h4>Items</h4>
                <div class="order-items-list">
                    ${itemsHTML}
                </div>
            </div>
            <div class="order-detail-section">
                <div class="order-detail-row" style="font-size: 1.3rem; border-top: 2px solid #f0f0f0; padding-top: 15px;">
                    <span class="order-detail-label">Total:</span>
                    <span class="order-detail-value" style="color: #667eea;">$${order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('order-modal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.remove('active');
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            loadOrders();
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}
