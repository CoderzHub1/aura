import Users from '../../models/Users';
import connectDb from '../utils/connectDb';
import nodemailer from 'nodemailer';

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, message, location } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.emergencyEmails || user.emergencyEmails.length === 0) {
            return res.status(400).json({ message: 'No emergency email contacts found' });
        }

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const defaultMessage = `EMERGENCY ALERT: ${user.name || 'A user'} has triggered a distress signal in the Aura app.`;
        const emailMessage = message || defaultMessage;
        const emailSubject = 'AURA APP - EMERGENCY DISTRESS DETECTED';
        const locationInfo = location ? `\n\nLocation information: ${location}` : '\n\nNo location information available.';
        
        // Send emails to all emergency contacts
        const emailPromises = user.emergencyEmails.map(contact => {
            return transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: contact.email,
                subject: emailSubject,
                text: `Dear ${contact.name},\n\n${emailMessage}${locationInfo}\n\nPlease check on them immediately.\n\nThis is an automated message from the Aura App.`
            });
        });

        await Promise.all(emailPromises);

        return res.status(200).json({ message: 'Emergency emails sent successfully' });
    } catch (error) {
        console.error('Error sending emergency emails:', error);
        return res.status(500).json({ message: 'Failed to send emergency emails' });
    }
};

export default connectDb(handler); 