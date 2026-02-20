// Product database
const products = [
    { id: 1, name: 'Fat Burner Tablet', desc: 'Dr.Morepen · 60 tablets', price: 12.99, icon: 'fas fa-capsules', category: 'wellness' },
    { id: 2, name: 'Omega-3 Fish Oil', desc: 'Deep sea fish oil · 1000mg', price: 15.99, icon: 'fas fa-fish', category: 'vitamins' },
    { id: 3, name: 'Biotin+ Advanced', desc: 'Hair & skin health · 60 tablets', price: 11.99, icon: 'fas fa-bolt', category: 'wellness' },
    { id: 4, name: 'Cod Liver Oil', desc: 'With Omega-3 · 500mg', price: 9.99, icon: 'fas fa-cod', category: 'vitamins' },
    { id: 5, name: 'Multivitamin Men', desc: 'Advanced formula · 60 tablets', price: 13.99, icon: 'fas fa-droplet', category: 'vitamins' },
    { id: 6, name: 'Emergency First Aid Kit', desc: 'Complete medical kit', price: 24.99, icon: 'fas fa-first-aid', category: 'emergency' },
    { id: 7, name: 'Pain Relief Tablets', desc: 'Fast acting · 20 tablets', price: 8.99, icon: 'fas fa-pills', category: 'medicine' },
    { id: 8, name: 'Antibiotics', desc: 'Prescription required · 10 tablets', price: 18.99, icon: 'fas fa-tablets', category: 'medicine' },
    { id: 9, name: 'Vitamin D3', desc: '1000 IU · 60 capsules', price: 7.99, icon: 'fas fa-sun', category: 'vitamins' },
    { id: 10, name: 'Blood Pressure Monitor', desc: 'Digital · Home use', price: 39.99, icon: 'fas fa-heartbeat', category: 'wellness' },
    { id: 11, name: 'Insulin Syringes', desc: 'Emergency medical supplies', price: 14.99, icon: 'fas fa-syringe', category: 'emergency' },
    { id: 12, name: 'Asthma Inhaler', desc: 'Emergency relief · Prescription', price: 22.99, icon: 'fas fa-lungs', category: 'medicine' }
];

let currentCategory = 'all';
let searchQuery = '';
let priorityQueueCount = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    setupEventListeners();
    checkUser();
});

function checkUser() {
    const user = localStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        const signInLink = document.querySelector('.sign-in-link');
        if (signInLink) {
            signInLink.innerHTML = `<i class="fas fa-user"></i> ${userData.name}`;
            signInLink.href = '#';
        }
    }
}

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            loadProducts();
        });
    }

    // Category filters
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(cat => cat.classList.remove('active-cat'));
            item.classList.add('active-cat');
            currentCategory = item.getAttribute('data-category');
            loadProducts();
        });
    });

    // ===== EMERGENCY BUTTON =====
function initEmergencyBtn() {
    const emergencyBtn = document.getElementById('emergencyBtn');
    if (!emergencyBtn) return;

    // Already activated? Disable immediately on page load
    if (localStorage.getItem('emergency_activated')) {
        disableEmergency(emergencyBtn);
        return;
    }

    emergencyBtn.addEventListener('click', function () {
        if (localStorage.getItem('emergency_activated')) return; // double-safety

        localStorage.setItem('emergency_activated', 'true');
        localStorage.setItem('queue_priority', 'EMERGENCY');

        disableEmergency(emergencyBtn);

        // Update queue status text
        document.getElementById('queueStatus').innerHTML =
            '<i class="fas fa-bolt"></i> YOU ARE #1 — Drone dispatching now';

        // Show toast
        showToast('🚁 Emergency priority activated! You are #1 in queue.', 'error');
    });
}

function disableEmergency(btn) {
    btn.disabled = true;
    btn.style.background = '#555';
    btn.style.cursor = 'not-allowed';
    btn.style.opacity = '0.6';
    btn.innerHTML = '<i class="fas fa-check"></i> PRIORITY ACTIVATED';

    // Add #1 badge below button
    if (!document.getElementById('emergencyBadge')) {
        const badge = document.createElement('div');
        badge.id = 'emergencyBadge';
        badge.style.cssText = `
            background: #ff3b3b; color: white; font-size: 0.75rem;
            font-weight: 700; padding: 5px 12px; border-radius: 20px;
            margin-top: 10px; text-align: center; letter-spacing: 1px;
        `;
        badge.innerHTML = 'YOU ARE IN QUEUE';
        btn.parentNode.insertBefore(badge, btn.nextSibling);
    }
}

// Run on load
initEmergencyBtn();
}

function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    let filteredProducts = products;

    // Filter by category
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    // Filter by search query
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            p.desc.toLowerCase().includes(searchQuery)
        );
    }

    // Render products
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-icon"><i class="${product.icon}"></i></div>
            <div class="product-title">${product.name}</div>
            <div class="product-desc">${product.desc}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="order-btn" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `).join('');

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7a99;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>No products found. Try a different search.</p>
            </div>
        `;
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            icon: product.icon,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✓ ${product.name} added to cart`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }
}

function handleEmergency() {
    priorityQueueCount++;
    
    const queueBadge = document.getElementById('queueCount');
    if (queueBadge) {
        const queueNumber = document.getElementById('queueNumber');
        if (queueNumber) {
            queueNumber.textContent = priorityQueueCount;
        }
    }

    const queueStatus = document.getElementById('queueStatus');
    if (queueStatus) {
        queueStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Emergency request added to priority queue';
    }

    showToast('🚑 EMERGENCY: Priority dispatch activated!', 'emergency');
    
    // Update AI status
    const aiStatus = document.querySelector('.emergency-panel p[style*="margin-top:14px"]');
    if (aiStatus) {
        aiStatus.innerHTML = '<i class="fas fa-satellite-dish"></i> AI: Emergency route calculated · fastest path selected';
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.style.opacity = '1';
    
    if (type === 'emergency') {
        toast.style.background = '#b91c1c';
        toast.style.borderColor = '#ffd966';
    } else {
        toast.style.background = '#14283e';
        toast.style.borderColor = 'gold';
    }
    
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// Export for use in other pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products, addToCart, updateCartCount };
}
