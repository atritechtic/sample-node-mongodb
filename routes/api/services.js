const express = require('express');
const router = express.Router();

// @route   GET api/service
// @desc    Get all users service
// @access  Public
router.get('/', (req, res) => {
  res.send('Get all services');
});

// @route   POST api/service
// @desc    Add new service
// @access  Private
router.post('/', (req, res) => {
  res.send('Add service');
});

// @route   PUT api/service/:id
// @desc    Update service
// @access  Private
router.put('/', (req, res) => {
  res.send('Update service');
});

// @route   DELETE api/service/:id
// @desc    Delete service
// @access  Private
router.delete('/', (req, res) => {
  res.send('Delete service');
});

module.exports = router;
