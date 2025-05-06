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
        
        tableId = 'table' + tableNumber;
        currentTableDisplay.textContent = tableNumber;
        
        // Hide table selection and show main container
        tableSelection.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        
        // Load cart for this table
        loadCart();
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
    
    function showCheckoutScreen() {
        const checkoutOverlay = document.createElement('div');
        checkoutOverlay.className = 'checkout-overlay';
        
        const checkoutContent = document.createElement('div');
        checkoutContent.className = 'checkout-content';
        
        // Checkout header
        const checkoutHeader = document.createElement('div');
        checkoutHeader.className = 'checkout-header';
        checkoutHeader.innerHTML = `
            <h2>Finalizacija porudžbine</h2>
            <button id="close-checkout">&times;</button>
        `;
        
        // Checkout steps
        const checkoutSteps = document.createElement('div');
        checkoutSteps.className = 'checkout-steps';
        checkoutSteps.innerHTML = `
            <div class="step active" data-step="details">1. Podaci</div>
            <div class="step" data-step="payment">2. Plaćanje</div>
            <div class="step" data-step="confirmation">3. Potvrda</div>
        `;
        
        // Checkout body
        const checkoutBody = document.createElement('div');
        checkoutBody.className = 'checkout-body';
        
        // Restaurant info
        const restaurantInfo = `
            <div class="restaurant-info">
                <p><strong>Tango Pub</strong></p>
                <p>Kralja Petra I 13, Kragujevac</p>
                <p>Sto #${tableId.replace('table', '')}</p>
            </div>
        `;
        
        // Step 1: Customer details
        const stepDetails = document.createElement('div');
        stepDetails.className = 'checkout-step-content active';
        stepDetails.id = 'step-details';
        
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
        
        stepDetails.innerHTML = `
            ${restaurantInfo}
            <div class="form-group">
                <label for="customer-name">Ime i prezime *</label>
                <input type="text" id="customer-name" required>
            </div>
            <div class="form-row">
                <div class="form-group half">
                    <label for="customer-phone">Telefon *</label>
                    <input type="tel" id="customer-phone" required>
                </div>
                <div class="form-group half">
                    <label for="customer-email">Email *</label>
                    <input type="email" id="customer-email" required>
                </div>
            </div>
            <div class="form-group">
                <label for="customer-notes">Napomene (alergije, posebni zahtevi)</label>
                <textarea id="customer-notes" rows="3"></textarea>
            </div>
            
            <div class="order-summary">
                <h3>Vaša porudžbina</h3>
                ${orderSummaryHTML}
                <div class="summary-total">Ukupno: ${formatPrice(total)}</div>
            </div>
            
            <div class="form-actions">
                <button id="cancel-checkout" class="btn btn-secondary">Otkaži</button>
                <button id="to-payment-btn" class="btn btn-primary">Nastavi</button>
            </div>
        `;
        
        // Step 2: Payment
        const stepPayment = document.createElement('div');
        stepPayment.className = 'checkout-step-content';
        stepPayment.id = 'step-payment';
        stepPayment.innerHTML = `
            ${restaurantInfo}
            <div class="payment-methods">
                <h3>Način plaćanja</h3>
                
                <div class="payment-method">
                    <input type="radio" id="payment-cash" name="payment-method" value="cash" checked>
                    <label for="payment-cash">Gotovina</label>
                </div>
                
                <div class="payment-method">
                    <input type="radio" id="payment-card" name="payment-method" value="card">
                    <label for="payment-card">Platna kartica</label>
                </div>
            </div>
            
            <div id="card-payment-form" style="display: none;">
                <div class="form-group">
                    <label for="card-number">Broj kartice *</label>
                    <input type="text" id="card-number" placeholder="1234 5678 9012 3456">
                </div>
                
                <div class="form-row">
                    <div class="form-group half">
                        <label for="card-expiry">Važi do *</label>
                        <input type="text" id="card-expiry" placeholder="MM/YY">
                    </div>
                    <div class="form-group half">
                        <label for="card-cvv">CVV *</label>
                        <input type="text" id="card-cvv" placeholder="123">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="card-name">Ime na kartici *</label>
                    <input type="text" id="card-name">
                </div>
            </div>
            
            <div class="order-summary">
                <h3>Vaša porudžbina</h3>
                ${orderSummaryHTML}
                <div class="summary-total">Ukupno: ${formatPrice(total)}</div>
            </div>
            
            <div class="form-actions">
                <button id="back-to-details-btn" class="btn btn-secondary">Nazad</button>
                <button id="to-confirmation-btn" class="btn btn-primary">Potvrdi porudžbinu</button>
            </div>
        `;
        
        // Step 3: Confirmation
        const stepConfirmation = document.createElement('div');
        stepConfirmation.className = 'checkout-step-content';
        stepConfirmation.id = 'step-confirmation';
        stepConfirmation.innerHTML = `
            <div class="confirmation-message">
                <div class="success-icon">✓</div>
                <h3>Hvala na porudžbini!</h3>
                <p>Vaša porudžbina je uspešno primljena.</p>
                <p>Konobar će vam doneti porudžbinu uskoro.</p>
                <button class="btn btn-primary" id="finish-order-btn">Završi</button>
            </div>
        `;
        
        // Assemble checkout
        checkoutBody.appendChild(stepDetails);
        checkoutBody.appendChild(stepPayment);
        checkoutBody.appendChild(stepConfirmation);
        
        checkoutContent.appendChild(checkoutHeader);
        checkoutContent.appendChild(checkoutSteps);
        checkoutContent.appendChild(checkoutBody);
        
        checkoutOverlay.appendChild(checkoutContent);
        document.body.appendChild(checkoutOverlay);
        
        // Add event listeners
        document.getElementById('close-checkout').onclick = function() {
            document.body.removeChild(checkoutOverlay);
        };
        
        document.getElementById('cancel-checkout').onclick = function() {
            document.body.removeChild(checkoutOverlay);
        };
        
        document.getElementById('to-payment-btn').onclick = function() {
            // Validate customer details
            const name = document.getElementById('customer-name').value;
            const phone = document.getElementById('customer-phone').value;
            const email = document.getElementById('customer-email').value;
            
            if (!name || !phone || !email) {
                alert('Molimo popunite sva obavezna polja');
                return;
            }
            
            // Switch to payment step
            document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
            document.getElementById('step-payment').classList.add('active');
            
            document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
            document.querySelector('.step[data-step="payment"]').classList.add('active');
        };
        
        document.getElementById('back-to-details-btn').onclick = function() {
            // Switch back to details step
            document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
            document.getElementById('step-details').classList.add('active');
            
            document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
            document.querySelector('.step[data-step="details"]').classList.add('active');
        };
        
        document.getElementById('to-confirmation-btn').onclick = function() {
            // Validate payment details if card payment selected
            const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
            
            if (paymentMethod === 'card') {
                const cardNumber = document.getElementById('card-number').value;
                const cardExpiry = document.getElementById('card-expiry').value;
                const cardCvv = document.getElementById('card-cvv').value;
                const cardName = document.getElementById('card-name').value;
                
                if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
                    alert('Molimo popunite sve podatke o kartici');
                    return;
                }
            }
            
            // Switch to confirmation step
            document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
            document.getElementById('step-confirmation').classList.add('active');
            
            document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
            document.querySelector('.step[data-step="confirmation"]').classList.add('active');
            
            // Clear cart
            cart = [];
            updateCartDisplay();
        };
        
        document.getElementById('finish-order-btn').onclick = function() {
            document.body.removeChild(checkoutOverlay);
            cartContainer.classList.add('hidden');
        };
        
        // Toggle card payment form visibility
        document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const cardForm = document.getElementById('card-payment-form');
                if (this.value === 'card') {
                    cardForm.style.display = 'block';
                } else {
                    cardForm.style.display = 'none';
                }
            });
        });
        
        // Format card number with spaces
        document.getElementById('card-number').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });
        
        // Format expiry date
        document.getElementById('card-expiry').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            
            e.target.value = value;
        });
    }
});