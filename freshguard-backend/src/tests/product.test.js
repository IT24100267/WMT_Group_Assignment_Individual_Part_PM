const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Product = require('../models/Product');

describe('Product API', () => {
  jest.setTimeout(15000);
  
  beforeAll(async () => {
    // Connect to a test database or just wait for the current one
    // In a real scenario, we might use a separate test DB
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should return 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/non-existent-id');
    expect(res.statusCode).toEqual(404);
  });
});
