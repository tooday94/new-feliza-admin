export interface CategoryImage {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  url: string;
}

export interface Category {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  nameUZB: string;
  nameRUS: string;
  parentCategoryUZ: string;
  parentCategoryRU: string;
  horizontalImage: CategoryImage;
  verticalImage: CategoryImage;
}

export interface SmallSliderItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  placeNumber: number;
  category: Category;
}
