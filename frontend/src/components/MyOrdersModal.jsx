import React from 'react';
import { formatPrice } from '../data/menuData.js';

export default function MyOrdersModal({ isOpen, onClose, orders = [], currentUser, onCancelOrder }) {
  if (!isOpen || !currentUser) return null;

  const userOrders = orders
    .filter(o => {
      const email = o.user_email ?? o.userEmail;
      const phone = o.phone ?? o.userPhone;
      return email === currentUser.email || phone === currentUser.phone;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getStepProgress = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return { width: '0%', activeStep: 0 };
      case 'preparing': return { width: '33%', activeStep: 1 };
      case 'ready': return { width: '66%', activeStep: 2 };
      case 'completed': return { width: '100%', activeStep: 3 };
      default: return { width: '0%', activeStep: -1 }; 
    }
  };

  return (
    <div className="myorders-overlay" onClick={onClose}>
      <div className="myorders-card" onClick={e => e.stopPropagation()}>
        <div className="myorders-header">
          <h2>My Orders</h2>
          <button className="myorders-close" onClick={onClose}>&times;</button>
        </div>

        <div className="myorders-body">
          {userOrders.length === 0 ? (
            <div className="myorders-empty">
              <div className="myorders-empty-icon">🍔</div>
              <h3>No orders placed yet</h3>
              <p>Items you order from the menu or Xerox will appear here.</p>
            </div>
          ) : (
            userOrders.map(order => {
              const currentStatus = order.status || 'Pending';
              const { width, activeStep } = getStepProgress(currentStatus);
              const isCancelled = currentStatus.toLowerCase() === 'cancelled';

              return (
                <div className="order-history-card" key={order.id}>
                  <div className="order-card-header">
                    <div className="order-card-meta">
                      <h4>
                        Order #{String(order.id).slice(-6).toUpperCase()}
                        <span className={`order-status-badge ${currentStatus.toLowerCase()}`}>
                          {currentStatus}
                        </span>
                      </h4>
                      <p>{new Date(order.timestamp || Date.now()).toLocaleString()}</p>
                    </div>
                    {currentStatus.toLowerCase() === 'pending' && (
                      <button
                        className="btn-cancel-order"
                        onClick={() => onCancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                  <ul className="order-card-items">
                    {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item, idx) => (
                      <li className="order-card-item-row" key={idx}>
                        <span className="order-card-item-name">
                          <span className="order-card-item-qty">{item.qty}x</span>
                          {item.name}
                        </span>
                        <span className="order-card-item-price">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="order-card-details-row">
                    <div className="order-card-detail-info">
                      <span>Type</span>
                      <span>{order.orderType === 'delivery' ? 'Hostel Delivery' : 'Self Pickup'}</span>
                    </div>
                    {order.orderType === 'delivery' && (
                      <div className="order-card-detail-info">
                        <span>Delivery To</span>
                        <span>{order.hostel} - Room {order.roomNumber}</span>
                      </div>
                    )}
                    <div className="order-card-detail-info">
                      <span>Payment</span>
                      <span>{order.paymentMethod === 'upi' ? 'UPI' : 'Cash'}</span>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="order-tracker-steps">
                      <div className="order-tracker-line">
                        <div className="order-tracker-progress" style={{ width }} />
                      </div>
                      
                      <div className={`order-tracker-step ${activeStep >= 0 ? 'completed' : ''} ${activeStep === 0 ? 'active' : ''}`}>
                        <div className="step-node">✓</div>
                        <div className="step-label">Placed</div>
                      </div>
                      <div className={`order-tracker-step ${activeStep >= 1 ? 'completed' : ''} ${activeStep === 1 ? 'active' : ''}`}>
                        <div className="step-node">👨‍🍳</div>
                        <div className="step-label">Cooking</div>
                      </div>
                      <div className={`order-tracker-step ${activeStep >= 2 ? 'completed' : ''} ${activeStep === 2 ? 'active' : ''}`}>
                        <div className="step-node">🔔</div>
                        <div className="step-label">Ready</div>
                      </div>
                      <div className={`order-tracker-step ${activeStep >= 3 ? 'completed' : ''} ${activeStep === 3 ? 'active' : ''}`}>
                        <div className="step-node">🏁</div>
                        <div className="step-label">Done</div>
                      </div>
                    </div>
                  )}

                  <div className="order-card-total-box">
                    <span>Total Amount</span>
                    <span className="order-card-total-price">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
