// This uses Cloudflare KV for persistence
// You'll need to create a KV namespace in Cloudflare dashboard named CARTS
export async function onRequest(context) {
  const { request, env, params } = context;
  const { tableId } = params;
  
  // Handle GET request to fetch cart
  if (request.method === "GET") {
    const cartData = await env.CARTS.get(tableId);
    return new Response(cartData || "[]", {
      headers: {
        "content-type": "application/json"
      }
    });
  }
  
  // Handle POST request to update cart
  if (request.method === "POST") {
    const data = await request.json();
    const { itemId, quantity } = data;
    
    // Get current cart
    let cart = [];
    const cartData = await env.CARTS.get(tableId);
    if (cartData) {
      cart = JSON.parse(cartData);
    }
    
    // Find menu item (simplified - in production you'd query the menu data)
    // For now, we'll just use the data from the request
    
    // Find item in cart
    const existingItemIndex = cart.findIndex(item => item.id === itemId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      cart[existingItemIndex].quantity += quantity;
      
      // Remove if quantity is zero or negative
      if (cart[existingItemIndex].quantity <= 0) {
        cart.splice(existingItemIndex, 1);
      }
    } else if (quantity > 0) {
      // Add new item - we'd need to fetch item details from menu
      // This is simplified
      cart.push({
        id: itemId,
        name: data.name || "Item",
        price: data.price || 0,
        quantity: quantity
      });
    }
    
    // Save updated cart
    await env.CARTS.put(tableId, JSON.stringify(cart));
    
    return new Response(JSON.stringify(cart), {
      headers: {
        "content-type": "application/json"
      }
    });
  }
  
  return new Response("Method not allowed", { status: 405 });
} 