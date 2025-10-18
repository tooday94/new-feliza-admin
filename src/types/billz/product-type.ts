export interface BillzProductType {
  id?: string;
  barcode?: string;
  brand_name?: string;
  name?: string;
  sku?: string;
  supply_price?: string;
  categories?: { id: string; name: string; parent_id: string }[];
  product_supplier_stock?: [
    {
      max_supply_price: number;
      measurement_value: number;
      min_supply_price: number;
      retail_price: number;
      shop_id: string;
      supplier_id: string;
      supplier_name: string;
      wholesale_price: number;
    }
  ];
  shop_prices?: {
    promo_price: number;
    promos: null | string | number;
    retail_currency: string;
    retail_price: number;
    shop_id: string;
    shop_name: string;
    supply_currency: string;
    supply_price: number;
  }[];
  shop_measurement_values?: {
    active_measurement_value: number;
    shop_id: string;
    shop_name: string;
  }[];
  custom_fields?: {
    custom_field_id: string;
    custom_field_name: string;
    custom_field_system_name: string;
    custom_field_value: string;
    from_parent: boolean;
  }[];
}
