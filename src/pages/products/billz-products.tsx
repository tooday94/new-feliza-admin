import {
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useBillzGet } from "../../services/billz/query/useBillzGet";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { formatPrice } from "../../utils/formatPrice";
import { IoReload } from "react-icons/io5";
import { AiFillFilter, AiOutlineClear } from "react-icons/ai";
import { useBillzCreate } from "../../services/billz/mutation/useBillzCreate";
import type { BillzShopType } from "../../types/billz/shop-type";
import type { BillzCategoryType } from "../../types/billz/category-type";
import type { BillzBrandType } from "../../types/billz/brand-type";
import type { BillzSupplierType } from "../../types/billz/supplier-type";
import { toast } from "react-toastify";

type objectType = {
  products:
    | [
        {
          id?: string;
          barcode?: string;
          brand_name?: string;
          name?: string;
          sku?: string;

          supply_price?: string;

          categories?: [
            {
              id: string;
              name: string;
              parent_id: string;
            }
          ];

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

          shop_prices?: [
            {
              promo_price: number;
              promos: null | string | number;
              retail_currency: string;
              retail_price: number;
              shop_id: string;
              shop_name: string;
              supply_currency: string;
              supply_price: number;
            }
          ];

          shop_measurement_values?: [
            {
              active_measurement_value: number;
              shop_id: string;
              shop_name: string;
            }
          ];

          custom_fields?: [
            {
              custom_field_id: string;
              custom_field_name: string;
              custom_field_system_name: string;
              custom_field_value: string;
              from_parent: boolean;
            }
          ];
        }
      ]
    | null;

  count: number;
};

type billzShopType = {
  count: number;
  shops: BillzShopType[];
};

