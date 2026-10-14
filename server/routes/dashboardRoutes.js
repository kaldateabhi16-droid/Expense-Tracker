const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getMonthlyOverview,
  getCategoryBreakdown,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/monthly-overview', getMonthlyOverview);
router.get('/category-breakdown', getCategoryBreakdown);

module.exports = router;
