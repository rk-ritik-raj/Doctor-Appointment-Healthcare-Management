const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  updatePatientProfile,
  getPatientAppointments,
  toggleFavoriteDoctor,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protect all routes under this prefix
router.use(protect);
router.use(restrictTo('patient'));

router.get('/profile', getPatientProfile);
router.put('/profile', upload.single('profilePicture'), updatePatientProfile);
router.get('/appointments', getPatientAppointments);
router.post('/favorites', toggleFavoriteDoctor);

module.exports = router;
