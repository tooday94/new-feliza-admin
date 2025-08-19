export interface ImageData {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  url: string;
}

export interface KaruselItemType {
  id: number;
  productImages: ImageData;
  desktopImage: ImageData;
  karuselType: string; // masalan: "category_id"
  parameterId: string; // bu `string` bo'lgan raqam: "52"
}
