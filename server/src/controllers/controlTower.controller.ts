import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Exception from '../models/exception.model';
import Booking from '../models/booking.model';
import Container from '../models/container.model';

export async function getControlTowerExceptions(req: Request, res: Response) {
  try {
    // Seed initial exceptions if database exceptions are empty
    const existingCount = await Exception.countDocuments();
    if (existingCount === 0) {
      await seedInitialExceptions();
    }

    const exceptions = await Exception.find().sort({ createdAt: -1 }).limit(50);

    const highCount = exceptions.filter(e => e.severity === 'HIGH').length;
    const medCount = exceptions.filter(e => e.severity === 'MEDIUM').length;
    const lowCount = exceptions.filter(e => e.severity === 'LOW').length;

    return res.json({
      ai_available: true,
      summary: {
        total: exceptions.length,
        high_severity: highCount,
        medium_severity: medCount,
        low_severity: lowCount,
        on_track_count: 183,
      },
      exceptions,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function resolveException(req: Request, res: Response) {
  try {
    const { exceptionId } = req.params;
    const { status } = req.body;

    const idStr = String(exceptionId || '').trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(idStr);
    const orConditions: any[] = [
      { exception_id: idStr },
    ];
    if (isObjectId) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(idStr) });
    }

    const exceptionDoc = await Exception.findOneAndUpdate(
      { $or: orConditions },
      { status: status || 'resolved' },
      { new: true }
    );

    return res.json({ success: true, exception: exceptionDoc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

async function seedInitialExceptions() {
  const initialData = [
    {
      exception_id: 'EXC-001',
      type: 'capacity_anomaly',
      severity: 'HIGH',
      target_type: 'booking',
      target_id: 'BOOK00042',
      title: 'Container Capacity Overflow (7% Dataset Anomaly)',
      details: 'Booking BOOK00042 requested 12 CBM on container CONT00041 which only has 8.17 CBM available.',
      metadata: { requested_cbm: 12, available_cbm: 8.17 },
      status: 'open',
    },
    {
      exception_id: 'EXC-002',
      type: 'delay_risk',
      severity: 'HIGH',
      target_type: 'booking',
      target_id: 'BOOK00189',
      title: 'High Delay Risk Detected at Port of Hamburg',
      details: 'Feeder congestion at Hamburg terminal predicts +4 days transit delay.',
      metadata: { predicted_delay_days: 4, location: 'Hamburg' },
      status: 'open',
    },
    {
      exception_id: 'EXC-003',
      type: 'doc_mismatch',
      severity: 'MEDIUM',
      target_type: 'document',
      target_id: 'DOC00690',
      title: 'Weight Discrepancy on Packing List',
      details: 'Packing List specifies 1,480 kg vs declared booking weight 1,250 kg (Delta: 230 kg).',
      metadata: { declared_kg: 1250, document_kg: 1480 },
      status: 'open',
    },
    {
      exception_id: 'EXC-004',
      type: 'low_utilization',
      severity: 'MEDIUM',
      target_type: 'container',
      target_id: 'CONT00108',
      title: 'Under-utilized Container Departs in < 5 Days',
      details: 'Container CONT00108 is currently at 42% capacity with ETD 2026-10-21.',
      metadata: { current_utilization_pct: 42, days_to_etd: 4 },
      status: 'open',
    },
    {
      exception_id: 'EXC-005',
      type: 'payment_pending',
      severity: 'LOW',
      target_type: 'payment',
      target_id: 'PAY00912',
      title: 'Payment Pending > 18 Hours',
      details: 'Customer booking payment confirmation pending since 18.5 hours.',
      metadata: { pending_hours: 18.5 },
      status: 'open',
    },
  ];

  await Exception.insertMany(initialData).catch(() => {});
}
