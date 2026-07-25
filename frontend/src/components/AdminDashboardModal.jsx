import React, { useState } from 'react';
import { formatPrice } from '../data/menuData.js';

export default function AdminDashboardModal({ 
  isOpen, 
  onClose, 
  products, 
  onAddClick, 
  onEditClick, 
  onDeleteClick,
  onSaveProduct,
  orders = [],
  onUpdateOrderStatus
}) {
  const [activeTab, setActiveTab] = useState('products');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [formId, setFormId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('food');
  const [formPrice, setFormPrice] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVeg, setFormVeg] = useState(true);
  const [formImg, setFormImg] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'All' || (order.status || 'Pending').toLowerCase() === orderFilter.toLowerCase();
    const idStr = String(order.id).slice(-6).toUpperCase();
    const userName = order.user_name ?? order.userName ?? '';
    const userPhone = order.phone ?? order.userPhone ?? '';
    const matchesSearch = 
      idStr.includes(orderSearch.toUpperCase()) || 
      userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      userPhone.includes(orderSearch);
    return matchesFilter && matchesSearch;
  });

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(prevId => (prevId === id ? null : id));
  };

  const handleEditInline = (p) => {
    setFormId(p.id);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormDesc(p.desc);
    setFormVeg(p.veg);
    setFormImg(p.img);
    setFormError('');
    setActiveTab('edit-product');
  };

  const handleAddInline = () => {
    setFormId(null);
    setFormName('');
    setFormCategory('food');
    setFormPrice('');
    setFormDesc('');
    setFormVeg(true);
    setFormImg('');
    setFormError('');
    setActiveTab('add-product');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName || !formPrice || !formDesc) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price.');
      return;
    }

    let imageFile = formImg.trim();
    if (!imageFile) {
      imageFile = formCategory === 'beverages' ? 'Tea.jpg' : 'samosa.jpg';
    }

    onSaveProduct({
      id: formId || Date.now(),
      name: formName,
      category: formCategory,
      price: priceNum,
      desc: formDesc,
      veg: formVeg,
      img: imageFile
    });

    setActiveTab('products');
  };

  return (
    <div className="admin-db-overlay">
      <div className="admin-db-card">
        {}
        <div className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <h3>Canteen Admin</h3>
          </div>
          <div className="admin-sidebar-nav">
            <button 
              className={`admin-sidebar-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📋 Manage Products
            </button>
            <button 
              className={`admin-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Manage Orders ({orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length})
            </button>
            <button 
              className={`admin-sidebar-btn ${activeTab === 'add-product' ? 'active' : ''}`}
              onClick={handleAddInline}
            >
              ➕ Add Product
            </button>
          </div>
          <div style={{ padding: '0 16px' }}>
            <button 
              className="admin-sidebar-btn" 
              style={{ width: '100%', color: 'var(--red)' }}
              onClick={onClose}
            >
              🚪 Exit Panel
            </button>
          </div>
        </div>

        {}
        <div className="admin-content-panel">
          <div className="admin-content-header">
            <h2>
              {activeTab === 'products' && 'Manage Products'}
              {activeTab === 'orders' && 'Manage Orders'}
              {activeTab === 'add-product' && 'Add New Product'}
              {activeTab === 'edit-product' && 'Edit Product'}
            </h2>
            <button className="admin-db-close-btn" onClick={onClose}>&times;</button>
          </div>

          <div className="admin-content-body">
            {activeTab === 'products' && (
              <>
                <div className="admin-db-controls" style={{ padding: '0 0 20px 0' }}>
                  <div className="admin-db-search-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input 
                      type="text" 
                      placeholder="Search products by name or category..." 
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="admin-db-search"
                    />
                  </div>
                </div>

                <div className="admin-db-list-wrapper" style={{ padding: 0 }}>
                  {filteredProducts.length === 0 ? (
                    <div className="admin-db-empty">
                      <p>No products found matching "{productSearch}".</p>
                    </div>
                  ) : (
                    <div className="admin-db-table">
                      <div className="admin-db-thead">
                        <div className="admin-db-tr">
                          <div className="admin-db-th th-img">Image</div>
                          <div className="admin-db-th th-name">Name</div>
                          <div className="admin-db-th th-cat">Category</div>
                          <div className="admin-db-th th-price">Price</div>
                          <div className="admin-db-th th-veg">Type</div>
                          <div className="admin-db-th th-actions">Actions</div>
                        </div>
                      </div>
                      <div className="admin-db-tbody">
                        {filteredProducts.map(p => (
                          <div className="admin-db-tr" key={p.id}>
                            <div className="admin-db-td td-img">
                              <img 
                                src={p.img} 
                                alt={p.name} 
                                onError={e => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.style.background = 'var(--bg3)';
                                }}
                              />
                            </div>
                            <div className="admin-db-td td-name">
                              <span className="mobile-label">Name:</span>
                              <span className="p-name">{p.name}</span>
                            </div>
                            <div className="admin-db-td td-cat">
                              <span className="mobile-label">Category:</span>
                              <span className="p-cat cat-tag">{p.category}</span>
                            </div>
                            <div className="admin-db-td td-price">
                              <span className="mobile-label">Price:</span>
                              <span className="p-price">₹{p.price}</span>
                            </div>
                            <div className="admin-db-td td-veg">
                              <span className="mobile-label">Type:</span>
                              <span className={`veg-badge ${p.veg ? 'is-veg' : 'non-veg'}`}>
                                {p.veg ? 'Veg' : 'Non-Veg'}
                              </span>
                            </div>
                            <div className="admin-db-td td-actions">
                              <button className="btn-db-action edit" onClick={() => handleEditInline(p)} title="Edit">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                              </button>
                              <button className="btn-db-action delete" onClick={() => onDeleteClick(p.id)} title="Delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <div style={{ padding: '0 0 20px 0' }}>
                  <input
                    type="text"
                    placeholder="Search orders by ID (last 6 chars), name, or mobile..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="admin-orders-search"
                    style={{ width: '100%', marginBottom: '15px' }}
                  />

                  <div className="admin-orders-filter-bar" style={{ margin: 0 }}>
                    {['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map(filter => (
                      <button
                        key={filter}
                        className={`admin-filter-btn ${orderFilter === filter ? 'active' : ''}`}
                        onClick={() => setOrderFilter(filter)}
                      >
                        {filter} ({filter === 'All' ? orders.length : orders.filter(o => (o.status || 'Pending').toLowerCase() === filter.toLowerCase()).length})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-db-list-wrapper" style={{ padding: 0 }}>
                  {filteredOrders.length === 0 ? (
                    <div className="admin-db-empty">
                      <p>No orders found matching status and search query.</p>
                    </div>
                  ) : (
                    <div className="admin-db-orders-list">
                      {filteredOrders.map(order => {
                        const isExpanded = expandedOrderId === order.id;

                        return (
                          <div className="admin-order-item-card" key={order.id}>
                            <div 
                              className="admin-order-header"
                              onClick={() => toggleExpandOrder(order.id)}
                            >
                              <div className="admin-order-meta-info">
                                <span className="admin-order-id-label">
                                  #{order.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="admin-order-user-badge">{order.user_name ?? order.userName}</span>
                                <span className="admin-order-timestamp">
                                  {new Date(order.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <div className="order-card-meta">
                                <h4>
                                  Order #{String(order.id).slice(-6).toUpperCase()}
                                </h4>
                                <span className={`order-status-badge ${(order.status || 'Pending').toLowerCase()}`}>
                                  {order.status || 'Pending'}
                                </span>
                              </div>  <span>{isExpanded ? '▲' : '▼'}</span>
                            </div>

                            {isExpanded && (
                              <div className="admin-order-detail-pane">
                                <table className="admin-order-items-table">
                                  <thead>
                                    <tr>
                                      <th>Item Description</th>
                                      <th style={{ width: '60px', textAlign: 'center' }}>Qty</th>
                                      <th style={{ width: '100px', textAlign: 'right' }}>Price</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item, idx) => (
                                      <tr key={idx}>
                                        <td>
                                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                                          {item.isXerox && item.description && (
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                              Config: {item.description}
                                            </div>
                                          )}
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                                        <td className="col-price">{formatPrice(item.price * item.qty)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                <div className="admin-order-delivery-details">
                                  <div className="admin-detail-block">
                                    <span>Fulfillment Type</span>
                                    <span>{order.orderType === 'delivery' ? '🚗 Room Delivery' : '🏪 Counter Pickup'}</span>
                                  </div>
                                  {order.orderType === 'delivery' && (
                                    <div className="admin-detail-block">
                                      <span>Delivery Destination</span>
                                      <span>{order.hostel} - Room {order.roomNumber}</span>
                                    </div>
                                  )}
                                  <div className="admin-detail-block">
                                    <span>Payment Method</span>
                                    <span style={{ textTransform: 'uppercase' }}>{order.paymentMethod}</span>
                                  </div>
                                  <div className="admin-detail-block">
                                    <span>Customer Contact</span>
                                    <span>{order.phone ?? order.userPhone ?? 'N/A'}</span>
                                  </div>
                                </div>

                                <div className="admin-order-actions-row">
                                  {(order.status || 'Pending').toLowerCase() === 'pending' && (
                                    <>
                                      <button 
                                        className="btn-admin-order-action cancel"
                                        onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')}
                                      >
                                        Decline Order
                                      </button>
                                      <button 
                                        className="btn-admin-order-action prepare"
                                        onClick={() => onUpdateOrderStatus(order.id, 'Preparing')}
                                      >
                                        Accept &amp; Prepare
                                      </button>
                                    </>
                                  )}

                                  {(order.status || 'Pending').toLowerCase() === 'preparing' && (
                                    <>
                                      <button 
                                        className="btn-admin-order-action cancel"
                                        onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')}
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        className="btn-admin-order-action ready"
                                        onClick={() => onUpdateOrderStatus(order.id, 'Ready')}
                                      >
                                        Mark Ready
                                      </button>
                                    </>
                                  )}

                                  {(order.status || 'Pending').toLowerCase() === 'ready' && (
                                    <button 
                                      className="btn-admin-order-action complete"
                                      onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                                    >
                                      Complete Order
                                    </button>
                                  )}

                                  {((order.status || 'Pending').toLowerCase() === 'completed' || (order.status || 'Pending').toLowerCase() === 'cancelled') && (
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                      Order processed and archived.
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {(activeTab === 'add-product' || activeTab === 'edit-product') && (
              <div className="admin-inline-form-card" style={{ maxWidth: '600px' }}>
                {formError && <div className="auth-error-msg" style={{ marginBottom: '15px' }}>{formError}</div>}

                <form onSubmit={handleFormSubmit} className="auth-form">
                  <div className="auth-form-group">
                    <label>Product Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Veg Burger" 
                      value={formName} 
                      onChange={e => setFormName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>Category *</label>
                    <select 
                      value={formCategory} 
                      onChange={e => setFormCategory(e.target.value)}
                      className="x-select"
                      style={{ width: '100%', background: 'var(--input-bg)' }}
                    >
                      <option value="food">Food</option>
                      <option value="beverages">Beverages</option>
                      <option value="snacks">Snacks</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  <div className="auth-form-group">
                    <label>Price (₹) *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 50" 
                      value={formPrice} 
                      onChange={e => setFormPrice(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>Description *</label>
                    <textarea 
                      placeholder="Enter product description" 
                      value={formDesc} 
                      onChange={e => setFormDesc(e.target.value)} 
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  <div className="auth-form-group">
                    <label>Image Filename / URL</label>
                    <input 
                      type="text" 
                      placeholder="e.g. samosa.jpg (or leave blank for default)" 
                      value={formImg} 
                      onChange={e => setFormImg(e.target.value)} 
                    />
                  </div>

                  <div className="auth-form-group-checkbox" style={{ marginBottom: '20px' }}>
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={formVeg} 
                        onChange={e => setFormVeg(e.target.checked)} 
                      />
                      <span className="checkmark"></span>
                      Is Vegetarian
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ flex: 1, background: 'var(--bg3)', color: 'var(--text)' }}
                      onClick={() => setActiveTab('products')}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {activeTab === 'edit-product' ? 'Save Changes' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
