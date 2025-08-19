export interface AddPostFilialType {
  id: number;
  region: {
    id: number;
    nameUZB: string;
    nameRUS: string;
  };
  subRegion: {
    id: number;
    nameUZB: string;
    nameRUS: string;
  };
  postName: string;
  postFilialName: string;
  streetUZB: string;
  streetRUS: string;
  houseNumber: string;
  descriptionUZB: string;
  descriptionRUS: string;
}
