export interface UserType {
  id: string | number;
  fullName: string;
  gender: string; // Masalan: "Erkak" yoki "Ayol"
  phoneNumber: string; // Telefon raqam string bo‘lishi kerak
  birthDate?: string; // Tug‘ilgan sana (majburiy bo‘lmasligi mumkin)
  createdAt: string; // format: "2025-08-19T10:20:30Z"
  status: {
    statusName: string;
    id: number;
  };
  saleSum: number; // Umumiy savdo summasi
  cashback: number; // Cashback ballari yoki pul
  roles: {
    roleName: string;
    id: number;
  }[];
  enabled: boolean; // Faol / NoFaol
  image: {
    url: string;
    id: number;
  } | null;
  user?: {
    fullName: string;
    id: number;
  };
}
