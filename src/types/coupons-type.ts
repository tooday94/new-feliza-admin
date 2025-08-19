export interface CouponsType {
  active: boolean;
  createdAt: string;
  createdBy: string | null;
  credit: number;
  enumName: string;
  id: string;
  name: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface CustomerCouponType {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  customer: Customer;
  coupon: Coupon;
  expireDate: string | null;
  activeCustomerCoupon: boolean;
}

export interface Customer {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  fullName: string;
  phoneNumber: string;
  password: string;
  birthDate: string;
  gender: string;
  saleSum: number | null;
  cashback: number | null;
  lastSeen: string | null;
  image: Image;
  verifyCode: string;
  status: Status;
  enabled: boolean;
  roles: any[];
  username: string;
  authorities: any[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

export interface Image {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  url: string;
}

export interface Status {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  statusName: string;
}

export interface Coupon {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  enumName: string;
  name: string;
  credit: number;
  active: boolean;
}
