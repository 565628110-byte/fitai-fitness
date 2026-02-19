let products = [];
let cart = [];
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderFeaturedProducts();
        renderAllProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        cart = await response.json();
        updateCartCount();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    const featured = products.slice(0, 4);
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
}

function renderAllProducts(filteredProducts = products) {
    const container = document.getElementById('all-products');
    container.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    return `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="reviews-count">(${product.reviews} reviews)</span>
                </div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `;
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(`${pageName}-page`).classList.add('active');
    event.target.classList.add('active');
    
    if (pageName === 'cart') {
        renderCart();
    }
}

async function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    document.getElementById('product-detail').innerHTML = `
        <div class="product-detail-container">
            <img src="${product.image}" alt="${product.name}" class="product-detail-image">
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="reviews-count">(${product.reviews} reviews)</span>
                </div>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                <p><strong>Stock:</strong> ${product.stock} units</p>
                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <input type="number" id="quantity-input" value="1" min="1" max="${product.stock}">
                </div>
                <button class="add-to-cart-btn" onclick="addToCartWithQuantity()">Add to Cart</button>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('product-detail-page').classList.add('active');
}

async function addToCart(productId) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        cart = await response.json();
        updateCartCount();
        alert('Product added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

async function addToCartWithQuantity() {
    if (!currentProduct) return;
    const quantity = parseInt(document.getElementById('quantity-input').value) || 1;
    
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: currentProduct.id, quantity })
        });
        cart = await response.json();
        updateCartCount();
        alert('Product added to cart!');
        showPage('cart');
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

async function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <button class="btn btn-primary" onclick="showPage('products')">Continue Shopping</button>
            </div>
        `;
        cartSummaryContainer.innerHTML = '';
        return;
    }
    
    let total = 0;
    const cartItemsHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';
        
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${product.name}</h3>
                    <p class="cart-item-price">$${product.price.toFixed(2)} each</p>
                    <div class="cart-item-controls">
                        <label>Qty:</label>
                        <input type="number" value="${item.quantity}" min="1" max="${product.stock}" 
                               onchange="updateCartItem(${product.id}, this.value)">
                        <button class="remove-btn" onclick="removeFromCart(${product.id})">Remove</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <p style="font-weight: 700; color: #667eea; font-size: 1.2rem;">$${itemTotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');
    
    cartItemsContainer.innerHTML = `<div class="cart-items">${cartItemsHTML}</div>`;
    cartSummaryContainer.innerHTML = `
        <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="cart-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
        </div>
    `;
}

async function updateCartItem(productId, quantity) {
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: parseInt(quantity) })
        });
        cart = await response.json();
        updateCartCount();
        renderCart();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: 'DELETE'
        });
        cart = await response.json();
        updateCartCount();
        renderCart();
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

async function checkout() {
    if (cart.length === 0) return;
    
    const customerName = prompt('Enter your name:');
    const customerEmail = prompt('Enter your email:');
    
    if (!customerName || !customerEmail) {
        alert('Please fill in all information');
        return;
    }
    
    let total = 0;
    const items = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        total += product.price * item.quantity;
        return { productId: item.productId, quantity: item.quantity, price: product.price };
    });
    
    try {
        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: customerName,
                email: customerEmail,
                total,
                items
            })
        });
        
        cart = [];
        updateCartCount();
        alert('Order placed successfully! Thank you for your purchase.');
        renderCart();
    } catch (error) {
        console.error('Error placing order:', error);
    }
}

function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const filtered = category ? products.filter(p => p.category === category) : products;
    renderAllProducts(filtered);
}
