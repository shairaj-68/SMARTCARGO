import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import mongoose from 'mongoose';
import connectDB from '../config/db';

import User from '../models/user.model';
import Company from '../models/company.model';
import Container from '../models/container.model';
import Booking from '../models/booking.model';
import Review from '../models/review.model';
import Message from '../models/message.model';
import DocumentModel from '../models/document.model';

import CapacitySnapshot from '../models/capacitySnapshot.model';
import PriceHistory from '../models/priceHistory.model';
import TrackingEvent from '../models/trackingEvent.model';
import DataQualityFlag from '../models/dataQualityFlag.model';

const PRICE_SCALE_FACTOR = 10;
const DATASET_VERSION = 'v2-xlsx';

interface ETLStats {
  sheet: string;
  rowsRead: number;
  loaded: number;
  flagged: number;
  rejected: number;
  reasonCodes: Record<string, number>;
}

async function runETL() {
  console.log('🚀 Starting SMARTCARGO v2 ETL Pipeline...');
  await connectDB();

  const excelPath = path.resolve(__dirname, '../../../Smart_Cargo_Large_Dataset.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found at ${excelPath}`);
    process.exit(1);
  }

  console.log(`📄 Reading workbook: ${excelPath}`);
  const workbook = xlsx.readFile(excelPath, { cellDates: true });

  const report: Record<string, ETLStats> = {};

  // Map to hold entity lookups:
  const companyMap = new Map<string, mongoose.Types.ObjectId>(); // logistics_company_id -> Company _id
  const customerMap = new Map<string, mongoose.Types.ObjectId>(); // customer_id -> User _id
  const containerMap = new Map<string, { _id: mongoose.Types.ObjectId; origin_port_id: string; destination_port_id: string; available_cbm: number; price_per_cbm: number }>(); // container_id -> container details

  // 1. Process Logistics_Companies
  console.log('📦 Processing Logistics_Companies...');
  const companyStats: ETLStats = { sheet: 'Logistics_Companies', rowsRead: 0, loaded: 0, flagged: 0, rejected: 0, reasonCodes: {} };
  const companySheet = workbook.Sheets['Logistics_Companies'];
  if (companySheet) {
    const rows = xlsx.utils.sheet_to_json<any>(companySheet);
    companyStats.rowsRead = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const companyIdStr = String(row.logistics_company_id || `LOG${i}`).trim();
      const email = String(row.email || `${companyIdStr.toLowerCase()}@smartcargo.demo`).trim().toLowerCase();

      try {
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: row.company_name || companyIdStr,
            email,
            password: 'Password123!',
            role: 'logistics',
            isVerified: true,
          });
        }

        let company = await Company.findOne({ registrationNumber: companyIdStr });
        if (!company) {
          company = await Company.create({
            userId: user._id,
            companyName: row.company_name || companyIdStr,
            registrationNumber: companyIdStr,
            gstNumber: `GST${companyIdStr}`,
            country: row.country || 'India',
            verificationStatus: 'verified',
            rating: Number(row.rating) || 4.5,
            totalReviews: 10,
            totalBookings: Number(row.completed_shipments) || 50,
          });
        }
        companyMap.set(companyIdStr, company._id as mongoose.Types.ObjectId);
        companyStats.loaded++;
      } catch (err: any) {
        companyStats.rejected++;
      }
    }
  }
  report['Logistics_Companies'] = companyStats;

  // 2. Process Customers
  console.log('👥 Processing Customers...');
  const customerStats: ETLStats = { sheet: 'Customers', rowsRead: 0, loaded: 0, flagged: 0, rejected: 0, reasonCodes: {} };
  const customerSheet = workbook.Sheets['Customers'];
  if (customerSheet) {
    const rows = xlsx.utils.sheet_to_json<any>(customerSheet);
    customerStats.rowsRead = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const custIdStr = String(row.customer_id || `CUST${i}`).trim();
      const email = String(row.email || `${custIdStr.toLowerCase()}@smartcargo.demo`).trim().toLowerCase();

      try {
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: row.company_name || custIdStr,
            email,
            password: 'Password123!',
            role: 'customer',
            isVerified: true,
          });
        }
        customerMap.set(custIdStr, user._id as mongoose.Types.ObjectId);
        customerStats.loaded++;
      } catch (err: any) {
        customerStats.rejected++;
      }
    }
  }
  report['Customers'] = customerStats;

  // 3. Process Containers (Fix #1: Deduplicate CONT00041)
  console.log('🚢 Processing Containers (Deduplicating CONT00041)...');
  const containerStats: ETLStats = { sheet: 'Containers', rowsRead: 0, loaded: 0, flagged: 0, rejected: 0, reasonCodes: {} };
  const containerSheet = workbook.Sheets['Containers'];
  if (containerSheet) {
    const rows = xlsx.utils.sheet_to_json<any>(containerSheet);
    containerStats.rowsRead = rows.length;

    const seenContainers = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const contIdStr = String(row.container_id || '').trim();

      if (!contIdStr) {
        containerStats.rejected++;
        continue;
      }

      if (seenContainers.has(contIdStr)) {
        // Record duplicate container flag
        containerStats.flagged++;
        containerStats.reasonCodes['DUPLICATE_CONTAINER'] = (containerStats.reasonCodes['DUPLICATE_CONTAINER'] || 0) + 1;

        await DataQualityFlag.create({
          sheet_name: 'Containers',
          row_index: i + 2,
          entity_id: contIdStr,
          reason_code: 'DUPLICATE_CONTAINER',
          details: `Container ID ${contIdStr} is duplicated in dataset sheet.`,
          raw_data: row,
          dataset_version: DATASET_VERSION,
        });
        continue; // Keep only the first occurrence for container map
      }

      seenContainers.add(contIdStr);

      const compId = companyMap.get(String(row.logistics_company_id || '')) || Array.from(companyMap.values())[0];
      const rawType = String(row.container_type || '40ft').toLowerCase();
      const contType = rawType.includes('20') ? '20ft' : '40ft';

      try {
        let containerDoc = await Container.findOne({ containerNumber: contIdStr });
        if (!containerDoc) {
          containerDoc = await Container.create({
            companyId: compId,
            containerNumber: contIdStr,
            type: contType,
            originPort: row.origin_port || 'Shanghai',
            destinationPort: row.destination_port || 'Hamburg',
            originCountry: row.origin_country || 'China',
            destinationCountry: row.destination_country || 'Germany',
            departureDate: row.departure_date ? new Date(row.departure_date) : new Date('2026-10-20'),
            arrivalDate: row.estimated_arrival_date ? new Date(row.estimated_arrival_date) : new Date('2026-11-12'),
            capacity: Number(row.total_capacity_cbm) || (contType === '20ft' ? 30 : 65),
            bookedSpace: Number(row.occupied_cbm) || 0,
            availableSpace: Number(row.available_cbm) || 20,
            pricePerCBM: (Number(row.price_per_cbm) || 8.0) * PRICE_SCALE_FACTOR,
            maxBooking: Number(row.available_cbm) || 20,
            minBooking: 0.5,
            cargoTypes: row.preferred_cargo_type ? [row.preferred_cargo_type] : ['Auto Components', 'Textiles', 'Electronics'],
            status: 'active',
            dataset_version: DATASET_VERSION,
            origin_port_id: String(row.origin_port_id || ''),
            destination_port_id: String(row.destination_port_id || ''),
            max_weight_kg: Number(row.max_weight_kg) || 30000,
            available_weight_kg: Number(row.available_weight_kg) || 20000,
            preferred_cargo_type: String(row.preferred_cargo_type || ''),
          });
        }

        containerMap.set(contIdStr, {
          _id: containerDoc._id as mongoose.Types.ObjectId,
          origin_port_id: String(row.origin_port_id || ''),
          destination_port_id: String(row.destination_port_id || ''),
          available_cbm: Number(row.available_cbm) || 20,
          price_per_cbm: Number(row.price_per_cbm) || 8.0,
        });
        containerStats.loaded++;
      } catch (err: any) {
        containerStats.rejected++;
      }
    }
  }
  report['Containers'] = containerStats;

  // 4. Process Bookings (Fix #2: Lane Mismatch, Fix #3: Capacity Overflow Tagging)
  console.log('📋 Processing Bookings (Checking lane mismatches & capacity overflows)...');
  const bookingStats: ETLStats = { sheet: 'Bookings', rowsRead: 0, loaded: 0, flagged: 0, rejected: 0, reasonCodes: {} };
  const bookingSheet = workbook.Sheets['Bookings'];
  if (bookingSheet) {
    const rows = xlsx.utils.sheet_to_json<any>(bookingSheet);
    bookingStats.rowsRead = rows.length;

    // Helper map of lane -> first matching container
    const laneContainerMap = new Map<string, { _id: mongoose.Types.ObjectId; container_id: string }>();
    for (const [cId, details] of containerMap.entries()) {
      const laneKey = `${details.origin_port_id}-${details.destination_port_id}`;
      if (!laneContainerMap.has(laneKey)) {
        laneContainerMap.set(laneKey, { _id: details._id, container_id: cId });
      }
    }

    const defaultCustomerObjId = Array.from(customerMap.values())[0];
    const defaultContainerObjId = Array.from(containerMap.values())[0]?._id;

    const batch: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const bookingIdStr = String(row.booking_id || `BOOK${i}`).trim();
      const custIdStr = String(row.customer_id || '').trim();
      const contIdStr = String(row.container_id || '').trim();

      const customerObjId = customerMap.get(custIdStr) || defaultCustomerObjId;
      let containerInfo = containerMap.get(contIdStr);

      const bkOriginPortId = String(row.origin_port_id || '');
      const bkDestPortId = String(row.destination_port_id || '');
      const bkRequiredCBM = Number(row.required_cbm) || 5;

      let isLaneMismatch = false;
      let isCapacityAnomaly = false;

      // Check Lane Mismatch
      if (containerInfo && (containerInfo.origin_port_id !== bkOriginPortId || containerInfo.destination_port_id !== bkDestPortId)) {
        isLaneMismatch = true;
        bookingStats.flagged++;
        bookingStats.reasonCodes['LANE_MISMATCH'] = (bookingStats.reasonCodes['LANE_MISMATCH'] || 0) + 1;

        // Repair logic: re-point to container on exact same lane if available
        const laneKey = `${bkOriginPortId}-${bkDestPortId}`;
        const repairedCont = laneContainerMap.get(laneKey);
        if (repairedCont) {
          containerInfo = containerMap.get(repairedCont.container_id);
        }
      }

      // Check Capacity Overflow
      if (containerInfo && bkRequiredCBM > containerInfo.available_cbm) {
        isCapacityAnomaly = true;
        bookingStats.flagged++;
        bookingStats.reasonCodes['CAPACITY_OVERFLOW'] = (bookingStats.reasonCodes['CAPACITY_OVERFLOW'] || 0) + 1;
      }

      const containerObjId = containerInfo?._id || defaultContainerObjId;
      const companyObjId = companyMap.get(String(row.logistics_company_id || '')) || Array.from(companyMap.values())[0];

      const rawAmount = Number(row.booking_amount_usd) || 100;
      const scaledAmount = rawAmount * PRICE_SCALE_FACTOR;

      batch.push({
        customerId: customerObjId,
        containerId: containerObjId,
        companyId: companyObjId,
        requiredCBM: bkRequiredCBM,
        cargoWeight: Number(row.weight_kg) || 1000,
        cargoType: String(row.cargo_type || 'General Cargo'),
        pickupAddress: `${bkOriginPortId} Terminal`,
        deliveryAddress: `${bkDestPortId} Logistics Hub`,
        specialInstructions: `ETL Seeded Booking ${bookingIdStr}`,
        status: 'confirmed',
        quotation: {
          pricePerCBM: (scaledAmount / (bkRequiredCBM || 1)),
          totalAmount: scaledAmount,
          pickupDate: row.departure_date ? new Date(row.departure_date) : new Date(),
          availableSpace: containerInfo?.available_cbm || 20,
          conditions: 'Standard LCL Terms',
        },
        bookingNumber: bookingIdStr,
        dataset_version: DATASET_VERSION,
        dataset_booking_id: bookingIdStr,
        origin_port_id: bkOriginPortId,
        destination_port_id: bkDestPortId,
        capacity_anomaly: isCapacityAnomaly,
        service_type: String(row.service_type || 'Port-to-Port'),
        priority: String(row.priority || 'Standard'),
      });

      bookingStats.loaded++;

      if (batch.length >= 1000) {
        await Booking.insertMany(batch, { ordered: false }).catch(() => {});
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await Booking.insertMany(batch, { ordered: false }).catch(() => {});
    }
  }
  report['Bookings'] = bookingStats;

  // 5. Process Available_CBM Snapshots
  console.log('📊 Processing Available_CBM Snapshots...');
  const availStats: ETLStats = { sheet: 'Available_CBM', rowsRead: 0, loaded: 0, flagged: 0, rejected: 0, reasonCodes: {} };
  const availSheet = workbook.Sheets['Available_CBM'];
  if (availSheet) {
    const rows = xlsx.utils.sheet_to_json<any>(availSheet);
    availStats.rowsRead = rows.length;

    const batch: any[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      batch.push({
        availability_id: String(row.availability_id || `AV${i}`),
        container_id: String(row.container_id || ''),
        snapshot_date: row.snapshot_date ? new Date(row.snapshot_date) : new Date(),
        available_cbm: Number(row.available_cbm) || 0,
        available_weight_kg: Number(row.available_weight_kg) || 0,
        total_cbm: Number(row.total_capacity_cbm) || 65,
        total_weight_kg: 30000,
        dataset_version: DATASET_VERSION,
      });
      availStats.loaded++;

      if (batch.length >= 2000) {
        await CapacitySnapshot.insertMany(batch, { ordered: false }).catch(() => {});
        batch.length = 0;
      }
    }
    if (batch.length > 0) {
      await CapacitySnapshot.insertMany(batch, { ordered: false }).catch(() => {});
    }
  }
  report['Available_CBM'] = availStats;

  // 6. Process Prices
  console.log('🏷️ Processing Prices...');
  const priceStats: ETLStats = { sheet: 'Prices', rowsRead: 0, loaded: 0, flagged: 0, rejected: 0, reasonCodes: {} };
  const priceSheet = workbook.Sheets['Prices'];
  if (priceSheet) {
    const rows = xlsx.utils.sheet_to_json<any>(priceSheet);
    priceStats.rowsRead = rows.length;

    const batch: any[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const basePrice = Number(row.base_price_per_cbm) || 8.0;
      const quotedPrice = Number(row.quoted_price_per_cbm) || basePrice;

      batch.push({
        price_id: String(row.price_id || `PR${i}`),
        origin_port_id: String(row.origin_port_id || ''),
        destination_port_id: String(row.destination_port_id || ''),
        cargo_type: String(row.cargo_type || 'General Cargo'),
        container_type: String(row.container_type || '40ft'),
        base_price_per_cbm: basePrice,
        quoted_price_per_cbm: quotedPrice,
        scaled_price_per_cbm: quotedPrice * PRICE_SCALE_FACTOR,
        currency: 'USD',
        valid_from: row.valid_from ? new Date(row.valid_from) : new Date('2026-01-01'),
        valid_to: row.valid_to ? new Date(row.valid_to) : new Date('2026-12-31'),
        logistics_company_id: String(row.logistics_company_id || ''),
        dataset_version: DATASET_VERSION,
      });
      priceStats.loaded++;

      if (batch.length >= 2000) {
        await PriceHistory.insertMany(batch, { ordered: false }).catch(() => {});
        batch.length = 0;
      }
    }
    if (batch.length > 0) {
      await PriceHistory.insertMany(batch, { ordered: false }).catch(() => {});
    }
  }
  report['Prices'] = priceStats;

  // 7. Process Shipment_Tracking
  console.log('📍 Processing Shipment_Tracking (72k streaming insert)...');
  const trackingStats: ETLStats = { sheet: 'Shipment_Tracking', rowsRead: 0, loaded: 0, flagged: 0, rejected: 0, reasonCodes: {} };
  const trackingSheet = workbook.Sheets['Shipment_Tracking'];
  if (trackingSheet) {
    const rows = xlsx.utils.sheet_to_json<any>(trackingSheet);
    trackingStats.rowsRead = rows.length;

    const batch: any[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      batch.push({
        tracking_event_id: String(row.tracking_event_id || `TRK${i}`),
        booking_id: String(row.booking_id || ''),
        container_id: String(row.container_id || ''),
        event_type: String(row.event || 'In Transit'),
        event_time: row.event_time ? new Date(row.event_time) : new Date(),
        location: String(row.updated_by || 'Port Gate'),
        latitude: Number(row.latitude) || 0,
        longitude: Number(row.longitude) || 0,
        status_details: String(row.event_status || 'Completed'),
        dataset_version: DATASET_VERSION,
      });
      trackingStats.loaded++;

      if (batch.length >= 5000) {
        await TrackingEvent.insertMany(batch, { ordered: false }).catch(() => {});
        batch.length = 0;
      }
    }
    if (batch.length > 0) {
      await TrackingEvent.insertMany(batch, { ordered: false }).catch(() => {});
    }
  }
  report['Shipment_Tracking'] = trackingStats;

  // Write Report to File
  const reportPath = path.resolve(__dirname, '../../etl_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ ETL Complete! Report saved to ${reportPath}`);

  mongoose.connection.close();
}

runETL().catch((err) => {
  console.error('❌ ETL Failed:', err);
  process.exit(1);
});
