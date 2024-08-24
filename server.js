const mongoose = require('mongoose');
const passport = require('passport');
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

const publicRoutes = [
  '/api/user/login',
  '/api/user/register',
  '/api/user/verify-user',
  '/api/car/view-all-cars',
  '/api/user/view-car-collection/:id',
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

app.get('/', (req, res) => {
  res.send('Server Online');
});

const server = http.createServer(app);

// if (!NODE_ENV === 'test') {
//   server.listen(3000, () => {
//     console.log('Server is running');
//   });
// }
server.listen(3000, () => {
  console.log('Server is running');
});

// 1 hour
cron.schedule('0 */1 * * *', async () => {
  console.log('Server running');
  logger.info('Server running');
});

// Saturday 12am
cron.schedule('0 0 * * 6', async () => {
  sendMail();
});

module.exports = { app, server };
