export interface GovernorateRate {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  active: boolean;
}

export const DEFAULT_EGYPT_GOVERNORATES: GovernorateRate[] = [
  { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo", price: 50, active: true },
  { id: "giza", nameAr: "الجيزة", nameEn: "Giza", price: 50, active: true },
  { id: "qalyubia", nameAr: "القليوبية", nameEn: "Qalyubia", price: 55, active: true },
  { id: "alexandria", nameAr: "الإسكندرية", nameEn: "Alexandria", price: 65, active: true },
  { id: "beheira", nameAr: "البحيرة", nameEn: "Beheira", price: 70, active: true },
  { id: "matrouh", nameAr: "مطروح", nameEn: "Matrouh", price: 85, active: true },
  { id: "gharbia", nameAr: "الغربية", nameEn: "Gharbia", price: 65, active: true },
  { id: "menofia", nameAr: "المنوفية", nameEn: "Menofia", price: 65, active: true },
  { id: "dakahlia", nameAr: "الدقهلية", nameEn: "Dakahlia", price: 65, active: true },
  { id: "kafr_el_sheikh", nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh", price: 70, active: true },
  { id: "sharqia", nameAr: "الشرقية", nameEn: "Sharqia", price: 65, active: true },
  { id: "damietta", nameAr: "دمياط", nameEn: "Damietta", price: 70, active: true },
  { id: "port_said", nameAr: "بورسعيد", nameEn: "Port Said", price: 70, active: true },
  { id: "ismailia", nameAr: "الإسماعيلية", nameEn: "Ismailia", price: 70, active: true },
  { id: "suez", nameAr: "السويس", nameEn: "Suez", price: 70, active: true },
  { id: "north_sinai", nameAr: "شمال سيناء", nameEn: "North Sinai", price: 95, active: true },
  { id: "south_sinai", nameAr: "جنوب سيناء", nameEn: "South Sinai", price: 95, active: true },
  { id: "beni_suef", nameAr: "بني سويف", nameEn: "Beni Suef", price: 75, active: true },
  { id: "fayoum", nameAr: "الفيوم", nameEn: "Fayoum", price: 75, active: true },
  { id: "minya", nameAr: "المنيا", nameEn: "Minya", price: 80, active: true },
  { id: "assiut", nameAr: "أسيوط", nameEn: "Assiut", price: 80, active: true },
  { id: "sohag", nameAr: "سوهاج", nameEn: "Sohag", price: 85, active: true },
  { id: "qena", nameAr: "قنا", nameEn: "Qena", price: 85, active: true },
  { id: "luxor", nameAr: "الأقصر", nameEn: "Luxor", price: 90, active: true },
  { id: "aswan", nameAr: "أسوان", nameEn: "Aswan", price: 95, active: true },
  { id: "red_sea", nameAr: "البحر الأحمر", nameEn: "Red Sea", price: 95, active: true },
  { id: "new_valley", nameAr: "الوادي الجديد", nameEn: "New Valley", price: 100, active: true },
];
