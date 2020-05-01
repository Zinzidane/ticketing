import request from 'supertest';
import { app } from '../../app';


it('returns a 400 with invalid email', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'testtest.com',
      password: 'password'
    })
    .expect(400)
});

it('returns a 400 with missing email and/or password', async () => {
  await request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com'
  })
  .expect(400);

  await request(app)
    .post('/api/users/signin')
    .send({
      password: '1234'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signin')
    .send({})
    .expect(400);
});

it('fails when a email that does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('fails when a incorrect password supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password1'
    })
    .expect(400);
});

it('responds with a cookie when give valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200);
  
  expect(response.get('Set-Cookie')).toBeDefined();
});