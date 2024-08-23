const app = require('../config/server');
const request = require('supertest');

let appointmentId;
let token;
let id;

describe('Appointment Controller Tests', () => {
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
