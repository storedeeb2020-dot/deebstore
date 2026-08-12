import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Timestamp | Date;
  orderCount: number;
}

export interface Admin {
  uid: string;
  email: string;
  name: string;
}
