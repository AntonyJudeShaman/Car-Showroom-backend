const { app, server } = require('../server');
const request = require('supertest');
const helpers = require('../lib/utils');
const Invoice = require('../Model/invoice');
const User = require('../Model/user');

// describe('running setupTests', () => {
//   it('returns true', () => {
//     expect(true).toBe(true);
//   });
// });

describe('Invoice Controller Tests', () => {
  let token = '';
  let userId = '';
  let invoiceId = '';
  let carId = '';
  let carData;
  let user;

  //////////////////////////////////////////
  //////////// CREATE INVOICE /////////////
  ////////////////////////////////////////

  describe('Create a user to create invoice', () => {
    it('should register a user', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'antonyjude',
        email: 'antonyjude@gmail.com',
        password: 'password',
        role: 'admin',
      });
      token = res.body.token;
      userId = res.body.user._id;
      user = res.body.user;
      expect(res.status).toBe(201);
      expect(res.body.user.username).toBe('antonyjude');
      expect(res.body.user.role).toBe('admin');
    });
  });

  describe('Create a Car to create invoice', () => {
    it('should create a car successfully', async () => {
      const res = await request(app)
        .post('/api/car/create-car')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Mercedes-Benz S-Class',
          brand: 'Mercedes',
          basePrice: 120000,
          color: 'black',
          fuelType: 'petrol',
          engine: {
            capacity: 4000,
            cylinders: 6,
            horsepower: 429,
          },
          transmission: 'automatic',
          features: [
            { name: 'remote start', price: 6000 },
            { name: 'adaptive cruise control', price: 12000 },
            { name: 'lane departure warning', price: 10000 },
          ],
          tyres: 'tubeless',
          bodyType: 'sedan',
          bodyMaterial: 'aluminium',
          stock: {
            quantity: 10,
          },
          status: 'available',
          tax: 0.1,
        });
      carId = res.body.car._id;
      carData = res.body;
    });
  });

  describe('Create a invoice', () => {
    it('should create a invoice', async () => {
      const res = await helpers.generateInvoice(user, carData);

      res.totalAmount = 120000;
      res.remainingBalance = 10000;
      res.tax = 0.1;
      console.log(res);
      const savedInvoice = await res.save();
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $push: {
            invoices: savedInvoice,
          },
        },
        { new: true },
      );
      invoiceId = res._id;
      expect(res).toBeInstanceOf(Invoice);
      expect(res).toHaveProperty('user');
      expect(res).toHaveProperty('car');
      expect(res).toHaveProperty('_id');
      expect(updatedUser.invoices.length).toBe(1);
      console.log(updatedUser.invoices);
      expect(Object.keys(updatedUser.invoices[0]).length).toBe(15);
    });
  });

  //////////////////////////////////////////
  //////////// VIEW INVOICE  //////////////
  ////////////////////////////////////////

  describe('View a invoice', () => {
    it('should view a invoice', async () => {
      const res = await request(app)
        .get(`/api/invoice/view-invoice/${invoiceId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(Object.keys(res.body).length).toBe(15);
    });
  });

  //////////////////////////////////////////
  /////////// VIEW ALL INVOICES  //////////
  ////////////////////////////////////////

  describe('View all invoices', () => {
    it('should view all invoices', async () => {
      const res = await request(app)
        .get('/api/invoice/view-all-invoices')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  //////////////////////////////////////////
  /////////// VIEW USER INVOICE  //////////
  ////////////////////////////////////////

  describe('View user invoices', () => {
    it('should view user invoices', async () => {
      const res = await request(app)
        .get(`/api/invoice/view-user-invoices?id=${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });
});

describe('Car Controller Tests', () => {
  let adminToken = '';
  let carId = '';
  let token = '';

  describe('Create a user to buy car', () => {
    it('should register a user with role admin', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'shaman',
        email: 'shamangenius@gmail.com',
        password: 'adminpassword',
        wallet: 123456789,
        role: 'admin',
      });
      adminToken = res.body.token;
      expect(res.status).toBe(201);
      expect(res.body.user.username).toBe('shaman');
      expect(res.body.user.role).toBe('admin');
    });

    it('should register a user with role customer', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'jude',
        email: 'jude@gmail.com',
        password: 'adminpassword',
      });
      token = res.body.token;
      console.log(res.body);
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('customer');
      expect(res.body.user.username).toBe('jude');
    });
  });

  describe('Create a Car ', () => {
    it('should create a car successfully', async () => {
      const res = await request(app)
        .post('/api/car/create-car')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Koenigsegg Regera',
          brand: 'Koenigsegg',
          basePrice: 1900000,
          color: 'silver',
          fuelType: 'hybrid',
          engine: {
            capacity: 5000,
            cylinders: 8,
            horsepower: 1500,
          },
          transmission: 'automatic',
          features: [
            { name: 'adaptive cruise control', price: 12000 },
            { name: 'navigation system', price: 15000 },
            { name: 'aerodynamic Kit', price: 25000 },
            { name: 'lane departure warning', price: 10000 },
            { name: 'android auto', price: 5000 },
            { name: 'sunroof', price: 1000 },
            { name: 'premium sound system', price: 25000 },
            { name: 'navigation system', price: 15000 },
          ],
          tyres: 'tubeless',
          bodyType: 'coupe',
          bodyMaterial: 'carbon fiber',
          stock: {
            quantity: 5,
          },
          status: 'available',
          tax: 0.12,
        });
      carId = res.body.car._id;
      expect(res.status).toBe(201);
      expect(res.body.car.name).toBe('Koenigsegg Regera');
      expect(res.body.car.brand).toBe('Koenigsegg');
      expect(res.body.car.basePrice).toBe(1900000);
      expect(res.body.car.features.length).toBe(8);
      expect(res.body.car.stock.quantity).toBe(5);
      expect(res.body.sent).toBe(true);
    });
  });

  describe('Create a Car with a customer role user', () => {
    it('should return 403 for not being admin', async () => {
      const res = await request(app)
        .post('/api/car/create-car')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Koenigsegg Agera RS',
          brand: 'Koenigsegg',
          basePrice: 1900000,
          color: 'silver',
          fuelType: 'hybrid',
          engine: {
            capacity: 5000,
            cylinders: 8,
            horsepower: 1500,
          },
          transmission: 'automatic',
          features: [
            { name: 'adaptive cruise control', price: 12000 },
            { name: 'navigation system', price: 15000 },
            { name: 'aerodynamic Kit', price: 25000 },
            { name: 'lane departure warning', price: 10000 },
            { name: 'android auto', price: 5000 },
            { name: 'sunroof', price: 1000 },
            { name: 'premium sound system', price: 25000 },
            { name: 'navigation system', price: 15000 },
          ],
          tyres: 'tubeless',
          bodyType: 'coupe',
          bodyMaterial: 'carbon fiber',
          stock: {
            quantity: 5,
          },
          status: 'available',
          tax: 0.12,
        });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden. Admin access required');
    });
  });

  describe('View a car', () => {
    it('should view a car by id', async () => {
      const res = await request(app)
        .get(`/api/car/view-car/${carId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.car.name).toBe('Koenigsegg Regera');
      expect(res.body.car.brand).toBe('Koenigsegg');
      expect(res.body.car.basePrice).toBe(1900000);
      expect(res.body.car.features.length).toBe(8);
    });
  });

  describe('View all cars', () => {
    it('should view all cars', async () => {
      const res = await request(app)
        .get('/api/car/view-all-cars')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.cars.length).toBeGreaterThan(0);
    });
  });

  describe('Update a car', () => {
    it('should update a car by id', async () => {
      const res = await request(app)
        .put(`/api/car/update-car/${carId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          stock: {
            quantity: 2,
          },
          tax: 0.25,
        });
      expect(res.status).toBe(200);
      expect(res.body.car.name).toBe('Koenigsegg Regera');
      expect(res.body.car.tax).toBe(0.25);
      expect(res.body.car.stock.quantity).toBe(2);
    });
  });

  // afterAll((done) => {
  //   server.close(done);
  // });
});

