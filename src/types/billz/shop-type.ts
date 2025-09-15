export interface BillzShopType {
  address: string;
  bank_accounts: [];
  cash_boxes: [
    {
      e_pos: number;
      id: string;
      is_active: boolean;
      name: string;
      web_kassa: number;
    }
  ];

  cash_boxes_count: number;
  cheque_id: string;
  color: string;
  company_id: string;
  company_inn: string;
  facebook: string;
  has_unique_details: boolean;
  id: string;
  inn: string;
  instagram: string;
  legal_country_id: string;
  legal_name: string;
  name: string;
  nds: string;
  phone_numbers: [];
  postcode: string;
  quadrature: number;
  telegram: string;
  website: string;
  working_hours: null;
}
