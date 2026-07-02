const express = require('express');
const router = express.Router();
const { analyzeSymptoms } = require('../controllers/aiController');

router.post('/symptom-check', analyzeSymptoms);

module.exports = router;