describe('Payment Controller Tests', () => {
  let token = '';
  let userId = '';
  let paymentId = '';
  let carId = '';

  //////////////////////////////////////////
  //////////// CREATE PAYMENT /////////////
  ////////////////////////////////////////

  describe('Create a user to create payment', () => {
    it('should register a user with role admin', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'antony',
        email: 'starkshaman30@gmail.com',
        password: 'adminpassword',
        wallet: 123456789,
        role: 'admin',
      });
      token = res.body.token;
      userId = res.body.user._id;
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('admin');
    });
  });

  describe('Create a Car to create payment', () => {
    it('should create a car successfully', async () => {
      const res = await request(app)
        .post('/api/car/create-car')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Lamborghini Aventador',
          brand: 'Lamborghini',
          basePrice: 393695,
          color: 'yellow',
          fuelType: 'petrol',
          engine: {
            capacity: 6500,
            cylinders: 12,
            horsepower: 730,
          },
          transmission: 'automatic',
          features: [
            {
              name: 'aerodynamic Kit',
              price: 25000,
            },
          ],
          tyres: 'tubeless',
          bodyType: 'coupe',
          bodyMaterial: 'carbon fiber',
          stock: {
            quantity: 5,
          },
          status: 'available',
          tax: 0.25,
        });
      carId = res.body.car._id;
    });
  });

  describe('Create a payment', () => {
    it('should create a payment', async () => {
      const res = await request(app)
        .post('/api/payment/create-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: userId,
          car: carId,
          invoice: '123456789012345678901234',
          paymentMethod: 'UPI',
          amount: 123456,
          status: 'completed',
          transactionId: helpers.generateTransactionId('AJS'),
        });
      paymentId = res.body._id;
      expect(res.status).toBe(201);
      expect(res.body.user).toBe(userId);
    });
  });

  //////////////////////////////////////////
  //////////// VERIFY PAYMENT  ////////////
  ////////////////////////////////////////

  describe('Verify a payment', () => {
    it('should verify a payment', async () => {
      const res = await request(app)
        .post('/api/payment/verify-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: paymentId,
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Appointment Controller Tests', () => {
  // beforeEach(async () => {
  //   server.close();
  //   server.listen(3000);
  //   console.log('beforeEach appointment tests');
  // });

  // afterEach(async () => {
  //   server.close();
  //   console.log('afterEach appointment tests');
  // });

  let appointmentId;
  let token;
  let id;

  describe('Create a user to create appointment', () => {
    it('should create a user', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'appointmentuser',
        email: 'appointmentuser@gmail.com',
        password: 'password',
      });
      token = res.body.token;
      id = res.body.user._id;
    });
  });

  ///////////////////////////////////////
  //////// CREATE APPOINTMENT //////////
  /////////////////////////////////////

  describe('Create Appointment', () => {
    it('should create an appointment', async () => {
      const res = await request(app)
        .post('/api/appointment/create-appointment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '24/08/2024',
          startTime: '10:00',
          endTime: '11:00',
        });
      appointmentId = res.body.appointment._id;
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('appointment');
      expect(res.body.appointment.date).toBe('24/08/2024');
    });

    it('should return 400', async () => {
      const res = await request(app)
        .post('/api/appointment/create-appointment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '24/08/2024',
          startTime: '10:00',
          endTime: '11:00',
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Slot not available. Please choose another slot');
    });

    it('should return an appointment', async () => {
      const res = await request(app)
        .get(`/api/appointment/view-appointment/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.date).toBe('24/08/2024');
    });
  });

  /////////////////////////////////////////
  //////// VIEW APPOINTMENT BY ID ////////
  ///////////////////////////////////////

  describe('Cancel Appointment', () => {
    it('should cancel an appointment', async () => {
      const res = await request(app)
        .get(`/api/appointment/cancel-appointment?id=${appointmentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Appointment Cancelled');
    });

    it('should return 404', async () => {
      const res = await request(app)
        .get(`/api/appointment/cancel-appointment?id=123456789012345678901234`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Appointment not found');
    });
  });

  /////////////////////////////////////////
  //////// VIEW ALL APPOINTMENTS /////////
  ///////////////////////////////////////

  describe('View All Appointments', () => {
    it('should create an appointment', async () => {
      const res = await request(app)
        .post('/api/appointment/create-appointment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '25/08/2024',
          startTime: '10:00',
          endTime: '11:00',
        });
      appointmentId = res.body.appointment._id;
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('appointment');
      expect(res.body.appointment.date).toBe('25/08/2024');
    });

    it('should return all appointments', async () => {
      const res = await request(app)
        .get('/api/appointment/view-all-appointments')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  /////////////////////////////////////////
  ////////// UPDATE APPOINTMENT //////////
  ///////////////////////////////////////

  describe('Update Appointment', () => {
    it('should update an appointment', async () => {
      const res = await request(app)
        .put(`/api/appointment/update-appointment/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '26/08/2024',
          startTime: '10:00',
          endTime: '11:00',
        });
      expect(res.status).toBe(200);
      expect(res.body.date).toBe('26/08/2024');
    });
  });

  /////////////////////////////////////////
  ////////// SEARCH APPOINTMENT //////////
  ///////////////////////////////////////

  describe('Search Appointment', () => {
    it('should search for an appointment based on status', async () => {
      const res = await request(app)
        .get(`/api/appointment/search-appointment?q=sche`)
        .set('Authorization', `Bearer ${token}`)
        .query('schedu');
      expect(res.status).toBe(200);
    });

    it('should search for an appointment based on date', async () => {
      const res = await request(app)
        .get(`/api/appointment/search-appointment?q=26/08`)
        .set('Authorization', `Bearer ${token}`)
        .query('schedu');
      expect(res.status).toBe(200);
    });

    it('should return 400', async () => {
      const res = await request(app)
        .get('/api/appointment/search-appointment')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No search query');
    });

    it('should return 404', async () => {
      const res = await request(app)
        .get('/api/appointment/search-appointment?q=hello')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('No results found for the query');
    });
  });
});

describe('User Controller Tests', () => {
  /////////////////////////////////////////////////
  /////////////// REGISTER MODULE ////////////////
  ///////////////////////////////////////////////

  // beforeEach(async () => {
  //   server.close();
  //   server.listen(3000);
  //   console.log('beforeEach user tests');
  // });

  let token = '';
  let token2 = '';
  let userId = '';
  let adminToken = '';
  let deleteToken = '';
  let searchToken = '';
  let carId = '';
  let buyToken = '';
  let noBuyToken = '';
  let carData;
  describe('Register Module', () => {
    it('should register a user successfully', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'testuser',
        email: 'test@gmail.com',
        password: 'testpassword',
        address: 'testaddress',
        phone: 1234567890,
        wallet: 12000322,
        role: 'customer',
      });
      token = res.body.token;
      userId = res.body.user._id;
      console.log(userId);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.email).toBe('test@gmail.com');
    });
    it('should register a user with admin role', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'adminuser',
        email: 'antonyjudeshaman@gmail.com',
        password: 'adminpassword',
        role: 'admin',
      });
      adminToken = res.body.token;
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('admin');
    });
    it('should register a user with default role when role is not provided', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'testuser2',
        email: 'test2@gmail.com',
        password: 'testpassword2',
        address: 'testaddress2',
        phone: 1234567890,
        wallet: 1205322,
      });
      token2 = res.body.token;
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('customer');
    });
    it('should not register a user with an existing username', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'testuser',
        email: 'testuser3@gmail.com',
        password: 'testpassword',
        address: 'testaddress',
        phone: 1234567890,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
    it('should not register a user with an existing email', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'testuser3',
        email: 'test@gmail.com',
        password: 'testpassword',
        address: 'testaddress',
        phone: 1234567890,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
    it('should not register a user with invalid email format', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'testuser3',
        email: 'invalidemail',
        password: 'testpassword',
        address: 'testaddress',
        phone: 1234567890,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('details');
    });
  });
  ///////////////////////////////////////////////
  ///////////// LOGIN MODULE ///////////////////
  /////////////////////////////////////////////
  describe('Login Module', () => {
    it('should login a user with correct credentials', async () => {
      const res = await request(app).post('/api/user/login').send({
        credential: 'testuser',
        password: 'testpassword',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });
    it('should login a user with email as credential', async () => {
      const res = await request(app).post('/api/user/login').send({
        credential: 'test@gmail.com',
        password: 'testpassword',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });
    it('should not login a user with incorrect password', async () => {
      const res = await request(app).post('/api/user/login').send({
        credential: 'testuser',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
    it('should not login a non-existent user', async () => {
      const res = await request(app).post('/api/user/login').send({
        credential: 'nonexistentuser',
        password: 'testpassword',
      });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
  /////////////////////////////////////////////////
  /////////////// UPDATE USER MODULE /////////////
  ///////////////////////////////////////////////
  describe('Update User Module', () => {
    it('should update user address', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: 'newaddress',
        });
      expect(res.status).toBe(200);
      expect(res.body.user.address).toBe('newaddress');
    });
    it('should update user phone', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          phone: 9876543210,
        });
      expect(res.status).toBe(200);
      expect(res.body.user.phone).toBe(9876543210);
    });
    it('should not update user role', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'admin',
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
    it('should not update user username', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newusername',
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
    it('should not update user with invalid email', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'iaminvalid',
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('details');
    });
    it('should not update user without authentication', async () => {
      const res = await request(app).put('/api/user/update-user').send({
        address: 'newaddress',
      });
      expect(res.status).toBe(401);
    });
  });
  /////////////////////////////////////////////////
  /////////////// VIEW ALL USERS MODULE //////////
  ///////////////////////////////////////////////
  describe('View All Users Module', () => {
    it('should allow admin to view all users', async () => {
      const res = await request(app)
        .get('/api/user/view-all-users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
    it('should not allow non-admin users to view all users', async () => {
      const res = await request(app)
        .get('/api/user/view-all-users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });
  /////////////////////////////////////////////////
  /////////////// VERIFY TOKEN MODULE ////////////
  ///////////////////////////////////////////////
  describe('Verify Token Module', () => {
    it('should return user data for valid token', async () => {
      const res = await request(app)
        .post('/api/user/verify-user')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username');
    });
    it('should return unauthorized for invalid token', async () => {
      const res = await request(app)
        .post('/api/user/verify-user')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
    });
  });
  /////////////////////////////////////////////////
  /////////////// VIEW USER MODULE ///////////////
  ///////////////////////////////////////////////
  describe('View User Module', () => {
    it('should return user data for valid user ID', async () => {
      const res = await request(app)
        .get(`/api/user/view-user/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username');
    });
    it('should return not found for invalid user ID', async () => {
      const res = await request(app)
        .get('/api/user/view-user/123456789012345678901234')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
    it('should return bad request for malformed user ID', async () => {
      const res = await request(app)
        .get('/api/user/view-user/invalidid')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });
  /////////////////////////////////////////////////
  /////////////// DELETE USER MODULE /////////////
  ///////////////////////////////////////////////
  describe('Delete User Module', () => {
    let id = '';
    describe('create a user to delete', () => {
      it('should register a user successfully', async () => {
        const res = await request(app).post('/api/user/register').send({
          username: 'deleteuser',
          email: 'deleteuser@gmail.com',
          password: 'deletepassword',
        });
        id = res.body.user._id;
        deleteToken = res.body.token;
      });
    });
    it('should allow admin to delete any user', async () => {
      const res = await request(app)
        .delete(`/api/user/delete-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('User deleted successfully');
    });
    //////////////////////////////
    it('should allow user to delete their own account', async () => {
      const res = await request(app)
        .delete(`/api/user/delete-user/${id}`)
        .set('Authorization', `Bearer ${deleteToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('User deleted successfully');
    });
    //////////////////////////////
    it('should not allow user to delete another user account', async () => {
      const anotherUser = await request(app).post('/api/user/register').send({
        username: 'anotheruser',
        email: 'another@gmail.com',
        password: 'anotherpassword',
      });
      const anotherId = anotherUser.body.user._id;
      const res = await request(app)
        .delete(`/api/user/delete-user/${anotherId}`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Forbidden. Admin access required. Cannot delete another user');
    });
    it('should return not found for deleting non-existent user', async () => {
      const res = await request(app)
        .delete('/api/user/delete-user/123456789012345678901234')
        .set('Authorization', `Bearer ${token2}`);
      expect(res.status).toBe(404);
    });
  });
  describe('Logout Module', () => {
    it('should logout user successfully', async () => {
      const res = await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });
  /////////////////////////////////////////////////////////
  //////////////// SEARCH USER MODULE ////////////////////
  ///////////////////////////////////////////////////////
  describe('Search User Module', () => {
    describe('Create a user to search', () => {
      it('should register a user successfully', async () => {
        const res = await request(app).post('/api/user/register').send({
          username: 'searchuser',
          email: 'searchuser@gmail.com',
          password: 'password',
          wallet: 12323977,
        });
        searchToken = res.body.token;
      });
    });
    it('should return users when given a valid search query', async () => {
      const res = await request(app)
        .get('/api/user/search-user?q=sear')
        .set('Authorization', `Bearer ${searchToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('username', 'searchuser');
      expect(res.body[0]).toHaveProperty('email', 'searchuser@gmail.com');
    });
    it('should return 400 if no search query is provided', async () => {
      const res = await request(app)
        .get('/api/user/search-user')
        .set('Authorization', `Bearer ${searchToken}`);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
    it('should return 404 if no users are found', async () => {
      const res = await request(app)
        .get('/api/user/search-user?q=noresult')
        .set('Authorization', `Bearer ${searchToken}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
  /////////////////////////////////////////////////////////
  //////////////// BUY CAR MODULE ////////////////////////
  ///////////////////////////////////////////////////////
  describe('Buy Car Module', () => {
    describe('Create a user to buy a car', () => {
      describe('User with enough balance', () => {
        it('should register a user successfully', async () => {
          const res = await request(app).post('/api/user/register').send({
            username: 'carbuyer',
            email: 'carbuyer@gmail.com',
            password: 'password',
            wallet: 12323977,
          });
          buyToken = res.body.token;
          userId = res.body.user._id;
          console.log('wallet', res.body.user.wallet);
        });
      });
      describe('User with insufficient balance', () => {
        it('should register a user successfully', async () => {
          const res = await request(app).post('/api/user/register').send({
            username: 'poorbuyer',
            email: 'poorbuyer@gmail.com',
            password: 'password',
            wallet: 100,
          });
          noBuyToken = res.body.token;
        });
      });
    });
    describe('Create a car to buy', () => {
      it('should create a car successfully', async () => {
        const res = await request(app)
          .post('/api/car/create-car')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Ferrari SF90 Stradale',
            brand: 'Ferrari',
            basePrice: 507300,
            color: 'red',
            fuelType: 'hybrid',
            engine: {
              capacity: 4000,
              cylinders: 8,
              horsepower: 986,
            },
            transmission: 'automatic',
            features: [
              { name: 'lane departure warning', price: 10000 },
              { name: 'android auto', price: 5000 },
              { name: 'sunroof', price: 1000 },
              { name: 'premium sound system', price: 25000 },
              { name: 'navigation system', price: 15000 },
              { name: 'adaptive cruise control', price: 12000 },
            ],
            tyres: 'tubeless',
            bodyType: 'coupe',
            bodyMaterial: 'carbon fiber',
            stock: {
              quantity: 1,
            },
            status: 'available',
            tax: 0.12,
          });
        console.log('car', res.body);
        carId = res.body.car._id;
        carData = res.body.car;
      });
    });
    describe('Buy Car with various scenarios', () => {
      it('should fail and return 400 if user has insufficient balance', async () => {
        const res = await request(app)
          .post('/api/user/buy-car')
          .set('Authorization', `Bearer ${noBuyToken}`)
          .send({
            id: carId,
            features: ['android auto'],
            paymentDetails: { method: 'credit_card' },
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Insufficient balance in your wallet');
      });
      it('should buy a car successfully', async () => {
        const res = await request(app)
          .post('/api/user/buy-car')
          .set('Authorization', `Bearer ${buyToken}`)
          .send({
            id: carId,
            features: [
              'android auto',
              'lane departure warning',
              'premium sound system',
              'navigation system',
              'sunroof',
            ],
            paymentDetails: { method: 'credit_card' },
          });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('invoice');
        expect(res.body).toHaveProperty('car');
        expect(res.body.invoice).toHaveProperty('user');
        expect(res.body.invoice).toHaveProperty('car');
        expect(res.body.payment).toHaveProperty('status', 'completed');
        expect(res.body).toHaveProperty('totalPrice');
      });
      it('should return 400 for missing payment details', async () => {
        const res = await request(app)
          .post('/api/user/buy-car')
          .set('Authorization', `Bearer ${buyToken}`)
          .send({
            id: carId,
            features: ['android auto'],
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Missing payment details');
      });
      it('should return 400 for invalid payment details', async () => {
        const res = await request(app)
          .post('/api/user/buy-car')
          .set('Authorization', `Bearer ${noBuyToken}`)
          .send({
            id: carId,
            features: ['android auto', 'navigation system', 'sunroof'],
            paymentDetails: { method: 'not-valid' },
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid payment details');
      });
      it('should return 400 for car out of stock', async () => {
        const res = await request(app)
          .post('/api/user/buy-car')
          .set('Authorization', `Bearer ${buyToken}`)
          .send({
            id: carId,
            features: ['android auto'],
            paymentDetails: { method: 'debit_card' },
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Car is out of stock');
      });
      it('should return 404 for car not found', async () => {
        const res = await request(app)
          .post('/api/user/buy-car')
          .set('Authorization', `Bearer ${buyToken}`)
          .send({
            id: '123456789012345678901234',
            features: ['android auto'],
            paymentDetails: { method: 'UPI' },
          });
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Car not found');
      });
    });
  });
  //////////////////////////////////////////////////
  ////////// VIEW CAR COLLECTION MODULE ///////////
  ////////////////////////////////////////////////
  describe('View Car Collection Module', () => {
    it('should return 200 and all cars in the collection', async () => {
      const res = await request(app)
        .get(`/api/user/view-car-collection?id=${userId}`)
        .set('Authorization', `Bearer ${buyToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('cars');
    });
    it('should return 404 for non-existent user ID', async () => {
      const res = await request(app)
        .get('/api/user/view-car-collection?id=123456789012345678901234')
        .set('Authorization', `Bearer ${buyToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
    it('should return 400 for missing user ID', async () => {
      const res = await request(app)
        .get('/api/user/view-car-collection')
        .set('Authorization', `Bearer ${buyToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid ID');
    });
  });
  //////////////////////////////////////////////////
  /////////////// SUBSCRIBE MODULE ////////////////
  ////////////////////////////////////////////////
  describe('Subscribe Module', () => {
    it('should subscribe a user successfully', async () => {
      const res = await request(app)
        .get('/api/user/subscribe')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'User subscribed successfully');
    });
    it('should subscribe a user successfully', async () => {
      const res = await request(app)
        .get('/api/user/subscribe')
        .set('Authorization', `Bearer ${buyToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'User subscribed successfully');
    });
    it('should return 400 for already subscribed user', async () => {
      const res = await request(app)
        .get('/api/user/subscribe')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Already subscribed');
    });
  });
  //////////////////////////////////////////////////
  /////////////// UNSUBSCRIBE MODULE //////////////
  ////////////////////////////////////////////////
  describe('Unsubscribe Module', () => {
    it('should unsubscribe a user successfully', async () => {
      const res = await request(app)
        .get('/api/user/unsubscribe')
        .set('Authorization', `Bearer ${buyToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'User unsubscribed successfully');
    });
    it('should return 400 for already unsubscribed user', async () => {
      const res = await request(app)
        .get('/api/user/unsubscribe')
        .set('Authorization', `Bearer ${buyToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No active subscription found');
    });
  });
  //////////////////////////////////////////////////
  /////////// SEND NOTIFICATION MODULE ////////////
  ////////////////////////////////////////////////
  describe('Send Notification Module', () => {
    it('should send notification to subscribed users', async () => {
      const res = await request(app)
        .post('/api/user/send-notification')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(carData);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Notification sent successfully');
    });
    describe('Unsubscribe user to test no subscribed users', () => {
      it('should unsubscribe a user successfully', async () => {
        const res = await request(app)
          .get('/api/user/unsubscribe')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User unsubscribed successfully');
      });
    });
    it('should return 404 for no subscribed users', async () => {
      const res = await request(app)
        .post('/api/user/send-notification')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(carData);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('No subscribed users found');
    });
  });
});
