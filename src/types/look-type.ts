export interface LookType {
  id: number;
  images: Image[];
  productResponseDtos: ProductResponseDto[];
}

export interface ProductResponseDto {
  id: number;
  nameUZB: string;
  nameRUS: string;
  descriptionUZB: string;
  descriptionRUS: string;
  mxikNumber: string;
  active: boolean;
  referenceNumber: string;
  sellPrice: number;
  salePrice: number | null;
  sale: number;
  averageRating: number;
  brand: Brand;
  category: Category[];
  color: Color;
  lookCollectionIdList: number[];
  productImages: Image[];
  productSizeVariantList: ProductSizeVariant[];
  reviewList: any[]; // Review[] bo'lishi mumkin agar strukturasi bo'lsa
  ikpunumber: string;
}

export interface Image {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  url: string;
}

export interface Brand {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
}

export interface Category {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  nameUZB: string;
  nameRUS: string;
  parentCategoryUZ: string | null;
  parentCategoryRU: string | null;
  horizontalImage: Image | null;
  verticalImage: Image | null;
}

export interface Color {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  nameUZB: string;
  nameRUS: string;
  colorCode: string;
}

export interface ProductSizeVariant {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  barCode: string;
  quantity: number;
  size: string;
}
