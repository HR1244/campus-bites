import React from 'react';
import { ITEM_VARIANTS, formatPrice } from '../data/menuData.js';

export default function MenuCard({ 
  item, 
  idx, 
  cart, 
  selectedVariants, 
  onAddToCart, 
  onChangeQty, 
  onOpenVariantDrawer,
  isAdmin,
  onEdit,
  onDelete,
  reviews = [],
  onOpenReviews
}) {
  const productReviews = reviews.filter(r => (r.item_id ?? r.productId) === item.id);
  const totalReviews = productReviews.length;
  const avgRating = totalReviews > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const isCanteenOnly = ['breakfast', 'lunch', 'dinner'].includes(item.category.toLowerCase());
  const hasVariants = !isCanteenOnly && !!ITEM_VARIANTS[item.id];

  const handleImgError = (e) => {
    e.target.style.display = 'none';
    e.target.parentElement.style.background = 'var(--bg3)';
  };

  const adminControls = isAdmin && (
    <div className="admin-card-actions">
      <button 
        className="admin-action-btn edit-btn" 
        onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
        title="Edit Product"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </button>
      <button 
        className="admin-action-btn delete-btn" 
        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
        title="Delete Product"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </button>
    </div>
  );

  if (hasVariants) {
    const varData = ITEM_VARIANTS[item.id];
    const activeVarId = selectedVariants[item.id];
    const activeVar = varData.items.find(v => v.id === activeVarId) || varData.items[0];
    const cartItem = cart.find(c => c.id === activeVar.id);
    const qtyInCart = cartItem ? cartItem.qty : 0;
    const chooseBtnText = item.id === 16 ? 'Choose Variant' : 'Choose Flavour';

    if (item.id === 13) {
      return (
        <div className="menu-card reveal" style={{ animationDelay: `${idx * 0.06}s` }} id={`card-${item.id}`}>
          <div className="menu-card-img">
            <img src={item.img} alt={item.name} loading="lazy" onError={handleImgError} />
            <span className={`menu-cat-tag cat-${item.category}`}>{item.category}</span>
            <span className={`veg-dot ${item.veg ? 'is-veg' : 'non-veg'}`} title={item.veg ? 'Veg' : 'Non-Veg'}></span>
            {adminControls}
          </div>
          <div className="menu-card-body">
            <div className="menu-name">{item.name}</div>
            <div className="star-rating-badge" onClick={() => onOpenReviews(item.id, item.name)}>
              ★ {avgRating} ({totalReviews})
            </div>
            <div className="menu-desc">{item.desc}</div>

            <span className="selected-variant-label" title={activeVar.name}>
              Selected: {activeVar.name}
            </span>

            <div className="menu-footer variant-footer">
              <div className="menu-footer-top-row">
                <div className="menu-price">
                  Starting: ₹25
                  <span className="variant-card-mrp">₹30</span>
                </div>
                <button className="change-variant-btn" onClick={() => onOpenVariantDrawer(item.id)}>
                  Change Flavour
                </button>
              </div>

              <div className="menu-footer-bottom-row">
                <div className="menu-card-add-action" id={`action-wrapper-${item.id}`}>
                  {qtyInCart > 0 ? (
                    <div className="drawer-qty-selector" style={{ margin: '0 auto', width: '100%' }}>
                      <button className="drawer-qty-btn" onClick={() => onChangeQty(activeVar.id, -1)}>−</button>
                      <span className="drawer-qty-num">{qtyInCart}</span>
                      <button className="drawer-qty-btn" onClick={() => onChangeQty(activeVar.id, 1)}>+</button>
                    </div>
                  ) : (
                    <button className="add-to-cart-btn" style={{ width: '100%' }} onClick={() => onAddToCart(activeVar.id)}>
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="menu-card reveal" style={{ animationDelay: `${idx * 0.06}s` }} id={`card-${item.id}`}>
        <div className="menu-card-img">
          <img src={item.img} alt={item.name} loading="lazy" onError={handleImgError} />
          <span className={`menu-cat-tag cat-${item.category}`}>{item.category}</span>
          <span className={`veg-dot ${item.veg ? 'is-veg' : 'non-veg'}`} title={item.veg ? 'Veg' : 'Non-Veg'}></span>
          {adminControls}
        </div>
        <div className="menu-card-body">
          <div className="menu-name">{item.name}</div>
          <div className="star-rating-badge" onClick={() => onOpenReviews(item.id, item.name)}>
            ★ {avgRating} ({totalReviews})
          </div>
          <div className="menu-desc">{item.desc}</div>

          <span className="selected-variant-label" title={activeVar.name}>
            Selected: {activeVar.name}
          </span>

          <div className="menu-footer variant-footer">
            <div className="menu-footer-top-row">
              <div className="menu-price">
                {formatPrice(activeVar.price)}
                {activeVar.mrp > activeVar.price && <span className="variant-card-mrp">{formatPrice(activeVar.mrp)}</span>}
              </div>
              <button className="change-variant-btn" onClick={() => onOpenVariantDrawer(item.id)}>
                Change
              </button>
            </div>

            <div className="menu-footer-bottom-row">
              <div className="menu-card-add-action" id={`action-wrapper-${item.id}`}>
                {qtyInCart > 0 ? (
                  <div className="drawer-qty-selector" style={{ margin: '0 auto', width: '100%' }}>
                    <button className="drawer-qty-btn" onClick={() => onChangeQty(activeVar.id, -1)}>−</button>
                    <span className="drawer-qty-num">{qtyInCart}</span>
                    <button className="drawer-qty-btn" onClick={() => onChangeQty(activeVar.id, 1)}>+</button>
                  </div>
                ) : (
                  <button className="add-to-cart-btn" style={{ width: '100%' }} onClick={() => onOpenVariantDrawer(item.id)}>
                    {chooseBtnText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cartItem = cart.find(c => c.id === item.id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  return (
    <div className="menu-card reveal" style={{ animationDelay: `${idx * 0.06}s` }} id={`card-${item.id}`}>
      <div className="menu-card-img">
        <img src={item.img} alt={item.name} loading="lazy" onError={handleImgError} />
        <span className={`menu-cat-tag cat-${item.category}`}>{item.category}</span>
        <span className={`veg-dot ${item.veg ? 'is-veg' : 'non-veg'}`} title={item.veg ? 'Veg' : 'Non-Veg'}></span>
        {adminControls}
      </div>
      <div className="menu-card-body">
        <div className="menu-name">{item.name}</div>
        <div className="star-rating-badge" onClick={() => onOpenReviews(item.id, item.name)}>
          ★ {avgRating} ({totalReviews})
        </div>
        <div className="menu-desc">{item.desc}</div>
        <div className="menu-footer">
          <div className="menu-price">{formatPrice(item.price)}</div>
          {isCanteenOnly ? (
            <span className="visit-canteen-badge">🏪 Visit Canteen</span>
          ) : qtyInCart > 0 ? (
            <div className="drawer-qty-selector" style={{ minWidth: '82px' }}>
              <button className="drawer-qty-btn" onClick={() => onChangeQty(item.id, -1)}>−</button>
              <span className="drawer-qty-num">{qtyInCart}</span>
              <button className="drawer-qty-btn" onClick={() => onChangeQty(item.id, 1)}>+</button>
            </div>
          ) : (
            <button className="add-to-cart-btn" id={`atc-${item.id}`} onClick={() => onAddToCart(item.id)}>+ Add</button>
          )}
        </div>
      </div>
    </div>
  );
}
