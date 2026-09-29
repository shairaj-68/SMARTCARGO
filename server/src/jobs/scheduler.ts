import { Server } from 'socket.io';
import cron from 'node-cron';
import Booking from '../models/booking.model';
import Container from '../models/container.model';
import Notification from '../models/notification.model';

export const startCronJobs = (io: Server) => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcomingBookings = await Booking.find({
        status: { $in: ['confirmed', 'pickup_scheduled'] },
      }).populate('customerId', 'email name').populate('containerId');

      for (const booking of upcomingBookings) {
        const container = booking.containerId as any;
        if (container && new Date(container.departureDate).toDateString() === tomorrow.toDateString()) {
          await Notification.create({
            userId: booking.customerId,
            title: 'Departure Reminder',
            message: `Your shipment ${booking.bookingNumber} is scheduled to depart tomorrow.`,
            type: 'shipment',
          });
        }
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
};
