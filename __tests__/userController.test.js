const app = require('../server');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const userServices = require('../Services/userServices');

let token = '';
let token2 = '';
let userId = '';
let adminToken = '';
let deleteToken = '';
let searchToken = '';
let carId = '';
let buyToken = '';

describe('User Controller Tests', () => {
  /////////////////////////////////////////////////
  /////////////// REGISTER MODULE ////////////////
  ///////////////////////////////////////////////

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
        email: 'admin@gmail.com',
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

  /////////////////////////////////////////////////
  /////////////// LOGIN MODULE ///////////////////
  ///////////////////////////////////////////////

  // describe('Login Module', () => {
  //   it('should login a user with correct credentials', async () => {
  //     const res = await request(app).post('/api/user/login').send({
  //       credential: 'testuser',
  //       password: 'testpassword',
  //     });
  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('user');
  //     expect(res.body).toHaveProperty('token');
  //   });

  //   it('should login a user with email as credential', async () => {
  //     const res = await request(app).post('/api/user/login').send({
  //       credential: 'test@gmail.com',
  //       password: 'testpassword',
  //     });
  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('user');
  //     expect(res.body).toHaveProperty('token');
  //   });

  //   it('should not login a user with incorrect password', async () => {
  //     const res = await request(app).post('/api/user/login').send({
  //       credential: 'testuser',
  //       password: 'wrongpassword',
  //     });
  //     expect(res.status).toBe(404);
  //     expect(res.body).toHaveProperty('error');
  //   });

  //   it('should not login a non-existent user', async () => {
  //     const res = await request(app).post('/api/user/login').send({
  //       credential: 'nonexistentuser',
  //       password: 'testpassword',
  //     });
  //     expect(res.status).toBe(404);
  //     expect(res.body).toHaveProperty('error');
  //   });
  // });

  // /////////////////////////////////////////////////
  // /////////////// UPDATE USER MODULE /////////////
  // ///////////////////////////////////////////////

  // describe('Update User Module', () => {
  //   it('should update user address', async () => {
  //     const res = await request(app)
  //       .put('/api/user/update-user')
  //       .set('Authorization', `Bearer ${token}`)
  //       .send({
  //         address: 'newaddress',
  //       });
  //     expect(res.status).toBe(200);
  //     expect(res.body.user.address).toBe('newaddress');
  //   });

  //   it('should update user phone', async () => {
  //     const res = await request(app)
  //       .put('/api/user/update-user')
  //       .set('Authorization', `Bearer ${token}`)
  //       .send({
  //         phone: 9876543210,
  //       });
  //     expect(res.status).toBe(200);
  //     expect(res.body.user.phone).toBe(9876543210);
  //   });

  //   it('should not update user role', async () => {
  //     const res = await request(app)
  //       .put('/api/user/update-user')
  //       .set('Authorization', `Bearer ${token}`)
  //       .send({
  //         role: 'admin',
  //       });
  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('error');
  //   });

  //   it('should not update user username', async () => {
  //     const res = await request(app)
  //       .put('/api/user/update-user')
  //       .set('Authorization', `Bearer ${token}`)
  //       .send({
  //         username: 'newusername',
  //       });
  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('error');
  //   });

  //   it('should not update user with invalid email', async () => {
  //     const res = await request(app)
  //       .put('/api/user/update-user')
  //       .set('Authorization', `Bearer ${token}`)
  //       .send({
  //         email: 'iaminvalid',
  //       });
  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('details');
  //   });

  //   it('should not update user without authentication', async () => {
  //     const res = await request(app).put('/api/user/update-user').send({
  //       address: 'newaddress',
  //     });
  //     expect(res.status).toBe(401);
  //   });
  // });

  // /////////////////////////////////////////////////
  // /////////////// VIEW ALL USERS MODULE //////////
  // ///////////////////////////////////////////////

  // describe('View All Users Module', () => {
  //   it('should allow admin to view all users', async () => {
  //     const res = await request(app)
  //       .get('/api/user/view-all-users')
  //       .set('Authorization', `Bearer ${adminToken}`);
  //     expect(res.status).toBe(200);
  //     expect(Array.isArray(res.body)).toBeTruthy();
  //   });

  //   it('should not allow non-admin users to view all users', async () => {
  //     const res = await request(app)
  //       .get('/api/user/view-all-users')
  //       .set('Authorization', `Bearer ${token}`);
  //     expect(res.status).toBe(403);
  //   });
  // });

  // /////////////////////////////////////////////////
  // /////////////// VERIFY TOKEN MODULE ////////////
  // ///////////////////////////////////////////////

  // describe('Verify Token Module', () => {
  //   it('should return user data for valid token', async () => {
  //     const res = await request(app)
  //       .post('/api/user/verify-user')
  //       .set('Authorization', `Bearer ${token}`);
  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('_id');
  //     expect(res.body).toHaveProperty('username');
  //   });

  //   it('should return unauthorized for invalid token', async () => {
  //     const res = await request(app)
  //       .post('/api/user/verify-user')
  //       .set('Authorization', 'Bearer token');
  //     expect(res.status).toBe(500);
  //   });
  // });

  // /////////////////////////////////////////////////
  // /////////////// VIEW USER MODULE ///////////////
  // ///////////////////////////////////////////////

  // describe('View User Module', () => {
  //   it('should return user data for valid user ID', async () => {
  //     const res = await request(app)
  //       .get(`/api/user/view-user/${userId}`)
  //       .set('Authorization', `Bearer ${token}`);
  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('_id');
  //     expect(res.body).toHaveProperty('username');
  //   });

  //   it('should return not found for invalid user ID', async () => {
  //     const res = await request(app)
  //       .get('/api/user/view-user/123456789012345678901234')
  //       .set('Authorization', `Bearer ${token}`);
  //     expect(res.status).toBe(404);
  //   });

  //   it('should return bad request for malformed user ID', async () => {
  //     const res = await request(app)
  //       .get('/api/user/view-user/invalidid')
  //       .set('Authorization', `Bearer ${token}`);
  //     expect(res.status).toBe(400);
  //   });
  // });

  // /////////////////////////////////////////////////
  // /////////////// DELETE USER MODULE /////////////
  // ///////////////////////////////////////////////

  // describe('Delete User Module', () => {
  //   let id = '';

  //   describe('create a user to delete', () => {
  //     it('should register a user successfully', async () => {
  //       const res = await request(app).post('/api/user/register').send({
  //         username: 'deleteuser',
  //         email: 'deleteuser@gmail.com',
  //         password: 'deletepassword',
  //       });
  //       id = res.body.user._id;
  //       deleteToken = res.body.token;
  //     });
  //   });

  //   it('should allow admin to delete any user', async () => {
  //     const res = await request(app)
  //       .delete(`/api/user/delete-user/${userId}`)
  //       .set('Authorization', `Bearer ${adminToken}`);
  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('message');
  //     expect(res.body.message).toBe('User deleted successfully');
  //   });
  //   //////////////////////////////

  //   it('should allow user to delete their own account', async () => {
  //     const res = await request(app)
  //       .delete(`/api/user/delete-user/${id}`)
  //       .set('Authorization', `Bearer ${deleteToken}`);
  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('message');
  //     expect(res.body.message).toBe('User deleted successfully');
  //   });
  //   //////////////////////////////

  //   it('should not allow user to delete another user account', async () => {
  //     const anotherUser = await request(app).post('/api/user/register').send({
  //       username: 'anotheruser',
  //       email: 'another@gmail.com',
  //       password: 'anotherpassword',
  //     });
  //     const anotherId = anotherUser.body.user._id;

  //     const res = await request(app)
  //       .delete(`/api/user/delete-user/${anotherId}`)
  //       .set('Authorization', `Bearer ${token2}`);
  //     expect(res.status).toBe(403);
  //     expect(res.body).toHaveProperty('error');
  //     expect(res.body.error).toBe('Forbidden. Admin access required. Cannot delete another user');
  //   });

  //   it('should return not found for deleting non-existent user', async () => {
  //     const res = await request(app)
  //       .delete('/api/user/delete-user/123456789012345678901234')
  //       .set('Authorization', `Bearer ${token2}`);
  //     expect(res.status).toBe(404);
  //   });
  // });

  // describe('Logout Module', () => {
  //   it('should logout user successfully', async () => {
  //     const res = await request(app)
  //       .post('/api/user/logout')
  //       .set('Authorization', `Bearer ${adminToken}`);
  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('message');
  //   });
  // });

  // /////////////////////////////////////////////////////////
  // //////////////// SEARCH USER MODULE ////////////////////
  // ///////////////////////////////////////////////////////

  // describe('Search User Module', () => {
  //   describe('Create a user to search', () => {
  //     it('should register a user successfully', async () => {
  //       const res = await request(app).post('/api/user/register').send({
  //         username: 'searchuser',
  //         email: 'searchuser@gmail.com',
  //         password: 'password',
  //         wallet: 12323977,
  //       });
  //       searchToken = res.body.token;
  //     });
  //   });

  //   it('should return users when given a valid search query', async () => {
  //     const res = await request(app)
  //       .get('/api/user/search-user?q=sear')
  //       .set('Authorization', `Bearer ${searchToken}`);

  //     expect(res.status).toBe(200);
  //     expect(Array.isArray(res.body)).toBeTruthy();
  //     expect(res.body[0]).toHaveProperty('username', 'searchuser');
  //     expect(res.body[0]).toHaveProperty('email', 'searchuser@gmail.com');
  //   });

  //   it('should return 400 if no search query is provided', async () => {
  //     const res = await request(app)
  //       .get('/api/user/search-user')
  //       .set('Authorization', `Bearer ${searchToken}`);

  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('error');
  //   });

  //   it('should return 404 if no users are found', async () => {
  //     const res = await request(app)
  //       .get('/api/user/search-user?q=noresult')
  //       .set('Authorization', `Bearer ${searchToken}`);

  //     expect(res.status).toBe(404);
  //     expect(res.body).toHaveProperty('error');
  //   });
  // });

  /////////////////////////////////////////////////////////
  //////////////// BUY CAR MODULE ////////////////////////
  ///////////////////////////////////////////////////////

  describe('Buy Car Module', () => {
    describe('Create a user to buy a car', () => {
      it('should register a user successfully', async () => {
        const res = await request(app).post('/api/user/register').send({
          username: 'caruser',
          email: 'caruser@gmail.com',
          password: 'password',
          wallet: 12323977,
        });
        console.log(res.body.user._id);
        buyToken = res.body.token;
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
            ],
            tyres: 'tubeless',
            bodyType: 'coupe',
            bodyMaterial: 'carbon fiber',
            stock: {
              quantity: 9,
            },
            status: 'available',
            tax: 0.12,
          });
        carId = res.body.car._id;
      });
    });
    describe('Buy Car with various scenarios', () => {
      it('should fail if user has insufficient balance', async () => {
        const res = await request(app)
          .post('/api/user/buy-car')
          .set('Authorization', `Bearer ${buyToken}`)
          .send({
            id: carId,
            features: ['android auto'],
            paymentDetails: { method: 'credit_card' },
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('INSUFFICIENT_BALANCE');
      });
    });
  });
});
