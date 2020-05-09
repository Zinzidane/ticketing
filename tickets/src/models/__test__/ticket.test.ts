import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123'
  });
  // Save the ticket to the database
  await ticket.save();
  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id);
  // Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 15 });
  secondInstance!.set({ price: 25 });
  // Save the first fetched ticket
  await firstInstance!.save();
  // Save the second fetched ticket and expect and an error
  try {
    await secondInstance!.save();
  } catch (error) {
    return done();
  }

  throw new Error('Should not reach that point');
});