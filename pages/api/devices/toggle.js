export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
  
    const { deviceId, state } = req.body;
  
    console.log(`Toggling device ${deviceId} to ${state}`);
  
    return res.status(200).json({ success: true, message: `Device ${deviceId} turned ${state}` });
  }
  