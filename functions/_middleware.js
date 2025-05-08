export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    
    // Log the request path
    console.log('Request path:', url.pathname);
    
    // Add CORS headers for all requests
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // Add CORS headers to the response
    const response = await context.next();
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([key, value]) => {
        newResponse.headers.set(key, value);
    });

    return newResponse;
} 