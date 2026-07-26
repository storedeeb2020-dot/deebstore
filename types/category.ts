import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  order: number;
  createdAt?: Timestamp | Date;
}
