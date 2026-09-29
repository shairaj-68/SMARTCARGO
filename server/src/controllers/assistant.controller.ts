import { Request, Response } from 'express';
import { LLMService } from '../services/llm.service';
import { answerShipmentQuestion, ShipmentContext } from '../services/shipmentQA.service';
import Booking from '../models/booking.model';
import Container from '../models/container.model';
import TrackingEvent from '../models/trackingEvent.model';
import DocumentModel from '../models/document.model';
import Payment from '../models/payment.model';
import Company from '../models/company.model';
import User from '../models/user.model';

export async function parseNaturalLanguageQuery(req: Request, res: Response) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query text is required' });
    }
    const intent = await LLMService.extractIntent(query);
    return res.json({ success: true, query, intent });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function askShipmentQA(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    const { question } = req.body;
    const userId = (req as any).user?._id || (req as any).user?.id;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // ── 1. Find the booking ──────────────────────────────────
    const bookingIdStr = String(bookingId);
    const booking = await Booking.findOne({
      $or: [
        { bookingNumber: bookingIdStr },
        { dataset_booking_id: bookingIdStr },
        // Only try ObjectId if the string looks like one
        ...(bookingIdStr.match(/^[a-f\d]{24}$/i) ? [{ _id: bookingIdStr }] : []),
      ],
    }).lean();

    if (!booking) {
      // Return a helpful "not found" answer instead of 404 error
      return res.json({
        success: true,
        answer: `I couldn't find booking **${bookingId}** in the system. Please check the booking reference number on your confirmation email.`,
        question,
      });
    }

    // ── 2. Ownership check (soft — allow unauthenticated in dev) ──
    if (userId) {
      const isCustomer = String(booking.customerId) === String(userId);
      const isAdmin = (req as any).user?.role === 'admin';
      if (!isCustomer && !isAdmin) {
        return res.status(403).json({ error: 'Access denied: You can only query your own shipments.' });
      }
    }

    // ── 3. Fetch all related data in parallel ─────────────────
    const bookingNumStr = booking.bookingNumber || booking.dataset_booking_id || String(booking._id);

    const [container, company, customer, trackingEvents, documents, payment] = await Promise.all([
      booking.containerId
        ? Container.findById(booking.containerId).lean()
        : null,
      booking.companyId
        ? Company.findById(booking.companyId).lean()
        : null,
      booking.customerId
        ? User.findById(booking.customerId).select('name email').lean()
        : null,
      TrackingEvent.find({
        $or: [
          { booking_id: bookingNumStr },
          { booking_id: String(booking._id) },
        ],
      })
        .sort({ event_time: -1 })
        .limit(10)
        .lean(),
      DocumentModel.find({ bookingId: booking._id }).limit(10).lean(),
      Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 }).lean(),
    ]);

    // ── 4. Build the bounded context object ───────────────────
    const ctx: ShipmentContext = {
      bookingNumber: bookingNumStr,
      status: booking.status,
      cargoType: booking.cargoType || 'N/A',
      requiredCBM: booking.requiredCBM || 0,
      cargoWeight: booking.cargoWeight || 0,
      pickupAddress: booking.pickupAddress || 'N/A',
      deliveryAddress: booking.deliveryAddress || 'N/A',
      specialInstructions: booking.specialInstructions || '',
      quotation: booking.quotation as any,
      container: container
        ? {
            containerNumber: container.containerNumber,
            originPort: container.originPort,
            originCountry: container.originCountry,
            destinationPort: container.destinationPort,
            destinationCountry: container.destinationCountry,
            departureDate: container.departureDate,
            arrivalDate: container.arrivalDate,
            type: container.type,
            pricePerCBM: container.pricePerCBM,
          }
        : undefined,
      company: company
        ? { companyName: (company as any).companyName, rating: (company as any).rating }
        : undefined,
      customer: customer
        ? { name: (customer as any).name, email: (customer as any).email }
        : undefined,
      recentTrackingEvents: trackingEvents.map((e) => ({
        type: e.event_type,
        time: e.event_time,
        location: e.location,
        status_details: e.status_details,
      })),
      paymentTotal: payment?.totalAmount,
      paymentStatus: payment?.status,
      documentCount: documents.length,
      documents: documents.map((d) => ({ type: d.type, status: d.status })),
      createdAt: (booking as any).createdAt,
      updatedAt: (booking as any).updatedAt,
    };

    // ── 5. Generate answer using deterministic rule engine ────
    // (LLM is optional — engine works fully offline with DB data)
    let answer = answerShipmentQuestion(question, ctx);

    // If LLM is available, attempt to enhance the rule-based answer
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        const llmAnswer = await Promise.race([
          LLMService.askShipment(question, ctx as any),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
        ]);
        if (llmAnswer && llmAnswer !== answer) {
          answer = llmAnswer as string;
        }
      } catch {
        // Keep rule-based answer on LLM failure
      }
    }

    return res.json({
      success: true,
      bookingNumber: ctx.bookingNumber,
      question,
      answer,
      context: {
        status: ctx.status,
        cargoType: ctx.cargoType,
        trackingEventCount: trackingEvents.length,
        documentCount: documents.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
