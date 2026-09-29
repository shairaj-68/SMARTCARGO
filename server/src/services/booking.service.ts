import Container from '../models/container.model';
import Booking from '../models/booking.model';

export const updateContainerSpace = async (containerId: string, cbmToBook: number): Promise<boolean> => {
  const container = await Container.findById(containerId);
  if (!container || container.availableSpace < cbmToBook) {
    return false;
  }

  container.bookedSpace += cbmToBook;
  container.availableSpace -= cbmToBook;

  if (container.availableSpace <= 0) {
    container.status = 'full';
  }

  await container.save();
  return true;
};

export const releaseContainerSpace = async (containerId: string, cbmToRelease: number): Promise<void> => {
  const container = await Container.findById(containerId);
  if (!container) return;

  container.bookedSpace = Math.max(0, container.bookedSpace - cbmToRelease);
  container.availableSpace = Math.min(container.capacity, container.availableSpace + cbmToRelease);

  if (container.status === 'full') {
    container.status = 'active';
  }

  await container.save();
};

export const calculateBookingAmount = (cbm: number, pricePerCBM: number) => {
  const amount = cbm * pricePerCBM;
  const commission = amount * 0.05;
  const gst = amount * 0.18;
  const totalAmount = amount + gst;
  return { amount, commission, gst, totalAmount };
};
