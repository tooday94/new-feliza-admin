export interface NotificationsType {
  id: number;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  title: string | null;
  message: string | null;
  type: string | null;
  reserveId: string | null;
  read: boolean;
  image: {
    id: number;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    url: string | null;
  };
  reviewImages?: {
    id: number;
    url: string;
  }[];
  customer: {
    fullName: string;
    phoneNumber?: string;
  };
  content?: string;
  product?: {
    nameUZB?: string;
    brand?: {
      name?: string;
    };
  };
  rating?: number;
  active?: boolean;
}
