const mongoose = require('mongoose');
const authMiddleware = require('./config/middleware');
require('./config/passport');
const userRoutes = require('./Routes/user');
const carRoutes = require('./Routes/car');
const invoiceRoutes = require('./Routes/invoice');
const paymentRoutes = require('./Routes/payment');
const appointmentRoutes = require('./Routes/appointment');
const cron = require('node-cron');
const logger = require('./config/winston');
const sendMail = require('./lib/sendWeeklyMail');
const app = require('./config/server');
const http = require('http');
const helpers = require('./lib/utils');

const publicRoutes = [
  '/api/user/login',
  '/api/user/register',
  '/api/user/verify-user',
  '/api/car/view-all-cars',
  '/',
  '/api/user/ping',
  '/api/car/ping',
  '/api/invoice/ping',
  '/api/payment/ping',
  '/api/appointment/ping',
  '/api/user/forgot-password',
  '/api/user/reset-password',
];

app.use((req, res, next) => {
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  authMiddleware(req, res, (err) => {
    if (err) {
      logger.error(`[authMiddleware] ${err.message}`);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  });
});

app.use('/api/user', userRoutes);
app.use('/api/car', carRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/appointment', appointmentRoutes);

const db = process.env.MONGODB_URI;
mongoose
  .connect(db)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.get('/', async (req, res) => {
  res.write('Main route working\n');
  res.write('\nTesting routes...\n\n');

  try {
    const data = await helpers.testRoutes();
    for (const item of data) {
      res.write(`${item}\n`);
    }
    if (data.length === 5) {
      res.write('\nAll routes are working\n');
    } else {
      res.write('Some routes are not working\n');
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Server is facing some issues' });
  }
});

const server = http.createServer(app);

server.listen(3000, () => {
  console.log('Server is running');
});

cron.schedule('0 */1 * * *', async () => {
  console.log('Server running');
  logger.info('Server running');
});

cron.schedule(
  '0 10 * * 4',
  async () => {
    try {
      await sendMail();
    } catch (error) {
      console.error(error);
    }
  },
  {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  },
);

module.exports = { app, server };
