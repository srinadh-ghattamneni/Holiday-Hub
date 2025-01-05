const express= require("express");
const router =express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn,isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");
const customRateLimiter = require("../utils/expressRateLimit"); // Import rate limiter

// Apply rate limiter to reviews routes
const createReviewRateLimiter = customRateLimiter(1 * 60 * 1000, 40, 
    "Too many reviews posted, please try again later."); // 15 minutes window, max 5 requests

    const deleteReviewRateLimiter = customRateLimiter(15 * 60 * 1000, 100, 
        "Too many requests, please try again later."); 
//Reviews
//Reviews post route
router.post("/",isLoggedIn,createReviewRateLimiter,validateReview, wrapAsync(reviewController.createReview));

// delete reviews route
router.delete("/:reviewId",isLoggedIn, deleteReviewRateLimiter,isReviewAuthor ,wrapAsync(reviewController.deleteReview));

module.exports = router;
