const {getFullData ,getLiveData } = require('../controllers/fullDataController.js');

const express = require('express');
const router = express.Router();

router.get('/fulldata', getFullData); 
router.get('/live', getLiveData);

module.exports = router;
