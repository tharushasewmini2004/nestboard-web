export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type PropertyType = 'HOUSE' | 'VILLA' | 'APARTMENT' | 'HOTEL';

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  type: PropertyType;
  amenities: string[];
  latitude: number;
  longitude: number;
  images: string[];
  minimumStay: number;
  active: boolean;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  createdAt: string;
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  pricePerMonth: number;
  seatCapacity: number;
  hasAC: boolean;
  active: boolean;
  availableSeats?: number;
}

export interface Room {
  id: string;
  propertyId: string;
  roomTypeId: string;
  label: string;
  active: boolean;
}

export interface PropertyDetail extends Property {
  roomTypes: RoomType[];
  rooms: Room[];
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Booking {
  id: string;
  seatNumber: number;
  leaseStart: string;
  leaseEnd: string;
  durationMonths: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  paymentExpiresAt: string;
  createdAt: string;
  tenantName?: string;
  room: Room | null;
  roomType: RoomType | null;
  property: Property | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  bookingId?: string;
  propertyId?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  properties: number;
  bookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  revenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PropertyFilters {
  q?: string;
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'recent' | 'price' | 'rating';
  page?: number;
  limit?: number;
}

export interface CreateBookingPayload {
  propertyId: string;
  roomTypeId: string;
  roomId: string;
  seatNumber: number;
  startMonth: string;
  durationMonths: number;
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  address: string;
  city: string;
  type: PropertyType;
  amenities: string[];
  latitude: number;
  longitude: number;
  minimumStay?: number;
  images?: string[];
}

export interface CreateRoomTypePayload {
  name: string;
  pricePerMonth: number;
  seatCapacity: number;
  hasAC?: boolean;
}

export interface CreateRoomPayload {
  label: string;
}
