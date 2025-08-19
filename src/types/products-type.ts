export interface Product {
  id: string;
  averageRating: number;
  createdAt: string;
  nameUZB: string;
  nameRUS: string;
  mxiknumber: string;
  ikpunumber: string;
  importPrice: number;
  descriptionUZB: string;
  descriptionRUS: string;
  sale: number;
  salePrice: number | null;
  sellPrice: number;
  referenceNumber: string;
  active: boolean;
  category: [
    {
      createdAt: string | null;
      createdBy: string | null;
      id: number;
      nameRUS: string;
      nameUZB: string;
      parentCategoryRU: string | null;
      parentCategoryUZ: string | null;
      updatedAt: string | null;
      updatedBy: string | null;
    }
  ];
  brand: {
    id: number;
    name: string;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
  };
  color: {
    colorCode: string;
    createdAt: string | null;
    createdBy: string | null;
    id: number;
    nameRUS: string;
    nameUZB: string;
    updatedAt: string | null;
    updatedBy: string | null;
  };
  productImages: [
    {
      id: string;
      url: string;
      createdAt: string;
      createdBy: string | null;
      updatedAt: string | null;
      updatedBy: string | null;
    }
  ];
  productSizeVariantList: [
    {
      barCode: string;
      createdAt: string | null;
      createdBy: string | null;
      id: number;
      quantity: number;
      size: string;
      updatedAt: string | null;
      updatedBy: string | null;
    }
  ];
}

export interface allColorsType {
  colorCode: string;
  createdAt: string;
  createdBy: string | null;
  id: number;
  nameRUS: string;
  nameUZB: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface allBrandsType {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
}
