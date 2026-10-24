export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { orderId, paymentId } = req.body;
  return res.status(200).json({ verified: true, paymentId: paymentId || 'pay_' + Date.now(), orderId });
}