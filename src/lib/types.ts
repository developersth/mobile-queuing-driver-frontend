export type CompanyCode = "TOP" | "OR" | "PTG" | "Shell" | "SFL";

export type ShipmentStatus =
  | "pending"
  | "called-1"
  | "called-2"
  | "confirmed"
  | "completed"
  | "no-confirmation";

export interface Shipment {
  id: string;
  company: CompanyCode;
  date: string;
  destination: string;
  licensePlates: string[];
  status: ShipmentStatus;
}

export interface NotificationItem {
  id: string;
  title: string;
  shipmentNo: string;
  datetime: string;
  relativeTime: string;
  isToday: boolean;
  isAlert?: boolean;
}

export interface UserProfile {
  name: string;
  company: string;
  phoneMasked: string;
}
