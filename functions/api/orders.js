export async function onRequest(context) {
    const { request, env } = context;
    
    // Add CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }
    
    if (request.method === 'GET') {
        // Get all orders
        const orders = await env.CARTS.list();
        return new Response(JSON.stringify(orders), { headers });
    }
    
    if (request.method === 'POST') {
        try {
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
            
            return new Response(JSON.stringify({ success: true }), { headers });
        } catch (error) {
            return new Response(JSON.stringify({ 
                error: 'Failed to process order',
                details: error.message 
            }), { 
                status: 400, 
                headers 
            });
        }
    }
    
    return new Response('Method not allowed', { status: 405, headers });
} 