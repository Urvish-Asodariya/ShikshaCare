const express = require('express');
const router = express.Router();
const crypto = require('crypto');

router.post('/razorpay-webhook', async (req, res) => {
    const secret = 'ShikshaCare';

    // Verify Razorpay signature
    const shasum = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (shasum !== req.headers['x-razorpay-signature']) {
        console.error('Invalid signature');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    try {
        console.log('Webhook event:', event, "PAYLOAD", payload);
        res.json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});

module.exports = router;

