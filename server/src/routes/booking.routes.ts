import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { createBooking, getMyBookings, acceptQuotation, confirmPayment } from '../controllers/customer.controller';
import { getBookingRequests, acceptBooking, rejectBooking, counterOffer } from '../controllers/logistics.controller';
import { bookingValidation } from '../middleware/validate';

const router = Router();

router.use(protect);
router.post('/', authorize('customer'), bookingValidation, createBooking);
router.get('/my', authorize('customer'), getMyBookings);
router.put('/:id/accept-quotation', authorize('customer'), acceptQuotation);
router.put('/confirm-payment', authorize('customer'), confirmPayment);

router.get('/company', authorize('logistics'), getBookingRequests);
router.put('/:id/accept', authorize('logistics'), acceptBooking);
router.put('/:id/reject', authorize('logistics'), rejectBooking);
router.put('/:id/counter', authorize('logistics'), counterOffer);

export default router;
