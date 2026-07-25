import React, { useState } from 'react';

export default function ReviewsModal({
  isOpen,
  onClose,
  productId,
  productName,
  reviews = [],
  currentUser,
  onSubmitReview,
  onLoginClick
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const productReviews = reviews.filter(r => (r.item_id ?? r.productId) === productId);
  const totalReviews = productReviews.length;
  
  const avgRating = totalReviews > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    onSubmitReview(productId, rating, comment.trim());
    setComment('');
    setRating(5);
  };

  const renderStars = (count, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        interactive ? (
          <button
            key={i}
            type="button"
            className={`star-select-btn ${i <= rating ? 'active' : ''}`}
            onClick={() => setRating(i)}
          >
            ★
          </button>
        ) : (
          <span key={i} style={{ color: i <= Math.round(count) ? '#ffb800' : 'var(--border2)' }}>
            ★
          </span>
        )
      );
    }
    return stars;
  };

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div className="reviews-modal-card" onClick={e => e.stopPropagation()}>
        <div className="reviews-modal-header">
          <h3>Reviews for {productName}</h3>
          <button className="reviews-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="reviews-modal-body">
          <div className="reviews-summary-block">
            <div className="rev-big-rating">{avgRating}</div>
            <div>
              <div className="rev-stars-row">
                {renderStars(Number(avgRating))}
              </div>
              <div className="rev-count-label">Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</div>
            </div>
          </div>

          <div className="reviews-list-container">
            <span className="reviews-list-title">Customer Feedback</span>
            {productReviews.length === 0 ? (
              <div className="no-reviews-placeholder">
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              productReviews.map((rev, index) => (
                <div className="review-item" key={index}>
                  <div className="review-header">
                    <span className="review-user-name">{rev.user_name ?? rev.userName}</span>
                    <span className="review-stars">{renderStars(rev.rating)}</span>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                  <div className="review-date">{new Date(rev.date).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="review-submit-section">
          {currentUser ? (
            <form onSubmit={handleSubmit}>
              <h4>Write a Review</h4>
              <div className="review-star-selector">
                {renderStars(5, true)}
              </div>
              <div className="review-input-group">
                <textarea
                  className="review-textarea"
                  placeholder="Share your experience with this item..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={250}
                  required
                />
                <button type="submit" className="btn btn-primary btn-review-submit">
                  Post
                </button>
              </div>
            </form>
          ) : (
            <div className="review-login-prompt">
              Please <button onClick={() => { onClose(); onLoginClick(); }}>Login</button> to write a review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
