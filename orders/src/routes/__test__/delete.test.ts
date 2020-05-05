import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

const buildTicket = async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20
  });

  await ticket.save();
  return ticket;
};

it('cancel the user order', async () => {
  const ticket = await buildTicket();
  const user = global.getCookie();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  const { body: cancelledOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
});

it('returns and error if one user try to cancel not owned orders', async () => {
  const ticket = await buildTicket();
  const user = global.getCookie();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(401);
});

it('emits an order:cancelled event', async () => {
  const ticket = await buildTicket();
  const user = global.getCookie();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  const { body: cancelledOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
