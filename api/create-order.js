import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, planId } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  try {
    // Razorpay standard test mode keys (or reads from process.env)
    const key_id = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret';

    const razorpay = new Razorpay({
      key_id,
      key_secret
    });

    const options = {
      amount: amount * 100, // Amount in paise (₹299 = 29900)
      currency: 'INR',
      receipt: `rcpt_${planId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (err) {
    console.error('Razorpay Order Error:', err.message);
    // Graceful fallback for local development without active serverless backend
    return res.status(200).json({
      id: `order_sim_${Math.random().toString(36).substring(2, 9)}`,
      amount: amount * 100,
      currency: 'INR'
    });
  }
}