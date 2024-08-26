// const { app, server } = require('../server');
// const request = require('supertest');

describe('running setupTests', () => {
  it('returns true', () => {
    expect(true).toBe(true);
  });
});

// describe('Car Controller Tests', () => {
//   let adminToken = '';
//   let carId = '';
//   let token = '';

//   //////////////////////////////////////////
//   ////////////// CREATE CAR ///////////////
//   ////////////////////////////////////////

//   describe('Create a user to buy car', () => {
//     it('should register a user with role admin', async () => {
//       const res = await request(app).post('/api/user/register').send({
//         username: 'shaman',
//         email: 'shamangenius@gmail.com',
//         password: 'adminpassword',
//         wallet: 123456789,
//         role: 'admin',
//       });
//       adminToken = res.body.token;
//       expect(res.status).toBe(201);
//       expect(res.body.user.username).toBe('shaman');
//       expect(res.body.user.role).toBe('admin');
//     });

//     it('should register a user with role customer', async () => {
//       const res = await request(app).post('/api/user/register').send({
//         username: 'jude',
//         email: 'jude@gmail.com',
//         password: 'adminpassword',
//       });
//       token = res.body.token;
//       console.log(res.body);
//       expect(res.status).toBe(201);
//       expect(res.body.user.role).toBe('customer');
//       expect(res.body.user.username).toBe('jude');
//     });
//   });

//   describe('Create a Car ', () => {
//     it('should create a car successfully', async () => {
//       const res = await request(app)
//         .post('/api/car/create-car')
//         .set('Authorization', `Bearer ${adminToken}`)
//         .send({
//           name: 'Koenigsegg Regera',
//           brand: 'Koenigsegg',
//           basePrice: 1900000,
//           color: 'silver',
//           fuelType: 'hybrid',
//           engine: {
//             capacity: 5000,
//             cylinders: 8,
//             horsepower: 1500,
//           },
//           transmission: 'automatic',
//           features: [
//             { name: 'adaptive cruise control', price: 12000 },
//             { name: 'navigation system', price: 15000 },
//             { name: 'aerodynamic Kit', price: 25000 },
//             { name: 'lane departure warning', price: 10000 },
//             { name: 'android auto', price: 5000 },
//             { name: 'sunroof', price: 1000 },
//             { name: 'premium sound system', price: 25000 },
//             { name: 'navigation system', price: 15000 },
//           ],
//           tyres: 'tubeless',
//           bodyType: 'coupe',
//           bodyMaterial: 'carbon fiber',
//           stock: {
//             quantity: 5,
//           },
//           status: 'available',
//           tax: 0.12,
//         });
//       carId = res.body.car._id;
//       expect(res.status).toBe(201);
//       expect(res.body.car.name).toBe('Koenigsegg Regera');
//       expect(res.body.car.brand).toBe('Koenigsegg');
//       expect(res.body.car.basePrice).toBe(1900000);
//       expect(res.body.car.features.length).toBe(8);
//       expect(res.body.car.stock.quantity).toBe(5);
//       expect(res.body.sent).toBe(true);
//     });
//   });

//   describe('Create a Car with a customer role user', () => {
//     it('should return 403 for not being admin', async () => {
//       const res = await request(app)
//         .post('/api/car/create-car')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           name: 'Koenigsegg Agera RS',
//           brand: 'Koenigsegg',
//           basePrice: 1900000,
//           color: 'silver',
//           fuelType: 'hybrid',
//           engine: {
//             capacity: 5000,
//             cylinders: 8,
//             horsepower: 1500,
//           },
//           transmission: 'automatic',
//           features: [
//             { name: 'adaptive cruise control', price: 12000 },
//             { name: 'navigation system', price: 15000 },
//             { name: 'aerodynamic Kit', price: 25000 },
//             { name: 'lane departure warning', price: 10000 },
//             { name: 'android auto', price: 5000 },
//             { name: 'sunroof', price: 1000 },
//             { name: 'premium sound system', price: 25000 },
//             { name: 'navigation system', price: 15000 },
//           ],
//           tyres: 'tubeless',
//           bodyType: 'coupe',
//           bodyMaterial: 'carbon fiber',
//           stock: {
//             quantity: 5,
//           },
//           status: 'available',
//           tax: 0.12,
//         });
//       expect(res.status).toBe(403);
//       expect(res.body.error).toBe('Forbidden. Admin access required');
//     });
//   });

//   //////////////////////////////////////////
//   /////////////// VIEW CAR ////////////////
//   ////////////////////////////////////////

//   describe('View a car', () => {
//     it('should view a car by id', async () => {
//       const res = await request(app)
//         .get(`/api/car/view-car/${carId}`)
//         .set('Authorization', `Bearer ${adminToken}`);
//       expect(res.status).toBe(200);
//       expect(res.body.car.name).toBe('Koenigsegg Regera');
//       expect(res.body.car.brand).toBe('Koenigsegg');
//       expect(res.body.car.basePrice).toBe(1900000);
//       expect(res.body.car.features.length).toBe(8);
//     });
//   });

//   //////////////////////////////////////////
//   //////////// VIEW ALL CARS //////////////
//   ////////////////////////////////////////

//   describe('View all cars', () => {
//     it('should view all cars', async () => {
//       const res = await request(app)
//         .get('/api/car/view-all-cars?page=1&limit=4')
//         .set('Authorization', `Bearer ${adminToken}`);
//       expect(res.status).toBe(200);
//       expect(res.body.cars.length).toBeGreaterThan(0);
//     });
//   });

//   /////////////////////////////////////////
//   ////////////// UPDATE CAR //////////////
//   ///////////////////////////////////////

//   describe('Update a car', () => {
//     it('should update a car by id', async () => {
//       const res = await request(app)
//         .put(`/api/car/update-car/${carId}`)
//         .set('Authorization', `Bearer ${adminToken}`)
//         .send({
//           stock: {
//             quantity: 2,
//           },
//           tax: 0.25,
//         });
//       expect(res.status).toBe(200);
//       expect(res.body.car.name).toBe('Koenigsegg Regera');
//       expect(res.body.car.tax).toBe(0.25);
//       expect(res.body.car.stock.quantity).toBe(2);
//     });
//   });

//   /////////////////////////////////////////
//   //////////// SEARCH CAR ////////////////
//   ///////////////////////////////////////

//   describe('Search a car', () => {
//     it('should search for a car by name', async () => {
//       const res = await request(app)
//         .get('/api/car/search-car?q=Koeni')
//         .set('Authorization', `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.length).toBe(1);
//     });
//   });
//   // afterAll((done) => {
//   //   server.close(done);
//   // });
// });
