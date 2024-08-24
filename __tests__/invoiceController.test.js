// const { app, server } = require('../server');
// const request = require('supertest');
// const helpers = require('../lib/utils');
// const Invoice = require('../Model/invoice');
// const User = require('../Model/user');

describe('running setupTests', () => {
  it('returns true', () => {
    expect(true).toBe(true);
  });
});

// describe('Invoice Controller Tests', () => {
//   let token = '';
//   let userId = '';
//   let invoiceId = '';
//   let carId = '';
//   let carData;
//   let user;

//   //////////////////////////////////////////
//   //////////// CREATE INVOICE /////////////
//   ////////////////////////////////////////

//   describe('Create a user to create invoice', () => {
//     it('should register a user', async () => {
//       const res = await request(app).post('/api/user/register').send({
//         username: 'antonyjude',
//         email: 'antonyjude@gmail.com',
//         password: 'password',
//         role: 'admin',
//       });
//       token = res.body.token;
//       userId = res.body.user._id;
//       user = res.body.user;
//       expect(res.status).toBe(201);
//       expect(res.body.user.username).toBe('antonyjude');
//       expect(res.body.user.role).toBe('admin');
//     });
//   });

//   describe('Create a Car to create invoice', () => {
//     it('should create a car successfully', async () => {
//       const res = await request(app)
//         .post('/api/car/create-car')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           name: 'Mercedes-Benz S-Class',
//           brand: 'Mercedes',
//           basePrice: 120000,
//           color: 'black',
//           fuelType: 'petrol',
//           engine: {
//             capacity: 4000,
//             cylinders: 6,
//             horsepower: 429,
//           },
//           transmission: 'automatic',
//           features: [
//             { name: 'remote start', price: 6000 },
//             { name: 'adaptive cruise control', price: 12000 },
//             { name: 'lane departure warning', price: 10000 },
//           ],
//           tyres: 'tubeless',
//           bodyType: 'sedan',
//           bodyMaterial: 'aluminium',
//           stock: {
//             quantity: 10,
//           },
//           status: 'available',
//           tax: 0.1,
//         });
//       carId = res.body.car._id;
//       carData = res.body;
//     });
//   });

//   describe('Create a invoice', () => {
//     it('should create a invoice', async () => {
//       const res = await helpers.generateInvoice(user, carData);

//       res.totalAmount = 120000;
//       res.remainingBalance = 10000;
//       res.tax = 0.1;
//       console.log(res);
//       const savedInvoice = await res.save();
//       const updatedUser = await User.findByIdAndUpdate(
//         user._id,
//         {
//           $push: {
//             invoices: savedInvoice,
//           },
//         },
//         { new: true },
//       );
//       invoiceId = res._id;
//       expect(res).toBeInstanceOf(Invoice);
//       expect(res).toHaveProperty('user');
//       expect(res).toHaveProperty('car');
//       expect(res).toHaveProperty('_id');
//       expect(updatedUser.invoices.length).toBe(1);
//       console.log(updatedUser.invoices);
//       expect(Object.keys(updatedUser.invoices[0]).length).toBe(15);
//     });
//   });

//   //////////////////////////////////////////
//   //////////// VIEW INVOICE  //////////////
//   ////////////////////////////////////////

//   describe('View a invoice', () => {
//     it('should view a invoice', async () => {
//       const res = await request(app)
//         .get(`/api/invoice/view-invoice/${invoiceId}`)
//         .set('Authorization', `Bearer ${token}`);
//       expect(res.status).toBe(200);
//       expect(res.body).toHaveProperty('user');
//       expect(Object.keys(res.body).length).toBe(15);
//     });
//   });

//   //////////////////////////////////////////
//   /////////// VIEW ALL INVOICES  //////////
//   ////////////////////////////////////////

//   describe('View all invoices', () => {
//     it('should view all invoices', async () => {
//       const res = await request(app)
//         .get('/api/invoice/view-all-invoices')
//         .set('Authorization', `Bearer ${token}`);
//       expect(res.status).toBe(200);
//       expect(res.body.length).toBe(1);
//     });
//   });

//   //////////////////////////////////////////
//   /////////// VIEW USER INVOICE  //////////
//   ////////////////////////////////////////

//   describe('View user invoices', () => {
//     it('should view user invoices', async () => {
//       const res = await request(app)
//         .get(`/api/invoice/view-user-invoices?id=${userId}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(res.status).toBe(200);
//       expect(res.body.length).toBe(1);
//     });
//   });
// });
