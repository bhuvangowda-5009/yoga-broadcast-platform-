export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required.' });
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

    if (accountSid && authToken) {
      const twilio = (await import('twilio')).default;
      const client = twilio(accountSid, authToken);

      await client.messages.create({
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${phone}`,
        body: message,
      });

      return res.status(200).json({ success: true, channel: 'WhatsApp', to: phone });
    }

    // Local dev / unconfigured sandbox fallback
    console.log(`[WhatsApp Simulated] To: ${phone} | Msg: ${message}`);
    return res.status(200).json({ success: true, simulated: true, to: phone });
  } catch (err) {
    console.error('Twilio Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}