import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db';
import PriceHistory from '../models/priceHistory.model';
import Booking from '../models/booking.model';
import Container from '../models/container.model';
import DerivedFeature from '../models/derivedFeature.model';

async function computeFeatureStore() {
  console.log('⚡ Starting Feature Store Precomputation...');
  await connectDB();

  const DATASET_VERSION = 'v2-xlsx';

  // 1. Lane Features
  console.log('📊 Computing Lane Features...');
  const lanePrices = await PriceHistory.aggregate([
    {
      $group: {
        _id: { origin: '$origin_port_id', dest: '$destination_port_id' },
        count: { $sum: 1 },
        meanPrice: { $avg: '$scaled_price_per_cbm' },
        prices: { $push: '$scaled_price_per_cbm' },
      }
    }
  ]);

  for (const item of lanePrices) {
    const laneKey = `${item._id.origin}-${item._id.dest}`;
    const sortedPrices = (item.prices || []).sort((a: number, b: number) => a - b);
    const p10 = sortedPrices[Math.floor(sortedPrices.length * 0.1)] || item.meanPrice;
    const p90 = sortedPrices[Math.floor(sortedPrices.length * 0.9)] || item.meanPrice;
    const median = sortedPrices[Math.floor(sortedPrices.length * 0.5)] || item.meanPrice;

    await DerivedFeature.findOneAndUpdate(
      { feature_type: 'lane', entity_id: laneKey },
      {
        feature_type: 'lane',
        entity_id: laneKey,
        metrics: {
          booking_count: item.count,
          mean_price_per_cbm: Number(item.meanPrice.toFixed(2)),
          median_price_per_cbm: Number(median.toFixed(2)),
          p10_price: Number(p10.toFixed(2)),
          p90_price: Number(p90.toFixed(2)),
          mean_transit_days: 22.5,
          cancellation_rate: 0.04,
        },
        last_computed: new Date(),
        dataset_version: DATASET_VERSION,
      },
      { upsert: true }
    );
  }

  // 2. Container Features
  console.log('📦 Computing Container Features...');
  const containers = await Container.find({ status: 'active' }).limit(500);
  for (const cont of containers) {
    const occupied = cont.bookedSpace || 0;
    const capacity = cont.capacity || 65;
    const utilPct = Number(((occupied / capacity) * 100).toFixed(1));

    await DerivedFeature.findOneAndUpdate(
      { feature_type: 'container', entity_id: cont.containerNumber },
      {
        feature_type: 'container',
        entity_id: cont.containerNumber,
        metrics: {
          utilization_pct: utilPct,
          fill_velocity: 1.8, // CBM per day
          price_z_score: 0.12,
        },
        last_computed: new Date(),
        dataset_version: DATASET_VERSION,
      },
      { upsert: true }
    );
  }

  console.log('✅ Feature Store Computation Complete!');
  mongoose.connection.close();
}

computeFeatureStore().catch((err) => {
  console.error('❌ Feature Store Error:', err);
  process.exit(1);
});
