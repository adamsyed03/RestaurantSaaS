const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Restaurant configuration
const restaurantConfig = {
  name: "Tango Pub",
  tagline: "Restoran & Bar • Kragujevac",
  primaryColor: "#1A1A1A",
  secondaryColor: "#D4AF37", // Gold accent color
  currency: {
    code: "RSD",
    symbol: "дин."
  }
};

// Menu data based on Tango Pub's offerings
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
        { 
          id: "starter2", 
          name: "Pohovani kačkavalj", 
          price: 550, 
          description: "Domaći pohovani kačkavalj sa tartar sosom",
          image: "/images/fried-cheese.jpg" 
        },
        { 
          id: "starter3", 
          name: "Tango plata", 
          price: 990, 
          description: "Selekcija sireva i suhomesnatih proizvoda",
          image: "/images/cheese-platter.jpg" 
        }
      ]
    },
    {
      name: "Glavna jela",
      items: [
        { 
          id: "main1", 
          name: "Tango burger", 
          price: 890, 
          description: "Sočni burger sa domaćim mesom, sirom i pomfritom",
          image: "/images/burger.jpg" 
        },
        { 
          id: "main2", 
          name: "Biftek", 
          price: 1950, 
          description: "Premium juneći biftek sa prilogom po izboru",
          image: "/images/steak.jpg" 
        },
        { 
          id: "main3", 
          name: "Pasta Carbonara", 
          price: 850, 
          description: "Kremasta pasta sa pančetom i parmezanom",
          image: "/images/carbonara.jpg" 
        },
        { 
          id: "main4", 
          name: "Piletina u sosu", 
          price: 890, 
          description: "Pileći file u kremastom sosu sa povrćem",
          image: "/images/chicken.jpg" 
        }
      ]
    },
    {
      name: "Prilozi",
      items: [
        { 
          id: "side1", 
          name: "Pomfrit", 
          price: 290, 
          description: "Hrskavi domaći pomfrit",
          image: "/images/fries.jpg" 
        },
        { 
          id: "side2", 
          name: "Grilovano povrće", 
          price: 350, 
          description: "Sezonsko povrće sa grila",
          image: "/images/grilled-vegetables.jpg" 
        },
        { 
          id: "side3", 
          name: "Domaći krompir", 
          price: 320, 
          description: "Pečeni krompir sa začinima",
          image: "/images/roasted-potatoes.jpg" 
        }
      ]
    },
    {
      name: "Deserti",
      items: [
        { 
          id: "dessert1", 
          name: "Čokoladni sufle", 
          price: 450, 
          description: "Topli čokoladni kolač sa sladoledom od vanile",
          image: "/images/chocolate-souffle.jpg" 
        },
        { 
          id: "dessert2", 
          name: "Cheesecake", 
          price: 420, 
          description: "Domaći kolač sa sirom i prelivom od šumskog voća",
          image: "/images/cheesecake.jpg" 
        },
        { 
          id: "dessert3", 
          name: "Tiramisu", 
          price: 390, 
          description: "Klasični italijanski desert",
          image: "/images/tiramisu.jpg" 
        }
      ]
    },
    {
      name: "Pića",
      items: [
        { 
          id: "drink1", 
          name: "Zanatsko pivo", 
          price: 320, 
          description: "Lokalno kraft pivo, 0.33l",
          image: "/images/craft-beer.jpg" 
        },
        { 
          id: "drink2", 
          name: "Vino (čaša)", 
          price: 290, 
          description: "Domaće crveno ili belo vino",
          image: "/images/wine.jpg" 
        },
        { 
          id: "drink3", 
          name: "Kokteli", 
          price: 490, 
          description: "Signature Tango kokteli",
          image: "/images/cocktail.jpg" 
        },
        { 
          id: "drink4", 
          name: "Kafa", 
          price: 180, 
          description: "Espresso, cappuccino ili domaća kafa",
          image: "/images/coffee.jpg" 
        },
        { 
          id: "drink5", 
          name: "Sokovi", 
          price: 220, 
          description: "Ceđeni sokovi ili gazirani napici",
          image: "/images/juice.jpg" 
        }
      ]
    }
  ]
};

// In-memory cart storage
const carts = {};

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/restaurant-config', (req, res) => {
  res.json(restaurantConfig);
});

app.get('/api/menu', (req, res) => {
  res.json(menuData);
});

app.get('/api/cart/:tableId', (req, res) => {
  const { tableId } = req.params;
  res.json(carts[tableId] || []);
});

app.post('/api/cart/:tableId', (req, res) => {
  const { tableId } = req.params;
  const { itemId, quantity } = req.body;
  
  console.log(`Cart update request: tableId=${tableId}, itemId=${itemId}, quantity=${quantity}`);
  
  // Initialize cart if it doesn't exist
  if (!carts[tableId]) {
    carts[tableId] = [];
  }
  
  // Find item in menu
  let menuItem = null;
  for (const category of menuData.categories) {
    const found = category.items.find(item => item.id === itemId);
    if (found) {
      menuItem = found;
      break;
    }
  }
  
  if (!menuItem) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  // Find item in cart
  const existingItemIndex = carts[tableId].findIndex(item => item.id === itemId);
  
  if (existingItemIndex >= 0) {
    // Update existing item
    carts[tableId][existingItemIndex].quantity += quantity;
    
    // Remove if quantity is zero or negative
    if (carts[tableId][existingItemIndex].quantity <= 0) {
      carts[tableId].splice(existingItemIndex, 1);
    }
  } else if (quantity > 0) {
    // Add new item
    carts[tableId].push({
      id: itemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: quantity
    });
  }
  
  console.log(`Updated cart for ${tableId}:`, carts[tableId]);
  res.json(carts[tableId]);
});

// Admin route for QR codes
app.get('/admin/qrcodes', (req, res) => {
  res.sendFile(__dirname + '/public/admin-qrcodes.html');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 