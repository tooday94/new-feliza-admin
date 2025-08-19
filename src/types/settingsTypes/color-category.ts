export interface ColorCategoryType {
  id: string;
  nameUZB: string;
  nameRUS: string;
  colorCode: string;
  createdAt?: string; // optional
  updatedAt?: string; // optional
  isActive?: boolean; // optional
  payload?: {
    nameUZB: string;
    nameRUS: string;
    colorCode: string;
    id: string | number;
  };
}
