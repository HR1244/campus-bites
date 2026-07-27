import { API_URL } from '../config.js';
import React, { useState, useEffect, useRef } from 'react';
import { formatPrice } from '../data/menuData.js';

export default function OrderModal({ isOpen, onClose, cart = [], onConfirm, currentUser }) {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState('pickup');
  const [hostel, setHostel] = useState('Academic Block');
  const [roomNumber, setRoomNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  
  const [upiTimer, setUpiTimer] = useState(120);
  const [paymentStatus, setPaymentStatus] = useState('pending'); 
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const timerRef = useRef(null);

  const totalAmt = cart.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    if (!isOpen) {
      
      setStep(1);
      setOrderType('pickup');
      setHostel('Academic Block');
      setRoomNumber('');
      setPaymentMethod('upi');
      setPaymentStatus('pending');
      setUpiTimer(120);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 2 && paymentMethod === 'upi' && paymentStatus === 'pending') {
      setUpiTimer(120);
      timerRef.current = setInterval(() => {
        setUpiTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setPaymentStatus('failed');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, paymentMethod, paymentStatus]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1) {
      if (orderType === 'delivery' && !roomNumber.trim()) {
        alert('Please enter your room number.');
        return;
      }
      setStep(2);
    }
  };

  const handleRazorpayCheckout = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      const res = await fetch(API_URL + '/api/create-payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmt })
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const options = {
        key: 'rzp_test_TFl0tKSbKXpskR',
        amount: totalAmt * 100,
        currency: 'INR',
        name: 'Campus Bites',
        description: 'Food Order Payment',
        order_id: data.order_id,
        prefill: {
          name: currentUser ? currentUser.name : '',
          email: currentUser ? currentUser.email : '',
          contact: currentUser && currentUser.phone ? currentUser.phone : '9999999999'
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(API_URL + '/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            if (verifyRes.ok) {
              setPaymentStatus('success');
              const finalOrderId = 'CB-' + Math.floor(100000 + Math.random() * 900000);
              setGeneratedOrderId(finalOrderId);
              onConfirm({
                id: finalOrderId,
                orderType,
                hostel: orderType === 'delivery' ? hostel : '',
                roomNumber: orderType === 'delivery' ? roomNumber : '',
                paymentMethod,
                totalPrice: totalAmt,
                items: [...cart],
                timestamp: new Date().toISOString(),
                status: 'Pending'
              });
              setStep(3);
            } else {
              setPaymentStatus('failed');
            }
          } catch (err) {
            console.error(err);
            setPaymentStatus('failed');
          }
        },
        theme: {
          color: '#ff4757'
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setPaymentStatus('failed');
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setPaymentStatus('failed');
    }
  };

  const handlePlaceCOD = () => {
    const orderId = 'CB-' + Math.floor(100000 + Math.random() * 900000);
    setGeneratedOrderId(orderId);
    
    onConfirm({
      id: orderId,
      orderType,
      hostel: orderType === 'delivery' ? hostel : '',
      roomNumber: orderType === 'delivery' ? roomNumber : '',
      paymentMethod,
      totalPrice: totalAmt,
      items: [...cart],
      timestamp: new Date().toISOString(),
      status: 'Pending'
    });
    
    setStep(3);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-modal-card" onClick={e => e.stopPropagation()}>
        <div className="checkout-header">
          <h3>Checkout</h3>
          <button className="checkout-close" onClick={onClose}>&times;</button>
        </div>

        {step < 3 && (
          <div className="checkout-steps-nav">
            <div className={`checkout-step-tab ${step === 1 ? 'active' : ''}`}>1. Details</div>
            <div className={`checkout-step-tab ${step === 2 ? 'active' : ''}`}>2. Payment</div>
          </div>
        )}

        <div className="checkout-body">
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="fulfillment-toggle">
                <button
                  type="button"
                  className={`fulfillment-btn ${orderType === 'pickup' ? 'active' : ''}`}
                  onClick={() => setOrderType('pickup')}
                >
                  🏪 Counter Pickup
                </button>
                <button
                  type="button"
                  className={`fulfillment-btn ${orderType === 'delivery' ? 'active' : ''}`}
                  onClick={() => setOrderType('delivery')}
                >
                  🚀 Delivery Location
                </button>
              </div>

              {orderType === 'delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="x-form-group">
                    <label>Select Location</label>
                    <select
                      className="x-select"
                      value={hostel}
                      onChange={e => setHostel(e.target.value)}
                    >
                      <option value="Academic Block">Academic Block</option>
                      <option value="Library">Library</option>
                      <option value="Auditorium">Auditorium</option>
                      <option value="Boy's Hostel">Boy's Hostel</option>
                      <option value="Girl's Hostel">Girl's Hostel</option>
                      <option value="Type-A">Type-A</option>
                      <option value="Type-B">Type-B</option>
                      <option value="Type-C">Type-C</option>
                    </select>
                  </div>
                  
                  <div className="x-form-group">
                    <label>Room Number</label>
                    <input
                      type="text"
                      className="x-input"
                      placeholder="e.g. 104, 302-B"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div style={{ background: 'var(--bg3)', padding: '15px', borderRadius: 'var(--radius-lg)', marginTop: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Order Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800 }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatPrice(totalAmt)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {paymentStatus === 'pending' ? (
                <div>
                  <div className="payment-methods-grid">
                    <div
                      className={`payment-method-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                      <div className="payment-option-details">
                        <span className="payment-option-title">Online Payment (Razorpay)</span>
                        <span className="payment-option-desc">Pay securely using Cards, UPI, or NetBanking</span>
                      </div>
                    </div>

                    <div
                      className={`payment-method-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <div className="payment-option-details">
                        <span className="payment-option-title">
                          {orderType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter'}
                        </span>
                        <span className="payment-option-desc">Pay when you receive your order</span>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="upi-simulator-view" style={{ padding: '20px', textAlign: 'center' }}>
                      <p className="upi-instructions" style={{ marginBottom: '20px' }}>
                        Click below to securely checkout via Razorpay.
                      </p>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '12px 24px', fontSize: '16px' }}
                        onClick={handleRazorpayCheckout}
                      >
                        Proceed to Pay {formatPrice(totalAmt)}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '48px', color: 'var(--red)', marginBottom: '15px' }}>✕</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Payment Failed!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                    The transaction was either cancelled or timed out. Please try again.
                  </p>
                  <button className="btn btn-primary" onClick={() => setPaymentStatus('pending')}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="order-success-screen">
              <div className="order-check">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Order Confirmed!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '340px' }}>
                Your order has been received and added to your tracking log. Canteen staff is starting preparation.
              </p>

              <div className="order-success-meta">
                <div className="order-success-meta-row">
                  <span>Order ID:</span>
                  <strong>#{generatedOrderId.slice(-6).toUpperCase()}</strong>
                </div>
                <div className="order-success-meta-row">
                  <span>Fulfillment:</span>
                  <strong>{orderType === 'delivery' ? `Delivery Location (${hostel}, Room ${roomNumber})` : 'Self Counter Pickup'}</strong>
                </div>
                <div className="order-success-meta-row">
                  <span>Est. Time:</span>
                  <strong>10–15 Minutes</strong>
                </div>
                <div className="order-success-meta-row">
                  <span>Total Amount Paid:</span>
                  <strong style={{ color: 'var(--primary)' }}>{formatPrice(totalAmt)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-footer">
          {step === 1 && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleNextStep}>Next: Payment</button>
            </>
          )}

          {step === 2 && paymentMethod === 'cod' && paymentStatus === 'pending' && (
            <>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={handlePlaceCOD}>Place Order</button>
            </>
          )}

          {step === 2 && paymentMethod === 'upi' && paymentStatus === 'pending' && (
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
          )}

          {step === 3 && (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Awesome!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
