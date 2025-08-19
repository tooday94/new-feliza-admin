export interface AddCategoryType {
  parentCategoryUZ: string;
  id: number | null;
  nameUZB: string;
  nameRUS: string;
  category: {
    nameUZB: string;
    nameRUS: string;
    parentCategoryUZ: string;
    parentCategoryRU: string;
  };
  // qo'shimcha propertylar
  horizontalImage?: {
    url: string;
  } | null;
  verticalImage?: {
    url: string;
  } | null;
}
