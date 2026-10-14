const Settings = require('../models/Settings');

// @desc    Get user preferences / settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Settings.create({
        user: req.user._id,
        currency: 'INR',
        theme: 'light',
        dateFormat: 'DD/MM/YYYY',
        defaultTransactionType: 'expense',
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res, next) => {
  try {
    const { currency, theme, dateFormat, defaultTransactionType } = req.body;

    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      settings = new Settings({ user: req.user._id });
    }

    if (currency) settings.currency = currency;
    if (theme) settings.theme = theme;
    if (dateFormat) settings.dateFormat = dateFormat;
    if (defaultTransactionType) settings.defaultTransactionType = defaultTransactionType;

    const updated = await settings.save();

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
