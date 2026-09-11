
// import express from "express";
// import {
//   addReview,
//   getProductReviews,
//   getFeaturedReviews,
//   toggleFeaturedReview,
//   deleteReview,
// } from "../controllers/reviewController.js";
// import { verifyUser } from "../middleware/authVerify.js";
// import { verifyAdmin } from "../middleware/AdminVerify.js";

// const router = express.Router();

// // 1. Static routes first
// router.get("/getfeaturedreviews", getFeaturedReviews);

// // 2. Dynamic parameter routes second
// router.get("/getproductreviews/:productId", getProductReviews);

// // Authenticated user
// router.post("/addreview/:productId", verifyUser, addReview);
// router.delete("/deletereview/:reviewId", verifyUser, deleteReview);

// // Admin only
// router.patch("/togglefeatured/:reviewId", verifyAdmin, toggleFeaturedReview);

// export default router;

import express from "express";
import {
  addReview,
  getProductReviews,
  getFeaturedReviews,
  getAllReviewsAdmin,
  toggleFeaturedReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { verifyUser } from "../middleware/authVerify.js";
import { verifyAdmin } from "../middleware/AdminVerify.js";

const router = express.Router();

// 1. Static routes first
router.get("/getfeaturedreviews", getFeaturedReviews);

// Admin only — list all reviews (static path, put before any /:param routes)
router.get("/getallreviews", verifyAdmin, getAllReviewsAdmin);

// 2. Dynamic parameter routes second
router.get("/getproductreviews/:productId", getProductReviews);

// Authenticated user
router.post("/addreview/:productId", verifyUser, addReview);
router.delete("/deletereview/:reviewId", verifyUser, deleteReview);

// Admin only
router.patch("/togglefeatured/:reviewId", verifyAdmin, toggleFeaturedReview);

export default router;