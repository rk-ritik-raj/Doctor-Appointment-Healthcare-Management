const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptionById,
  getPrescriptionByAppointment,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', restrictTo('doctor'), createPrescription);
router.get('/:id', getPrescriptionById);
router.get('/appointment/:id', getPrescriptionByAppointment);

module.exports = router;
