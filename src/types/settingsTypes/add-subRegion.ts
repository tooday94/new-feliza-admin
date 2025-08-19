export interface AddSubRegionType {
  id: number;
  nameUZB: string;
  nameRUS: string;
  postCode: string;
  region: {
    id: number;
    nameUZB: string;
    nameRUS: string;
  };
}
