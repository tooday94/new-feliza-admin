import { useState } from "react";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import type { Product } from "../../types/products-type";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCreate } from "../../services/mutation/useCreate";
import {
  Button,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Popover,
  Switch,
  Table,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteFilled,
  DownloadOutlined,
  EditFilled,
  PlusOutlined,
  SettingFilled,
} from "@ant-design/icons";
import { useDeleteById } from "../../services/mutation/useDeleteById";
import { useUpdate } from "../../services/mutation/useUpdate";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

type objectType = {
  content: Product[];
  totalElements: number;
  totalPages: number;
};

const SiteProducts = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;
  const initialTab = searchParams.get("tab") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagesList, setimagesList] = useState([]);

  const [tab, setTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const { data: AllProducts, isLoading } = useGetList<objectType>({
    endpoint: endpoints.products.getAll,
    params: {
      page: currentPage - 1,
      size: limit,
    },
  });
  console.log(AllProducts);

  const { data: activeProducts, isLoading: activeProductsLoad } =
    useGetList<objectType>({
      endpoint: endpoints.products.getAllAvtive,
      params: {
        page: currentPage - 1,
        size: limit,
      },
    });
  console.log(activeProducts);

  const { data: searchedProducts, isLoading: searchedProductsLoad } =
    useGetList<Product[]>({
      endpoint: endpoints.products.getByRefNumber + searchValue,
      enabled: searchValue.length > 0,
    });

  console.log(searchedProducts);

  const [selectedProduct, setSelectedProduct] = useState("");
  const { mutate: updateStatus } = useCreate({
    endpoint: "api/product/changeActive/" + selectedProduct,
    queryKey: endpoints.products.getAll,
  });

  const { mutate: deleteProduct } = useDeleteById({
    endpoint: endpoints.products.delete,
    queryKey: endpoints.products.getAll,
  });

  const [popoverOpen, setPopoverOpen] = useState("");
  const { mutate: updateProduct } = useUpdate({
    endpoint: endpoints.products.put,
    queryKey: endpoints.products.getAll,
  });

  const handleDeleteProductById = (id: string | number) => {
    deleteProduct(
      { id },
      {
        onSuccess: () => {
          toast.success("Mahsulot o'chirildi!");
          if (searchValue) {
            queryClient.invalidateQueries({
              queryKey: [endpoints.products.getByRefNumber + searchValue],
            });
          }
        },
        onError: () => {
          toast.error("Mahsulotni o'chirishda xatolik. Qayta urinib ko'ring");
        },
      }
    );
  };

  const activeTab = tab === "active" ? activeProducts : AllProducts;
  const dataSource =
    searchValue && searchedProducts
      ? {
          content: searchedProducts,
          totalElements: searchedProducts.length,
          totalPages: 1,
        }
      : activeTab;

  return (
    <div>
      <Flex justify="space-between" align="center" wrap gap={24}>
        <Flex gap={12} className="">
          <Button
            size="large"
            type={tab == "all" ? "primary" : "default"}
            onClick={() => (
              setTab("all"),
              setSearchParams({
                page: String(initialPage),
                limit: String(initialLimit),
                tab: "all",
              })
            )}
            children={`Barchasi (${AllProducts?.totalElements || 0})`}
          />
          <Button
            size="large"
            type={tab == "active" ? "primary" : "default"}
            onClick={() => (
              setTab("active"),
              setSearchParams({
                page: String(initialPage),
                limit: String(initialLimit),
                tab: "active",
              })
            )}
            children={`Active (${activeProducts?.totalElements || 0})`}
          />
        </Flex>
        <Link to={"https://felizabackend.uz/api/export/exportProducts"}>
          <Button
            size="large"
            type="primary"
            icon={<DownloadOutlined />}
            children="Mahsulotlarni Yuklab Olish"
          />
        </Link>
      </Flex>

      <Table
        caption={`Mahsulotlar:  ${dataSource?.totalElements} ta`}
        title={() => (
          <Flex
            gap={24}
            wrap="wrap-reverse"
            justify="space-between"
            align="center"
          >
            <div></div>

            <Input.Search
              size="large"
              placeholder="Mahsulot Nomi yoki Artikul (ref) bo'yicha qidirish"
              style={{ width: 550 }}
              onSearch={(value) => {
                setSearchValue(value);
                setSearchParams({
                  page: String(initialPage),
                  limit: String(initialLimit),
                  tab,
                  search: value, // search URL ga yoziladi
                });
              }}
              allowClear
              onChange={(e) => {
                if (!e.target.value) {
                  setSearchValue("");
                  setSearchParams({
                    page: String(initialPage),
                    limit: String(initialLimit),
                    tab,
                  });
                }
                setSearchValue(e.target.value);
              }}
              value={searchValue}
            />

            <Button
              size="large"
              type="primary"
              icon={<PlusOutlined />}
              children={"Mahsulot qo'shish"}
              onClick={() => navigate("/admin/create-product")}
            />
          </Flex>
        )}
        scroll={{ x: "max-content" }}
        className="mt-4"
        bordered
        loading={isLoading || activeProductsLoad || searchedProductsLoad}
        dataSource={dataSource?.content.map((item) => ({
          ...item,
          key: item.id,
        }))}
        columns={[
          {
            width: "0",
            title: "№",
            render: (_, __, index) => (currentPage - 1) * limit + index + 1,
          },
          {
            width: "0",
            title: "ID",
            dataIndex: "id",
          },
          {
            width: "0",
            title: "Rang",
            dataIndex: "color",
            render: (text) => (
              <Tooltip
                title={
                  <div>
                    <p className="space-x-2 text-lg border p-3 text-nowrap">
                      <strong>Nomi:</strong>
                      <span>{text.nameUZB}</span>
                    </p>
                    <p className="space-x-2 text-lg border p-3 text-nowrap">
                      <strong>Code:</strong>
                      <span>{text.colorCode}</span>
                    </p>
                  </div>
                }
              >
                <div
                  style={{ background: text.colorCode }}
                  className={`w-6 h-6 rounded-md cursor-pointer shadow-sm shadow-primary`}
                ></div>
              </Tooltip>
            ),
          },
          {
            title: "Img",
            dataIndex: "productImages",
            align: "center",
            render: (images) => (
              <img
                onClick={() => (setimagesList(images), setIsModalOpen(true))}
                src={images[0]?.url}
                alt="Product"
                className="w-24 h-32 object-cover rounded-md hover:scale-150 border cursor-zoom-in mx-auto z-0 hover:z-50"
              />
            ),
          },
          {
            title: "Nomi UZ",
            dataIndex: "nameUZB",
            align: "center",
            render: (name, record) => (
              <Tooltip title={record.brand.name}>{name}</Tooltip>
            ),
          },
          {
            title: "Kategoriya",
            dataIndex: "category",
            render: (category) => (
              <Tooltip
                title={
                  <>
                    {category.map((cat: any) => (
                      <p key={cat.id} className="border p-3">
                        <strong>
                          {cat.parentCategoryUZ && cat.parentCategoryUZ + " > "}
                        </strong>
                        {cat.nameUZB}{" "}
                      </p>
                    ))}
                  </>
                }
              >
                {category[0].nameUZB}
                {category.length > 1 && "+" + (category?.length - 1)}
              </Tooltip>
            ),
          },
          {
            width: "0",
            title: "Brand",
            dataIndex: "brand",
            render: (text) => <span>{text.name}</span>,
          },
          {
            width: "0",
            title: "O'lcham",
            dataIndex: ["productSizeVariantList"],
            render: (_, record) => {
              // if (!record?.productSizeVariantList) return "-";
              const handleFinish = (values: any) => {
                const updatedVariants = record.productSizeVariantList.map(
                  (variant) => ({
                    ...variant,
                    quantity: values[`quantity_${variant.id}`],
                  })
                );

                const updatedData = {
                  nameUZB: record.nameUZB,
                  nameRUS: record.nameRUS,
                  descriptionUZB: record.descriptionUZB,
                  descriptionRUS: record.descriptionRUS,
                  ikpuNumber: record.ikpunumber,
                  mxikNumber: searchValue
                    ? record.mxikNumber
                    : record.mxiknumber,
                  importPrice: record.importPrice,
                  sellPrice: record.sellPrice,
                  active: record.active,
                  brandId: record.brand?.id,
                  categoryId: record.category?.map((c) => c.id),
                  colorId: record.color?.id,
                  productSizeVariantDtoList: updatedVariants,
                };

                updateProduct(
                  { data: updatedData, id: popoverOpen },
                  {
                    onSuccess: () => {
                      setPopoverOpen("");
                      toast.success("Mahsulot o'lchami o'zgartirildi");

                      if (searchValue) {
                        queryClient.invalidateQueries({
                          queryKey: [
                            endpoints.products.getByRefNumber + searchValue,
                          ],
                        });
                      }
                    },
                    onError: () => {
                      toast.error(
                        "Mahsulot o'lchamini o'zgartirishda xatolik",
                        { position: "top-center" }
                      );
                    },
                  }
                );
              };

              return (
                <Popover
                  fresh
                  open={popoverOpen == record.id ? true : false}
                  onOpenChange={(open) => {
                    if (open) {
                      form.setFieldsValue(
                        record.productSizeVariantList.reduce(
                          (acc: Record<string, any>, variant) => {
                            acc[`quantity_${variant.id}`] = variant.quantity;
                            return acc;
                          },
                          {} as Record<string, any>
                        )
                      );
                      setPopoverOpen(record.id);
                    } else {
                      setPopoverOpen("");
                    }
                  }}
                  trigger="click"
                  title="O'lchamlar tahriri"
                  content={
                    <Form form={form} onFinish={handleFinish} layout="vertical">
                      {record.productSizeVariantList.map((variant) => (
                        <Form.Item
                          key={variant.id}
                          name={`quantity_${variant?.id}`}
                          label={`${variant.size} miqdor`}
                          initialValue={variant.quantity}
                          rules={[{ required: true }]}
                        >
                          <InputNumber className="!w-full" min={0} />
                        </Form.Item>
                      ))}
                      <Button
                        block
                        htmlType="submit"
                        type="primary"
                        size="small"
                      >
                        Saqlash
                      </Button>
                    </Form>
                  }
                >
                  <Tooltip
                    placement="bottom"
                    title={
                      <div className="text-lg">
                        {record.productSizeVariantList.map((size: any) => (
                          <p
                            key={size.id}
                            className="text-lg border p-3 text-nowrap"
                          >
                            {size.size}: {size.quantity} ta
                          </p>
                        ))}
                      </div>
                    }
                  >
                    <span
                      onClick={() => (
                        setPopoverOpen(record.id), console.log(record.id)
                      )}
                      className="border px-2 py-1 rounded cursor-pointer text-nowrap"
                      style={{
                        backgroundColor: record.productSizeVariantList.some(
                          (item) => item.quantity <= 0
                        )
                          ? "#ffa2a2"
                          : "transparent",
                      }}
                    >
                      {record.productSizeVariantList[0]?.size}
                      {record.productSizeVariantList.length > 1 &&
                        ` +${record.productSizeVariantList.length - 1}`}
                    </span>
                  </Tooltip>
                </Popover>
              );
            },
          },
          {
            title: "Ref",
            dataIndex: "referenceNumber",
            align: "center",
            width: "8%",
            render: (text) => (
              <Typography.Paragraph className="mt-4" copyable>
                {text}
              </Typography.Paragraph>
            ),
          },
          {
            width: "0",
            title: "Sotish Narxi",
            dataIndex: "sellPrice",
            key: "price",
            render: (price: number) => price.toLocaleString("en-US"),
          },
          {
            width: "0",
            title: "Barcode",
            dataIndex: ["productSizeVariantList"],
            render: (_, record) => {
              const handleFinish = (values: any) => {
                const updatedVariants = record.productSizeVariantList.map(
                  (variant) => ({
                    ...variant,
                    barCode: values[`barcode_${variant.id}`],
                  })
                );

                const updatedData = {
                  nameUZB: record.nameUZB,
                  nameRUS: record.nameRUS,
                  descriptionUZB: record.descriptionUZB,
                  descriptionRUS: record.descriptionRUS,
                  ikpuNumber: record.ikpunumber,
                  mxikNumber: searchValue
                    ? record.mxikNumber
                    : record.mxiknumber,
                  importPrice: record.importPrice,
                  sellPrice: record.sellPrice,
                  active: record.active,
                  brandId: record.brand?.id,
                  categoryId: record.category?.map((c) => c.id),
                  colorId: record.color?.id,
                  productSizeVariantDtoList: updatedVariants,
                };

                console.log(updatedData);

                // updateProduct(
                //   { data: updatedData, id: record?.id },
                //   {
                //     onSuccess: () => {
                //       setPopoverOpen("");
                //       toast.success("Mahsulot barcodelari o'zgartirildi");
                //       if (searchValue) {
                //         queryClient.invalidateQueries({
                //           queryKey: [
                //             endpoints.products.getByRefNumber + searchValue,
                //           ],
                //         });
                //       }
                //     },
                //     onError: () => {
                //       toast.error(
                //         "Mahsulot barcodelari o'zgartirishda xatolik",
                //         { position: "top-center" }
                //       );
                //     },
                //   }
                // );
              };

              return (
                <Popover
                  open={popoverOpen === `barcode-${record.id}`}
                  onOpenChange={(open) => {
                    if (open) {
                      form.setFieldsValue(
                        record.productSizeVariantList.reduce(
                          (acc: Record<string, any>, variant) => {
                            acc[`barcode_${variant.id}`] = variant.barCode;
                            return acc;
                          },
                          {}
                        )
                      );
                      setPopoverOpen(`barcode-${record.id}`);
                    } else {
                      setPopoverOpen("");
                    }
                  }}
                  trigger="click"
                  title="Barcode tahriri"
                  content={
                    <Form form={form} onFinish={handleFinish} layout="vertical">
                      {record.productSizeVariantList.map(
                        (variant, index: number) => (
                          <Form.Item
                            key={index}
                            name={`barcode_${variant.id}`}
                            label={`${variant.size} barcode`}
                            rules={[{ required: true }]}
                          >
                            <Input className="!w-full" />
                          </Form.Item>
                        )
                      )}
                      <Button
                        block
                        htmlType="submit"
                        type="primary"
                        size="small"
                      >
                        Saqlash
                      </Button>
                    </Form>
                  }
                >
                  <Tooltip
                    placement="bottom"
                    title={
                      <div className="text-sm">
                        {record.productSizeVariantList.map((variant: any) => (
                          <p key={variant.id} className="border p-2">
                            {variant.size}: {variant.barCode}
                          </p>
                        ))}
                      </div>
                    }
                  >
                    <span
                      onClick={() => setPopoverOpen(`barcode-${record.id}`)}
                      className="border px-2 py-1 rounded cursor-pointer text-nowrap"
                      style={{
                        backgroundColor: record.productSizeVariantList.some(
                          (item) => !item.barCode
                        )
                          ? "#ffa2a2"
                          : "transparent",
                      }}
                    >
                      {record.productSizeVariantList[0]?.barCode}
                      {record.productSizeVariantList.length > 1 &&
                        ` +${record.productSizeVariantList.length - 1}`}
                    </span>
                  </Tooltip>
                </Popover>
              );
            },
          },
          {
            width: "0",
            fixed: "right",
            title: <SettingFilled />,
            align: "center",
            dataIndex: "id",
            render: (id, record) => (
              <Flex vertical gap={24} align="center">
                <Button
                  type="primary"
                  size="middle"
                  icon={<EditFilled />}
                  onClick={() => navigate("/admin/update-product/" + id)}
                />
                <Popconfirm
                  placement="left"
                  title="Mahsulotni o'chirmoqchimisiz?"
                  okText="Ha"
                  cancelText="Yo'q"
                  onConfirm={() => handleDeleteProductById(id)}
                >
                  <Button
                    type="default"
                    danger
                    size="middle"
                    icon={<DeleteFilled />}
                  />
                </Popconfirm>

                <Popconfirm
                  placement="left"
                  title="Status o'zgarishini tasdiqlaysizmi?"
                  okText="Ha"
                  cancelText="Yo'q"
                  onConfirm={() => (
                    console.log("ID", { ...record, active: !record.active }),
                    setSelectedProduct(id),
                    updateStatus(
                      {},
                      {
                        onSuccess: () => {
                          toast.success("Mahsulot Statusi o'gartirilidi");
                          if (searchValue) {
                            queryClient.invalidateQueries({
                              queryKey: [
                                endpoints.products.getByRefNumber + searchValue,
                              ],
                            });
                          }
                        },
                        onError: () => {
                          toast.error("Mahsulot Status o'zgartirishda xatolik");
                        },
                      }
                    )
                  )}
                >
                  <Switch value={record.active} />
                </Popconfirm>
              </Flex>
            ),
          },
        ]}
        pagination={{
          size: "default",
          pageSize: limit,
          current: currentPage,
          showPrevNextJumpers: true,
          showQuickJumper: true,
          position: ["bottomCenter"],
          total: dataSource?.totalElements,
          onChange: (page, size) => {
            setCurrentPage(page);
            setLimit(size);
            setSearchParams({
              page: String(page),
              limit: String(size),
              tab: initialTab,
            });
          },
        }}
      />

      <Modal
        width={1000}
        closable={false}
        open={isModalOpen}
        getContainer={() => document.body}
        onCancel={() => setIsModalOpen(false)}
        mask={true}
        footer={false}
        centered
        styles={{
          content: { background: "#0009", padding: 0 },
          header: {
            background: "transparent",
            color: "#fff",
            textAlign: "center",
          },
        }}
      >
        <div className="grid grid-cols-3 md:grid-cols-4">
          <Image.PreviewGroup>
            {imagesList.map((item: any) => (
              <Image
                key={item.id}
                className="border-2 w-full object-cover !h-full"
                src={item.url}
              />
            ))}
          </Image.PreviewGroup>
        </div>
      </Modal>
    </div>
  );
};

export default SiteProducts;
