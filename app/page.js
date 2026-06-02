"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Color maps for dynamic preview rendering
const FLAVOR_COLORS = {
  chocolate: { bg: "#4d3227", border: "#332119", name: "Velvet Chocolate", extra: 0 },
  vanilla: { bg: "#faf1e3", border: "#e6dac4", name: "Vanilla Bean", extra: 0 },
  pistachio: { bg: "#b2c595", border: "#92a575", name: "Pistachio Nut", extra: 200 },
  redvelvet: { bg: "#9c1c24", border: "#731318", name: "Red Velvet", extra: 150 }
};

const SIZE_LABELS = {
  "1lb": { label: "1 Pound", price: 1200 },
  "2lb": { label: "2 Pounds", price: 2200 },
  "3lb": { label: "3 Pounds", price: 3200 }
};

const TOPPING_DETAILS = {
  none: { name: "No extra toppings", extra: 0 },
  fruits: { name: "Fresh Mixed Berries", extra: 150 },
  chocos: { name: "Chocolate Shavings", extra: 100 },
  macarons: { name: "Vanilla Macarons", extra: 250 }
};

export default function Home() {
  // ==========================================
  // 1. COMPONENT STATES
  // ==========================================
  const [cart, setCart] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  
  // Testimonials Slider State
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
  // Customizer Form State
  const [customFlavor, setCustomFlavor] = useState("chocolate");
  const [customSize, setCustomSize] = useState("1lb");
  const [customSugarFree, setCustomSugarFree] = useState(false);
  const [customGlutenFree, setCustomGlutenFree] = useState(false);
  const [customTopping, setCustomTopping] = useState("none");
  const [customMessage, setCustomMessage] = useState("");
  
  // Toast notifications list
  const [toasts, setToasts] = useState([]);
  
  // Simulation Success Order modal state
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // References for scroll tracking
  const sectionsRef = {
    home: useRef(null),
    about: useRef(null),
    gallery: useRef(null),
    customizer: useRef(null),
    testimonials: useRef(null),
    contact: useRef(null)
  };

  // ==========================================
  // 2. EFFECTS & LIFECYCLE
  // ==========================================
  // Initialize Cart and Products from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("sweet_slice_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }

    const savedProducts = localStorage.getItem("sweet_slice_products");
    const defaultProducts = [
      {
        id: "rose-gold-classic",
        name: "Rose Gold Birthday Classic",
        desc: "Exquisite hand-crafted chocolate sponge cake with elegant pink and cocoa rose piping. Perfect for special birthdays.",
        price: 1500,
        image: "assets/birthday_rose.png",
        categories: ["cakes"],
        badge: "Best Seller"
      },
      {
        id: "pistachio-garden",
        name: "Pistachio Fresh Garden Cake",
        desc: "Fluffy organic vanilla sponge infused with real pistachio cream, dressed in modern vibrant light-green rosette frosting.",
        price: 1800,
        image: "assets/pistachio_cake.png",
        categories: ["cakes", "healthy"],
        badge: "Low Sugar"
      },
      {
        id: "mango-cups",
        name: "Vanilla Mango Custard Cups (6pcs)",
        desc: "Rich custard layers in cups topped with whipped vanilla cream and seasonal mango puree glaze. Set of 6 cups.",
        price: 650,
        image: "assets/mango_cups.png",
        categories: ["desserts"],
        badge: null
      },
      {
        id: "choco-fudge-pots",
        name: "Choco-Fudge Pudding Pots (12pcs)",
        desc: "Individual baked cocoa fudge pots. Sweetened with organic stevia and made with gluten-free oat flour. Set of 12 mini pots.",
        price: 980,
        image: "assets/fudge_pots.jpg",
        categories: ["desserts", "healthy"],
        badge: "Gluten Free"
      }
    ];

    if (savedProducts) {
      try {
        setProductsList(JSON.parse(savedProducts));
      } catch (e) {
        console.error("Failed to parse products", e);
        setProductsList(defaultProducts);
        localStorage.setItem("sweet_slice_products", JSON.stringify(defaultProducts));
      }
    } else {
      setProductsList(defaultProducts);
      localStorage.setItem("sweet_slice_products", JSON.stringify(defaultProducts));
    }
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem("sweet_slice_cart", JSON.stringify(cart));
  }, [cart]);

  // Global Scroll & Intersection Observers
  useEffect(() => {
    const handleScroll = () => {
      // Sticky header
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Scroll Progress Bar
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolledPct = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolledPct);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active Link Scroller Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-80px 0px 0px 0px",
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    Object.values(sectionsRef).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Auto rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex(prev => (prev + 1) % 3); // 3 reviews
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // 3. EVENT HANDLERS
  // ==========================================
  // Custom Toast Trigger
  const triggerToast = (title, message, type = "success") => {
    const newToast = {
      id: Date.now(),
      title,
      message,
      type
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  // Add Item to Cart
  const handleAddToBag = (id, name, price, image, specs = []) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { id, name, price, image, quantity: 1, specs }];
      }
    });
    
    triggerToast("Added to Bag", `"${name}" added successfully!`, "success");
    setCartOpen(true);
  };

  // Update Cart Quantities
  const handleUpdateQty = (index, change) => {
    const newCart = [...cart];
    newCart[index].quantity += change;
    
    if (newCart[index].quantity <= 0) {
      const removed = newCart[index].name;
      newCart.splice(index, 1);
      triggerToast("Item Removed", `"${removed}" was removed from your bag.`, "info");
    }
    setCart(newCart);
  };

  // Remove Item
  const handleRemoveCartItem = (index) => {
    const newCart = [...cart];
    const removedName = newCart[index].name;
    newCart.splice(index, 1);
    setCart(newCart);
    triggerToast("Item Removed", `"${removedName}" was removed from your bag.`, "info");
  };

  // Calculate Subtotal
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Add custom cake to cart
  const handleAddCustomCake = () => {
    const flavorName = FLAVOR_COLORS[customFlavor].name;
    const sizeLabel = SIZE_LABELS[customSize].label;
    const toppingLabel = TOPPING_DETAILS[customTopping].name;
    
    const specs = [flavorName, sizeLabel];
    if (customSugarFree) specs.push("Sugar-Free (Stevia)");
    if (customGlutenFree) specs.push("Gluten-Free");
    if (customTopping !== "none") specs.push(toppingLabel);
    if (customMessage.trim()) specs.push(`Msg: "${customMessage.trim()}"`);
    
    const customId = `custom-cake-${Date.now()}`;
    const customPrice = calculateCustomizerPrice();
    
    handleAddToBag(customId, "Custom Celebration Cake", customPrice, "assets/logo.jpg", specs);
    
    // Reset Form settings
    setCustomMessage("");
    setCustomSugarFree(false);
    setCustomGlutenFree(false);
    setCustomTopping("none");
  };

  // Calculate Customizer Price
  const calculateCustomizerPrice = () => {
    const sizePrice = SIZE_LABELS[customSize].price;
    const flavorExtra = FLAVOR_COLORS[customFlavor].extra;
    const sugarFreeExtra = customSugarFree ? 150 : 0;
    const glutenFreeExtra = customGlutenFree ? 200 : 0;
    const toppingExtra = TOPPING_DETAILS[customTopping].extra;
    
    return sizePrice + flavorExtra + sugarFreeExtra + glutenFreeExtra + toppingExtra;
  };

  // Contact Form submit
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const name = e.target.elements["contact-name"].value.trim();
    const phone = e.target.elements["contact-phone"].value.trim();
    const email = e.target.elements["contact-email"].value.trim();
    const message = e.target.elements["contact-message"].value.trim();
    
    const enquiryDetails = {
      id: `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
      name,
      phone,
      email,
      message,
      timestamp: new Date().toISOString()
    };

    const enquiries = JSON.parse(localStorage.getItem("sweet_slice_enquiries")) || [];
    enquiries.push(enquiryDetails);
    localStorage.setItem("sweet_slice_enquiries", JSON.stringify(enquiries));

    triggerToast("Message Sent", `Thank you, ${name}! Your enquiry has been sent. Suma will contact you at ${phone}.`, "success");
    e.target.reset();
  };

  // Checkout submit
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const name = e.target.elements["chk-name"].value;
    const phone = e.target.elements["chk-phone"].value;
    const address = e.target.elements["chk-address"].value;
    const date = e.target.elements["chk-date"].value;
    
    const orderDetails = {
      orderId: `SS-${Math.floor(100000 + Math.random() * 900000)}`,
      customer: { name, phone, address, date },
      items: [...cart],
      total: getSubtotal(),
      timestamp: new Date().toISOString()
    };
    
    // Store locally
    const orders = JSON.parse(localStorage.getItem("sweet_slice_orders")) || [];
    orders.push(orderDetails);
    localStorage.setItem("sweet_slice_orders", JSON.stringify(orders));
    
    // Close cart/checkout & trigger confirmation modal
    setCheckoutOpen(false);
    setCart([]);
    setOrderConfirmation(orderDetails);
    e.target.reset();
  };

  // Loaded dynamic products list state from localStorage

  // ==========================================
  // 4. RENDER DESIGN IMPLEMENTATION
  // ==========================================
  return (
    <>
      {/* Scroll Progress bar */}
      <div id="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* Header / Navbar */}
      <header id="header" className={scrolled ? "scrolled" : ""}>
        <div className="header-container">
          <a href="#home" className="logo-wrapper">
            <Image src="/assets/logo.jpg" alt="Sweet Slice By Suma Logo" className="logo-img" width={50} height={50} />
            <div className="logo-text">
              <span className="logo-title">Sweet Slice</span>
              <span className="logo-subtitle">By Suma</span>
            </div>
          </a>
          
          <nav className={`nav-menu ${mobileMenuOpen ? "open" : ""}`} id="nav-menu">
            <a href="#home" className={`nav-link ${activeSection === "home" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#about" className={`nav-link ${activeSection === "about" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#gallery" className={`nav-link ${activeSection === "gallery" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>Menu</a>
            <a href="#customizer" className={`nav-link ${activeSection === "customizer" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>Customizer</a>
            <a href="#testimonials" className={`nav-link ${activeSection === "testimonials" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>Reviews</a>
            <a href="#contact" className={`nav-link ${activeSection === "contact" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </nav>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
            <button className="cart-trigger" id="cart-trigger" onClick={() => setCartOpen(true)} aria-label="Open shopping cart">
              <i className="fa-solid fa-bag-shopping"></i>
              <span className="cart-badge" id="cart-count">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
            <div className="menu-toggle" id="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main>
        
        {/* HERO SECTION */}
        <section className="hero" id="home" ref={sectionsRef.home}>
          <div className="container hero-grid">
            <div className="hero-content">
              <div className="hero-subtitle-badge">
                <i className="fa-solid fa-leaf" style={{ color: "var(--accent-green)" }}></i>
                <span>100% Home Baked with Love</span>
              </div>
              <h1 className="hero-title">
                Healthy Food For<br /><span>Healthy Life</span> 😇
              </h1>
              <p className="hero-description">
                Exquisite, artisanal birthday cakes and handcrafted pastries baked fresh in Suma's kitchen. We believe premium taste and wholesome health go hand-in-hand.
              </p>
              <div className="hero-actions">
                <a href="#gallery" className="btn btn-primary">Order Now</a>
                <a href="#customizer" className="btn btn-secondary">Design Your Cake</a>
              </div>
            </div>
            
            <div className="hero-image-container">
              <div className="hero-circle-bg"></div>
              <div className="hero-img-wrapper">
                <Image src="/assets/birthday_rose.png" alt="Featured Birthday Cake" className="hero-img" width={420} height={420} priority />
              </div>
              <div className="floating-badge floating-badge-1">
                <div className="badge-icon-circle">
                  <i className="fa-solid fa-cake-candles"></i>
                </div>
                <div className="badge-text-wrapper">
                  <span className="badge-text-title">Custom Designs</span>
                  <span className="badge-text-desc">Birthday & Events</span>
                </div>
              </div>
              <div className="floating-badge floating-badge-2">
                <div className="badge-icon-circle">
                  <i className="fa-solid fa-heart"></i>
                </div>
                <div className="badge-text-wrapper">
                  <span className="badge-text-title">Guilt-Free Sweetness</span>
                  <span className="badge-text-desc">Stevia & Organic options</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="about" id="about" ref={sectionsRef.about}>
          <div className="container about-grid">
            <div className="about-images">
              <div className="about-decor"></div>
              <Image src="/assets/logo.jpg" alt="Sweet Slice Logo" className="about-img-main" width={450} height={450} />
              <Image src="/assets/fudge_pots.jpg" alt="Dessert Pots Table" className="about-img-sub" width={240} height={240} />
            </div>
            
            <div className="about-content">
              <div className="section-title-wrapper" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <span className="section-subtitle">Our Story</span>
                <h2 className="section-title" style={{ display: "inline-block" }}>Suma's Baked Creations</h2>
              </div>
              
              <h3 className="about-tagline">
                😇 Healthy Food For <span>Healthy Life</span> 😇
              </h3>
              
              <p className="about-text">
                Welcome to <strong>Sweet Slice By Suma</strong>. Every single treat that leaves our kitchen is hand-crafted with meticulous detail, premium ingredients, and a touch of warmth. We specialize in custom birthday cakes, cupcakes, dessert jars, and specialty puddings.
              </p>
              
              <p className="about-text">
                We believe that celebration shouldn't compromise your well-being. That is why we provide tailored baking options—offering standard treats alongside sugar-free, diabetic-friendly, and gluten-free variations.
              </p>
              
              <div className="philosophy-grid">
                <div className="philosophy-card">
                  <i className="fa-solid fa-wand-magic-sparkles philosophy-icon"></i>
                  <h4 className="philosophy-title">Artisanal Craft</h4>
                  <p className="philosophy-desc">Custom designs made to order to reflect the unique theme of your birthday celebration.</p>
                </div>
                <div className="philosophy-card health">
                  <i className="fa-solid fa-apple-whole philosophy-icon"></i>
                  <h4 className="philosophy-title">Health First</h4>
                  <p className="philosophy-desc">Choose alternative sweeteners (stevia/honey), whole grains, and organic toppings.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT GALLERY */}
        <section className="gallery" id="gallery" ref={sectionsRef.gallery}>
          <div className="container">
            <div className="section-title-wrapper">
              <span className="section-subtitle">Our Signature Collection</span>
              <h2 className="section-title">Fresh From Our Kitchen</h2>
            </div>
            
            <div className="gallery-filters">
              <button 
                className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >All Items</button>
              <button 
                className={`filter-btn ${activeFilter === "cakes" ? "active" : ""}`}
                onClick={() => setActiveFilter("cakes")}
              >Birthday Cakes</button>
              <button 
                className={`filter-btn ${activeFilter === "desserts" ? "active" : ""}`}
                onClick={() => setActiveFilter("desserts")}
              >Cupcakes & Jars</button>
              <button 
                className={`filter-btn health-filter ${activeFilter === "healthy" ? "active" : ""}`}
                onClick={() => setActiveFilter("healthy")}
              >Healthy Specials</button>
            </div>
            
            <div className="product-grid">
              {productsList
                .filter(p => activeFilter === "all" || p.categories.includes(activeFilter))
                .map(product => (
                  <div className="product-card" key={product.id}>
                    <div className="product-img-wrapper">
                      <Image 
                        src={product.image.startsWith("data:") ? product.image : `/${product.image}`} 
                        alt={product.name} 
                        className="product-img" 
                        width={350} 
                        height={240} 
                        style={{ objectFit: "cover" }} 
                        unoptimized={product.image.startsWith("data:")} 
                      />
                      {product.badge && (
                        <div className="product-badges">
                          <span className="badge-health">
                            <i className={product.badge === "Best Seller" ? "fa-solid fa-crown" : "fa-solid fa-leaf"}></i> {product.badge}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.name}</h3>
                      <p className="product-desc">{product.desc}</p>
                      <div className="product-meta">
                        <span className="product-price">৳{product.price.toLocaleString()}</span>
                        <button 
                          className="product-add-btn" 
                          onClick={() => handleAddToBag(product.id, product.name, product.price, product.image)}
                          aria-label="Add to cart"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* CAKE CUSTOMIZER */}
        <section className="customizer" id="customizer" ref={sectionsRef.customizer}>
          <div className="container">
            <div className="section-title-wrapper">
              <span className="section-subtitle">Baker's Lab</span>
              <h2 className="section-title">Design Your Custom Cake</h2>
            </div>
            
            <div className="customizer-layout">
              {/* Form Options */}
              <div className="customizer-form-card">
                <form onSubmit={(e) => e.preventDefault()}>
                  
                  {/* 1. Base Flavor */}
                  <div className="form-section">
                    <h3 className="form-group-title"><span>1.</span> Select Your Cake Base</h3>
                    <div className="customizer-grid-options">
                      {Object.keys(FLAVOR_COLORS).map(key => (
                        <label className="option-selector" key={key}>
                          <input 
                            type="radio" 
                            name="cake-flavor" 
                            value={key} 
                            checked={customFlavor === key}
                            onChange={() => setCustomFlavor(key)}
                            className="option-input" 
                          />
                          <span className="option-card">
                            <span className="option-icon">
                              {key === "chocolate" ? "🍫" : key === "vanilla" ? "🍦" : key === "pistachio" ? "🥑" : "🍰"}
                            </span>
                            <span className="option-label">{FLAVOR_COLORS[key].name}</span>
                            <span className="option-price-tag">
                              {FLAVOR_COLORS[key].extra === 0 ? "Included" : `+৳${FLAVOR_COLORS[key].extra}`}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 2. Weight / Size */}
                  <div className="form-section">
                    <h3 className="form-group-title"><span>2.</span> Cake Size & Weight</h3>
                    <div className="customizer-grid-options">
                      {Object.keys(SIZE_LABELS).map(key => (
                        <label className="option-selector" key={key}>
                          <input 
                            type="radio" 
                            name="cake-size" 
                            value={key} 
                            checked={customSize === key}
                            onChange={() => setCustomSize(key)}
                            className="option-input" 
                          />
                          <span className="option-card">
                            <span className="option-icon">
                              {key === "1lb" ? "🎂" : key === "2lb" ? "🎂🎂" : "👑"}
                            </span>
                            <span className="option-label">{SIZE_LABELS[key].label}</span>
                            <span className="option-price-tag">৳{SIZE_LABELS[key].price.toLocaleString()}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 3. Health Settings */}
                  <div className="form-section">
                    <h3 className="form-group-title"><span>3.</span> Health Customization 😇</h3>
                    
                    <div className="toggle-wrapper">
                      <div className="toggle-label-group">
                        <span className="toggle-main-label">
                          <i className="fa-solid fa-leaf" style={{ color: "var(--accent-green)" }}></i> Organic Sugar-Free
                        </span>
                        <span className="toggle-sub-label">Prepared with Stevia. (+৳150)</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={customSugarFree}
                          onChange={(e) => setCustomSugarFree(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-wrapper">
                      <div className="toggle-label-group">
                        <span className="toggle-main-label">
                          <i className="fa-solid fa-wheat-awn" style={{ color: "var(--accent-green)" }}></i> Organic Gluten-Free
                        </span>
                        <span className="toggle-sub-label">Prepared with almond & oat flour. (+৳200)</span>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={customGlutenFree}
                          onChange={(e) => setCustomGlutenFree(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  {/* 4. Extras */}
                  <div className="form-section" style={{ marginTop: "1.5rem" }}>
                    <h3 className="form-group-title"><span>4.</span> Add-on Decorations</h3>
                    <div className="form-input-wrapper">
                      <label htmlFor="cake-toppings" className="custom-label">Extra Toppings</label>
                      <select 
                        id="cake-toppings" 
                        className="custom-select"
                        value={customTopping}
                        onChange={(e) => setCustomTopping(e.target.value)}
                      >
                        <option value="none">No extra toppings</option>
                        <option value="fruits">Fresh Mixed Berries (+৳150)</option>
                        <option value="chocos">Chocolate Shavings (+৳100)</option>
                        <option value="macarons">Vanilla Macarons (+৳250)</option>
                      </select>
                    </div>
                    
                    <div className="form-input-wrapper">
                      <label htmlFor="cake-message" className="custom-label">Birthday Message on Cake</label>
                      <input 
                        type="text" 
                        id="cake-message" 
                        className="custom-text-input" 
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="e.g., Happy Birthday Piu! (Max 30 chars)" 
                        maxLength={30} 
                      />
                    </div>
                  </div>

                </form>
              </div>

              {/* Summary Sticky Box */}
              <div className="customizer-preview-sticky">
                <h3 className="preview-title">Order Summary</h3>
                
                <div className="preview-cake-graphic">
                  <div 
                    className="cake-graphic" 
                    id="preview-graphic"
                    style={{
                      backgroundColor: FLAVOR_COLORS[customFlavor].bg,
                      borderColor: FLAVOR_COLORS[customFlavor].border,
                      height: customSize === "3lb" ? "110px" : "90px"
                    }}
                  >
                    <div 
                      className="cake-layer-2" 
                      id="preview-layer-2"
                      style={{
                        display: (customSize === "2lb" || customSize === "3lb") ? "block" : "none",
                        backgroundColor: FLAVOR_COLORS[customFlavor].bg,
                        borderColor: FLAVOR_COLORS[customFlavor].border,
                        height: customSize === "3lb" ? "75px" : "60px"
                      }}
                    ></div>
                    <div className="cake-candle">
                      <div className="cake-flame"></div>
                    </div>
                  </div>
                </div>
                
                <div className="preview-details-list">
                  <div className="preview-item">
                    <span>Cake Flavor:</span>
                    <strong>{FLAVOR_COLORS[customFlavor].name}</strong>
                  </div>
                  <div className="preview-item">
                    <span>Cake Size:</span>
                    <strong>{SIZE_LABELS[customSize].label}</strong>
                  </div>
                  <div className="preview-item">
                    <span>Sugar Free:</span>
                    <strong>{customSugarFree ? "Yes" : "No"}</strong>
                  </div>
                  <div className="preview-item">
                    <span>Gluten Free:</span>
                    <strong>{customGlutenFree ? "Yes" : "No"}</strong>
                  </div>
                  <div className="preview-item">
                    <span>Topping:</span>
                    <strong>{TOPPING_DETAILS[customTopping].name}</strong>
                  </div>
                  <div className="preview-item">
                    <span>Cake Message:</span>
                    <strong style={{ fontStyle: "italic", color: "var(--primary)" }}>
                      {customMessage.trim() ? `"${customMessage.trim()}"` : "None"}
                    </strong>
                  </div>
                </div>
                
                <div className="preview-total">
                  <span className="preview-total-label">Estimated Price:</span>
                  <span className="preview-total-price">৳{calculateCustomizerPrice().toLocaleString()}</span>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddCustomCake}
                  style={{ width: "100%" }}
                >
                  <i className="fa-solid fa-cart-plus" style={{ marginRight: "0.5rem" }}></i> Add to Cart
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="testimonials" id="testimonials" ref={sectionsRef.testimonials}>
          <div className="container">
            <div className="section-title-wrapper">
              <span className="section-subtitle">Heartfelt Feedback</span>
              <h2 className="section-title">What Our Customers Say</h2>
            </div>
            
            <div className="testimonials-slider-container">
              <div className="testimonials-slider">
                
                {/* Review 1 */}
                <div className={`testimonial-slide ${currentReviewIndex === 0 ? "active" : ""}`}>
                  <div className="testimonial-rating">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <blockquote className="testimonial-quote">
                    "The Rose Gold Birthday cake was an absolute showstopper for Piu's birthday! It was so soft, not overly sweet, and the chocolate taste was incredibly rich. Everyone asked where we got it. Thank you, Suma!"
                  </blockquote>
                  <div className="testimonial-author-group">
                    <Image src="/assets/logo.jpg" alt="Sharmin Akter" className="testimonial-avatar" width={60} height={60} />
                    <span className="testimonial-name">Sharmin Akter</span>
                    <span className="testimonial-rating" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Verified Buyer</span>
                  </div>
                </div>

                {/* Review 2 */}
                <div className={`testimonial-slide ${currentReviewIndex === 1 ? "active" : ""}`}>
                  <div className="testimonial-rating">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <blockquote className="testimonial-quote">
                    "I have diabetes and finding good cake is so hard. The Pistachio Garden cake with Stevia was phenomenal! Finally, a bakery that looks out for healthy life choices without sacrificing taste. Outstanding service."
                  </blockquote>
                  <div className="testimonial-author-group">
                    <Image src="/assets/logo.jpg" alt="Saad Rahman" className="testimonial-avatar" width={60} height={60} />
                    <span className="testimonial-name">Saad Rahman</span>
                    <span className="testimonial-rating" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Healthy Diet Enthusiast</span>
                  </div>
                </div>

                {/* Review 3 */}
                <div className={`testimonial-slide ${currentReviewIndex === 2 ? "active" : ""}`}>
                  <div className="testimonial-rating">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <blockquote className="testimonial-quote">
                    "We ordered the Vanilla Mango Custard Cups and the Choco-Fudge pudding pots for a home gathering. My guests were completely wowed by the presentation and fresh flavours. Everything tastes premium."
                  </blockquote>
                  <div className="testimonial-author-group">
                    <Image src="/assets/logo.jpg" alt="Tasmia Kabir" className="testimonial-avatar" width={60} height={60} />
                    <span className="testimonial-name">Tasmia Kabir</span>
                    <span className="testimonial-rating" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Home Party Host</span>
                  </div>
                </div>

              </div>
              
              <div className="slider-controls">
                <button 
                  className="slider-btn" 
                  onClick={() => setCurrentReviewIndex(prev => (prev - 1 + 3) % 3)}
                  aria-label="Previous review"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button 
                  className="slider-btn" 
                  onClick={() => setCurrentReviewIndex(prev => (prev + 1) % 3)}
                  aria-label="Next review"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="contact" id="contact" ref={sectionsRef.contact}>
          <div className="container contact-grid">
            
            <div className="contact-info-column">
              <div>
                <h2 className="contact-info-title">Get In Touch</h2>
                <p className="contact-info-description">
                  Have an upcoming celebration or special request? Suma is ready to bake something wonderful for you. Reach out via phone, email, or Facebook.
                </p>
              </div>
              
              <div className="contact-methods">
                <a href="tel:01864749587" className="contact-method-card">
                  <div className="contact-icon-box">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="contact-method-details">
                    <span className="contact-method-label">Call or WhatsApp</span>
                    <span className="contact-method-value">01864-749587</span>
                  </div>
                </a>
                
                <a href="mailto:sharmin0akter12@gmail.com" className="contact-method-card">
                  <div className="contact-icon-box">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div className="contact-method-details">
                    <span className="contact-method-label">Email Address</span>
                    <span className="contact-method-value">sharmin0akter12@gmail.com</span>
                  </div>
                </a>

                <a href="https://www.facebook.com/profile.php?id=100094904995635" target="_blank" rel="noopener noreferrer" className="contact-method-card fb-card">
                  <div className="contact-icon-box">
                    <i className="fa-brands fa-facebook-f"></i>
                  </div>
                  <div className="contact-method-details">
                    <span className="contact-method-label">Facebook Profile</span>
                    <span className="contact-method-value">Sweet Slice By Suma</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="contact-form-card">
              <h3 className="form-group-title" style={{ marginBottom: "2rem" }}>
                <i className="fa-solid fa-paper-plane" style={{ color: "var(--primary)" }}></i> Send Suma a Message
              </h3>
              <form id="contact-enquiry-form" className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-input-wrapper">
                    <label htmlFor="contact-name" className="custom-label">Your Name</label>
                    <input type="text" id="contact-name" className="custom-text-input" placeholder="e.g., Saad Rahman" required />
                  </div>
                  <div className="form-input-wrapper">
                    <label htmlFor="contact-phone" className="custom-label">Phone Number</label>
                    <input type="tel" id="contact-phone" className="custom-text-input" placeholder="e.g., 01864-XXXXXX" required />
                  </div>
                </div>
                
                <div className="form-input-wrapper">
                  <label htmlFor="contact-email" className="custom-label">Email Address</label>
                  <input type="email" id="contact-email" className="custom-text-input" placeholder="e.g., you@domain.com" />
                </div>

                <div className="form-input-wrapper">
                  <label htmlFor="contact-message" className="custom-label">Your Message or Enquiry Details</label>
                  <textarea id="contact-message" className="custom-text-input contact-textarea" placeholder="Describe the cake, flavors, theme, or delivery date you want..." required></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>Send Enquiry</button>
              </form>
            </div>

          </div>
        </section>

      </main>

      {/* SHOPPING CART DRAWER */}
      <div className={`cart-drawer-backdrop ${cartOpen ? "open" : ""}`} id="cart-backdrop" onClick={() => setCartOpen(false)}></div>
      <div className={`cart-drawer ${cartOpen ? "open" : ""}`} id="cart-drawer">
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            <i className="fa-solid fa-shopping-bag" style={{ color: "var(--primary)" }}></i> Shopping Bag
          </h2>
          <div className="cart-drawer-close" id="cart-close" onClick={() => setCartOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
        
        <div className="cart-items-container" id="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <i className="fa-solid fa-basket-shopping cart-empty-icon"></i>
              <p>Your shopping bag is empty.</p>
              <p style={{ fontSize: "0.8rem" }}>Add some healthy delights from our menu!</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div className="cart-item" key={item.id}>
                <Image 
                  src={item.image.startsWith("data:") ? item.image : `/${item.image}`} 
                  alt={item.name} 
                  className="cart-item-img" 
                  width={70} 
                  height={70} 
                  style={{ objectFit: "cover" }} 
                  unoptimized={item.image.startsWith("data:")} 
                />
                <div className="cart-item-details">
                  <span className="cart-item-title">{item.name}</span>
                  {item.specs && item.specs.length > 0 && (
                    <span className="cart-item-spec">{item.specs.join(", ")}</span>
                  )}
                  <span className="cart-item-price">৳{(item.price * item.quantity).toLocaleString()}</span>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => handleUpdateQty(index, -1)} aria-label="Decrease quantity">-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => handleUpdateQty(index, 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <div className="cart-item-remove" onClick={() => handleRemoveCartItem(index)} aria-label="Remove item">
                  <i className="fa-solid fa-trash-can"></i>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="cart-drawer-footer">
          <div className="cart-summary-row">
            <span>Subtotal:</span>
            <span className="cart-total-price" id="cart-subtotal">৳{getSubtotal().toLocaleString()}</span>
          </div>
          <button 
            className="btn btn-primary" 
            id="btn-checkout" 
            style={{ width: "100%" }} 
            onClick={() => {
              setCartOpen(false);
              setCheckoutOpen(true);
            }}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <div className={`modal-backdrop ${checkoutOpen ? "open" : ""}`} id="checkout-modal">
        <div className="modal-container">
          <div className="modal-header">
            <h2 className="modal-title">
              <i className="fa-solid fa-file-invoice-dollar" style={{ color: "var(--primary)", marginRight: "0.5rem" }}></i> Complete Your Order
            </h2>
            <div className="modal-close" id="modal-close" onClick={() => setCheckoutOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
          <div className="modal-body">
            <form id="order-checkout-form" className="checkout-form" onSubmit={handleCheckoutSubmit}>
              
              <div className="form-input-wrapper">
                <label htmlFor="chk-name" className="custom-label">Full Name</label>
                <input type="text" id="chk-name" className="custom-text-input" placeholder="Your full name" required />
              </div>

              <div className="form-input-wrapper">
                <label htmlFor="chk-phone" className="custom-label">Contact Number (Mobile)</label>
                <input type="tel" id="chk-phone" className="custom-text-input" placeholder="e.g. 01864-749587" required />
              </div>

              <div className="form-input-wrapper">
                <label htmlFor="chk-address" className="custom-label">Delivery Address</label>
                <textarea id="chk-address" className="custom-text-input" style={{ minHeight: "80px" }} placeholder="Full delivery address details" required></textarea>
              </div>

              <div className="form-row">
                <div className="form-input-wrapper">
                  <label htmlFor="chk-date" className="custom-label">Delivery Date</label>
                  <input type="date" id="chk-date" className="custom-text-input" required />
                </div>
                <div className="form-input-wrapper">
                  <label htmlFor="chk-time" className="custom-label">Preferred Time Slot</label>
                  <select id="chk-time" className="custom-select">
                    <option value="morning">Morning (10:00 AM - 01:00 PM)</option>
                    <option value="afternoon">Afternoon (01:00 PM - 05:00 PM)</option>
                    <option value="evening">Evening (05:00 PM - 08:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="form-input-wrapper" style={{ marginTop: "0.5rem", backgroundColor: "var(--primary-light)", padding: "1.2rem", borderRadius: "var(--border-radius-md)", border: "1px dashed var(--primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", marginBottom: "0.3rem" }}>
                  <span>Total Payable Amount:</span>
                  <span id="checkout-total-val" style={{ color: "var(--primary)", fontSize: "1.2rem" }}>৳{getSubtotal().toLocaleString()}</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", lineHeight: "1.4" }}>
                  * Payment is cash-on-delivery or via Mobile Banking (bKash/Nagad) once delivery is scheduled. Suma will call you to confirm.
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Confirm & Place Order</button>
            </form>
          </div>
        </div>
      </div>

      {/* CONFIRMATION ALERT DIALOG */}
      {orderConfirmation && (
        <>
          <div 
            style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              backgroundColor: "rgba(58, 37, 33, 0.6)", backdropFilter: "blur(8px)",
              zIndex: 2999, transition: "var(--transition-smooth)"
            }}
            onClick={() => setOrderConfirmation(null)}
          ></div>
          <div 
            style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              background: "var(--bg-white)", borderRadius: "var(--border-radius-lg)",
              padding: "3rem", boxShadow: "var(--shadow-lg)", zIndex: 3000,
              textAlign: "center", maxWidth: "460px", width: "90%",
              border: "2px solid var(--primary-light)", transition: "var(--transition-smooth)"
            }}
          >
            <div style={{ width: "70px", height: "70px", backgroundColor: "var(--accent-green-light)", color: "var(--accent-green)", borderRadius: "50%", display: "flex", alignItems: "center", justify: "center", fontSize: "2.2rem", margin: "0 auto 1.5rem auto" }}>
              <i className="fa-solid fa-circle-check" style={{ marginTop: "1.2rem" }}></i>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", marginBottom: "1rem", color: "var(--text-dark)" }}>Order Placed Successfully!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "0.5rem", lineHeight: "1.6" }}>
              Thank you, <strong>{orderConfirmation.customer.name}</strong>! Your order <strong>{orderConfirmation.orderId}</strong> has been received by Suma.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "2rem", lineHeight: "1.5" }}>
              Suma will phone you at <strong>{orderConfirmation.customer.phone}</strong> shortly to verify details and delivery logistics.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: "100%" }} 
              onClick={() => setOrderConfirmation(null)}
            >
              Perfect, Thank You!
            </button>
          </div>
        </>
      )}

      {/* TOAST SYSTEM */}
      <div className="notification-container" id="notification-container">
        {toasts.map(toast => (
          <div className={`notification ${toast.type === "success" ? "notification-success" : ""} show`} key={toast.id}>
            {toast.type === "success" ? (
              <i className="fa-solid fa-circle-check notification-icon"></i>
            ) : (
              <i className="fa-solid fa-circle-info notification-icon" style={{ color: "var(--primary)" }}></i>
            )}
            <div className="notification-text-group">
              <span className="notification-title">{toast.title}</span>
              <span className="notification-message">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer>
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-wrapper">
              <Image src="/assets/logo.jpg" alt="Sweet Slice Logo" className="footer-logo-img" width={48} height={48} />
              <div>
                <span className="footer-logo-title">Sweet Slice</span><br />
                <span className="footer-logo-subtitle">By Suma</span>
              </div>
            </div>
            <p className="footer-desc">
              Artisanal, premium baked goods. Made to order with wholesome, organic ingredients and baked fresh daily in Suma's home kitchen.
            </p>
            <span className="footer-slogan">😇 Healthy Food For Healthy Life 😇</span>
          </div>
          
          <div>
            <h4 className="footer-column-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home" className="footer-link">Home</a></li>
              <li><a href="#about" className="footer-link">About Suma</a></li>
              <li><a href="#gallery" className="footer-link">Our Menu</a></li>
              <li><a href="#customizer" className="footer-link">Cake Customizer</a></li>
              <li><a href="#testimonials" className="footer-link">Reviews</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="footer-column-title">Contact Suma</h4>
            <ul className="footer-links" style={{ gap: "1.2rem" }}>
              <li className="footer-contact-item">
                <i className="fa-solid fa-phone footer-contact-icon"></i>
                <span>01864-749587</span>
              </li>
              <li className="footer-contact-item">
                <i className="fa-solid fa-envelope footer-contact-icon"></i>
                <span>sharmin0akter12@gmail.com</span>
              </li>
              <li className="footer-contact-item">
                <i className="fa-solid fa-location-dot footer-contact-icon"></i>
                <span>Chittagong, Bangladesh<br /><span style={{ fontSize: "0.75rem", opacity: 0.7 }}>(Home Delivery Available)</span></span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="footer-column-title">Connect With Us</h4>
            <p className="footer-desc" style={{ fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1rem" }}>
              Follow us on Facebook to see our daily baking updates, recent designs, and customer reviews.
            </p>
            <div className="footer-socials" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <a href="https://www.facebook.com/profile.php?id=100094904995635" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Follow Suma on Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="/admin" className="social-icon-btn" style={{ fontSize: "0.85rem", width: "auto", padding: "0 1.2rem", borderRadius: "30px", display: "inline-flex", gap: "0.4rem" }} aria-label="Open Admin Dashboard">
                <i className="fa-solid fa-user-gear"></i> Admin Portal
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-copyright">
          <p>&copy; 2026 Sweet Slice By Suma. All rights reserved. Made with ❤️ for healthy celebrations.</p>
        </div>
      </footer>
    </>
  );
}
