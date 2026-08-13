import express from 'express';
import prisma from '../db.js';
import { sendEmail } from '../utils/mailer.js';

const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser?.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #374151; margin-top: 0;">New Contact Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 15px; color: #4b5563; white-space: pre-wrap;">
            ${message}
          </div>
        </div>
      `;
      
      sendEmail({
        to: adminUser.email,
        subject: `New Contact Inquiry: ${subject}`,
        html: emailHtml
      }).catch(e => console.error("Contact Email Dispatch Error:", e));
    }

    res.status(201).json({ success: true, message: 'Message sent successfully.', data: contactMessage });
  } catch (error) {
    console.error('Contact endpoint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
