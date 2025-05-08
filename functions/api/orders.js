export async function onRequest(context) {
    // Simple POST handler
    if (context.request.method === 'POST') {
        const order = await context.request.json();
        const key = 'order_' + new Date().getTime();
        
        try {
            // Direct KV operation
            await context.env.CARTS.put(key, JSON.stringify(order));
            return new Response(JSON.stringify({ ok: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            // If this fails, we know it's a KV binding issue
            return new Response(JSON.stringify({ 
                error: 'KV Error', 
                details: e.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
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