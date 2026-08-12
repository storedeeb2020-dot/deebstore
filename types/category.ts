import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;        // الاسم بالإنجليزية (الذي يُنشئ الرابط Slug)
  nameAr?: string;      // الاسم بالعربي (الذي يظهر على الكارت والمنتجات للعميل)
  slug: string;
  subtitle?: string;
  image?: string;
  order: number;
  createdAt?: Timestamp | Date;
}
