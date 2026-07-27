import { API_URL } from './config.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import MenuSection from './components/MenuSection.jsx';
import XeroxSection from './components/XeroxSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import CartSidebar from './components/CartSidebar.jsx';
import VariantDrawer from './components/VariantDrawer.jsx';
import OrderModal from './components/OrderModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import LoginModal from './components/LoginModal.jsx';
import AdminProductModal from './components/AdminProductModal.jsx';
import AdminDashboardModal from './components/AdminDashboardModal.jsx';
import MyOrdersModal from './components/MyOrdersModal.jsx';
import ReviewsModal from './components/ReviewsModal.jsx';
import { MENU_ITEMS, ITEM_VARIANTS, FEATURED } from './data/menuData.js';

let toastIdCounter = 0;

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cb-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [menuItems, setMenuItems] = useState([]);
  const [itemVariants, setItemVariants] = useState(ITEM_VARIANTS);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(API_URL + '/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data.length ? data : MENU_ITEMS))
      .catch(err => {
        console.error(err);
        setMenuItems(MENU_ITEMS);
      });
    
    fetch(API_URL + '/api/orders')
      .then(res => res.json())
      .then(setOrders)
      .catch(console.error);
      
    fetch(API_URL + '/api/reviews')
      .then(res => res.json())
      .then(setReviews)
      .catch(console.error);
  }, []);

  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const [selectedVariants, setSelectedVariants] = useState({
    1: 'bf_veg_sandwich',
    13: 'cd_coke_250',
    14: 'ic_vanilla_cone',
    15: 'ch_Lays_10',
    16: 'bi_parle_small'
  });

  const [activeDrawerProductId, setActiveDrawerProductId] = useState(null);
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');
  const [drawerActiveBrand, setDrawerActiveBrand] = useState('All');
  const [theme, setTheme] = useState(() => localStorage.getItem('cb-theme') || 'dark');
  const [navOpen, setNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminProductModalOpen, setIsAdminProductModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviewsProductId, setReviewsProductId] = useState(null);
  const [reviewsProductName, setReviewsProductName] = useState('');

  const slideIntervalRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cb-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const showToast = useCallback((msg, imgSrc = '', type = 'success') => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, msg, imgSrc, type, leaving: false }]);
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, leaving: true } : t))
      );
    }, 2660);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2960);
  }, []);

  const activeFeatured = FEATURED.map(f => {
    const found = menuItems.find(item => item.id === f.id);
    if (found) {
      return { ...f, name: found.name, img: found.img, price: `₹${found.price}` };
    }
    return null;
  }).filter(Boolean);

  const SLIDE_COUNT = activeFeatured.length || 1;

  useEffect(() => {
    if (activeFeatured.length === 0) return;
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(s => (s + 1) % SLIDE_COUNT);
    }, 4500);
    return () => clearInterval(slideIntervalRef.current);
  }, [SLIDE_COUNT, activeFeatured.length]);

  const goToSlide = (idx) => {
    if (activeFeatured.length === 0) return;
    clearInterval(slideIntervalRef.current);
    setCurrentSlide(((idx % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(s => (s + 1) % SLIDE_COUNT);
    }, 4500);
  };

  const featuredIdx = activeFeatured.length > 0 ? (currentSlide % activeFeatured.length) : 0;

  useEffect(() => {
    function onScroll() {
      setNavScrolled(window.scrollY > 50);
      updateActiveNavLink();
    }
    function updateActiveNavLink() {
      const sections = ['home', 'menu', 'xerox', 'about', 'contact'];
      let current = 'home';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 130) current = id;
      });
      setActiveSection(current);
    }
    window.addEventListener('scroll', onScroll);
    updateActiveNavLink();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    const els = document.querySelectorAll(
      '.reveal, .xerox-card, .contact-card, .about-feat, .section-header, .search-bar-wrapper, .category-tabs, .menu-card'
    );
    els.forEach(el => {
      if (!el.classList.contains('reveal')) el.classList.add('reveal');
      if (!el.classList.contains('visible')) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [activeCategory, searchQuery, cart.length, menuItems]);

  function getFiltered() {
    return menuItems.filter(item => {
      const matchCat = activeCategory === 'all' || item.category.toLowerCase() === activeCategory.toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }

  const addToCart = useCallback((id) => {
    let item = null;
    const isVariant = typeof id === 'string';

    if (isVariant) {
      for (const mainId in itemVariants) {
        const found = itemVariants[mainId].items.find(v => v.id === id);
        if (found) {
          item = found;
          setSelectedVariants(prev => ({ ...prev, [mainId]: id }));
          break;
        }
      }
    } else {
      item = menuItems.find(i => i.id === id);
    }

    if (!item) return;

    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === id);
      if (existing) {
        return prevCart.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prevCart, { id: item.id, name: item.name, img: item.img, price: item.price, qty: 1 }];
    });

    showToast(`${item.name} added to cart!`, item.img, 'success');
  }, [showToast, menuItems, itemVariants]);

  const removeCartItem = useCallback((id) => {
    setCart(prevCart => prevCart.filter(i => i.id !== id));
  }, []);

  const changeCartQty = useCallback((id, delta) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === id);
      if (!item) return prevCart;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prevCart.filter(i => i.id !== id);
      }
      return prevCart.map(i => (i.id === id ? { ...i, qty: newQty } : i));
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Cart cleared', '', 'error');
  }, [showToast]);

  const openCart = () => {
    setCartOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    setCartOpen(false);
    document.body.style.overflow = '';
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!', '', 'error');
      return;
    }
    if (!currentUser) {
      showToast('Please login first to place your order.', '', 'info');
      closeCart();
      setPendingOrder(true);
      setIsLoginModalOpen(true);
      return;
    }
    closeCart();
    setOrderModalOpen(true);
  };

  const addCustomItemToCart = useCallback((customItem) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === customItem.id);
      if (existing) {
        return prevCart.map(i => (i.id === customItem.id ? { ...i, qty: i.qty + customItem.qty } : i));
      }
      return [...prevCart, customItem];
    });
    showToast(`${customItem.name} added to cart!`, '', 'success');
  }, [showToast]);

  const handleConfirmCheckout = (orderData) => {
    const fullOrder = {
      id: orderData.id,
      user_name: currentUser ? currentUser.name : 'Guest',
      user_email: currentUser ? currentUser.email : '',
      phone: currentUser ? currentUser.phone : '',
      hostel: orderData.hostel || '',
      room: orderData.room || '',
      items: JSON.stringify(orderData.items || []),
      total: orderData.total || 0,
      status: 'Pending',
      user_id: currentUser ? currentUser.id : null
    };
    
    fetch(API_URL + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullOrder)
    })
      .then(res => res.json())
      .then(data => {
        setOrders(prev => [data, ...prev]);
        setCart([]);
      })
      .catch(console.error);
  };

  const handleCancelOrder = (orderId) => {
    fetch(`${API_URL}/api/orders/${orderId}/status?status=Cancelled`, { method: 'PUT' })
      .then(res => res.json())
      .then(() => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
        showToast('Order cancelled.', '', 'error');
      })
      .catch(console.error);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    fetch(`${API_URL}/api/orders/${orderId}/status?status=${newStatus}`, { method: 'PUT' })
      .then(res => res.json())
      .then(() => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(`Order status: ${newStatus}`, '', 'info');
      })
      .catch(console.error);
  };

  const handleSubmitReview = (productId, rating, comment) => {
    if (!currentUser) return;
    const newReview = {
      item_id: productId,
      user_name: currentUser.name,
      rating,
      comment
    };
    
    fetch(API_URL + '/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    })
      .then(res => res.json())
      .then(data => {
        setReviews(prev => [...prev, data]);
        showToast('Review posted!', '', 'success');
      })
      .catch(console.error);
  };

  const openVariantDrawer = (productId) => {
    const varData = itemVariants[productId];
    if (!varData) return;
    setActiveDrawerProductId(productId);
    setDrawerSearchQuery('');
    setDrawerActiveBrand('All');
    document.body.style.overflow = 'hidden';
  };

  const closeVariantDrawer = () => {
    setActiveDrawerProductId(null);
    document.body.style.overflow = '';
  };

  const handleContactSubmit = ({ name, email, msg }) => {
    if (!name || !email || !msg) {
      showToast('Please fill in all fields!', '', 'error');
      return;
    }
    setFormSuccess(true);
    showToast("Message sent! We'll be in touch soon.", '', 'success');
    setTimeout(() => setFormSuccess(false), 5000);
  };

  const addToCartHero = () => {
    if (activeFeatured.length === 0) return;
    const fid = activeFeatured[featuredIdx]?.id || 1;
    addToCart(fid);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('cb-current-user', JSON.stringify(user));
    showToast(`Welcome back, ${user.name}!`, '', 'success');
    if (pendingOrder) {
      setPendingOrder(false);
      setOrderModalOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cb-current-user');
    showToast('Logged out successfully.', '', 'info');
  };

  const handleSaveProduct = (productData) => {
    const exists = menuItems.some(item => item.id === productData.id);
    const method = exists ? 'PUT' : 'POST';
    const url = exists ? `${API_URL}/api/menu/${productData.id}` : API_URL + '/api/menu';
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...productData,
        is_featured: false,
        veg: productData.veg !== undefined ? productData.veg : true
      })
    })
      .then(res => res.json())
      .then(data => {
        if (exists) {
          setMenuItems(prev => prev.map(item => item.id === data.id ? data : item));
          setCart(prev => prev.map(c => c.id === data.id ? { ...c, name: data.name, img: data.img, price: data.price } : c));
          showToast('Product updated successfully!', data.img, 'success');
        } else {
          setMenuItems(prev => [...prev, data]);
          showToast('Product added successfully!', data.img, 'success');
        }
        setEditingProduct(null);
      })
      .catch(console.error);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      fetch(`${API_URL}/api/menu/${productId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          const foundItem = menuItems.find(item => item.id === productId);
          setMenuItems(prev => prev.filter(item => item.id !== productId));
          setCart(prev => prev.filter(c => c.id !== productId));
          showToast(`${foundItem ? foundItem.name : 'Product'} deleted successfully.`, '', 'error');
        })
        .catch(console.error);
    }
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setIsAdminProductModalOpen(true);
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setIsAdminProductModalOpen(true);
  };

  return (
    <>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        navScrolled={navScrolled}
        activeSection={activeSection}
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        onCartClick={openCart}
        currentUser={currentUser}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onAddProductClick={handleAddProductClick}
        onAdminDashboardClick={() => setIsAdminDashboardOpen(true)}
        onMyOrdersClick={() => setIsMyOrdersOpen(true)}
      />

      <Hero
        currentSlide={currentSlide}
        goToSlide={goToSlide}
        featured={activeFeatured[featuredIdx]}
        onAddHero={addToCartHero}
      />

      <MenuSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        items={getFiltered()}
        cart={cart}
        selectedVariants={selectedVariants}
        onAddToCart={addToCart}
        onChangeQty={changeCartQty}
        onOpenVariantDrawer={openVariantDrawer}
        isAdmin={currentUser && currentUser.role === 'admin'}
        onEdit={handleEditProductClick}
        onDelete={handleDeleteProduct}
        reviews={reviews}
        onOpenReviews={(id, name) => {
          setReviewsProductId(id);
          setReviewsProductName(name);
          setIsReviewsOpen(true);
        }}
      />

      <XeroxSection onAddCustomItem={addCustomItemToCart} />
      <AboutSection />

      <ContactSection
        formSuccess={formSuccess}
        onSubmit={handleContactSubmit}
      />

      <Footer />

      <CartSidebar
        cart={cart}
        isOpen={cartOpen}
        onClose={closeCart}
        onChangeQty={changeCartQty}
        onRemove={removeCartItem}
        onPlaceOrder={placeOrder}
        onClear={clearCart}
      />

      <VariantDrawer
        activeDrawerProductId={activeDrawerProductId}
        varData={activeDrawerProductId ? itemVariants[activeDrawerProductId] : null}
        drawerSearchQuery={drawerSearchQuery}
        setDrawerSearchQuery={setDrawerSearchQuery}
        drawerActiveBrand={drawerActiveBrand}
        setDrawerActiveBrand={setDrawerActiveBrand}
        cart={cart}
        onAdd={addToCart}
        onChangeQty={changeCartQty}
        onClose={closeVariantDrawer}
      />

      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        cart={cart}
        onConfirm={handleConfirmCheckout}
        currentUser={currentUser}
      />

      <ToastContainer toasts={toasts} />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => { setIsLoginModalOpen(false); setPendingOrder(false); }}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminProductModal
        isOpen={isAdminProductModalOpen}
        onClose={() => { setIsAdminProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        products={menuItems}
        onAddClick={handleAddProductClick}
        onEditClick={handleEditProductClick}
        onDeleteClick={handleDeleteProduct}
        onSaveProduct={handleSaveProduct}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        orders={orders}
        currentUser={currentUser}
        onCancelOrder={handleCancelOrder}
      />

      <ReviewsModal
        isOpen={isReviewsOpen}
        onClose={() => { setIsReviewsOpen(false); setReviewsProductId(null); }}
        productId={reviewsProductId}
        productName={reviewsProductName}
        reviews={reviews}
        currentUser={currentUser}
        onSubmitReview={handleSubmitReview}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />
    </>
  );
}
