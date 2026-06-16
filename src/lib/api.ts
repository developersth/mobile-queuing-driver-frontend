const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }

  return json;
}

// Auth
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
}

export interface UserLoginResponse {
  userId: number;
  phoneNumber: string;
  fullName: string;
  licensePlate: string;
  companyId?: number;
  companyName?: string;
  status: string;
  lastLogin: string;
}

export interface OtpVerifyResponse {
  isVerified: boolean;
  userId: number;
  message: string;
}

export const authApi = {
  login: (personalId: string) =>
    request<ApiResponse<{
      driverId: number;
      fullName: string;
      phoneNumber: string;
      driverCode: string;
      carrierId: string;
      license: string;
      licenseType: string;
    }>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ personalId }),
    }),

  lookupByIdCard: (idCardNumber: string) =>
    request<ApiResponse<{
      driverId: number;
      fullName: string;
      phoneNumber: string;
      driverCode: string;
      carrierId: string;
      license: string;
      licenseType: string;
    }>>("/api/auth/lookup-by-idcard", {
      method: "POST",
      body: JSON.stringify({ idCardNumber }),
    }),

  requestOtp: (phoneNumber: string) =>
    request<ApiResponse<{ otpCode?: string }>>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),

  verifyOtp: (phoneNumber: string, otpCode: string) =>
    request<ApiResponse<OtpVerifyResponse>>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, otpCode }),
    }),
};

// Shipments
export interface ShipmentDto {
  shipmentId: number;
  shipmentNumber: string;
  trackingNumber: string;
  userId?: number;
  companyId: number;
  origin: string;
  destination: string;
  status: string;
  priority: string;
  weight?: number;
  weightUnit?: string;
  quantity?: number;
  pickupTime?: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
}

export const shipmentsApi = {
  getAll: () =>
    request<ApiResponse<ShipmentDto[]>>("/api/shipments"),

  getByUser: (userId: number) =>
    request<ApiResponse<ShipmentDto[]>>(`/api/shipments/user/${userId}`),

  getById: (id: number) =>
    request<ApiResponse<ShipmentDto>>(`/api/shipments/${id}`),

  updateStatus: (id: number, status: string, notes?: string) =>
    request<ApiResponse<ShipmentDto>>(`/api/shipments/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    }),
};

// Notifications
export interface NotificationDto {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  shipmentId?: number;
}

export const notificationsApi = {
  getByUser: (userId: number) =>
    request<ApiResponse<NotificationDto[]>>(`/api/notifications/user/${userId}`),

  markRead: (notificationId: number) =>
    request<ApiResponse<object>>(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    }),
};

// Mobile Shipments
export interface MobileShipmentDto {
  shipmentNo: string;
  shipmentDate: string | null;
  shipmentStatus: string;
  statusName: string;
  customerGroupId: string;
  customerName: string;
  destName: string;
  carrierName: string;
  licensePlates: string[];
  sealNo: string;
  sealCount: number | null;
  fromDate: string | null;
  toDate: string | null;
  status: number | null;
  shDisplay: string;
  notify1stTimeStart: string | null;
  notify1stTimeEnd: string | null;
  notify2ndTimeStart: string | null;
  notify2ndTimeEnd: string | null;
}

export interface DriverProfileDto {
  driverId: number;
  fullName: string;
  carrierId: string;
  carrierName: string;
}

export interface MobileShipmentLineDto {
  shipmentNo: string;
  compartmentNo: number | null;
  compartmentVolume: number | null;
  product: string;
  saleProductCode: string;
  saleProductName: string;
  productName: string;
  unit: string;
}

export const mobileApi = {
  getShipments: (driverId: number) =>
    request<ApiResponse<MobileShipmentDto[]>>(`/api/mobile/driver/${driverId}/shipments`),

  getDriverProfile: (driverId: number) =>
    request<ApiResponse<DriverProfileDto>>(`/api/mobile/driver/${driverId}/profile`),

  getShipmentLines: (shipmentNo: string) =>
    request<ApiResponse<MobileShipmentLineDto[]>>(`/api/mobile/shipment/${shipmentNo}/lines`),
};

// Geofence
export interface GeofenceCheckResponse {
  inZone: boolean;
  distanceMeters: number;
  distanceKm: number;
  radiusKm: number;
  centerLatitude: number;
  centerLongitude: number;
}

export const geofenceApi = {
  check: (latitude: number, longitude: number) =>
    request<ApiResponse<GeofenceCheckResponse>>("/api/geofence/check", {
      method: "POST",
      body: JSON.stringify({ latitude, longitude }),
    }),
};

export interface QueueNotificationDto {
  transactionId: number;
  shipmentNo: string;
  customerGroupId: string;
  tuId1: string;
  tuId2: string;
  driverId: number;
  driverName: string;
  callingCount: number | null;
  callingMsg: string;
  flagRead: string;
  datetime: string | null;
  creationDate: string | null;
}

export const queueNotificationApi = {
  getUnread: (driverId: number) =>
    request<ApiResponse<QueueNotificationDto[]>>(`/api/mobile/driver/${driverId}/queue-notifications`),

  getAll: (driverId: number) =>
    request<ApiResponse<QueueNotificationDto[]>>(`/api/mobile/driver/${driverId}/queue-notifications/all`),

  markRead: (transactionId: number, msgRead: string = "รับทราบแล้ว") =>
    request<ApiResponse<null>>(`/api/mobile/queue-notification/${transactionId}/read?msgRead=${encodeURIComponent(msgRead)}`, {
      method: "PUT",
    }),
};

export const acknowledgeApi = {
  acknowledge: (shipmentNo: string, customerGroupId: string, driverId: number) =>
    request<ApiResponse<null>>("/api/mobile/shipment/acknowledge", {
      method: "POST",
      body: JSON.stringify({ shipmentNo, customerGroupId, driverId }),
    }),
};

// Companies
export interface CompanyDto {
  companyId: number;
  companyName: string;
  companyCode: string;
  address?: string;
  contactPhone?: string;
  status: string;
}

export const companiesApi = {
  getAll: () =>
    request<ApiResponse<CompanyDto[]>>("/api/companies"),
};
