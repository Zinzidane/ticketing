import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledEvent } from '@zzticketing/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { OrderCancelledListener } from '../order-cancelled-listener';


const setup = async () => {
  // create an istance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  // create and save a ticket with orderId
  const orderId = new mongoose.Types.ObjectId().toHexString();
  
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  ticket.set({ orderId });
  await ticket.save();

  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    }
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, orderId, ticket };
};

it('updates the ticket, publishes and event and aks the message', async () => {
  const { listener, ticket, orderId, data, msg } = await setup();
  // call the onMessage function with data object + message object
  await listener.onMessage(data, msg);
  
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
