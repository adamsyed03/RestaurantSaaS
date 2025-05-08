export function onRequest(context) {
  return new Response(JSON.stringify({
    name: "Tango Pub",
    tagline: "Tradicionalni ukusi u modernom ambijentu",
    address: "Karađorđeva 28, Kragujevac",
    currency: {
      code: "RSD",
      symbol: "RSD"
    }
  }), {
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
} 