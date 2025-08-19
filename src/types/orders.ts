export type OrderStatus =
  | "NEW"
  | "SEND"
  | "REACHED"
  | "REJECTED"
  | "PAIDFALSE"
  | "PACK";

export interface newOrders {
  id: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  receiverName: string;
  receiverPhoneNumber: string;
  orderNumber: string;
  postTrackingNumber: string | null;
  orderTime: string | null;
  paymentMethod: string;
  orderCost: number;
  orderStatusType: string;
  shippingCost: number;
  deliveryDays: number;
  deliveryDate: string;
  cancelled: boolean;
  paid: boolean;
  delivered: boolean;
  address: Address;
  couponCustomer: CouponCustomer;
  customer: Customer;
  orderDetails?: OrderDetail[];
  orderDetailDtos?: [
    {
      productName: string;
      referenceNumber: string;
      quantity: number;
      sellPrice: number;
      productCost: number;
      productImages: [
        {
          id: number;
          createdAt: string;
          updatedAt: string;
          createdBy: string | null;
          updatedBy: string | null;
          url: string;
        }
      ];
      productSizeVariant: {
        id: number;
        createdAt: string | null;
        updatedAt: string | null;
        createdBy: string | null;
        updatedBy: string | null;
        barCode: string;
        quantity: number;
        size: string;
      };
    }
  ];
}

interface Address {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  customer: Customer;
  region: Region;
  subRegion: SubRegion;
  street: string;
  houseNumber: string;
  postFilial: {
    id: number;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    descriptionRUS: string;
    descriptionUZB: string;
    houseNumber: string | null;
    postFilialName: string;
    postName: string;
    region: {
      id: number;
      createdAt: string | null;
      updatedAt: string | null;
      createdBy: string | null;
      updatedBy: string | null;
    };
    streetRUS: string;
    streetUZB: string;
  } | null;
}

interface Region {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  nameUZB: string;
  nameRUS: string;
  postCode: string;
}

interface SubRegion extends Region {
  region: Region;
}

interface CouponCustomer {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  customer: Customer;
  coupon: Coupon;
  expireDate: string | null;
  activeCustomerCoupon: boolean;
}

interface Coupon {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  enumName: string;
  name: string;
  credit: number;
  active: boolean;
}

interface Customer {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  fullName: string;
  phoneNumber: string;
  password: string;
  birthDate: string;
  gender: string;
  saleSum: number;
  cashback: number;
  lastSeen: string | null;
  image: {
    createdAt: string | null;
    createdBy: string | null;
    id: number;
    updatedAt: string | null;
    updatedBy: string | null;
    url: string;
  } | null;
  verifyCode: string;
  status: Status;
  enabled: boolean;
  roles: Role[];
  username: string;
  authorities: Role[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

interface Status {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  statusName: string;
}

interface Role {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  roleName: string;
  authority: string;
}

interface OrderDetail {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  quantity: number;
  productCost: number;
  productSizeVariant: ProductSizeVariant;
}

interface ProductSizeVariant {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: null;
  updatedBy: null;
  barCode: string;
  quantity: number;
  size: string;
}
