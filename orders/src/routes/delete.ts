import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@zzticketing/common';

import { Order, OrderStatus } from '../models/order';

const router = express.Router();

router.delete('/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish and event saying the order was cancelled

    res.send(order);
});

export { router as deleteOrderRouter };