import express, { Request, Response, Router } from 'express';

const router = express.Router();

router.post('/api/orders', async (req: Request, res: Response) => {
  res.send({});
});

export { router as createOrderRouter };