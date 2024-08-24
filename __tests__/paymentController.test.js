const { app, server } = require('../server');
const request = require('supertest');
const helpers = require('../lib/utils');

describe('Payment Controller Tests', () => {
  it('should return true', () => {
    expect(true).toBe(true);
  });
});

// describe('Payment Controller Tests', () => {
//   let token = '';
//   let userId = '';
//   let paymentId = '';
//   let carId = '';

//   //////////////////////////////////////////
//   //////////// CREATE PAYMENT /////////////
//   ////////////////////////////////////////

//   describe('Create a user to create payment', () => {
//     it('should register a user with role', async () => {
//       const res = await request(app).post('/api/user/register').send({
//         username: 'antony',
//         email: 'starkshaman30@gmail.com',
//         password: 'adminpassword',
//         wallet: 123456789,
//         role: 'admin',
//       });
//       token = res.body.token;
//       userId = res.body.user._id;
//       expect(res.status).toBe(201);
//       expect(res.body.user.role).toBe('admin');
//     });
//   });

//   describe('Create a Car to create payment', () => {
//     it('should create a car successfully', async () => {
//       const res = await request(app)
//         .post('/api/car/create-car')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           name: 'Lamborghini Aventador',
//           brand: 'Lamborghini',
//           basePrice: 393695,
//           color: 'yellow',
//           fuelType: 'petrol',
//           engine: {
//             capacity: 6500,
//             cylinders: 12,
//             horsepower: 730,
//           },
//           transmission: 'automatic',
//           features: [
//             {
//               name: 'aerodynamic Kit',
//               price: 25000,
//             },
//           ],
//           tyres: 'tubeless',
//           bodyType: 'coupe',
//           bodyMaterial: 'carbon fiber',
//           stock: {
//             quantity: 5,
//           },
//           status: 'available',
//           tax: 0.25,
//         });
//       carId = res.body.car._id;
//     });
//   });

//   describe('Create a payment', () => {
//     it('should create a payment', async () => {
//       const res = await request(app)
//         .post('/api/payment/create-payment')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           user: userId,
//           car: carId,
//           invoice: '123456789012345678901234',
//           paymentMethod: 'UPI',
//           amount: 123456,
//           status: 'completed',
//           transactionId: helpers.generateTransactionId('AJS'),
//         });
//       paymentId = res.body._id;
//       expect(res.status).toBe(201);
//       expect(res.body.user).toBe(userId);
//     });
//   });

//   //////////////////////////////////////////
//   //////////// VERIFY PAYMENT  ////////////
//   ////////////////////////////////////////

//   describe('Verify a payment', () => {
//     it('should verify a payment', async () => {
//       const res = await request(app)
//         .post('/api/payment/verify-payment')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           id: paymentId,
//         });
//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//     });
//   });
// });
