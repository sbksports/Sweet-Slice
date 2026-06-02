"use client";

import React, { useState, useEffect } from "react";

export default function AdminPortal() {
  // ==========================================
  // 1. STATE CONFIGURATION
  // ==========================================
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  
  // Product Form states
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [editId, setEditId] = useState(null);
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodBadge, setProdBadge] = useState("");
  const [prodCakes, setProdCakes] = useState(false);
  const [prodDesserts, setProdDesserts] = useState(false);
  const [prodHealthy, setProdHealthy] = useState(false);
  const [prodImage, setProdImage] = useState(""); // Base64 data URL
  const [imagePreview, setImagePreview] = useState("");

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // ==========================================
  // 2. LIFECYCLE DATA SYNCS
  // ==========================================
  useEffect(() => {
    // Check Session Auth first
    const sessionAuth = sessionStorage.getItem("sweet_slice_admin_auth");
    if (sessionAuth === "true") {
      setIsLoggedIn(true);
    }

    // 1. Load Products
    const savedProducts = localStorage.getItem("sweet_slice_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Default fallback
      const defaultProducts = [
        {
          id: "rose-gold-classic",
          name: "Rose Gold Birthday Classic",
          desc: "Exquisite hand-crafted chocolate sponge cake with elegant pink and cocoa rose piping. Perfect for special birthdays.",
          price: 1500,
          image: "../assets/birthday_rose.png",
          categories: ["cakes"],
          badge: "Best Seller"
        },
        {
          id: "pistachio-garden",
          name: "Pistachio Fresh Garden Cake",
          desc: "Fluffy organic vanilla sponge infused with real pistachio cream, dressed in modern vibrant light-green rosette frosting.",
          price: 1800,
          image: "../assets/pistachio_cake.png",
          categories: ["cakes", "healthy"],
          badge: "Low Sugar"
        },
        {
          id: "mango-cups",
          name: "Vanilla Mango Custard Cups (6pcs)",
          desc: "Rich custard layers in cups topped with whipped vanilla cream and seasonal mango puree glaze. Set of 6 cups.",
          price: 650,
          image: "../assets/mango_cups.png",
          categories: ["desserts"],
          badge: null
        },
        {
          id: "choco-fudge-pots",
          name: "Choco-Fudge Pudding Pots (12pcs)",
          desc: "Individual baked cocoa fudge pots. Sweetened with organic stevia and made with gluten-free oat flour. Set of 12 mini pots.",
          price: 980,
          image: "../assets/fudge_pots.jpg",
          categories: ["desserts", "healthy"],
          badge: "Gluten Free"
        }
      ];
      setProducts(defaultProducts);
      localStorage.setItem("sweet_slice_products", JSON.stringify(defaultProducts));
    }

    // 2. Load Orders
    const savedOrders = localStorage.getItem("sweet_slice_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }

    // 3. Load Enquiries
    const savedEnquiries = localStorage.getItem("sweet_slice_enquiries");
    if (savedEnquiries) {
      setEnquiries(JSON.parse(savedEnquiries));
    }
  }, []);

  // Sync products back to local storage
  const syncProductsToStorage = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem("sweet_slice_products", JSON.stringify(updatedProducts));
  };

  // Sync orders back to local storage
  const syncOrdersToStorage = (updatedOrders) => {
    setOrders(updatedOrders);
    localStorage.setItem("sweet_slice_orders", JSON.stringify(updatedOrders));
  };

  // Sync enquiries back to local storage
  const syncEnquiriesToStorage = (updatedEnquiries) => {
    setEnquiries(updatedEnquiries);
    localStorage.setItem("sweet_slice_enquiries", JSON.stringify(updatedEnquiries));
  };

  // ==========================================
  // 3. IMAGE UPLOAD BASE64 LOADER
  // ==========================================
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProdImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // 4. PRODUCT CRUD OPERATIONS
  // ==========================================
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      alert("Product Name and Price are required.");
      return;
    }

    const categories = [];
    if (prodCakes) categories.push("cakes");
    if (prodDesserts) categories.push("desserts");
    if (prodHealthy) categories.push("healthy");

    if (categories.length === 0) {
      alert("Please select at least one category (Cakes, Desserts, or Healthy).");
      return;
    }

    if (formMode === "add") {
      const newProduct = {
        id: `prod-${Date.now()}`,
        name: prodName.trim(),
        desc: prodDesc.trim(),
        price: parseInt(prodPrice),
        badge: prodBadge.trim() || null,
        categories: categories,
        image: prodImage || "../assets/logo.jpg" // default brand logo
      };

      const updated = [...products, newProduct];
      syncProductsToStorage(updated);
      alert("Product added successfully!");
    } else {
      // Edit mode
      const updated = products.map(p => {
        if (p.id === editId) {
          return {
            ...p,
            name: prodName.trim(),
            desc: prodDesc.trim(),
            price: parseInt(prodPrice),
            badge: prodBadge.trim() || null,
            categories: categories,
            image: prodImage || p.image
          };
        }
        return p;
      });
      syncProductsToStorage(updated);
      alert("Product updated successfully!");
    }

    // Reset Form
    resetProductForm();
  };

  const handleEditProductClick = (product) => {
    setFormMode("edit");
    setEditId(product.id);
    setProdName(product.name);
    setProdDesc(product.desc);
    setProdPrice(product.price);
    setProdBadge(product.badge || "");
    setProdCakes(product.categories.includes("cakes"));
    setProdDesserts(product.categories.includes("desserts"));
    setProdHealthy(product.categories.includes("healthy"));
    setProdImage(product.image);
    setImagePreview(product.image);

    // Scroll to form
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleDeleteProduct = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter(p => p.id !== id);
      syncProductsToStorage(updated);
    }
  };

  const resetProductForm = () => {
    setFormMode("add");
    setEditId(null);
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdBadge("");
    setProdCakes(false);
    setProdDesserts(false);
    setProdHealthy(false);
    setProdImage("");
    setImagePreview("");
  };

  // ==========================================
  // 5. ORDER MANAGEMENT OPERATIONS
  // ==========================================
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(o => {
      if (o.orderId === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    syncOrdersToStorage(updated);
  };

  const handleDeleteOrder = (orderId) => {
    if (confirm(`Delete order ${orderId}?`)) {
      const updated = orders.filter(o => o.orderId !== orderId);
      syncOrdersToStorage(updated);
    }
  };

  const handleClearAllOrders = () => {
    if (confirm("WARNING: Are you sure you want to delete ALL order history? This cannot be undone.")) {
      syncOrdersToStorage([]);
    }
  };

  // ==========================================
  // 6. ENQUIRY MANAGEMENT OPERATIONS
  // ==========================================
  const handleDeleteEnquiry = (id) => {
    if (confirm("Delete this message?")) {
      const updated = enquiries.filter(e => e.id !== id);
      syncEnquiriesToStorage(updated);
    }
  };

  const handleClearAllEnquiries = () => {
    if (confirm("Are you sure you want to delete ALL messages?")) {
      syncEnquiriesToStorage([]);
    }
  };

  // ==========================================
  // 7. CALCULATE DASHBOARD METRICS
  // ==========================================
  const totalSales = orders
    .filter(o => o.status === "Delivered")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status !== "Delivered").length;

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "Suma@2026") {
      setIsLoggedIn(true);
      sessionStorage.setItem("sweet_slice_admin_auth", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("sweet_slice_admin_auth");
  };

  return (
    <>
      {/* Custom Styles Inject for Admin Panel */}
      <style jsx global>{`
        .admin-nav {
          background-color: var(--text-dark);
          color: white;
          padding: 1.2rem 0;
          border-bottom: 3px solid var(--primary);
        }
        .admin-nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-nav-tabs {
          display: flex;
          gap: 1.5rem;
        }
        .admin-nav-tab {
          padding: 0.5rem 1.2rem;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 20px;
          transition: var(--transition-smooth);
        }
        .admin-nav-tab:hover, .admin-nav-tab.active {
          background-color: var(--primary);
          color: var(--text-light);
        }
        .admin-main {
          padding: 4rem 0;
          min-height: 80vh;
        }
        .admin-header-title {
          font-family: var(--font-heading);
          color: var(--text-dark);
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .admin-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .admin-metric-card {
          background-color: var(--bg-white);
          border-radius: var(--border-radius-md);
          padding: 1.8rem;
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: 1.2rem;
          transition: var(--transition-smooth);
        }
        .admin-metric-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--secondary);
        }
        .admin-metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }
        .admin-metric-icon.sales {
          background-color: rgba(212, 163, 115, 0.15);
        }
        .admin-metric-icon.pending {
          background-color: rgba(230, 184, 156, 0.15);
          color: var(--secondary);
        }
        .admin-metric-icon.msg {
          background-color: var(--accent-green-light);
          color: var(--accent-green);
        }
        .admin-metric-details {
          display: flex;
          flex-direction: column;
        }
        .admin-metric-value {
          font-size: 1.8rem;
          font-family: var(--font-heading);
          font-weight: 700;
          color: var(--text-dark);
          line-height: 1.1;
        }
        .admin-metric-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          margin-top: 0.2rem;
        }
        .admin-crud-layout {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 3rem;
          align-items: start;
        }
        .admin-form-panel {
          background-color: var(--bg-white);
          border-radius: var(--border-radius-lg);
          padding: 2.5rem;
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-sm);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          background: white;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .admin-table th {
          background-color: var(--text-dark);
          color: white;
          text-align: left;
          padding: 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--primary-light);
          font-size: 0.9rem;
          color: var(--text-dark);
          vertical-align: middle;
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .admin-table tr:hover {
          background-color: var(--primary-light);
        }
        .badge-status {
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-status.pending {
          background-color: #fcf4dd;
          color: #b58900;
        }
        .badge-status.confirmed {
          background-color: #e2f0fd;
          color: #0275d8;
        }
        .badge-status.delivered {
          background-color: var(--accent-green-light);
          color: var(--accent-green);
        }
        .admin-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
          font-size: 0.85rem;
          margin-right: 0.5rem;
        }
        .admin-action-btn.edit {
          background-color: var(--primary-light);
          color: var(--primary-hover);
        }
        .admin-action-btn.edit:hover {
          background-color: var(--primary);
          color: white;
        }
        .admin-action-btn.delete {
          background-color: rgba(217, 83, 79, 0.1);
          color: #d9534f;
        }
        .admin-action-btn.delete:hover {
          background-color: #d9534f;
          color: white;
        }
        .admin-upload-box {
          border: 2px dashed var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: var(--transition-smooth);
          background-color: var(--bg-vanilla);
          margin-bottom: 1.5rem;
          position: relative;
        }
        .admin-upload-box:hover {
          border-color: var(--primary);
        }
        .admin-preview-thumb {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          margin: 0.8rem auto 0 auto;
          border: 1px solid var(--glass-border);
          display: block;
        }
        @media (max-width: 900px) {
          .admin-crud-layout {
            grid-template-columns: 1fr;
          }
          .admin-nav-container {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>

      {!isLoggedIn ? (
        /* Login Card Panel */
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 50%, rgba(247, 237, 226, 0.6), transparent 70%)"
        }}>
          <div style={{
            background: "var(--bg-white)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--border-radius-lg)",
            padding: "3rem",
            boxShadow: "var(--shadow-lg)",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center"
          }}>
            <img 
              src="../assets/logo.jpg" 
              alt="Brand Logo" 
              style={{ width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 1.5rem auto", border: "3px solid var(--primary)" }} 
            />
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-dark)", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Sweet Slice</h2>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--primary)", fontWeight: 700, display: "block", marginBottom: "2rem" }}>Admin Access Portal</span>
            
            {loginError && (
              <div style={{ padding: "0.8rem", backgroundColor: "rgba(217, 83, 79, 0.1)", color: "#d9534f", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1.5rem", fontWeight: 600 }}>
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem", textAlign: "left" }}>
              <div className="form-input-wrapper">
                <label className="custom-label">Username</label>
                <input 
                  type="text" 
                  className="custom-text-input" 
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              <div className="form-input-wrapper">
                <label className="custom-label">Password</label>
                <input 
                  type="password" 
                  className="custom-text-input" 
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Regular Admin Panel Panel */
        <>
          {/* Admin Navbar */}
          <nav className="admin-nav">
            <div className="container admin-nav-container">
              <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <img src="../assets/logo.jpg" alt="Logo" style={{ height: "40px", width: "40px", borderRadius: "50%", border: "2px solid white" }} />
                <span style={{ fontWeight: 700, fontSize: "1.15rem", letterSpacing: "0.5px" }}>Sweet Slice Admin</span>
              </a>
          
          <div className="admin-nav-tabs" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <span 
              className={`admin-nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >Dashboard</span>
            <span 
              className={`admin-nav-tab ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >Products</span>
            <span 
              className={`admin-nav-tab ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >Orders ({orders.length})</span>
            <span 
              className={`admin-nav-tab ${activeTab === "enquiries" ? "active" : ""}`}
              onClick={() => setActiveTab("enquiries")}
            >Enquiries ({enquiries.length})</span>
            <span 
              className="admin-nav-tab"
              onClick={handleLogout}
              style={{ backgroundColor: "rgba(217, 83, 79, 0.15)", color: "#d9534f", display: "inline-flex", gap: "0.3rem", alignItems: "center" }}
            >
              <i className="fa-solid fa-power-off"></i> Logout
            </span>
          </div>
        </div>
      </nav>

      {/* Admin Main Body */}
      <main className="admin-main">
        <div className="container">
          
          {/* HEADER TITLE */}
          <div className="admin-header-title">
            <h2>
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "products" && "Product Catalog Manager"}
              {activeTab === "orders" && "Customer Orders Tracker"}
              {activeTab === "enquiries" && "Customer Message Logs"}
            </h2>
            <a href="/" className="btn btn-secondary" style={{ fontSize: "0.85rem", padding: "0.5rem 1.2rem" }}>
              <i className="fa-solid fa-store" style={{ marginRight: "0.4rem" }}></i> Storefront
            </a>
          </div>

          {/* ==========================================
              TAB 1: DASHBOARD
              ========================================== */}
          {activeTab === "dashboard" && (
            <>
              {/* Metrics Row */}
              <div className="admin-card-grid">
                <div className="admin-metric-card">
                  <div className="admin-metric-icon sales">
                    <i className="fa-solid fa-bangladeshi-taka-sign"></i>
                  </div>
                  <div className="admin-metric-details">
                    <span className="admin-metric-value">৳{totalSales.toLocaleString()}</span>
                    <span className="admin-metric-label">Total Revenue</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="admin-metric-icon">
                    <i className="fa-solid fa-clipboard-list"></i>
                  </div>
                  <div className="admin-metric-details">
                    <span className="admin-metric-value">{orders.length}</span>
                    <span className="admin-metric-label">Total Orders</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="admin-metric-icon pending">
                    <i className="fa-solid fa-truck-clock"></i>
                  </div>
                  <div className="admin-metric-details">
                    <span className="admin-metric-value">{pendingOrdersCount}</span>
                    <span className="admin-metric-label">Pending Deliveries</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="admin-metric-icon msg">
                    <i className="fa-solid fa-message"></i>
                  </div>
                  <div className="admin-metric-details">
                    <span className="admin-metric-value">{enquiries.length}</span>
                    <span className="admin-metric-label">Customer Queries</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div style={{ marginTop: "3rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "1.2rem" }}>Recent Incoming Orders</h3>
                {orders.length === 0 ? (
                  <div style={{ padding: "3rem", background: "white", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}>
                    <i className="fa-solid fa-basket-shopping" style={{ fontSize: "3rem", color: "var(--secondary)", marginBottom: "1rem", display: "block" }}></i>
                    No orders have been placed yet.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Customer</th>
                          <th>Delivery Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(-5).reverse().map(order => (
                          <tr key={order.orderId}>
                            <td style={{ fontWeight: 700 }}>{order.orderId}</td>
                            <td>
                              <div><strong>{order.customer.name}</strong></div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.customer.phone}</div>
                            </td>
                            <td>{order.customer.date}</td>
                            <td style={{ fontWeight: 700 }}>৳{order.total.toLocaleString()}</td>
                            <td>
                              <span className={`badge-status ${order.status ? order.status.toLowerCase() : "pending"}`}>
                                {order.status || "Pending"}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: "0.3rem 0.8rem", fontSize: "0.75rem" }}
                                onClick={() => setActiveTab("orders")}
                              >Manage</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ==========================================
              TAB 2: PRODUCTS CRUD
              ========================================== */}
          {activeTab === "products" && (
            <div className="admin-crud-layout">
              {/* Product Form */}
              <div className="admin-form-panel">
                <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "1.5rem", borderBottom: "1px solid var(--primary-light)", paddingBottom: "0.5rem" }}>
                  {formMode === "add" ? "Add New Product" : "Edit Product Details"}
                </h3>
                
                <form onSubmit={handleSaveProduct}>
                  <div className="form-input-wrapper">
                    <label htmlFor="prod-name" className="custom-label">Product Title *</label>
                    <input 
                      type="text" 
                      id="prod-name" 
                      className="custom-text-input" 
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="e.g., Chocolate Berry Jar" 
                      required 
                    />
                  </div>

                  <div className="form-input-wrapper">
                    <label htmlFor="prod-price" className="custom-label">Price (৳ BDT) *</label>
                    <input 
                      type="number" 
                      id="prod-price" 
                      className="custom-text-input" 
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g., 750" 
                      required 
                    />
                  </div>

                  <div className="form-input-wrapper">
                    <label htmlFor="prod-badge" className="custom-label">Badge Overlay (Optional)</label>
                    <input 
                      type="text" 
                      id="prod-badge" 
                      className="custom-text-input" 
                      value={prodBadge}
                      onChange={(e) => setProdBadge(e.target.value)}
                      placeholder="e.g., Best Seller / Gluten Free" 
                    />
                  </div>

                  {/* Categories Checkboxes */}
                  <div className="form-input-wrapper" style={{ marginBottom: "1.5rem" }}>
                    <span className="custom-label">Store Categories *</span>
                    <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={prodCakes} 
                          onChange={(e) => setProdCakes(e.target.checked)} 
                          style={{ accentColor: "var(--primary)" }} 
                        />
                        <span style={{ fontSize: "0.9rem" }}>Birthday Cakes</span>
                      </label>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={prodDesserts} 
                          onChange={(e) => setProdDesserts(e.target.checked)} 
                          style={{ accentColor: "var(--primary)" }}
                        />
                        <span style={{ fontSize: "0.9rem" }}>Cupcakes & Jars</span>
                      </label>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={prodHealthy} 
                          onChange={(e) => setProdHealthy(e.target.checked)} 
                          style={{ accentColor: "var(--accent-green)" }}
                        />
                        <span style={{ fontSize: "0.9rem", color: "var(--accent-green)", fontWeight: 600 }}>Healthy Special</span>
                      </label>
                    </div>
                  </div>

                  {/* Image Selector Base64 */}
                  <div className="form-input-wrapper">
                    <span className="custom-label">Product Image</span>
                    <label className="admin-upload-box">
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "1.8rem", color: "var(--primary)", display: "block", marginBottom: "0.5rem" }}></i>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Click to upload local product photo
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: "none" }} 
                        onChange={handleImageFileChange} 
                      />
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="admin-preview-thumb" />
                      )}
                    </label>
                  </div>

                  <div className="form-input-wrapper">
                    <label htmlFor="prod-desc" className="custom-label">Description</label>
                    <textarea 
                      id="prod-desc" 
                      className="custom-text-input" 
                      style={{ minHeight: "80px" }}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Describe ingredients, servings, stevia options..."
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                    <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                      {formMode === "add" ? "Create Product" : "Save Changes"}
                    </button>
                    {formMode === "edit" && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={resetProductForm}
                      >Cancel</button>
                    )}
                  </div>
                </form>
              </div>

              {/* Product List */}
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "1.2rem" }}>Available Products ({products.length})</h3>
                {products.length === 0 ? (
                  <div style={{ padding: "3rem", background: "white", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}>
                    No products found.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {products.map(product => (
                      <div 
                        key={product.id} 
                        style={{ display: "flex", gap: "1rem", background: "white", padding: "1rem", borderRadius: "12px", border: "1px solid var(--glass-border)", alignItems: "center" }}
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          style={{ width: "65px", height: "65px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--primary-light)" }} 
                        />
                        <div style={{ flexGrow: 1 }}>
                          <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>{product.name}</h4>
                          <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, margin: "0.2rem 0" }}>৳{product.price.toLocaleString()}</div>
                          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                            {product.categories.map(cat => (
                              <span 
                                key={cat} 
                                style={{ 
                                  fontSize: "0.65rem", 
                                  padding: "0.1rem 0.5rem", 
                                  borderRadius: "10px", 
                                  background: cat === "healthy" ? "var(--accent-green-light)" : "var(--primary-light)", 
                                  color: cat === "healthy" ? "var(--accent-green)" : "var(--text-dark)",
                                  fontWeight: 600,
                                  textTransform: "capitalize"
                                }}
                              >{cat}</span>
                            ))}
                            {product.badge && (
                              <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.5rem", borderRadius: "10px", background: "#fcf4dd", color: "#b58900", fontWeight: 600 }}>{product.badge}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex" }}>
                          <button 
                            className="admin-action-btn edit" 
                            onClick={() => handleEditProductClick(product)}
                            aria-label="Edit product"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button 
                            className="admin-action-btn delete" 
                            onClick={() => handleDeleteProduct(product.id)}
                            aria-label="Delete product"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: ORDERS MANAGER
              ========================================== */}
          {activeTab === "orders" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3>All Orders Track List ({orders.length})</h3>
                {orders.length > 0 && (
                  <button className="btn btn-secondary" style={{ padding: "0.4rem 1.2rem", fontSize: "0.8rem", color: "#d9534f", borderColor: "rgba(217,83,79,0.3)" }} onClick={handleClearAllOrders}>
                    <i className="fa-solid fa-trash-arrow-up" style={{ marginRight: "0.4rem" }}></i> Clear Order History
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div style={{ padding: "4rem", background: "white", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}>
                  <i className="fa-solid fa-inbox" style={{ fontSize: "3.5rem", color: "var(--secondary)", marginBottom: "1rem", display: "block" }}></i>
                  No orders have been received yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {orders.slice().reverse().map(order => (
                    <div 
                      key={order.orderId}
                      style={{ background: "white", borderRadius: "16px", border: "1px solid var(--glass-border)", padding: "2rem", boxShadow: "var(--shadow-sm)" }}
                    >
                      {/* Order Title Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", borderBottom: "1px dashed var(--primary-light)", paddingBottom: "1.2rem", marginBottom: "1.2rem" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>ORDER REFERENCE ID:</span>
                          <h4 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-dark)" }}>{order.orderId}</h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Placed on: {new Date(order.timestamp).toLocaleString()}</span>
                        </div>
                        
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                          {/* Interactive Status Selector */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>UPDATE STATUS:</span>
                            <select 
                              className="custom-select" 
                              style={{ padding: "0.4rem 2rem 0.4rem 0.8rem", fontSize: "0.85rem", minWidth: "140px" }}
                              value={order.status || "Pending"}
                              onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                            >
                              <option value="Pending">⌛ Pending</option>
                              <option value="Confirmed">⚙️ Confirmed</option>
                              <option value="Delivered">✅ Delivered</option>
                            </select>
                          </div>
                          
                          <button 
                            className="admin-action-btn delete" 
                            style={{ width: "38px", height: "38px", marginTop: "1rem" }}
                            onClick={() => handleDeleteOrder(order.orderId)}
                            aria-label="Delete order"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      {/* Customer Info & Items columns */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "2.5rem" }}>
                        
                        {/* Customer Details block */}
                        <div>
                          <h5 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.8rem" }}>
                            Customer Details
                          </h5>
                          <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem" }}>
                            <li><strong>Name:</strong> {order.customer.name}</li>
                            <li><strong>Phone:</strong> <a href={`tel:${order.customer.phone}`} style={{ color: "var(--primary)", textDecoration: "underline" }}>{order.customer.phone}</a></li>
                            <li><strong>Address:</strong> {order.customer.address}</li>
                            <li><strong>Delivery Date:</strong> {order.customer.date} ({order.customer.timeSlot || "Standard slot"})</li>
                          </ul>
                        </div>

                        {/* Order Items list */}
                        <div>
                          <h5 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.8rem" }}>
                            Cart Delights
                          </h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {order.items.map(item => (
                              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--bg-vanilla)" }}>
                                <div>
                                  <strong>{item.name}</strong> <span style={{ color: "var(--text-muted)" }}>x{item.quantity}</span>
                                  {item.specs && item.specs.length > 0 && (
                                    <div style={{ fontSize: "0.75rem", color: "var(--accent-green)", fontWeight: 600 }}>
                                      {item.specs.join(", ")}
                                    </div>
                                  )}
                                </div>
                                <span style={{ fontWeight: 600 }}>৳{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                            
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", marginTop: "0.5rem" }}>
                              <span>Grand Total:</span>
                              <span style={{ color: "var(--primary)" }}>৳{order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 4: ENQUIRIES MANAGER
              ========================================== */}
          {activeTab === "enquiries" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3>Customer Messages & Enquiries ({enquiries.length})</h3>
                {enquiries.length > 0 && (
                  <button className="btn btn-secondary" style={{ padding: "0.4rem 1.2rem", fontSize: "0.8rem", color: "#d9534f", borderColor: "rgba(217,83,79,0.3)" }} onClick={handleClearAllEnquiries}>
                    <i className="fa-solid fa-trash-can" style={{ marginRight: "0.4rem" }}></i> Delete All Messages
                  </button>
                )}
              </div>

              {enquiries.length === 0 ? (
                <div style={{ padding: "4rem", background: "white", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}>
                  <i className="fa-solid fa-comment-slash" style={{ fontSize: "3.5rem", color: "var(--secondary)", marginBottom: "1rem", display: "block" }}></i>
                  No enquiries have been submitted.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {enquiries.slice().reverse().map(enq => (
                    <div 
                      key={enq.id}
                      style={{ background: "white", borderRadius: "16px", border: "1px solid var(--glass-border)", padding: "1.8rem", boxShadow: "var(--shadow-sm)", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}
                    >
                      <div style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="fa-solid fa-paper-plane" style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}></i>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                          <div>
                            <h4 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{enq.name}</h4>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Received: {new Date(enq.timestamp).toLocaleString()}</span>
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>REF: {enq.id}</span>
                        </div>
                        
                        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          <span>Phone: </span><a href={`tel:${enq.phone}`} style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 600, marginRight: "1rem" }}>{enq.phone}</a>
                          {enq.email && (
                            <>
                              <span>Email: </span><a href={`mailto:${enq.email}`} style={{ color: "var(--primary)", textDecoration: "underline" }}>{enq.email}</a>
                            </>
                          )}
                        </div>
                        
                        <p style={{ marginTop: "1rem", padding: "1.2rem", background: "var(--bg-vanilla)", borderRadius: "8px", borderLeft: "4px solid var(--primary)", fontSize: "0.95rem", color: "var(--text-dark)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                          {enq.message}
                        </p>
                      </div>
                      <button 
                        className="admin-action-btn delete" 
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => handleDeleteEnquiry(enq.id)}
                        aria-label="Delete message"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "logout" && (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <h3>Logging out...</h3>
              <button className="btn btn-primary" onClick={handleLogout}>Confirm Logout</button>
            </div>
          )}
        </div>
      </main>
    </>
  )}
</>
  );
}
