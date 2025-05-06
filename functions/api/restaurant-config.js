export function onRequest(context) {
  const restaurantConfig = {
    name: "Tango Pub",
    tagline: "Restoran & Bar • Kragujevac",
    primaryColor: "#1A1A1A",
    secondaryColor: "#D4AF37",
    currency: {
      code: "RSD",
      symbol: "дин."
    }
  };
  
  return new Response(JSON.stringify(restaurantConfig), {
    headers: {
      "content-type": "application/json"
    }
  });
} 