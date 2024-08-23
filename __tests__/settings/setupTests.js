const mongoose = require('mongoose');
const logger = require('../../config/winston');

afterAll(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to test database');
    try {
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany();
      }
      logger.info('Database cleared after all tests');
      await mongoose.disconnect();
      logger.info('Disconnected from test database');
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
});

describe('running setupTests', () => {
  it('returns true', () => {
    expect(true).toBe(true);
  });
});
