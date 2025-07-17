const {getFullData} = require('../controllers/fullDataController.js');
const {getLiveData} = require('../controllers/liveDataController.js');
const { receiveData } = require('../controllers/recieveDataController.js');
const express = require('express');
const router = express.Router();

router.get('/fulldata', getFullData); 
router.get('/live', getLiveData);
router.post('/receive', receiveData);

module.exports = router;
