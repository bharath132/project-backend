import { getFullData } from '../controllers/fullDataController.js';

const express = require('express');
const router = express.Router();

router.get('/fulldata', getFullData); 

export default router;
