export async function onRequest(context) {
    const { request, env } = context;
    
    // First, check if we have access to KV
    if (!env.CARTS) {
        return new Response(JSON.stringify({ 
            error: 'KV namespace not available' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        if (request.method === 'POST') {
            // Log the incoming request
            console.log('Received POST request');
            
            const orderData = await request.json();
            console.log('Order data:', orderData);

            // Generate a simpler order ID
            const orderId = `order_${Date.now()}`;

            // Try to write to KV
            try {
                await env.CARTS.put(orderId, JSON.stringify({
                    ...orderData,
                    id: orderId,
                    status: 'active'
                }));
            } catch (kvError) {
                console.error('KV Error:', kvError);
                return new Response(JSON.stringify({ 
                    error: 'Failed to save to KV',
                    details: kvError.message 
                }), { 
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            return new Response(JSON.stringify({ 
                success: true, 
                orderId 
            }), { 
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            error: 'Method not allowed' 
        }), { 
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Processing error:', error);
        return new Response(JSON.stringify({ 
            error: error.message,
            type: error.constructor.name
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 