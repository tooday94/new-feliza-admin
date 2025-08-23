import React, { useEffect, useState } from "react";
import {
  Upload,
  Button,
  Card,
  Col,
  Input,
  Row,
  Image,
  Space,
  Flex,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCreate } from "../../services/mutation/useCreate";
import { useGetById } from "../../services/query/useGetById";
import { endpoints } from "../../configs/endpoints";
import { toast } from "react-toastify";

const { Search } = Input;

const Collection: React.FC = () => {
  const [lookImage, setLookImage] = useState<File | null>(null);
  const [productId, setProductId] = useState("");
  const [lookProducts, setLookProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // ✅ Create mutation
  const { mutate: createLookCollection } = useCreate<any, FormData>({
    endpoint: endpoints.look.post, // example: "/lookCollection/addLookCollection"
    queryKey: endpoints.look.getAll,
  });

  // ✅ Product fetch by ID
  const {
    data: productData,
    refetch,
    isFetching,
    isSuccess,
  } = useGetById<any>({
    endpoint: endpoints.products.getById,
    id: productId,
    enabled: false,
  });

  // ✅ update selectedProduct on productData change
  useEffect(() => {
    if (isSuccess && productData) {
      const exists = lookProducts.some((p) => p.id === productData.id);
      if (exists) {
        toast.warn("Bu mahsulot allaqachon qo‘shilgan", {
          position: "top-center",
        });
        setSelectedProduct(null);
      } else {
        setSelectedProduct(productData);
      }
    }
  }, [isSuccess, productData]);

  // ✅ Image change handler
  const handleImageChange = (info: any) => {
    const file = info.file;
    if (file) {
      setLookImage(file);
    }
  };

  // ✅ Search product by ID
  const handleSearchProduct = () => {
    if (!productId)
      return toast.warn("Mahsulot ID kiriting", { position: "top-center" });
    refetch();
  };

  // ✅ Add selected product to list
  const addProductToList = () => {
    if (selectedProduct) {
      setLookProducts((prev) => [...prev, selectedProduct]);
      setSelectedProduct(null);
      setProductId("");
    }
  };

  // ✅ Remove product from list
  const removeProduct = (id: number) => {
    setLookProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Save to backend using FormData
  const handleSave = () => {
    if (!lookImage || lookProducts.length === 0) {
      return toast.warn("Iltimos, rasm va kamida 1 ta mahsulot tanlang", {
        position: "top-center",
      });
    }

    const formData = new FormData();
    formData.append("files", lookImage); // 1 dona rasm

    const productIds = {
      productIds: lookProducts.map((p) => p.id),
    };

    formData.append("productIds", JSON.stringify(productIds));
    console.log(formData);
    console.log(productIds);

    createLookCollection(formData, {
      onSuccess: () => {
        toast.success("Collection muvaffaqiyatli yaratildi");
        setLookImage(null);
        setProductId("");
        setLookProducts([]);
        setSelectedProduct(null);
      },
      onError: () => {
        toast.error("Xatolik yuz berdi");
      },
    });
  };

  return (
    <div style={{ marginTop: 24 }}>
      <Card title="Yangi Collection">
        <Row gutter={16}>
          {/* ✅ Rasm yuklash */}
          <Col xs={24} md={6}>
            {!lookImage ? (
              <Upload
                accept="image/*"
                listType="picture"
                showUploadList={false}
                beforeUpload={() => false}
                customRequest={() => {}}
                onChange={handleImageChange}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Rasm yuklash</Button>
              </Upload>
            ) : (
              <div className="text-center" style={{ position: "relative" }}>
                <Image
                  src={URL.createObjectURL(lookImage)}
                  width="100%"
                  height={200}
                  style={{ objectFit: "contain" }}
                  title="Yuklangan rasm"
                />
                <span>Lookning Rasmi</span>
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  size="small"
                  onClick={() => setLookImage(null)}
                  style={{ position: "absolute", top: 8, right: 8 }}
                />
              </div>
            )}
          </Col>

          {/* ✅ Tanlangan mahsulotlar */}
          <Col xs={24} md={12}>
            <Row gutter={[8, 8]}>
              {lookProducts.map((item) => (
                <Col key={item.id} xs={8}>
                  <Flex vertical className="border w-fit relative">
                    <Button
                      danger
                      className="!absolute right-1 top-1 z-10"
                      onClick={() => removeProduct(item.id)}
                      icon={<DeleteOutlined />}
                    />
                    <Image
                      src={item?.productImages?.[0]?.url}
                      width={200}
                      style={{ objectFit: "cover" }}
                      // preview={false}
                    />
                    <div className="absolute bottom-0 left-0 bg-white/50 w-full text-center">
                      <span className="">ID: {item.id}</span>
                      <span className="font-semibold line-clamp-1">
                        {item.nameUZB}
                      </span>
                    </div>
                  </Flex>
                </Col>
              ))}
            </Row>
          </Col>

          {/* ✅ Mahsulot ID orqali qidirish */}
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Search
                placeholder="Mahsulot ID"
                enterButton="Qidirish"
                type="number"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                onSearch={handleSearchProduct}
                loading={isFetching}
              />

              {selectedProduct && selectedProduct?.productImages?.[0]?.url && (
                <Card
                  style={{ width: 200 }}
                  size="small"
                  cover={
                    <img
                      src={selectedProduct.productImages[0].url}
                      alt="Preview"
                      style={{ objectFit: "cover", width: 200 }}
                    />
                  }
                  actions={[
                    <Button
                      size="small"
                      type="primary"
                      onClick={addProductToList}
                    >
                      Qo‘shish
                    </Button>,
                  ]}
                />
              )}

              <Button
                type="primary"
                block
                onClick={handleSave}
                style={{ marginTop: 10 }}
              >
                Saqlash
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Collection;
