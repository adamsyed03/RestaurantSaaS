export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    
    // Log all requests to API
    console.log('API Request:', {
        method: request.method,
        path: url.pathname,
        headers: Object.fromEntries(request.headers)
    });

    return context.next();
} 