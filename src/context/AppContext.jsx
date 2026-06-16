import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import initialInventory from '../data/inventory.json';
import { supabase } from '../supabaseClient';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Johannesburg Suburbs & Suburb Coordinates/Distances (relative to Johannesburg CBD)
// Magic Adwork HQ is located in Johannesburg CBD.
export const JOHANNESBURG_SUBURBS = [
  { name: 'Johannesburg CBD', distanceKm: 0, calloutBase: 350 },
  { name: 'Marshalltown (HQ Area)', distanceKm: 1, calloutBase: 350 },
  { name: 'Fordsburg', distanceKm: 3, calloutBase: 350 },
  { name: 'Melville', distanceKm: 7, calloutBase: 380 },
  { name: 'Sandton', distanceKm: 16, calloutBase: 450 },
  { name: 'Rosebank', distanceKm: 10, calloutBase: 400 },
  { name: 'Randburg', distanceKm: 18, calloutBase: 480 },
  { name: 'Roodepoort', distanceKm: 22, calloutBase: 500 },
  { name: 'Soweto (Orlando)', distanceKm: 20, calloutBase: 500 },
  { name: 'Midrand', distanceKm: 28, calloutBase: 550 },
  { name: 'Benoni', distanceKm: 32, calloutBase: 600 },
  { name: 'Kempton Park', distanceKm: 29, calloutBase: 580 },
  { name: 'Germiston', distanceKm: 15, calloutBase: 420 },
  { name: 'Boksburg', distanceKm: 26, calloutBase: 520 },
];

