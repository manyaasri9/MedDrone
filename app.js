// Product database
const products = [
    { 
        id: 1, 
        name: 'Ibuprofen 400mg', 
        desc: 'Pain reliever & anti-inflammatory · 50 tablets', 
        price: 12.99, 
        category: 'medicine',
        image: "images/ibuprofen.jpg"
    },

    { 
        id: 2, 
        name: 'Paracetamol 500mg', 
        desc: 'Fever reducer & pain relief · 60 tablets', 
        price: 15.99, 
        icon: 'fas fa-capsules', 
        category: 'medicine',
        image: "images" 
    },

    { 
        id: 3, 
        name: 'Vitamin C 1000mg', 
        desc: 'Immune support · 30 effervescent tablets', 
        price: 11.99, 
        icon: 'fas fa-bolt', 
        category: 'vitamins' 
    },

    { 
        id: 4, 
        name: 'Vitamin D3 2000IU', 
        desc: 'Bone & immune health · 60 softgels', 
        price: 14.99, 
        icon: 'fas fa-sun', 
        category: 'vitamins' 
    },

    { 
        id: 5, 
        name: 'DayQuil Cold & Flu', 
        desc: 'Non-drowsy flu relief · 24 capsules', 
        price: 11.99, 
        icon: 'fas fa-droplet', 
        category: 'medicine' 
    },

    { 
        id: 6, 
        name: 'NyQuil Night Relief', 
        desc: 'Nighttime cold relief · 24 capsules', 
        price: 13.49, 
        icon: 'fas fa-first-aid', 
        category: 'medicine' 
    },

    { 
        id: 7, 
        name: 'Omega-3 Fish Oil', 
        desc: 'Heart & brain health · 90 softgels', 
        price: 19.99, 
        icon: 'fas fa-fish', 
        category: 'wellness' 
    },

    { 
        id: 8, 
        name: 'Probiotics 10B CFU', 
        desc: 'Gut & digestive health · 60 capsules', 
        price: 24.99, 
        icon: 'fas fa-tablets', 
        category: 'wellness' 
    },

    { 
        id: 9, 
        name: 'Zinc + Elderberry', 
        desc: 'Immune booster · 60 gummies', 
        price: 16.99, 
        icon: 'fas fa-syringe', 
        category: 'vitamins' 
    },

    { 
        id: 10, 
        name: 'Melatonin 5mg', 
        desc: 'Sleep support · 60 dissolving tablets', 
        price: 9.49, 
        icon: 'fas fa-moon', 
        category: 'wellness' 
    },

    { 
        id: 11, 
        name: 'Emergency Kit', 
        desc: 'Bandages, antiseptics & gloves', 
        price: 34.99, 
        icon: 'fas fa-briefcase-medical', 
        category: 'emergency' 
    },

    { 
        id: 12, 
        name: 'Allergy Relief Kit', 
        desc: 'Antihistamine tablets & sterile wipes', 
        price: 18.99, 
        icon: 'fas fa-allergies', 
        category: 'emergency' 
    }
];

let currentCategory = 'all';
let searchQuery = '';
let priorityQueueCount = 0;
let emergencyActivated = false;

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
        ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` 
                       : `<div class="product-icon"><i class="${product.icon}"></i></div>`}
        <div class="product-icon" style="display:none;"><i class="${product.icon}"></i></div>
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

    // 🚫 Prevent multiple activations
    if (emergencyActivated) {
        showToast('⚠️ Emergency already activated!', 'emergency');
        return;
    }

    emergencyActivated = true;  // mark as activated
    priorityQueueCount = 1;     // ensure it's only 1

    const queueNumber = document.getElementById('queueNumber');
    if (queueNumber) {
        queueNumber.textContent = priorityQueueCount;
    }

    const queueStatus = document.getElementById('queueStatus');
    if (queueStatus) {
        queueStatus.innerHTML =
            '<i class="fas fa-exclamation-circle"></i> Emergency request added to priority queue';
    }

    showToast('🚑 EMERGENCY: Priority dispatch activated!', 'emergency');

    // Disable button visually
    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) {
        emergencyBtn.disabled = true;
        emergencyBtn.style.opacity = "0.6";
        emergencyBtn.style.cursor = "not-allowed";
        emergencyBtn.innerHTML = '<i class="fas fa-check"></i> ACTIVE';
    }

    // Update AI status
    const aiStatus = document.querySelector('.emergency-panel p[style*="margin-top:14px"]');
    if (aiStatus) {
        aiStatus.innerHTML =
            '<i class="fas fa-satellite-dish"></i> AI: Emergency route calculated · fastest path selected';
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
