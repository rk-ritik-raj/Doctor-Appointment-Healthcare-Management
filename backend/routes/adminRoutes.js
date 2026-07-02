const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getPendingDoctors,
  approveDoctor,
  deleteReview,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/approve', approveDoctor);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
