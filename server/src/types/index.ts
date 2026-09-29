import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'logistics' | 'customer';
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  q?: string;
  origin?: string;
  destination?: string;
  containerType?: string;
  minCBM?: number;
  maxCBM?: number;
  minPrice?: number;
  maxPrice?: number;
  departureDate?: string;
  cargoType?: string;
  rating?: number;
}
