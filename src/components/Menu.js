import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Menu() {
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 1,
      category: "Burgeri",
      items: [
        { 
          id: 'B1', 
          name: 'Američki Burger', 
          price: 1999, 
          description: 'Sočni burger sa 100% junetinom, čedar sirom, zelenom salatom, paradajzom i našim specijalnim sosom' 
        },
      ]
    },
    {
      id: 2,
      category: "Pice",
      items: [
        { 
          id: 'P1', 
          name: 'Kapričoza', 
          price: 1999, 
          description: 'Šunka, pečurke, sir, masline, paradajz sos' 
        },
      ]
    },
    {
      id: 3,
      category: "Paste",
      items: [
        { 
          id: 'PA1', 
          name: 'Pasta Bolonjeze', 
          price: 1999, 
          description: 'Domaća pasta sa sosom od mlevenog mesa, paradajza i parmezana' 
        },
      ]
    }
  ];

  const addToCart = (item) => {
    setSelectedItems([...selectedItems, item]);
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <h1>Naš Meni</h1>
        <button 
          className="view-cart"
          onClick={() => navigate('/cart')}
        >
          Korpa ({selectedItems.length})
        </button>
      </header>

      {menuItems.map((category) => (
        <div key={category.id} className="menu-category">
          <h2>{category.category}</h2>
          <div className="menu-items">
            {category.items.map((item) => (
              <div key={item.id} className="menu-item">
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="price">{item.price} RSD</span>
                </div>
                <button onClick={() => addToCart(item)}>Dodaj u korpu</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Menu; 