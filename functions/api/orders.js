export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    if (request.method === 'GET') {
        // Get all orders
        const orders = await env.CARTS.list();
        return new Response(JSON.stringify(orders), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (request.method === 'POST') {
        // Handle new order
        const order = await request.json();
        const timestamp = new Date().toISOString();
        const orderId = `order_${timestamp}_${order.tableId}`;
        
        await env.CARTS.put(orderId, JSON.stringify({
            ...order,
            id: orderId,
            status: 'active',
            timestamp
        }));
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response('Method not allowed', { status: 405 });
} 