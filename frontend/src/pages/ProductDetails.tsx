import React, { useState, useEffect } from 'react';
import { Star, Shield, ArrowLeft, Plus, Minus, ShoppingCart, MessageSquarePlus, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import { Product, User } from '../types';
import { api } from '../services/api';

interface ProductDetailsProps {
  productId: string;
  user: User | null;
  onNavigate: (page: string, params?: any) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  isAddingToCart: boolean;
}

export default function ProductDetails({
  productId,
  user,
  onNavigate,
  onAddToCart,
  isAddingToCart,
}: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Active picture index selector
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review Submission Hooks
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Loaded Details effect
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError('');
        const data = await api.products.getById(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Product catalog query malfunction');
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');
      const updatedProduct = await api.products.addReview(productId, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setProduct(updatedProduct);
      setReviewComment('');
      setReviewSuccess('Thank you for sharing your feedback with ShopEZ!');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBuyNow = () => {
    onAddToCart(productId, quantity);
    onNavigate('cart');
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4" id="details-loader">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
        <p className="text-sm font-semibold text-slate-500">Retrieving catalog records...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 px-4" id="details-error">
        <div className="rounded-full bg-rose-50 p-3 text-rose-500 inline-block mb-3">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Review specification target error</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'This product does not exist.'}</p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-6 rounded-md bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
        >
          Return to product list
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 space-y-12 pt-4" id={`product-details-${product._id}`}>
      
      {/* Return button row */}
      <div>
        <button
          onClick={() => onNavigate('products')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Product Directory</span>
        </button>
      </div>

      {/* Main product card bento layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        
        {/* Left Column: Product Photography */}
        <div className="space-y-4" id="details-photography">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
            <img
              src={product.images[activeImageIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded-full bg-rose-650 bg-rose-650 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Sub Thumbnails list */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square overflow-hidden rounded-md border-2 bg-slate-50 transition ${
                    activeImageIndex === idx ? 'border-emerald-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Descriptions & Actions */}
        <div className="space-y-6" id="details-info-container">
          
          {/* Header information */}
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{product.name}</h1>
            
            {/* Rating Display */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">{product.rating}</span>
              <span className="text-sm text-slate-400">|</span>
              <span className="text-xs font-bold text-slate-500 hover:underline cursor-pointer">
                {product.reviews?.length || 0} customer reviews
              </span>
            </div>
          </div>

          {/* Pricing blocks */}
          <div className="border-t border-b border-slate-100 py-4">
            <span className="text-xs text-slate-400 font-bold tracking-wider block">PRICE VALUE</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-700">${product.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Product description copy */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-1">Product Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Stock Metrics State Display */}
          <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-150 bg-slate-50 text-sm">
            <span className="text-slate-600 font-medium">Availability Status</span>
            {isOutOfStock ? (
              <span className="font-extrabold text-rose-600 uppercase tracking-wide">Out of Stock</span>
            ) : (
              <span className="text-slate-900 font-bold">
                In Stock <span className="text-emerald-600">({product.stock} items left!)</span>
              </span>
            )}
          </div>

          {/* Multi-quantity step modifiers */}
          {!isOutOfStock && (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-bold tracking-wider block">CHOOSE QUANTITY</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-1">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="rounded p-1 text-slate-500 hover:bg-slate-200 transition disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-extrabold text-slate-900">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className="rounded p-1 text-slate-500 hover:bg-slate-200 transition disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  Max capacity: {product.stock}
                </span>
              </div>
            </div>
          )}

          {/* Operational checkout triggers */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => onAddToCart(product._id, quantity)}
              disabled={isOutOfStock || isAddingToCart}
              className={`flex-1 inline-flex items-center justify-center space-x-2 rounded-md py-3 text-sm font-bold shadow transition ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-850'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{isAddingToCart ? 'Processing...' : 'Add To Cart'}</span>
            </button>

            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-emerald-600 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                Buy Now
              </button>
            )}
          </div>

          {/* Secure promise layout footer */}
          <div className="flex items-center space-x-2.5 text-xs text-slate-400">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
            <span>Guaranteed genuine product from authorized brand suppliers & merchants.</span>
          </div>
        </div>
      </div>

      {/* Reviews Logs Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3" id="reviews-pane">
        
        {/* Left pane: post a Review (col-span-1) */}
        <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-150 space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
            <MessageSquarePlus className="h-5 w-5 text-emerald-600" />
            <span>Share Your Review</span>
          </h3>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4" id="review-submission-form">
              {reviewError && <p className="text-xs text-rose-650 font-bold bg-rose-50 p-2.5 rounded">{reviewError}</p>}
              {reviewSuccess && <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded">{reviewSuccess}</p>}

              {/* Rating selection row */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">YOUR RATING</span>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 rounded hover:bg-white/60 transition"
                    >
                      <Star
                        className={`h-6 w-6 text-2xl transition-all ${
                          star <= reviewRating ? 'fill-amber-405 fill-amber-400 text-amber-400 scale-105' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content text block */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">COMMENT FEEDBACK</span>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your experience, design packaging notes, and overall product values..."
                  className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-emerald-500 transition"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full rounded-md bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-sm"
              >
                {submittingReview ? 'Submitting to ShopEZ...' : 'Post Detailed Review'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 bg-white rounded-lg border border-slate-100 p-4">
              <p className="text-xs text-slate-500">
                You must login to log e-commerce purchase feedback ratings.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
              >
                Sign In Now &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Right pane: list matching reviews (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-1.5">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              <span>Customer Reviews ({product.reviews?.length || 0})</span>
            </h3>
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4" id="reviews-list-container">
              {product.reviews.map((rev, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block capitalize">{rev.name}</span>
                      {/* Sub star row */}
                      <div className="flex items-center space-x-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic leading-relaxed pt-1 select-none">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-100">
              <p className="text-sm text-slate-400 italic">No customer reviews yet. Be the first to share your opinion!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
