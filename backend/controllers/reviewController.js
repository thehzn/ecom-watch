import Review from "../models/ReviewModel.js";
import Product from "../models/ProductModel.js";

// Recalculates and stores averageRating + numReviews on the Product document.
// Called after any add/delete so product cards can show ratings without aggregating live.
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // round to 1 decimal
      numReviews: stats[0].numReviews,
    });
  } else {
    // No reviews left for this product
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

// =========================
// ADD REVIEW
// =========================
export const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        status: false,
        message: "Rating and comment are required",
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        status: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({
        status: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: numericRating,
      title,
      comment,
    });

    await recalculateProductRating(productId);

    const populatedReview = await review.populate("user", "firstName lastName");

    return res.status(201).json({
      status: true,
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    // Duplicate key error from the unique index, as a fallback safety net
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "You have already reviewed this product",
      });
    }
    return res.status(500).json({ status: false, message: error.message });
  }
};

// =========================
// GET REVIEWS FOR A PRODUCT (public, paginated)
// =========================
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [reviews, totalReviews, product] = await Promise.all([
      Review.find({ product: productId })
        .populate("user", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: productId }),
      Product.findById(productId).select("averageRating numReviews").lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Reviews fetched successfully",
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      page,
      averageRating: product?.averageRating || 0,
      numReviews: product?.numReviews || 0,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// =========================
// GET FEATURED REVIEWS (public — used on Contact Us page)
// =========================
export const getFeaturedReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const reviews = await Review.find({ featured: true })
      .populate("user", "firstName lastName")
      .populate("product", "modelName mainImage")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      status: true,
      message: "Featured reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// =========================
// TOGGLE FEATURED (admin only)
// =========================
export const toggleFeaturedReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ status: false, message: "Review not found" });
    }

    review.featured = !review.featured;
    await review.save();

    return res.status(200).json({
      status: true,
      message: `Review ${review.featured ? "marked" : "unmarked"} as featured`,
      review,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// =========================
// DELETE REVIEW (owner or admin)
// =========================
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ status: false, message: "Review not found" });
    }

    if (!isAdmin && review.user.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to delete this review",
      });
    }

    const productId = review.product;
    await review.deleteOne();
    await recalculateProductRating(productId);

    return res.status(200).json({
      status: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// =========================
// GET ALL REVIEWS (admin only — paginated, for the review management page)
// =========================
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Optional filter: ?featured=true / ?featured=false to narrow the list
    const filter = {};
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.featured === "false") filter.featured = false;

    const [reviews, totalReviews] = await Promise.all([
      Review.find(filter)
        .populate("user", "firstName lastName email")
        .populate("product", "modelName mainImage")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      message: "Reviews fetched successfully",
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      page,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};