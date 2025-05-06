export function onRequest(context) {
  const menuData = {
    categories: [
      {
        name: "Predjela",
        items: [
          { 
            id: "starter1", 
            name: "Brusketi", 
            price: 450, 
            description: "Hrskavi tost sa svežim paradajzom i bosiljkom",
            image: "/images/bruschetta.jpg" 
          },
          // ... other starters
        ]
      },
      // ... other categories
    ]
  };
  
  return new Response(JSON.stringify(menuData), {
    headers: {
      "content-type": "application/json"
    }
  });
} 