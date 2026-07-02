const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAvailability,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Protected routes (Doctor only)
router.put(
  '/profile',
  protect,
  restrictTo('doctor'),
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'certificates', maxCount: 5 },
  ]),
  updateDoctorProfile
);
router.get('/appointments', protect, restrictTo('doctor'), getDoctorAppointments);
router.put('/availability', protect, restrictTo('doctor'), updateAvailability);

module.exports = router;
