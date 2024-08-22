const app = require('../server');
const request = require('supertest');

let token = '';

describe('User Register Module', () => {
  it('should register a user', async () => {
    const res = await request(app).post('/api/user/register').send({
      username: 'testuser',
      email: 'test@gmail.com',
      password: 'testpassword',
      address: 'testaddress',
      phone: '1234567890',
      wallet: 12000322,
      role: 'customer',
    });
    token = res.body.token;
    expect(res).toBeDefined();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('should register another user without role', async () => {
    const res = await request(app).post('/api/user/register').send({
      username: 'testuser2',
      email: 'test2@gmail.com',
      password: 'testpassword2',
      address: 'testaddress2',
      phone: '1234567890',
      wallet: 1205322,
    });
    expect(res).toBeDefined();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('should register user as admin', async () => {
    const res = await request(app).post('/api/user/register').send({
      username: 'testuser3',
      email: 'test3@gmail.com',
      password: 'testpassword3',
      address: 'testaddress3',
      phone: '1234567890',
      wallet: 345300322,
      role: 'admin',
    });

    expect(res).toBeDefined();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  describe('user already exists', () => {
    it('should return 400', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: 'testuser',
        email: 'test@gmail.com',
        password: 'testpassword',
      });
      expect(res).toBeDefined();
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('empty fields', () => {
    it('should return 400', async () => {
      const res = await request(app).post('/api/user/register').send({
        username: '',
        email: '',
        password: 'testpassword',
      });
      expect(res).toBeDefined();
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('details');
    });
  });
});

describe('User Login Module', () => {
  it('should login a user', async () => {
    const res = await request(app).post('/api/user/login').send({
      credential: 'testuser',
      password: 'testpassword',
    });
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('should return 404 for wrong password', async () => {
    const res = await request(app).post('/api/user/login').send({
      credential: 'testuser',
      password: 'password',
    });
    expect(res).toBeDefined();
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 404 for user not found', async () => {
    const res = await request(app).post('/api/user/login').send({
      credential: 'wrong',
      password: 'testpassword',
    });
    expect(res).toBeDefined();
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid username', async () => {
    const res = await request(app).post('/api/user/login').send({
      credential: 'abc',
      password: 'testpassword',
    });
    expect(res).toBeDefined();
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('details');
  });

  it('should return 400 for empty password', async () => {
    const res = await request(app).post('/api/user/login').send({
      credential: 'testuser',
      password: '',
    });
    expect(res).toBeDefined();
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('details');
  });
});

describe('User Update Module', () => {
  it('should update user address', async () => {
    const res = await request(app)
      .put('/api/user/update-user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: 'newaddress',
      });
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
  });

  describe('try to change role of user', () => {
    it('should return 400', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'admin',
        });
      expect(res).toBeDefined();
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('try to change username of user', () => {
    it('should return 400', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newusername',
        });
      expect(res).toBeDefined();
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('send empty email', () => {
    it('should return 400', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: '',
        });
      expect(res).toBeDefined();
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('details');
    });
  });

  describe('send invalid email', () => {
    it('should return 400', async () => {
      const res = await request(app)
        .put('/api/user/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'test',
        });
      expect(res).toBeDefined();
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('details');
    });
  });
});
