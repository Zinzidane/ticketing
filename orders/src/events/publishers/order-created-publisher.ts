import { Publisher, OrderCreatedEvent, Subjects } from '@zzticketing/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}