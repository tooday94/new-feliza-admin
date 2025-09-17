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
import { useNavigate, useSearchParams } from "react-router-dom";
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
import type { BillzProductType } from "../../types/billz/product-type";

type objectType = {
  products: BillzProductType[];
  count: number;
};

type billzShopType = {
  count: number;
  shops: BillzShopType[];
};

const BillzProducts = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;
  const initialTab = searchParams.get("tab") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filteredData, setFilteredData] = useState<objectType | null>(null);

  // Asosiy GET
  const { data, refetch, isLoading, isFetching } = useBillzGet<objectType>({
    endpoint: "/v2/products",
    params: {
      // shop_ids: "6c9cc178-a00b-44b3-a611-0e572074ddfe",
      limit,
      search: searchValue,
      ...(searchValue ? {} : { page: currentPage }),
    },
    enabled: !filteredData, // filter ishlatilgan bo‘lsa, GET ishlamaydi
  });

  // Filter uchun mutation
  const { mutate, isPending: filterLoading } = useBillzCreate({
    endpoint: "/v2/product-search-with-filters",
    queryKey: "",
  });

  // Filter dependent data (shops, categories, brands, suppliers)
  const { data: shops, isLoading: shopsLoad } = useBillzGet<billzShopType>({
    endpoint: "/v1/shop",
    params: { limit: 10, only_allowed: true },
  });

  const { data: category, isLoading: categoryLoad } = useBillzGet<{
    count: number;
    categories: BillzCategoryType[];
  }>({
    endpoint: "/v2/category",
    params: { limit: 72 },
  });

  const { data: brand, isLoading: brandLoad } = useBillzGet<{
    count: number;
    brands: BillzBrandType[];
  }>({
    endpoint: "/v2/brand",
    params: { limit: 72 },
  });

  const { data: supplier, isLoading: supplierLoad } = useBillzGet<{
    count: number;
    suppliers: BillzSupplierType[];
  }>({
    endpoint: "/v1/supplier",
    params: { limit: 72 },
  });

  // Ko‘rsatiladigan asosiy data (filterlangan yoki default)
  const tableData = filteredData || data;

  return (
    <div>
      <Table
        caption={
          <h1 className="text-lg">
            {filteredData
              ? "Billz Filterlangan mahsulotlar soni: "
              : "Billz mahsulotlar soni: "}
            <b>{tableData?.count || 0}</b> ta
          </h1>
        }
        size="large"
        bordered
        scroll={{ x: "max-content" }}
        className="mt-4"
        dataSource={tableData?.products?.map((item) => ({
          key: item.id,
          ...item,
        }))}
        loading={isLoading || isFetching || filterLoading}
        title={() => (
          <Flex justify="space-between" className="flex-wrap-reverse md:flex-nowrap" gap={24}>
            <Flex>
              <Button
                size="large"
                type="primary"
                onClick={() => {
                  setFilteredData(null);
                  refetch();
                }}
                icon={<IoReload />}
              >
                Qayta yuklash
              </Button>

            </Flex>
              <Input.Search
                size="large"
                placeholder="ref, barcode yoki nom bilan qidirish"
                style={{ width: 550 }}
                allowClear
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={(value) => {
                  setSearchValue(value);
                  setFilteredData(null);
                  setSearchParams({
                    type: "billz",
                    page: String(currentPage),
                    limit: String(limit),
                    tab: initialTab,
                    search: value,
                  });
                }}
              />
            <Flex gap={24} justify="space-between" className="w-full md:w-fit">
              <Button
                type="primary"
                size="large"
                icon={<AiFillFilter />}
                onClick={() => setOpenFilterDrawer(true)}
              >
                Filterlash
              </Button>

              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/admin/create-billz-product")}
              >
                Saytga mahsulot qo'shish
              </Button>
            </Flex>
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
                        <strong>{cat.name}</strong>
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
                    {item.shop_id ===
                      "0793974b-f85b-4c1d-b0e7-9ad7b921d588" && (
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
                  {item.custom_field_name}: <b>{item.custom_field_value}</b>
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
          showQuickJumper: true,
          position: ["bottomCenter"],
          total: tableData?.count,
          onChange: (page, size) => {
            setCurrentPage(page);
            setLimit(size);

            if (filteredData) {
              // Filterlangan data uchun qayta chaqiramiz
              form.submit();
            } else {
              // Default GET uchun
              setSearchParams({
                type: "billz",
                page: String(page),
                limit: String(size),
                tab: initialTab,
              });
            }
          },
        }}
      />

      {/* Filter Drawer */}
      <Drawer
        title="Billz Mahsulot Filterlash"
        onClose={() => setOpenFilterDrawer(false)}
        open={openFilterDrawer}
        placement="top"
        height={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const filterData = {
              ...(values.shop_ids && { shop_ids: values.shop_ids }),
              ...(values.category_ids && { category_ids: values.category_ids }),
              ...(values.brand_ids && { brand_ids: values.brand_ids }),
              ...(values.supplier_ids && {
                supplier_ids: values.supplier_ids,
              }),
              ...(values.skus && { skus: [values.skus] }),
              status: "all",
              product_field_filters: [],
              group_variations: false,
              statistics: true,
              limit,
              page: currentPage,
            };
            mutate(
              { data: filterData },
              {
                onSuccess: (res) => {
                  toast.success("Filterlash bajarildi");
                  setFilteredData(res as objectType);

                  setOpenFilterDrawer(false);
                  console.log(res);
                  const rest = res as objectType;
                  if (rest.products == null) {
                    toast.error("Filterlangan mahsulotlar mavjud emas");
                  }
                },
                onError: () => {
                  toast.error("xatolik filter");
                },
              }
            );
          }}
        >
          <Flex gap={12} justify="space-between">
            <Form.Item className="w-full" label="Do'kon" name="shop_ids">
              <Select
                mode="multiple"
                allowClear
                optionFilterProp="label"
                size="large"
                placeholder="Do'kon"
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
              name="category_ids"
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                size="large"
                placeholder="Kategoriya"
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
            <Form.Item className="w-full" label="Brand" name="brand_ids">
              <Select
                allowClear
                mode="multiple"
                showSearch
                optionFilterProp="label"
                size="large"
                placeholder="Brand"
                loading={brandLoad}
                options={brand?.brands.map((item) => ({
                  key: item.id,
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              className="w-full"
              label="Yetkazib beruvchi ( Поставщик )"
              name="supplier_ids"
            >
              <Select
                allowClear
                mode="multiple"
                showSearch
                optionFilterProp="label"
                size="large"
                placeholder="Yetkazib beruvchi"
                loading={supplierLoad}
                options={supplier?.suppliers.map((item) => ({
                  key: item.id,
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </Flex>

          <Form.Item label="Ref" name="skus" className="w-fit">
            <Input size="large" placeholder="Reference nomer" />
          </Form.Item>

          <Flex gap={24} align="center">
            <Form.Item className="w-full">
              <Button
                block
                danger
                htmlType="reset"
                icon={<AiOutlineClear />}
                size="large"
                onClick={() => {
                  setFilteredData(null);
                  refetch();
                }}
              >
                Filterni Tozalash
              </Button>
            </Form.Item>
            <Form.Item className="w-full">
              <Button
                block
                icon={<AiFillFilter />}
                htmlType="submit"
                size="large"
                type="primary"
              >
                Filterlash
              </Button>
            </Form.Item>
          </Flex>
        </Form>
      </Drawer>
    </div>
  );
};

export default BillzProducts;
