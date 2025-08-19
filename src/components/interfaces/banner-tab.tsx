import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Popconfirm,
  Image,
  Select,
  Form,
  Upload,
  Input,
  message,
  Flex,
} from "antd";
import {
  DeleteOutlined,
  SwapOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import type { KaruselItemType } from "../../types/karousel-type";
import { useCreate } from "../../services/mutation/useCreate";
import type { CategoriesAllType } from "../../types/categories-type";
import { useGetById } from "../../services/query/useGetById";
import type { Product } from "../../types/products-type";
import { useDeleteById } from "../../services/mutation/useDeleteById";

const { Option } = Select;

const BannerTab = () => {
  const [form] = Form.useForm();
  const [bannerType, setbannerType] = useState("category_id");
  const [isMobileView, setIsMobileView] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [productId, setproductId] = useState("");
  const [lookid, setlookid] = useState("");

  const { data: carouselList, isLoading } = useGetList<KaruselItemType[]>({
    endpoint: endpoints.karusel.getAll,
  });

  const toggleView = (id: number) => {
    setIsMobileView((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { mutate: createCarousel, isPending } = useCreate({
    endpoint: endpoints.karusel.post,
    queryKey: endpoints.karusel.getAll,
  });

  const { mutate: deleteBanner, isPending: deletePending } = useDeleteById({
    endpoint: endpoints.karusel.delete,
    queryKey: endpoints.karusel.getAll,
  });

  const { data: categoryList } = useGetList<CategoriesAllType[]>({
    endpoint: endpoints.category.getParent,
    enabled: bannerType === "category_id",
  });

  const { data: productList, refetch: refetchProduct } = useGetById<Product>({
    endpoint: endpoints.products.getById,
    id: productId,
    enabled: false, // manually triggered
  });

  const { data: lookList } = useGetById<{ images: [{ url: string }] }>({
    endpoint: endpoints.look.getById,
    id: lookid,
    enabled: !!lookid,
  });

  const onFinish = (values: any) => {
    const formData = new FormData();

    formData.append(
      "karuselDto",
      JSON.stringify({
        karuselType: values.karuselType,
        parameterId: values.parameterId,
      })
    );
    // Mobile image
    if (values.mobileImg && values.mobileImg.length > 0) {
      formData.append("mobileImage", values.mobileImg[0].originFileObj);
    }

    // Desktop image
    if (values.desktopImg && values.desktopImg.length > 0) {
      formData.append("desktopImage", values.desktopImg[0].originFileObj);
    }

    createCarousel(formData, {
      onSuccess: () => {
        message.success("Yangi Karusel qo'shildi!");
        form.resetFields();
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 md:px-4">
      <Card className="mx-auto shadow-lg rounded-xl p-4">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Flex justify="space-between" gap={48} wrap>
            <Flex gap={48} wrap className="max-w-md w-full">
              <Form.Item
                label="Mobile Image"
                name="mobileImg"
                valuePropName="fileList"
                getValueFromEvent={(e) => e.fileList}
                rules={[{ required: true, message: "Upload mobile image" }]}
              >
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>Upload Mobile Image</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Desktop Image"
                name="desktopImg"
                valuePropName="fileList"
                getValueFromEvent={(e) => e.fileList}
                rules={[{ required: true, message: "Upload desktop image" }]}
              >
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>
                    Upload Desktop Image
                  </Button>
                </Upload>
              </Form.Item>
            </Flex>

            <Flex vertical>
              <Flex gap={24} wrap>
                <Form.Item
                  className="w-full"
                  label="Carousel Type"
                  name="karuselType"
                  rules={[{ required: true, message: "Please select type" }]}
                >
                  <Select
                    defaultValue="category_id"
                    onChange={(value) => {
                      setbannerType(value);
                      form.setFieldsValue({ parameterId: undefined });
                    }}
                  >
                    <Option value="category_id">Category</Option>
                    <Option value="product_id">Product</Option>
                    <Option value="look_id">Look</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  className="w-full"
                  label="Parameter"
                  name="parameterId"
                  rules={[
                    { required: true, message: "Please select a parameter" },
                  ]}
                >
                  {bannerType === "category_id" && (
                    <Select
                      className="min-w-full !w-full md:min-w-sm"
                      placeholder="Select a category"
                      showSearch
                      optionFilterProp="label"
                      filterSort={(a, b) =>
                        (a?.label ?? "").localeCompare(b?.label ?? "")
                      }
                      options={categoryList?.map((item) => ({
                        label: item.nameUZB,
                        value: item.id,
                      }))}
                    />
                  )}

                  {bannerType === "product_id" && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Enter product ID"
                        value={productId}
                        onChange={(e) => setproductId(e.target.value)}
                      />
                      <Button
                        type="primary"
                        className="w-full sm:w-auto"
                        onClick={async () => {
                          if (!productId) return;
                          form.setFieldsValue({
                            parameterId: Number(productId),
                          });
                          const { data } = await refetchProduct();
                          if (!data) message.error("Product not found");
                        }}
                      >
                        Search
                      </Button>
                    </div>
                  )}

                  {bannerType === "look_id" && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Enter look ID"
                        value={lookid}
                        onChange={(e) => setlookid(e.target.value)}
                      />
                      <Button
                        type="primary"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          if (!lookid) return;
                          form.setFieldsValue({ parameterId: Number(lookid) });
                        }}
                      >
                        Search
                      </Button>
                    </div>
                  )}
                </Form.Item>
              </Flex>

              <Flex>
                {bannerType === "product_id" && productList && (
                  <Card
                    className="mb-4 max-w-md mx-auto"
                    title={`Product: ${productList.nameUZB}`}
                    cover={
                      <Image
                        src={productList.productImages?.[0]?.url}
                        alt="Product"
                        style={{ height: 100, objectFit: "contain" }}
                      />
                    }
                  />
                )}

                {bannerType === "look_id" && lookList && (
                  <Card
                    className="mb-4 max-w-md mx-auto"
                    title="Look preview"
                    cover={
                      <Image
                        src={lookList.images?.[0]?.url}
                        alt="Look"
                        style={{ height: 100, objectFit: "contain" }}
                      />
                    }
                  />
                )}
              </Flex>
            </Flex>
          </Flex>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className=" bg-blue-600 hover:bg-blue-700"
            >
              Add Carousel
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* ************************************************* */}

      <Row gutter={[16, 16]}>
        {carouselList?.map((item) => {
          const showMobile = isMobileView[item.id];
          return (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                loading={isLoading}
                hoverable
                styles={{ actions: { padding: 12, gap: 12 } }}
                cover={
                  <Image
                    alt="carousel"
                    src={
                      showMobile
                        ? item.productImages?.url
                        : item.desktopImage?.url
                    }
                    style={{
                      height: 200,
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                }
                actions={[
                  <Button
                    block
                    key="switch"
                    icon={<SwapOutlined />}
                    onClick={() => toggleView(item.id)}
                  />,
                  <Popconfirm
                    title="Rostdan ham o‘chirilsinmi?"
                    onConfirm={() => deleteBanner({ id: item?.id })}
                    okText="Ha"
                    cancelText="Yo‘q"
                  >
                    <Button
                      loading={deletePending}
                      block
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={`ID: ${item.id}`}
                  description={`Type: ${item.karuselType} | Link ID: ${item.parameterId}`}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default BannerTab;
