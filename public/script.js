document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');
    
    // Initialize variables
    let cart = [];
    let tableId = null;
    let currencySymbol = 'RSD';
    let menuData = null;
    
    // Get DOM elements
    const tableSelection = document.getElementById('table-selection');
    const mainContainer = document.getElementById('main-container');
    const tableNumberInput = document.getElementById('table-number-input');
    const startOrderBtn = document.getElementById('start-order-btn');
    const currentTableDisplay = document.getElementById('current-table');
    const restaurantName = document.getElementById('restaurant-name');
    const restaurantTagline = document.getElementById('restaurant-tagline');
    const menuContent = document.getElementById('menu-content');
    const categoryTabs = document.getElementById('category-tabs');
    const cartContainer = document.getElementById('cart-container');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Initialize cart as a global variable
    window.cart = [];
    
    // Get table number from URL
    const urlParams = new URLSearchParams(window.location.search);
    tableId = urlParams.get('table') || localStorage.getItem('tableId');
    
    if (tableId) {
        currentTableDisplay.textContent = tableId.replace('table', '');
    }
    
    // Event listeners for table selection
    startOrderBtn.addEventListener('click', function() {
        const tableNumber = tableNumberInput.value;
        if (!tableNumber || isNaN(tableNumber) || tableNumber < 1) {
            alert('Molimo unesite validan broj stola');
            return;
        }
        
        tableId = `table${tableNumber}`;
        currentTableDisplay.textContent = tableNumber;
        showServiceChoice();
    });
    
    // Allow Enter key to submit table number
    tableNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startOrderBtn.click();
        }
    });
    
    // Fetch restaurant config
    fetch('/api/restaurant-config')
        .then(response => response.json())
        .then(config => {
            console.log('Restaurant config loaded:', config);
            restaurantName.textContent = config.name;
            restaurantTagline.textContent = config.tagline;
            document.title = config.name + ' - Meni';
            
            if (config.currency && config.currency.symbol) {
                currencySymbol = config.currency.symbol;
            }
        })
        .catch(error => console.error('Error loading restaurant config:', error));
    
    // Fetch menu
    fetch('/api/menu')
        .then(response => response.json())
        .then(data => {
            console.log('Menu data loaded:', data);
            menuData = data;
            createCategoryTabs(data);
            displayMenu(data);
        })
        .catch(error => console.error('Error loading menu:', error));
    
    // Cart visibility toggle
    viewCartBtn.addEventListener('click', function() {
        cartContainer.classList.toggle('hidden');
    });
    
    closeCartBtn.addEventListener('click', function() {
        cartContainer.classList.add('hidden');
    });
    
    checkoutBtn.onclick = function() {
        if (cart.length === 0) {
            alert('Vaša korpa je prazna');
            return;
        }
        
        showCheckoutScreen();
    };
    
    // Functions
    function createCategoryTabs(data) {
        console.log('Creating category tabs');
        const categoryTabs = document.getElementById('category-tabs');
        categoryTabs.innerHTML = '';
        
        data.categories.forEach((category, index) => {
            const tab = document.createElement('button');
            tab.className = 'category-tab' + (index === 0 ? ' active' : '');
            tab.textContent = category.name;
            tab.onclick = () => {
                // Scroll to category section
                document.getElementById(`category-${category.name}`).scrollIntoView({ behavior: 'smooth' });
                
                // Update active tab
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            };
            categoryTabs.appendChild(tab);
        });
    }
    
    function displayMenu(data) {
        const menuContent = document.getElementById('menu-content');
        menuContent.innerHTML = '';
        
        data.categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'menu-category';
            categorySection.id = `category-${category.name}`;
            categorySection.innerHTML = `
                <h3>${category.name}</h3>
                <div class="menu-items">
                    ${category.items.map(item => `
                        <div class="menu-item">
                            <img src="/Images/menu/${item.image}" alt="${item.name}" class="menu-item-image">
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                <p>${item.description}</p>
                                <div class="price">${item.price.toLocaleString()} RSD</div>
                            </div>
                            <div class="item-quantity">
                                <button onclick="decrementQuantity('${item.id}', '${item.name}', ${item.price})">-</button>
                                <span id="quantity-${item.id}">0</span>
                                <button onclick="incrementQuantity('${item.id}', '${item.name}', ${item.price})">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            menuContent.appendChild(categorySection);
        });
    }
    
    function createMenuItem(item) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.dataset.id = item.id;
        
        // Add image container
        const itemImage = document.createElement('div');
        itemImage.className = 'item-image';
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            itemImage.appendChild(img);
        } else {
            // Placeholder for items without images
            itemImage.classList.add('placeholder');
            itemImage.innerHTML = '<div class="image-placeholder">Slika</div>';
        }
        
        const itemContent = document.createElement('div');
        itemContent.className = 'item-content';
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        
        const itemName = document.createElement('div');
        itemName.className = 'item-name';
        itemName.textContent = item.name;
        
        const itemDescription = document.createElement('div');
        itemDescription.className = 'item-description';
        itemDescription.textContent = item.description;
        
        itemInfo.appendChild(itemName);
        itemInfo.appendChild(itemDescription);
        
        const itemPrice = document.createElement('div');
        itemPrice.className = 'item-price';
        itemPrice.textContent = formatPrice(item.price);
        
        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'quantity-btn';
        decreaseBtn.textContent = '-';
        decreaseBtn.onclick = function() {
            decrementQuantity(item.id, item.name, item.price);
            animateButton(decreaseBtn);
        };
        
        const itemQuantity = document.createElement('span');
        itemQuantity.className = 'item-quantity';
        itemQuantity.textContent = getItemQuantity(item.id);
        
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'quantity-btn';
        increaseBtn.textContent = '+';
        increaseBtn.onclick = function() {
            incrementQuantity(item.id, item.name, item.price);
            animateButton(increaseBtn);
        };
        
        itemActions.appendChild(decreaseBtn);
        itemActions.appendChild(itemQuantity);
        itemActions.appendChild(increaseBtn);
        
        itemContent.appendChild(itemInfo);
        itemContent.appendChild(itemPrice);
        itemContent.appendChild(itemActions);
        
        menuItem.appendChild(itemImage);
        menuItem.appendChild(itemContent);
        
        return menuItem;
    }
    
    function updateActiveTabOnScroll() {
        const categories = document.querySelectorAll('.category');
        let closestCategory = null;
        let closestDistance = Infinity;
        
        categories.forEach(category => {
            const rect = category.getBoundingClientRect();
            const distance = Math.abs(rect.top);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestCategory = category;
            }
        });
        
        if (closestCategory) {
            const categoryName = closestCategory.dataset.name;
            document.querySelectorAll('.category-tab').forEach(tab => {
                if (tab.dataset.category === categoryName) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }
    }
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    function formatPrice(price) {
        return price.toLocaleString() + ' ' + currencySymbol;
    }
    
    function getItemQuantity(itemId) {
        const cartItem = cart.find(item => item.id === itemId);
        return cartItem ? cartItem.quantity : 0;
    }
    
    // Global functions for quantity buttons
    window.incrementQuantity = function(itemId, name, price) {
        console.log('Increment:', itemId);
        const quantityElement = document.getElementById(`quantity-${itemId}`);
        let currentQty = parseInt(quantityElement.textContent);
        currentQty++;
        quantityElement.textContent = currentQty;
        
        updateCart(itemId, name, price, currentQty);
    };
    
    window.decrementQuantity = function(itemId, name, price) {
        console.log('Decrement:', itemId);
        const quantityElement = document.getElementById(`quantity-${itemId}`);
        let currentQty = parseInt(quantityElement.textContent);
        if (currentQty > 0) {
            currentQty--;
            quantityElement.textContent = currentQty;
            updateCart(itemId, name, price, currentQty);
        }
    };
    
    function updateCart(itemId, name, price, quantity) {
        const existingItem = cart.find(item => item.id === itemId);
        
        if (existingItem) {
            if (quantity === 0) {
                cart = cart.filter(item => item.id !== itemId);
            } else {
                existingItem.quantity = quantity;
            }
        } else if (quantity > 0) {
            cart.push({ id: itemId, name, price, quantity });
        }
        
        updateCartDisplay();
    }
    
    function updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalQuantity;
        
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <div class="price">${(item.price * item.quantity).toLocaleString()} RSD</div>
                </div>
                <div class="item-quantity">
                    <button onclick="decrementQuantity('${item.id}', '${item.name}', ${item.price})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="incrementQuantity('${item.id}', '${item.name}', ${item.price})">+</button>
                </div>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            cartTotal.textContent = total.toLocaleString() + ' RSD';
        }
    }
    
    function animateButton(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300);
    }
    
    function showServiceChoice() {
        const tableSelection = document.getElementById('table-selection');
        tableSelection.innerHTML = `
            <div class="table-selection-content">
                <div class="logo-container">
                    <img src="/Images/RestaurantLogoTango.jpg" alt="Tango Pub Logo" class="restaurant-logo">
                </div>
                <h2>Sto #${tableId.replace('table', '')}</h2>
                <div class="service-choice-buttons">
                    <button id="call-waiter-btn" class="btn btn-secondary">
                        <i class="fas fa-bell"></i>
                        Pozovi konobara
                    </button>
                    <button id="order-online-btn" class="btn btn-primary">
                        <i class="fas fa-utensils"></i>
                        Naruči online
                    </button>
                </div>
            </div>
        `;

        // Event listeners for the choice buttons
        document.getElementById('call-waiter-btn').onclick = function() {
            // Alert for demonstration - this could be connected to a waiter notification system
            alert('Konobar je pozvan i uskoro će doći do vašeg stola.');
        };

        document.getElementById('order-online-btn').onclick = function() {
            tableSelection.classList.add('hidden');
            document.getElementById('main-container').classList.remove('hidden');
        };
    }
    
    function showTableSelection() {
        mainContainer.innerHTML = `
            <div class="table-selection">
                <img src="/Images/RestaurantLogoTango.jpg" alt="Tango Pub Logo" class="restaurant-logo">
                <h2>Sto #${tableId.replace('table', '')}</h2>
                <div class="service-choice-buttons">
                    <button id="call-waiter-btn" class="btn btn-secondary">
                        <i class="fas fa-bell"></i>
                        Pozovi konobara
                    </button>
                    <button id="order-online-btn" class="btn btn-primary">
                        <i class="fas fa-utensils"></i>
                        Naruči online
                    </button>
                </div>
            </div>
        `;
    }
    
    function showCheckoutScreen() {
        const checkoutOverlay = document.createElement('div');
        checkoutOverlay.className = 'checkout-overlay';
        
        const checkoutContent = document.createElement('div');
        checkoutContent.className = 'checkout-content';
        
        // Create order summary HTML
        let orderSummaryHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            orderSummaryHTML += `
                <div class="summary-item">
                    <div>${item.name} x${item.quantity}</div>
                    <div>${formatPrice(itemTotal)}</div>
                </div>
            `;
        });
        
        // Simplified checkout content
        checkoutContent.innerHTML = `
            <div class="checkout-header">
                <img src="/Images/RestaurantLogoTango.jpg" alt="Tango Pub Logo" class="checkout-logo">
                <h2>Vaša porudžbina</h2>
                <button id="close-checkout">&times;</button>
            </div>
            
            <div class="restaurant-info">
                <p><strong>Tango Pub</strong></p>
                <p>Karađorđeva 28, Kragujevac</p>
                <p>Sto #${tableId.replace('table', '')}</p>
            </div>
            
            <div class="order-summary">
                ${orderSummaryHTML}
                <div class="summary-total">Ukupno: ${formatPrice(total)}</div>
            </div>
            
            <div class="form-group">
                <label for="customer-notes">Napomene (alergije, posebni zahtevi)</label>
                <textarea id="customer-notes" rows="3"></textarea>
            </div>
            
            <div class="payment-choice">
                <h3>Način plaćanja:</h3>
                <div class="payment-buttons">
                    <button class="btn payment-btn" data-payment="cash">
                        <i class="fas fa-money-bill-wave"></i>
                        Gotovina
                    </button>
                    <button class="btn payment-btn" data-payment="card">
                        <i class="fas fa-credit-card"></i>
                        Kartica
                    </button>
                </div>
            </div>
        `;
        
        checkoutOverlay.appendChild(checkoutContent);
        document.body.appendChild(checkoutOverlay);
        
        // Event listeners
        document.getElementById('close-checkout').onclick = function() {
            document.body.removeChild(checkoutOverlay);
        };
        
        // Payment button handlers
        document.querySelectorAll('.payment-btn').forEach(button => {
            button.onclick = async function() {
                try {
                    const paymentType = this.dataset.payment;
                    const notes = document.getElementById('customer-notes').value;
                    
                    const orderData = {
                        table: tableId,
                        items: cart,
                        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                        payment: paymentType,
                        notes: notes,
                        time: new Date().toISOString()
                    };

                    const response = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });

                    if (response.ok) {
                        cart = [];
                        updateCartDisplay();
                        
                        checkoutContent.innerHTML = `
                            <div class="checkout-header">
                                <h2>Porudžbina potvrđena</h2>
                                <button id="close-confirmation">&times;</button>
                            </div>
                            <div class="confirmation-message">
                                <div class="success-icon">✓</div>
                                <h3>Hvala na porudžbini!</h3>
                                <p>Vaša porudžbina je uspešno primljena.</p>
                            </div>
                        `;
                    } else {
                        throw new Error('Failed to submit order');
                    }
                } catch (error) {
                    alert('Došlo je do greške. Molimo pokušajte ponovo.');
                }
            };
        });
    }
});