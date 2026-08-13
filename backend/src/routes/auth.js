import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { Resend } from 'resend';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Force load from backend/.env explicitly
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const RESEND_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

// Rate limiting for auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to authenticate
export const authenticate = (req, res, next) => {
  // Read token from cookie instead of Authorization header
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// POST /register
router.post('/register', authLimiter, async (req, res) => {
  let { name, email, phone, password } = req.body;
  if (email) email = email.toLowerCase().trim();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, lastLogin: new Date() },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    setTokenCookie(res, token);
    
    const { password: _, ...publicUser } = user;
    res.json({ user: publicUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /login
router.post('/login', authLimiter, async (req, res) => {
  let { email, password } = req.body;
  if (email) email = email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Incorrect email or password.' });
    if (user.blocked) return res.status(403).json({ message: 'This account has been suspended. Contact support for help.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect email or password.' });

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    setTokenCookie(res, token);

    const { password: _, ...publicUser } = user;
    res.json({ user: publicUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /admin-login
router.post('/admin-login', authLimiter, async (req, res) => {
  let { email, password } = req.body;
  if (email) email = email.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Incorrect email or password.' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admins only' });
    if (user.blocked) return res.status(403).json({ message: 'This account has been suspended.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect email or password.' });

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    setTokenCookie(res, token);

    const { password: _, ...publicUser } = user;
    res.json({ user: publicUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// GET /me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.blocked) return res.status(401).json({ message: 'Session expired.' });
    const { password: _, ...publicUser } = user;
    res.json(publicUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /me
router.patch('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
    });
    const { password: _, ...publicUser } = user;
    res.json(publicUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /change-password
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: otp,
          resetPasswordExpires: expiresAt,
        },
      });

      // Send the OTP via Resend
      if (RESEND_KEY) {
        try {
          const template = await prisma.emailTemplate.findUnique({ where: { type: 'otp' } });
          const subject = template ? template.subject : 'Daalbhat: Your Password Reset OTP';
          const html = template ? template.bodyHtml.replace(/{{otp}}/g, otp) : `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4b6354;">Password Reset Request</h2>
                <p>You requested to reset your password for your Daalbhat account.</p>
                <p>Your 6-digit OTP code is:</p>
                <div style="background-color: #f5f7f5; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${otp}</span>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please safely ignore this email.</p>
              </div>
            `;

          const { data, error } = await resend.emails.send({
            from: 'Daalbhat Support <onboarding@resend.dev>',
            to: email,
            subject,
            html
          });
          
          if (error) {
            console.error('[AUTH] Resend API Error:', error);
            // Fallback to local OTP if Resend rejects it
            console.log(`\n==============================================`);
            console.log(`[MOCK EMAIL FALLBACK] To: ${email}`);
            console.log(`[MOCK EMAIL FALLBACK] Body: Your OTP is: ${otp}`);
            console.log(`==============================================\n`);
          } else {
            console.log(`[AUTH] Sent real OTP email via Resend to ${email}. ID: ${data?.id}`);
          }
        } catch (emailError) {
          console.error('[AUTH] Failed to send email via Resend exception:', emailError);
          // Fallback to local OTP
          console.log(`\n==============================================`);
          console.log(`[MOCK EMAIL FALLBACK] To: ${email}`);
          console.log(`[MOCK EMAIL FALLBACK] Body: Your OTP is: ${otp}`);
          console.log(`==============================================\n`);
        }
      } else {
        console.log(`\n==============================================`);
        console.log(`[MOCK EMAIL] To: ${email}`);
        console.log(`[MOCK EMAIL] Subject: Password Reset OTP`);
        console.log(`[MOCK EMAIL] Body: Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`);
        console.log(`==============================================\n`);
      }
    }

    // Always return success to not leak email existence
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetPasswordToken !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and clear the OTP fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
