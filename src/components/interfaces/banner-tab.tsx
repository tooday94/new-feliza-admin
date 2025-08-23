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
  EyeOutlined,
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
import { toast } from "react-toastify";

const { Option } = Select;

const BannerTab = () => {
  const [form] = Form.useForm();
  const [bannerType, setbannerType] = useState("category_id");
  const [isMobileView, setIsMobileView] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [productId, setproductId] = useState("");
  const [lookid, setlookid] = useState("");

  const [mobilePreview, setMobilePreview] = useState<any[]>([]);
  const [desktopPreview, setDesktopPreview] = useState<any[]>([]);

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

  const { data: lookList } = useGetById<{
    id: number;
    images: [{ url: string }];
  }>({
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
        toast.success("Yangi Karusel qo'shildi!");
        form.resetFields();
      },
      onError: (err) => {
        console.log(err);
        toast.error("Xatolik yuz berdi, qayta urinib ko'ring");
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 md:px-4">
      <Card className="mx-auto shadow-lg rounded-xl p-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            karuselType: "category_id",
          }}
        >
          <Flex
            justify="space-between"
            gap={48}
            className="!mb-4 flex-wrap md:flex-nowrap"
          >
            <Flex
              gap={48}
              justify="space-between"
              // vertical
              className="max-w-4xl w-full"
            >
              <Flex vertical>
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
                    showUploadList={false} // antd ning default listini o‘chirib qo‘yamiz
                    onChange={({ fileList }) => setMobilePreview(fileList)}
                  >
                    <Button size="large" icon={<UploadOutlined />}>
                      Telefon uchun rasm yuklash
                    </Button>
                  </Upload>
                </Form.Item>

                {/* Mobile preview card */}
                {mobilePreview.map((file) => {
                  const url =
                    file.url || URL.createObjectURL(file.originFileObj);
                  return (
                    <Flex className="border relative justify-center w-fit">
                      <Image
                        src={url}
                        alt="mobile preview"
                        style={{ height: 300, objectFit: "contain" }}
                      />
                      <Button
                        className="!absolute top-1 right-1"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => (
                          setMobilePreview(
                            mobilePreview.filter((f) => f.uid !== file.uid)
                          ),
                          form.setFieldsValue({ mobileImg: [] })
                        )}
                      />
                    </Flex>
                  );
                })}
              </Flex>

              <Flex vertical justify="start" className="w-full">
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
                    showUploadList={false}
                    onChange={({ fileList }) => setDesktopPreview(fileList)}
                  >
                    <Button size="large" icon={<UploadOutlined />}>
                      Kompyuter uchun rasm yuklash
                    </Button>
                  </Upload>
                </Form.Item>

                {/* Desktop preview card */}
                {desktopPreview.map((file) => {
                  const url =
                    file.url || URL.createObjectURL(file.originFileObj);
                  return (
                    <Flex className="relative justify-center w-fit border">
                      <Image
                        src={url}
                        alt="desktop preview"
                        style={{
                          height: 300,
                          objectFit: "contain",
                          width: 600,
                        }}
                      />
                      <Button
                        className="!absolute top-1 right-1"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => (
                          setDesktopPreview(
                            desktopPreview.filter((f) => f.uid !== file.uid)
                          ),
                          form.setFieldsValue({ desktopImg: [] })
                        )}
                      />
                    </Flex>
                  );
                })}
              </Flex>
            </Flex>

            <Flex vertical>
              <Flex gap={24} wrap>
                <Form.Item
                  className="w-full"
                  label="Banner Turini tanlang"
                  name="karuselType"
                  rules={[{ required: true, message: "Please select type" }]}
                >
                  <Select
                    size="large"
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
                      size="large"
                      className="min-w-full !w-full md:min-w-sm"
                      placeholder="Kategoriya tanlang"
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
                        size="large"
                        placeholder="Mahsulot ID sini kiriting"
                        value={productId}
                        onChange={(e) => setproductId(e.target.value)}
                        onPressEnter={async () => {
                          if (!productId) return;
                          form.setFieldsValue({
                            parameterId: Number(productId),
                          });
                          const { data } = await refetchProduct();
                          if (!data) toast.error("Mahsulot topilmadi");
                        }}
                      />
                      <Button
                        size="large"
                        type="primary"
                        className="w-full sm:w-auto"
                        onClick={async () => {
                          if (!productId) return;
                          form.setFieldsValue({
                            parameterId: Number(productId),
                          });
                          const { data } = await refetchProduct();
                          if (!data) toast.error("Mahsulot topilmadi");
                        }}
                      >
                        Qidirish
                      </Button>
                    </div>
                  )}

                  {bannerType === "look_id" && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        size="large"
                        placeholder="Look ID sini kiriting"
                        value={lookid}
                        onChange={(e) => setlookid(e.target.value)}
                        onPressEnter={() => {
                          if (!lookid) return;
                          form.setFieldsValue({ parameterId: Number(lookid) });
                        }}
                      />
                      <Button
                        size="large"
                        type="primary"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          if (!lookid) return;
                          form.setFieldsValue({ parameterId: Number(lookid) });
                        }}
                      >
                        Qidirish
                      </Button>
                    </div>
                  )}
                </Form.Item>
              </Flex>

              <Flex>
                {bannerType === "product_id" && productList && (
                  <Card
                    className="mb-4 max-w-md mx-auto"
                    title={`Mahsulot: ${productList.nameUZB}`}
                    cover={
                      <Image
                        src={productList.productImages?.[0]?.url}
                        alt="Product"
                        style={{ height: 200, objectFit: "contain" }}
                      />
                    }
                  />
                )}

                {bannerType === "look_id" && lookList && (
                  <Card
                    className="mb-4 max-w-md mx-auto"
                    title={`Look ID: ${lookList?.id}`}
                    cover={
                      <Image
                        src={lookList.images?.[0]?.url}
                        alt="Look"
                        style={{ height: 200, objectFit: "contain" }}
                      />
                    }
                  />
                )}
              </Flex>
            </Flex>
          </Flex>

          <Form.Item>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={isPending}
            >
              Banner Qo'shish
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
                      objectFit: "contain",
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
