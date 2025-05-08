document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    
    // Set up filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadOrders(this.dataset.status);
        });
    });
});

async function loadOrders(status = 'active') {
    const ordersList = document.getElementById('orders-list');
    
    try {
        const response = await fetch(`/api/orders?status=${status}`);
        const orders = await response.json();
        
        ordersList.innerHTML = orders.map(order => `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-table">Sto #${order.tableId}</div>
                    <div class="order-time">${formatTime(order.timestamp)}</div>
                </div>
                
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>${formatPrice(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${order.notes ? `<div class="order-notes">Napomene: ${order.notes}</div>` : ''}
                
                <div class="order-total">
                    Ukupno: ${formatPrice(order.total)}
                </div>
                
                <div class="order-actions">
                    <button class="order-btn complete-btn" onclick="completeOrder('${order.id}')">
                        Završi
                    </button>
                    <button class="order-btn cancel-btn" onclick="cancelOrder('${order.id}')">
                        Otkaži
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersList.innerHTML = '<p>Greška pri učitavanju porudžbina</p>';
    }
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPrice(price) {
    return price.toLocaleString() + ' RSD';
}

async function completeOrder(orderId) {
    try {
        await fetch(`/api/orders/${orderId}/complete`, {
            method: 'POST'
        });
        loadOrders();
    } catch (error) {
        console.error('Error completing order:', error);
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Da li ste sigurni da želite da otkažete porudžbinu?')) return;
    
    try {
        await fetch(`/api/orders/${orderId}/cancel`, {
            method: 'POST'
        });
        loadOrders();
    } catch (error) {
        console.error('Error canceling order:', error);
    }
} 