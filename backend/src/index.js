import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import couponRoutes from './routes/coupons.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import nepalOrderRoutes from './routes/nepal-orders.js';
import deliveryRoutes from './routes/delivery.js';
import groceryEstimateRoutes from './routes/grocery-estimate.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3001;

console.log("RESEND API KEY STATUS:", process.env.RESEND_API_KEY ? "Found" : "Missing");

app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5173'],
  credentials: true, // Allow cookies
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/nepal-orders', nepalOrderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/grocery-estimate', groceryEstimateRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
