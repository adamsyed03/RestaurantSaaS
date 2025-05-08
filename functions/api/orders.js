export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method === 'POST') {
        const order = await request.json();
        const orderId = `order_${Date.now()}`;
        
        await env.CARTS.put(orderId, JSON.stringify({
            ...order,
            id: orderId,
            status: 'active'
        }));
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // GET request to fetch orders for waiters
    if (request.method === 'GET') {
        const orders = await env.CARTS.list();
        return new Response(JSON.stringify(orders), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 