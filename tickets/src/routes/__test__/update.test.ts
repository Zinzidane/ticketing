import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.getCookie())
    .send({
      title: 'tttt',
      price: 20
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'tttt',
      price: 20
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title: 'some',
      price: 20
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.getCookie())
    .send({
      title: 'some tea',
      price: 200
    })
    .expect(401);
});

it('returns a 400 if the user provided invalid price and/or title', async () => {
  const cookie = global.getCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'some title',
      price: 20
    })
    .expect(201);
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: ''
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'some title',
      price: -20
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20
    })
    .expect(400);
});

it('update the ticket if provided valid inputs', async () => {
  const cookie = global.getCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'some title',
      price: 20
    })
    .expect(201);
  
  const updateData = { title: 'title', price: 20 }; 
    
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updateData)
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()

  expect(ticketResponse.body.title).toEqual(updateData.title);
  expect(ticketResponse.body.price).toEqual(updateData.price);
});

it('published an event', async () => {
  const cookie = global.getCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'some title',
      price: 20
    })
    .expect(201);
  
  const updateData = { title: 'title', price: 20 }; 
    
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updateData)
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});