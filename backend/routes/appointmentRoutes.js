const express = require('express');
const router = express.Router();
const { bookAppointment, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/book', restrictTo('patient'), bookAppointment);
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