const BillzProducts = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;
  const initialTab = searchParams.get("tab") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const [filteredBillzProduct, setFilteredBillzProduct] = useState<objectType>({
    count: 0,
    products: [{}],
  });

  console.log(filteredBillzProduct);
  

  const { data, refetch, isLoading, isFetching } = useBillzGet<objectType>({
    endpoint: "/v2/products",
    params: {
      shop_ids: "6c9cc178-a00b-44b3-a611-0e572074ddfe",
      limit: limit,
      search: searchValue,
      ...(searchValue ? {} : { page: currentPage }),
    },
  });

  const { data: shops, isLoading: shopsLoad } = useBillzGet<billzShopType>({
    endpoint: "/v1/shop",
    params: { limit: 10, only_allowed: true },
  });
  console.log(shops);

  const { data: category, isLoading: categoryLoad } = useBillzGet<{
    count: number;
    categories: BillzCategoryType[];
  }>({
    endpoint: "/v2/category",
    params: { limit: 72 },
  });
  console.log("Categorys", category);
  const { data: brand, isLoading: brandLoad } = useBillzGet<{
    count: number;
    brands: BillzBrandType[];
  }>({
    endpoint: "/v2/brand",
    params: { limit: 72 },
  });
  console.log("Brands", brand);
  const { data: supplier, isLoading: supplierLoad } = useBillzGet<{
    count: number;
    suppliers: BillzSupplierType[];
  }>({
    endpoint: "/v1/supplier",
    params: { limit: 72 },
  });
  console.log("suppliers", supplier);

  const { mutate } = useBillzCreate({
    endpoint: "/v2/product-search-with-filters",
    queryKey: "",
  });

  console.log(data);

  // const selectedData = filteredBillzProduct.products
  //   ? filteredBillzProduct
  //   : data;

  return (
    <div>
      <Table
        caption={
          <h1 className="text-lg">
            Billz mahsulotlar soni: <b>{data?.count}</b> ta
          </h1>
        }
        size="large"
        bordered
        scroll={{ x: "max-content" }}
        className="mt-4"
        dataSource={data?.products?.map((item) => ({ key: item.id, ...item }))}
        loading={isLoading || isFetching}
        title={() => (
          <Flex justify="space-between">
            <Button
              size="large"
              type="primary"
              children={"qayta yuklash"}
              onClick={() => refetch()}
              icon={<IoReload />}
            />

            <Input.Search
              size="large"
              placeholder="ref bilan qidiring"
              style={{ width: 550 }}
              allowClear
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={(value) => {
                setSearchValue(value);
                setSearchParams({
                  type: "billz",
                  page: String(currentPage),
                  limit: String(limit),
                  tab: initialTab,
                  search: value,
                });
              }}
            />
            <Button
              type="primary"
              size="large"
              icon={<AiFillFilter />}
              children={"Filterlash"}
              onClick={() => setOpenFilterDrawer(true)}
            />
            <div className="">
              <Button
                type="primary"
                size="large"
                // icon={<BiPlus />}
                children="Saytga mahsulot qo'shish"
              />
            </div>
          </Flex>
        )}
        columns={[
          {
            width: "0",
            title: "№",
            render: (_, __, index) => (currentPage - 1) * limit + index + 1,
          },
          {
            align: "center",
            title: "Ref",
            dataIndex: ["sku"],
            render: (_, record) => (
              <Typography.Paragraph copyable>{record.sku}</Typography.Paragraph>
            ),
          },
          {
            title: "Brend",
            dataIndex: "brand_name",
          },
          {
            title: "Nomi",
            dataIndex: "name",
          },
          {
            title: "Barcode",
            dataIndex: "barcode",
            render: (_, record) => (
              <Typography.Paragraph copyable>
                {record.barcode}
              </Typography.Paragraph>
            ),
          },
          {
            title: "Kategoriya",
            dataIndex: "categories",
            render: (category, record) => (
              <Tooltip
                title={
                  <>
                    {record?.categories?.map((cat) => (
                      <p key={cat.id} className="border p-3">
                        <strong>{cat.name + " > "}</strong>
                      </p>
                    ))}
                  </>
                }
              >
                {record.categories?.[0]?.name}
                {category?.length > 1 && "+" + (category?.length - 1)}
              </Tooltip>
            ),
          },
          {
            title: "Sotish Narxi",
            dataIndex: "shop_prices",
            render: (_, record) => (
              <Flex vertical gap={6}>
                {record.shop_prices?.map((item) => (
                  <Flex key={item.shop_id}>
                    {item.shop_id == "0793974b-f85b-4c1d-b0e7-9ad7b921d588" && (
                      <h1 className="text-lg">
                        {item.shop_name}:{" "}
                        <b className="text-base">
                          {formatPrice(item.retail_price, {
                            separator: ".",
                            withCurrency: false,
                          })}
                        </b>
                      </h1>
                    )}
                  </Flex>
                ))}
              </Flex>
            ),
          },
          {
            title: "Malumot",
            dataIndex: "custom_fields",
            render: (_, record) =>
              record.custom_fields?.map((item) => (
                <p key={item.custom_field_id} className="text-lg">
                  {item.custom_field_name}: <b>{item.custom_field_value} </b>
                </p>
              )),
          },
          {
            width: "0",
            align: "center",
            title: "Holati",
            dataIndex: "shop_prices",
            render: (_, record) => {
              const exists = record.shop_measurement_values?.some(
                (item) =>
                  item.shop_id === "6c9cc178-a00b-44b3-a611-0e572074ddfe"
              );

              return exists ? (
                <Tag className="!text-lg" color="green">
                  Saytda bor
                </Tag>
              ) : (
                <Tag className="!text-lg" color="red">
                  Saytda yo‘q
                </Tag>
              );
            },
          },
        ]}
        pagination={{
          size: "default",
          pageSize: limit,
          current: currentPage,
          showPrevNextJumpers: true,
          showQuickJumper: true,
          position: ["bottomCenter"],
          total: data?.count,

          onChange: (page, size) => {
            setCurrentPage(page);
            setLimit(size);
            setSearchParams({
              type: "billz",
              page: String(page),
              limit: String(size),
              tab: initialTab,
            });
          },
        }}
      />

      <Drawer
        title="Billz Mahsulot Filterlash"
        closable={{ "aria-label": "Close Button" }}
        onClose={() => setOpenFilterDrawer(false)}
        open={openFilterDrawer}
        placement="top"
        mask
        height={500}
      >
        <Form
          form={form}
          title="Billz Mahsulot Filterlash"
          layout="vertical"
          onFinish={(values: {
            shop_ids: string;
            category_ids: string;
            brand_ids: string;
            supplier_ids: string;
            skus: string;
          }) => {
            const filterData = {
              // skus: [values.skus],
              // category_ids: values.category_ids,
              // shop_ids: values.shop_ids,
              // supplier_ids: values.supplier_ids,
              // brand_ids: values.brand_ids,

              ...(values.shop_ids && { shop_ids: values.shop_ids }),
              ...(values.category_ids && { category_ids: values.category_ids }),
              ...(values.brand_ids && { brand_ids: values.brand_ids }),
              ...(values.supplier_ids && { supplier_ids: values.supplier_ids }),
              ...(values.skus && { skus: [values.skus] }),

              // others
              status: "all",
              product_field_filters: [],
              group_variations: false,
              statistics: true,
              limit: 10,
              page: 1,
            };
            return mutate(
              { data: filterData },
              {
                onSuccess: (res) => {
                  toast.success("Filterlangan mahsulotlar");
                  console.log("Reees", res);
                  setFilteredBillzProduct({
                    count: (res as objectType).count,
                    products: (res as objectType).products,
                  });
                },
                onError: () => {
                  toast.error("xatolik filter");
                },
              }
            );
          }}
        >
          <Flex gap={12} justify="space-between">
            <Form.Item className="w-full" label="Do'kon" name={"shop_ids"}>
              <Select
                mode="multiple"
                // maxCount={1}
                allowClear
                optionFilterProp="label"
                size="large"
                placeholder={"Do'kon"}
                loading={shopsLoad}
                options={shops?.shops.map((item) => ({
                  key: item.id,
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              className="w-full"
              label="Kategoriya"
              name={"category_ids"}
            >
              <Select
                mode="multiple"
                allowClear
                optionFilterProp="label"
                showSearch
                size="large"
                placeholder={"Kategoriya"}
                loading={categoryLoad}
                options={category?.categories.map((item) => ({
                  key: item.id,
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </Flex>

          <Flex gap={12} justify="space-between">
            <Form.Item className="w-full" label="Brand" name={"brand_ids"}>
              <Select
                allowClear
                mode="multiple"
                optionFilterProp="label"
                showSearch
                size="large"
                placeholder={"Kategoriya"}
                loading={brandLoad}
                options={brand?.brands?.map((item) => ({
                  key: item.id,
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              className="w-full"
              label="Yetkazib beruvchi"
              name={"supplier_ids"}
            >
              <Select
                allowClear
                mode="multiple"
                optionFilterProp="label"
                showSearch
                size="large"
                placeholder={"Yetkazib beruvchi"}
                loading={supplierLoad}
                options={supplier?.suppliers?.map((item) => ({
                  key: item.id,
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </Flex>

          <Flex>
            <Form.Item label={"Ref"} name={"skus"}>
              <Input size="large" placeholder="Reference nomer" />
            </Form.Item>
          </Flex>

          <Flex gap={24} align="center">
            <Form.Item className="w-full">
              <Button
                block
                htmlType="reset"
                danger
                icon={<AiOutlineClear />}
                size="large"
                children={"Filterni Tozalash"}
              />
            </Form.Item>
            <Form.Item className="w-full">
              <Button
                block
                icon={<AiFillFilter />}
                htmlType="submit"
                size="large"
                type="primary"
                children={"Filterlash"}
                // onClick={() =>
                //   mutate(
                //     {
                //       data: {
                //         status: "all",
                //         // skus: ["106085"],
                //         // category_ids: ["9b994361-86d3-41c4-aad7-063c99378128"],
                //         shop_ids: ["0b1f421c-3f0f-45e7-81db-878eaca958ed"],
                //         // supplier_ids: ["7e9b2da4-c83f-4039-ac5a-e00192ef2a25"],
                //         // brand_ids: ["86785e4f-532f-4aaa-93c4-9d0884977e66"],
                //         // retail_price_from: 150000,
                //         // retail_price_to: 300000,
                //         // supply_price_from: 0,
                //         // supply_price_to: 10000000,
                //         // whole_sale_price_from: 0,
                //         // whole_sale_price_to: 10000000,
                //         product_field_filters: [
                //           // {
                //           //   field_id: "faca6ad6-b841-4f31-b54f-a70f2f33be2a",
                //           //   field_type: "custom",
                //           //   field_values: ["мовий"],
                //           // },
                //           // {
                //           //   field_id: "a3f2fcf1-f672-4ec6-a7e3-b3709ded4f8d",
                //           //   field_type: "custom",
                //           //   field_values: ["Bahor yoz"],
                //           // },
                //           // {
                //           //   field_id: "62e466a7-eb15-4032-a2b1-c56beea80a68",
                //           //   field_type: "custom",
                //           //   field_values: ["UZB"],
                //           // },
                //         ],
                //         group_variations: false,
                //         statistics: true,
                //         limit: 10,
                //         page: 1,
                //       },
                //     },
                //     {
                //       onSuccess: (res) => {
                //         console.log("Filtered Data: ", res);
                //       },
                //     }
                //   )
                // }
              />
            </Form.Item>
          </Flex>
        </Form>
      </Drawer>
    </div>
  );
};

export default BillzProducts;
