export async function onRequest(context) {
    // Simple POST handler
    if (context.request.method === 'POST') {
        try {
            const order = await context.request.json();
            const key = 'order_' + Date.now();
            
            // Add headers to ensure proper JSON response
            const headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            };

            // Save to KV
            await context.env.CARTS.put(key, JSON.stringify(order));
            
            return new Response(JSON.stringify({ success: true }), { headers });
            
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