export const AppProvider = ({ children }) => {
  // --- Authentication State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // --- Inventory & Products state ---
  // Load custom admin products from localStorage
  const [customProducts, setCustomProducts] = useState(() => {
    const saved = localStorage.getItem('magic_adwork_custom_products');
    return saved ? JSON.parse(saved) : [];
  });

  // Track edited and deleted base products
  const [editedBaseProducts, setEditedBaseProducts] = useState(() => {
    const saved = localStorage.getItem('magic_adwork_edited_base_products');
    return saved ? JSON.parse(saved) : {};
  });

  // Categories list
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('magic_adwork_categories');
    return saved ? JSON.parse(saved) : ['Machines & Equipment', 'Inks', 'Roland Spare Parts', 'Mimaki Spare Parts'];
  });

  // Subcategories mapping
  const [categorySubcategories, setCategorySubcategories] = useState(() => {
    const saved = localStorage.getItem('magic_adwork_category_subcategories');
    if (saved) return JSON.parse(saved);
    
    // Seed initial mapping from database
    const mapping = {};
    initialInventory.forEach(p => {
      const cat = p.category === 'Inks & Powders' ? 'Inks' : p.category;
      if (p.subcategory) {
        if (!mapping[cat]) mapping[cat] = [];
        if (!mapping[cat].includes(p.subcategory)) {
          mapping[cat].push(p.subcategory);
        }
      }
    });
    return mapping;
  });

  // Combine initial parsed Excel products with admin-added and edited products
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const base = initialInventory.map(p => {
      let item = { ...p };
      if (item.category === 'Inks & Powders') {
        item.category = 'Inks';
      }
      if (editedBaseProducts[item.id]) {
        item = { ...item, ...editedBaseProducts[item.id] };
      }
      return item;
    }).filter(item => !item.isDeleted);
    
    const custom = customProducts.map(p => {
      let item = { ...p };
      if (item.category === 'Inks & Powders') {
        item.category = 'Inks';
      }
      if (editedBaseProducts[item.id]) {
        item = { ...item, ...editedBaseProducts[item.id] };
      }
      return item;
    }).filter(item => !item.isDeleted);
    
    setProducts([...base, ...custom]);
  }, [customProducts, editedBaseProducts]);

  useEffect(() => {
    localStorage.setItem('magic_adwork_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('magic_adwork_category_subcategories', JSON.stringify(categorySubcategories));
  }, [categorySubcategories]);

  const addProduct = (newProduct) => {
    const updated = [newProduct, ...customProducts];
    setCustomProducts(updated);
    localStorage.setItem('magic_adwork_custom_products', JSON.stringify(updated));
    sendNotification(
      "Product Added to Catalog",
      `${newProduct.name} is now available in ${newProduct.category}!`
    );
  };

  const editProduct = (productId, updatedProduct) => {
    const isCustom = customProducts.some(p => p.id === productId);
    if (isCustom) {
      const updated = customProducts.map(p => p.id === productId ? { ...p, ...updatedProduct } : p);
      setCustomProducts(updated);
      localStorage.setItem('magic_adwork_custom_products', JSON.stringify(updated));
    } else {
      const updated = {
        ...editedBaseProducts,
        [productId]: { ...editedBaseProducts[productId], ...updatedProduct }
      };
      setEditedBaseProducts(updated);
      localStorage.setItem('magic_adwork_edited_base_products', JSON.stringify(updated));
    }
    sendNotification("Product Updated", `${updatedProduct.name} has been updated.`);
  };

  const deleteProduct = (productId) => {
    const isCustom = customProducts.some(p => p.id === productId);
    if (isCustom) {
      const updated = customProducts.filter(p => p.id !== productId);
      setCustomProducts(updated);
      localStorage.setItem('magic_adwork_custom_products', JSON.stringify(updated));
    } else {
      const updated = {
        ...editedBaseProducts,
        [productId]: { ...editedBaseProducts[productId], isDeleted: true }
      };
      setEditedBaseProducts(updated);
      localStorage.setItem('magic_adwork_edited_base_products', JSON.stringify(updated));
    }
    sendNotification("Product Removed", "The product has been removed from the catalog.");
  };

  const addCategory = (name) => {
    if (!categories.includes(name)) {
      setCategories([...categories, name]);
      setCategorySubcategories(prev => ({
        ...prev,
        [name]: prev[name] || []
      }));
      sendNotification("Category Added", `Category "${name}" has been created.`);
    }
  };

  const deleteCategory = (name) => {
    setCategories(categories.filter(c => c !== name));
    setCategorySubcategories(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    sendNotification("Category Removed", `Category "${name}" has been deleted.`);
  };

  const addSubcategory = (category, name) => {
    setCategorySubcategories(prev => {
      const current = prev[category] || [];
      if (!current.includes(name)) {
        const updated = [...current, name];
        sendNotification("Subcategory Added", `Subcategory "${name}" added to "${category}".`);
        return { ...prev, [category]: updated };
      }
      return prev;
    });
  };

  const deleteSubcategory = (category, name) => {
    setCategorySubcategories(prev => {
      const current = prev[category] || [];
      const updated = current.filter(s => s !== name);
      sendNotification("Subcategory Removed", `Subcategory "${name}" removed from "${category}".`);
      return { ...prev, [category]: updated };
    });
  };

  // --- Currency & Forex state ---
  const [currency, setCurrency] = useState('ZAR'); // 'ZAR' or 'USD'
  const [usdToZarRate, setUsdToZarRate] = useState(18.5); // Fallback rate (1 USD = 18.5 ZAR)
  const [forexLoading, setForexLoading] = useState(true);

  // Fetch real-time exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setForexLoading(true);
        // Using open.er-api.com (free, no key required)
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data.rates && data.rates.ZAR) {
            setUsdToZarRate(data.rates.ZAR);
            console.log(`Live Forex Rate loaded: 1 USD = ${data.rates.ZAR} ZAR`);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch real-time forex rate. Using fallback (18.5 ZAR/USD).', err);
      } finally {
        setForexLoading(false);
      }
    };
    fetchRates();
  }, []);

  // Helper to convert ZAR to active currency and format
  const formatPrice = useCallback((zarVal) => {
    if (currency === 'USD') {
      const usdVal = zarVal / usdToZarRate;
      return `$${usdVal.toFixed(2)}`;
    }
    // ZAR Format
    return `R ${Number(zarVal).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currency, usdToZarRate]);

  // Helper to convert ZAR value directly
  const convertZar = (zarVal) => {
    if (currency === 'USD') {
      return zarVal / usdToZarRate;
    }
    return zarVal;
  };

  // --- Cart state ---
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('magic_adwork_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('magic_adwork_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product, qty = 1) => {
    // Require authentication before adding to cart
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prevCart, { product, qty }];
    });
  }, [currentUser]);

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, qty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.priceZAR * item.qty, 0);
  };

  const getCartWeight = () => {
    return cart.reduce((total, item) => total + (item.product.weightKg || 0.1) * item.qty, 0);
  };

  // --- Bookings State ---
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('magic_adwork_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('magic_adwork_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (booking) => {
    const updated = [booking, ...bookings];
    setBookings(updated);
    sendNotification(
      "Booking Confirmed!",
      `Service booked for ${booking.suburb} on ${booking.date}. Ref: ${booking.id || 'JHB'}`
    );
  };

  // --- Chat Leads State ---
  const [chatLeads, setChatLeads] = useState(() => {
    const saved = localStorage.getItem('magic_adwork_chat_leads');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('magic_adwork_chat_leads', JSON.stringify(chatLeads));
  }, [chatLeads]);

  const updateChatLead = (sessionId, extractedInfo) => {
    if (!extractedInfo) return;
    
    // Filter out fields that are null/undefined or empty string
    const validInfo = {};
    Object.keys(extractedInfo).forEach(key => {
      const val = extractedInfo[key];
      if (val !== null && val !== undefined && val !== '' && String(val).toLowerCase() !== 'null') {
        validInfo[key] = val;
      }
    });

    if (Object.keys(validInfo).length === 0) return;

    setChatLeads(prevLeads => {
      const existingLeadIndex = prevLeads.findIndex(lead => lead.sessionId === sessionId);
      if (existingLeadIndex > -1) {
        // Merge the new data into the existing lead record
        const updatedLeads = [...prevLeads];
        const updatedLead = {
          ...updatedLeads[existingLeadIndex],
          ...validInfo,
          lastActive: new Date().toISOString()
        };
        updatedLeads[existingLeadIndex] = updatedLead;
        localStorage.setItem('magic_adwork_user_profile', JSON.stringify(updatedLead));
        return updatedLeads;
      } else {
        // Create a new lead record
        const newLead = {
          id: `lead-${Date.now()}`,
          sessionId,
          date: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          name: validInfo.name || 'Anonymous Visitor',
          company: validInfo.company || 'Unknown Company',
          location: validInfo.location || 'Unknown Location',
          equipment: validInfo.equipment || 'Unknown Equipment',
          ...validInfo
        };
        localStorage.setItem('magic_adwork_user_profile', JSON.stringify(newLead));
        return [newLead, ...prevLeads];
      }
    });
  };

  const deleteChatLead = (leadId) => {
    setChatLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
  };

  // --- PWA Installation & Browser Notification States ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('magic_adwork_notifications') === 'granted';
  });

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event triggered, PWA ready to install.');
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) {
      console.log('Install prompt is not available.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return false;
    }
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    localStorage.setItem('magic_adwork_notifications', permission);
    if (permission === 'granted') {
      new Notification("Notifications Enabled", {
        body: "You will receive updates for orders, bookings, and new products!",
        icon: "/pwa-192x192.png"
      });
    }
    return permission === 'granted';
  };

  const sendNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: "/pwa-192x192.png"
        });
      } catch (err) {
        console.warn('Failed to send notification via constructor:', err);
        // Fallback for service worker notification
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, {
              body,
              icon: "/pwa-192x192.png"
            });
          });
        }
      }
    }
  };

  // --- Theme Toggle ---
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('magic_adwork_theme');
    return saved ? saved : 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('magic_adwork_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- Authentication Handlers ---

  useEffect(() => {
    // Check for active sessions and set user
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Map user data to easily access name
      if (session?.user) {
        setCurrentUser({
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email
        });
      } else {
        setCurrentUser(null);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          name: name.trim()
        }
      }
    });

    if (error) throw error;
    
    console.log("CLOSING MODAL"); setAuthModalOpen(false);
    sendNotification("Welcome to Magic Adwork!", `Account created successfully.`);
  };

  const login = async (email, password) => { console.log("LOGIN CALLED WITH", email);
    const trimmedEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) throw error;

    setAuthModalOpen(false);
    sendNotification("Signed In", `Welcome back!`);
    window.dispatchEvent(new CustomEvent('loginSuccess'));
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return;
    }
    sendNotification("Signed Out", "You have successfully signed out.");
  };

  return (
    <AppContext.Provider
      value={{
        products,
        addProduct,
        editProduct,
        deleteProduct,
        categories,
        categorySubcategories,
        addCategory,
        deleteCategory,
        addSubcategory,
        deleteSubcategory,
        currency,
        setCurrency,
        usdToZarRate,
        forexLoading,
        formatPrice,
        convertZar,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        getCartSubtotal,
        getCartWeight,
        bookings,
        addBooking,
        chatLeads,
        updateChatLead,
        deleteChatLead,
        theme,
        toggleTheme,
        deferredPrompt,
        installPwa,
        notificationsEnabled,
        requestNotificationPermission,
        sendNotification,
        currentUser,
        authModalOpen,
        setAuthModalOpen,
        login,
        signup,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
