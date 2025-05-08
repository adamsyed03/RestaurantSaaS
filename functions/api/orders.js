export async function onRequest(context) {
    // Simple POST handler
    if (context.request.method === 'POST') {
        try {
            const order = await context.request.json();
            const timestamp = new Date().toISOString();
            const key = `order_${timestamp}`;
            
            // Format order data for better readability
            const formattedOrder = {
                orderNumber: `#${Date.now().toString().slice(-4)}`,
                tableNumber: order.table.replace('table', 'Sto '),
                time: new Date().toLocaleTimeString('sr-RS', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                items: order.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: `${item.price.toLocaleString()} RSD`
                })),
                total: `${order.total.toLocaleString()} RSD`,
                payment: order.payment === 'cash' ? 'Gotovina' : 'Kartica',
                notes: order.notes || 'Nema napomena',
                status: 'Novo',
                timestamp
            };

            await context.env.CARTS.put(key, JSON.stringify(formattedOrder));
            
            return new Response(JSON.stringify({ success: true }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } catch (error) {
            return new Response(
                JSON.stringify({ error: 'Failed to process order' }), 
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }

    // Simple GET handler for waiters
    if (context.request.method === 'GET') {
        try {
            const { keys } = await context.env.CARTS.list();
            const orders = [];
            
            for (const key of keys) {
                const order = await context.env.CARTS.get(key.name);
                if (order) orders.push(JSON.parse(order));
            }
            
            return new Response(JSON.stringify(orders), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
} 