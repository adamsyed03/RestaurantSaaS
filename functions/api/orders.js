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
    
    try {
        if (request.method === 'GET') {
            // Get all orders
            const orders = await env.CARTS.list();
            return new Response(JSON.stringify(orders), { headers });
        }
        
        if (request.method === 'POST') {
            const contentType = request.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Content-Type must be application/json');
            }

            const orderData = await request.json();
            if (!orderData.tableId || !orderData.items) {
                throw new Error('Invalid order data');
            }

            const orderId = `order_${Date.now()}_${orderData.tableId}`;
            await env.CARTS.put(orderId, JSON.stringify({
                ...orderData,
                id: orderId,
                status: 'active'
            }));

            return new Response(JSON.stringify({ 
                success: true, 
                orderId 
            }), { headers });
        }

        return new Response(JSON.stringify({ 
            error: 'Method not allowed' 
        }), { 
            status: 405, 
            headers 
        });

    } catch (error) {
        console.error('Order processing error:', error);
        return new Response(JSON.stringify({ 
            error: error.message 
        }), { 
            status: 400, 
            headers 
        });
    }
} 