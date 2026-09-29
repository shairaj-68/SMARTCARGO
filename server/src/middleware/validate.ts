import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'logistics', 'customer']).withMessage('Invalid role'),
  validate,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const containerValidation = [
  body('containerNumber').notEmpty().withMessage('Container number is required'),
  body('type').isIn(['20ft', '40ft', 'reefer', 'openTop', 'flatRack']).withMessage('Invalid container type'),
  body('originPort').notEmpty().withMessage('Origin port is required'),
  body('destinationPort').notEmpty().withMessage('Destination port is required'),
  body('capacity').isNumeric().withMessage('Capacity must be a number'),
  body('pricePerCBM').isNumeric().withMessage('Price per CBM must be a number'),
  body('departureDate').isISO8601().withMessage('Valid departure date is required'),
  body('arrivalDate').isISO8601().withMessage('Valid arrival date is required'),
  validate,
];

export const bookingValidation = [
  body('containerId').notEmpty().withMessage('Container ID is required'),
  body('requiredCBM').isNumeric().withMessage('Required CBM must be a number'),
  body('cargoWeight').isNumeric().withMessage('Cargo weight must be a number'),
  body('cargoType').notEmpty().withMessage('Cargo type is required'),
  body('pickupAddress').notEmpty().withMessage('Pickup address is required'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  validate,
];

export const reviewValidation = [
  body('companyId').notEmpty().withMessage('Company ID is required'),
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  validate,
];
