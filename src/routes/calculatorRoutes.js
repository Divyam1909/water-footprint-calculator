const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculatorController');

// Route to calculate water footprint
router.post('/calculate', calculatorController.calculateWaterFootprint);

// Route to get AI-generated advice
router.post('/advice', calculatorController.getAdvice);

module.exports = router; 