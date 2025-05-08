document.addEventListener('DOMContentLoaded', function() {
    // Elements
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
    
    // Variables
    let tableId = '';
    let cart = [];
    let currencySymbol = 'дин.';
    let menuData = null;
    
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
            menuData = data;
            createCategoryTabs(data);
            displayMenu(data);
        })
        .catch(error => console.error('Error loading menu:', error));
    
    // Cart button functionality
    viewCartBtn.onclick = function() {
        cartContainer.classList.remove('hidden');
    };
    
    closeCartBtn.onclick = function() {
        cartContainer.classList.add('hidden');
    };
    
    checkoutBtn.onclick = function() {
        if (cart.length === 0) {
            alert('Vaša korpa je prazna');
            return;
        }
        
        showCheckoutScreen();
    };
    
    // Functions
    function loadCart() {
        fetch(`/api/cart/${tableId}`)
            .then(response => response.json())
            .then(data => {
                cart = data;
                updateCartDisplay();
            })
            .catch(error => console.error('Error loading cart:', error));
    }
    
    function createCategoryTabs(menuData) {
        categoryTabs.innerHTML = '';
        
        menuData.categories.forEach((category, index) => {
            const tab = document.createElement('button');
            tab.className = 'category-tab';
            if (index === 0) tab.classList.add('active');
            tab.textContent = category.name;
            tab.dataset.category = category.name;
            
            tab.addEventListener('click', function() {
                // Update active tab
                document.querySelectorAll('.category-tab').forEach(t => {
                    t.classList.remove('active');
                });
                tab.classList.add('active');
                
                // Scroll to category
                const categoryElement = document.querySelector(`.category[data-name="${category.name}"]`);
                if (categoryElement) {
                    categoryElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
            
            categoryTabs.appendChild(tab);
        });
    }
    
    function displayMenu(menuData) {
        menuContent.innerHTML = '';
        
        menuData.categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'category';
            categorySection.dataset.name = category.name;
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'category-name';
            categoryTitle.textContent = category.name;
            categorySection.appendChild(categoryTitle);
            
            category.items.forEach(item => {
                const menuItem = createMenuItem(item);
                categorySection.appendChild(menuItem);
            });
            
            menuContent.appendChild(categorySection);
        });
        
        // Add scroll event listener to update active tab
        window.addEventListener('scroll', debounce(updateActiveTabOnScroll, 100));
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
            updateItemQuantity(item.id, -1);
            animateButton(decreaseBtn);
        };
        
        const itemQuantity = document.createElement('span');
        itemQuantity.className = 'item-quantity';
        itemQuantity.textContent = getItemQuantity(item.id);
        
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'quantity-btn';
        increaseBtn.textContent = '+';
        increaseBtn.onclick = function() {
            updateItemQuantity(item.id, 1);
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
        return `${price.toLocaleString('sr-RS')} ${currencySymbol}`;
    }
    
    function getItemQuantity(itemId) {
        const cartItem = cart.find(item => item.id === itemId);
        return cartItem ? cartItem.quantity : 0;
    }
    
    function updateItemQuantity(itemId, change) {
        if (!tableId) {
            alert('Molimo izaberite sto prvo');
            return;
        }
        
        fetch(`/api/cart/${tableId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId: itemId,
                quantity: change
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update cart');
            }
            return response.json();
        })
        .then(data => {
            cart = data;
            updateCartDisplay();
            
            // Update quantity in menu
            const quantityElement = document.querySelector(`.menu-item[data-id="${itemId}"] .item-quantity`);
            if (quantityElement) {
                quantityElement.textContent = getItemQuantity(itemId);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Greška pri ažuriranju korpe. Pokušajte ponovo.');
        });
    }
    
    function updateCartDisplay() {
        cartItems.innerHTML = '';
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-message">Vaša korpa je prazna</p>';
            cartTotal.textContent = `Ukupno: 0 ${currencySymbol}`;
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemName = document.createElement('div');
            itemName.className = 'cart-item-name';
            itemName.textContent = `${item.name} x${item.quantity}`;
            
            const itemPrice = document.createElement('div');
            itemPrice.className = 'cart-item-price';
            itemPrice.textContent = formatPrice(itemTotal);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-item-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = function() {
                updateItemQuantity(item.id, -item.quantity);
            };
            
            cartItem.appendChild(itemName);
            cartItem.appendChild(itemPrice);
            cartItem.appendChild(removeBtn);
            
            cartItems.appendChild(cartItem);
        });
        
        cartTotal.textContent = `Ukupno: ${formatPrice(total)}`;
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
                    <img src="/images/tango-logo.png" alt="Tango Pub Logo" class="restaurant-logo">
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
                <h2>Vaša porudžbina</h2>
                <button id="close-checkout">&times;</button>
            </div>
            
            <div class="restaurant-info">
                <p><strong>Tango Pub</strong></p>
                <p>Kralja Petra I 13, Kragujevac</p>
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
            button.onclick = function() {
                const paymentType = this.dataset.payment;
                const notes = document.getElementById('customer-notes').value;
                
                // Show confirmation message
                checkoutContent.innerHTML = `
                    <div class="checkout-header">
                        <h2>Porudžbina potvrđena</h2>
                        <button id="close-confirmation">&times;</button>
                    </div>
                    
                    <div class="confirmation-message">
                        <div class="success-icon">✓</div>
                        <h3>Hvala na porudžbini!</h3>
                        <p>Vaša porudžbina je uspešno primljena.</p>
                        <p>Plaćanje: ${paymentType === 'cash' ? 'Gotovina' : 'Kartica'}</p>
                    </div>
                    
                    <button id="finish-order-btn" class="btn btn-primary">U redu</button>
                `;
                
                // Alert waiter (this could be connected to a proper notification system)
                alert(`Nova porudžbina za sto #${tableId.replace('table', '')}\nNačin plaćanja: ${paymentType === 'cash' ? 'Gotovina' : 'Kartica'}`);
                
                // Clear cart
                cart = [];
                updateCartDisplay();
                
                // Add event listener for the finish button
                document.getElementById('finish-order-btn').onclick = function() {
                    document.body.removeChild(checkoutOverlay);
                    cartContainer.classList.add('hidden');
                };
                
                document.getElementById('close-confirmation').onclick = function() {
                    document.body.removeChild(checkoutOverlay);
                    cartContainer.classList.add('hidden');
                };
            };
        });
    }
});