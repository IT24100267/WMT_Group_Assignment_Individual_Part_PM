const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('src/uploads'));

app.get('/', (req, res) => res.json({ 
  message: 'FreshGuard API running ✅' 
}));

app.use('/api/products', require('./routes/productRoutes'));

app.use(errorHandler);

module.exports = app;