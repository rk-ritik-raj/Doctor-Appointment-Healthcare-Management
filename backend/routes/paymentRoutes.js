const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifyPayment,
  handleStripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.post('/checkout-session', protect, restrictTo('patient'), createCheckoutSession);
router.post('/verify', protect, restrictTo('patient'), verifyPayment);
router.post('/webhook', handleStripeWebhook);

module.exports = router;
