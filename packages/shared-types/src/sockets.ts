export interface SocketAuthPayload {
  sub: string;
  role: string;
  exp: number;
}

export interface OfferRoomPresence {
  mealRequestId: string;
  viewerCount: number;
}

export interface OrderLocationUpdate {
  orderId: string;
  riderId: string;
  lat: number;
  lng: number;
  recordedAt: string;
}
