const express = require('express');
const router = express.Router();
const { createReview, getDoctorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.post('/', protect, restrictTo('patient'), createReview);
router.get('/doctor/:id', getDoctorReviews);

module.exports = router;
