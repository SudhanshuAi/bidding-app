const express = require('express');
const router = express.Router();
const { getItems } = require('./store');

// GET /items
router.get('/items', (req, res) => {
    const items = getItems();
    // We can attach a 'serverTime' so client can sync offset
    res.json({
        items,
        serverTime: Date.now()
    });
});

module.exports = router;
