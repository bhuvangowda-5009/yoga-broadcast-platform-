export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { phone, message } = req.body;
  // Simulates Twilio SMS dispatch
  console.log(`[Twilio SMS] Sent to ${phone}: ${message}`);
  return res.status(200).json({ success: true, channel: 'SMS', to: phone, message });
}