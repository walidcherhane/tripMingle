export interface Notification {
  id: string;
  type: "trip" | "message" | "payment" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: {
    tripId?: string;
    messageId?: string;
    paymentId?: string;
  };
}
