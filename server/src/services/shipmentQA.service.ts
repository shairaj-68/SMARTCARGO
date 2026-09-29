/**
 * ShipmentQAEngine — deterministic, DB-grounded Q&A without needing an LLM.
 * Parses the user's question with keyword matching and returns a precise,
 * data-driven answer from the actual booking/tracking/payment context.
 */

export interface ShipmentContext {
  bookingNumber: string;
  status: string;
  cargoType: string;
  requiredCBM: number;
  cargoWeight: number;
  pickupAddress: string;
  deliveryAddress: string;
  quotation?: {
    pricePerCBM?: number;
    totalAmount?: number;
    pickupDate?: Date | string;
    availableSpace?: number;
    conditions?: string;
  };
  container?: {
    containerNumber?: string;
    originPort?: string;
    originCountry?: string;
    destinationPort?: string;
    destinationCountry?: string;
    departureDate?: Date | string;
    arrivalDate?: Date | string;
    type?: string;
    pricePerCBM?: number;
  };
  company?: {
    companyName?: string;
    rating?: number;
  };
  customer?: {
    name?: string;
    email?: string;
  };
  recentTrackingEvents?: Array<{
    type: string;
    time: Date | string;
    location: string;
    status_details?: string;
  }>;
  paymentTotal?: number;
  paymentStatus?: string;
  documentCount: number;
  documents?: Array<{ type: string; status: string }>;
  specialInstructions?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending — awaiting carrier review',
  counter_offer: 'Counter Offer — carrier has proposed new terms',
  accepted: 'Accepted — awaiting your payment',
  payment_pending: 'Payment Pending',
  confirmed: 'Confirmed & Paid',
  pickup_scheduled: 'Pickup Scheduled',
  cargo_received: 'Cargo Received at Origin Terminal',
  container_loaded: 'Container Loaded',
  in_transit: 'In Transit (vessel at sea)',
  reached_port: 'Reached Destination Port',
  customs_clearance: 'Under Customs Clearance',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function fmt(val: any): string {
  if (val === null || val === undefined) return 'N/A';
  return String(val);
}

function fmtDate(d: Date | string | undefined): string {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

function fmtMoney(n: number | undefined): string {
  if (n === undefined || n === null) return 'N/A';
  return `$${Number(n).toFixed(2)}`;
}

export function answerShipmentQuestion(q: string, ctx: ShipmentContext): string {
  const lower = q.toLowerCase();

  // ── Location / Tracking / Where ─────────────────────────────
  if (/where|location|current|position|tracking|track|live|now|port/.test(lower)) {
    const events = ctx.recentTrackingEvents;
    if (events && events.length > 0) {
      const latest = events[0];
      const secondLine = events.length > 1
        ? `\n\nPrevious event: ${events[1].type} at ${events[1].location} on ${fmtDate(events[1].time)}.`
        : '';
      return `📍 **Latest Location**\n\n${latest.type} at **${latest.location}**\nTime: ${fmtDate(latest.time)}\n${latest.status_details ? `Details: ${latest.status_details}` : ''}${secondLine}`;
    }
    const route = ctx.container
      ? `${ctx.container.originPort} → ${ctx.container.destinationPort}`
      : 'Route information unavailable';
    return `📍 Your shipment (${ctx.bookingNumber}) is currently **${STATUS_LABELS[ctx.status] || ctx.status}**.\nRoute: ${route}\nNo granular tracking events found yet — they appear once cargo is picked up.`;
  }

  // ── Status ──────────────────────────────────────────────────
  if (/status|state|stage|progress|update/.test(lower)) {
    const label = STATUS_LABELS[ctx.status] || ctx.status;
    const events = ctx.recentTrackingEvents || [];
    const history = events.length > 0
      ? '\n\n**Recent Events:**\n' + events.slice(0, 3).map(e => `• ${e.type} — ${e.location} (${fmtDate(e.time)})`).join('\n')
      : '';
    return `📋 **Booking Status: ${label}**\n\nBooking ref: ${ctx.bookingNumber}\nCargo: ${ctx.cargoType} · ${ctx.requiredCBM} CBM · ${ctx.cargoWeight} kg${history}`;
  }

  // ── ETA / Arrival / When / How long ─────────────────────────
  if (/eta|arrive|arrival|when|how long|delivery date|expected/.test(lower)) {
    const eta = ctx.container?.arrivalDate;
    const dep = ctx.container?.departureDate;
    if (eta) {
      return `🗓️ **Estimated Arrival: ${fmtDate(eta)}**\n\nDeparture: ${fmtDate(dep)}\nDestination Port: ${ctx.container?.destinationPort || 'N/A'}\nStatus: ${STATUS_LABELS[ctx.status] || ctx.status}`;
    }
    return `The ETA for booking ${ctx.bookingNumber} is not yet confirmed. Current status: **${STATUS_LABELS[ctx.status] || ctx.status}**. ETA will be available once the container is loaded.`;
  }

  // ── Documents ───────────────────────────────────────────────
  if (/document|doc|invoice|bill|lading|certificate|packing|customs|paper/.test(lower)) {
    if (ctx.documentCount === 0) {
      return `📄 **No documents uploaded yet** for booking ${ctx.bookingNumber}.\n\nYou can upload documents from the Documents section. Required documents typically include:\n• Commercial Invoice\n• Packing List\n• Bill of Lading`;
    }
    const docList = (ctx.documents || [])
      .map(d => `• ${d.type.replace(/_/g, ' ')} — ${d.status}`)
      .join('\n');
    const pending = (ctx.documents || []).filter(d => d.status !== 'verified').length;
    return `📄 **${ctx.documentCount} document(s)** for booking ${ctx.bookingNumber}:\n\n${docList}\n\n${pending > 0 ? `⚠️ ${pending} document(s) are pending verification.` : '✅ All documents verified.'}`;
  }

  // ── Payment / Amount / Cost / Price ─────────────────────────
  if (/pay|payment|amount|cost|price|rate|cbm|total|charge|fee|how much/.test(lower)) {
    const total = ctx.paymentTotal ?? ctx.quotation?.totalAmount;
    const rate = ctx.container?.pricePerCBM ?? ctx.quotation?.pricePerCBM;
    const payStatus = ctx.paymentStatus || (ctx.status === 'confirmed' ? 'completed' : 'pending');
    return `💰 **Payment Summary**\n\nTotal Amount: **${fmtMoney(total)}**\nRate: ${fmtMoney(rate)}/CBM × ${ctx.requiredCBM} CBM\nPayment Status: ${payStatus === 'completed' ? '✅ Paid' : '⏳ Pending'}\nBooking Ref: ${ctx.bookingNumber}`;
  }

  // ── Route / Origin / Destination ────────────────────────────
  if (/route|origin|source|from|ship from|departure|sailing|origin port/.test(lower)) {
    const c = ctx.container;
    return `🚢 **Origin Details**\n\nOrigin Port: **${c?.originPort || 'N/A'}**, ${c?.originCountry || ''}\nDeparture Date: ${fmtDate(c?.departureDate)}\nContainer: ${c?.containerNumber || 'N/A'} (${c?.type || 'N/A'})\nCarrier: ${ctx.company?.companyName || 'N/A'}`;
  }
  if (/destination|deliver|going|arriving|where.*going|sent to/.test(lower)) {
    const c = ctx.container;
    return `🏁 **Destination Details**\n\nDestination Port: **${c?.destinationPort || 'N/A'}**, ${c?.destinationCountry || ''}\nEstimated Arrival: ${fmtDate(c?.arrivalDate)}\nDelivery Address: ${ctx.deliveryAddress || 'N/A'}`;
  }

  // ── Carrier / Company ────────────────────────────────────────
  if (/carrier|company|logistics|provider|shipper|who.*shipping|operator/.test(lower)) {
    const co = ctx.company;
    return `🏢 **Carrier Information**\n\nCarrier: **${co?.companyName || 'N/A'}**\nRating: ${co?.rating ? `⭐ ${co.rating}/5` : 'N/A'}\nContainer: ${ctx.container?.containerNumber || 'N/A'}`;
  }

  // ── Cargo Details ────────────────────────────────────────────
  if (/cargo|goods|what.*ship|product|weight|cbm|space|load/.test(lower)) {
    return `📦 **Cargo Details**\n\nType: **${ctx.cargoType}**\nRequired Space: ${ctx.requiredCBM} CBM\nWeight: ${ctx.cargoWeight} kg\nPickup Address: ${ctx.pickupAddress || 'N/A'}\nSpecial Instructions: ${ctx.specialInstructions || 'None'}`;
  }

  // ── Pickup ────────────────────────────────────────────────────
  if (/pickup|pick up|collect|collection|when.*pick/.test(lower)) {
    const pickupDate = ctx.quotation?.pickupDate;
    return `🚚 **Pickup Information**\n\nPickup Address: **${ctx.pickupAddress || 'N/A'}**\nScheduled Date: ${fmtDate(pickupDate)}\nStatus: ${STATUS_LABELS[ctx.status] || ctx.status}\n\nContact your carrier (${ctx.company?.companyName || 'carrier'}) for exact pickup coordination.`;
  }

  // ── Booking Date / When booked ────────────────────────────────
  if (/when.*book|booked|created|date.*book|booking date/.test(lower)) {
    return `📅 **Booking Created:** ${fmtDate(ctx.createdAt)}\nBooking Ref: ${ctx.bookingNumber}\nLast Updated: ${fmtDate(ctx.updatedAt)}`;
  }

  // ── Tracking Events History ────────────────────────────────────
  if (/history|event|timeline|log|all.*event|past event/.test(lower)) {
    const events = ctx.recentTrackingEvents || [];
    if (events.length === 0) {
      return `No tracking events recorded yet for ${ctx.bookingNumber}. Events will appear once your cargo is picked up.`;
    }
    const list = events.map((e, i) => `${i + 1}. **${e.type}** — ${e.location}\n   📅 ${fmtDate(e.time)}${e.status_details ? `\n   ℹ️ ${e.status_details}` : ''}`).join('\n\n');
    return `📋 **Tracking History (${events.length} events)**\n\n${list}`;
  }

  // ── Fallback — show a full summary ───────────────────────────
  const c = ctx.container;
  const events = ctx.recentTrackingEvents || [];
  const latestEvent = events[0];
  return `ℹ️ **Shipment Summary — ${ctx.bookingNumber}**\n\n` +
    `Status: **${STATUS_LABELS[ctx.status] || ctx.status}**\n` +
    `Cargo: ${ctx.cargoType} · ${ctx.requiredCBM} CBM · ${ctx.cargoWeight} kg\n` +
    `Route: ${c?.originPort || 'N/A'} → ${c?.destinationPort || 'N/A'}\n` +
    `Departure: ${fmtDate(c?.departureDate)} · ETA: ${fmtDate(c?.arrivalDate)}\n` +
    `Carrier: ${ctx.company?.companyName || 'N/A'}\n` +
    (latestEvent ? `\nLatest Update: ${latestEvent.type} at ${latestEvent.location} (${fmtDate(latestEvent.time)})` : '') +
    `\n\nAsk me about: status, location, ETA, payment, documents, cargo, carrier, or tracking history.`;
}
