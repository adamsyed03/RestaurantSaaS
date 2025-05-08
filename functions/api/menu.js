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
            image: "/images/menu/bruschetta.jpg"
          },
          { 
            id: "starter2", 
            name: "Pohovani kačkavalj", 
            price: 550, 
            description: "Domaći pohovani kačkavalj sa tartar sosom",
            image: "/images/menu/fried-cheese.jpg"
          },
          { 
            id: "starter3", 
            name: "Tango plata", 
            price: 990, 
            description: "Selekcija sireva i suhomesnatih proizvoda",
            image: "/images/menu/cheese-platter.jpg"
          }
        ]
      },
      {
        name: "Glavna jela",
        items: [
          { 
            id: "main1", 
            name: "Biftek", 
            price: 2200, 
            description: "Premium juneći biftek sa mladim krompirom",
            image: "/images/menu/steak.jpg"
          },
          { 
            id: "main2", 
            name: "Losos", 
            price: 1800, 
            description: "Grilovani losos sa sezonskim povrćem",
            image: "/images/menu/salmon.jpg"
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
            image: "/images/menu/chocolate-souffle.jpg"
          },
          { 
            id: "dessert2", 
            name: "Tiramisu", 
            price: 390, 
            description: "Klasični italijanski desert",
            image: "/images/menu/tiramisu.jpg"
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
            image: "/images/menu/craft-beer.jpg"
          },
          { 
            id: "drink2", 
            name: "Vino (čaša)", 
            price: 290, 
            description: "Domaće crveno ili belo vino",
            image: "/images/menu/wine.jpg"
          },
          { 
            id: "drink3", 
            name: "Kokteli", 
            price: 490, 
            description: "Signature Tango kokteli",
            image: "/images/menu/cocktail.jpg"
          }
        ]
      }
    ]
  };
  
  return new Response(JSON.stringify(menuData), {
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
} 