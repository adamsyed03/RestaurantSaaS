export async function onRequest(context) {
    const { env } = context;
    
    try {
        // Test KV access
        const testKey = `health_check_${Date.now()}`;
        await env.CARTS.put(testKey, 'test');
        await env.CARTS.delete(testKey);
        
        return new Response(JSON.stringify({
            status: 'healthy',
            kv: 'connected'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            status: 'unhealthy',
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 