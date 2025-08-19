import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Tooltip,
  TreeSelect,
  type UploadFile,
} from "antd";
import {
  CheckCircleOutlined,
  CloseOutlined,
  LeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import type { CategoriesAllType } from "../../types/categories-type";
import { useCreate } from "../../services/mutation/useCreate";
import { toast } from "react-toastify";
import type { allBrandsType, allColorsType } from "../../types/products-type";
import SortableUpload from "../../components/products/sortable-upload";
import {
  localIKPUNumbers,
  localMXIKNumbers,
  localSizesData,
} from "../../components/products/local-data";

const CreateProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  console.log(selectedSizes);

  const [sizeDetails, setSizeDetails] = useState<
    {
      colorId: number;
      size: string;
      barCode: string;
      quantity: number;
    }[]
  >([]);

  const updateSizeDetail = (
    colorId: number,
    size: string,
    barCode: string | null,
    quantity: number | null
  ) => {
    setSizeDetails((prev) => {
      const existing = prev.find(
        (item) => item.colorId === colorId && item.size === size
      );

      if (existing) {
        return prev.map((item) =>
          item.colorId === colorId && item.size === size
            ? {
                ...item,
                barCode: barCode !== null ? barCode : item.barCode,
                quantity: quantity !== null ? quantity : item.quantity,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            colorId,
            size,
            barCode: barCode ?? "",
            quantity: quantity ?? 0,
          },
        ];
      }
    });
  };

  const [colorImages, setColorImages] = useState<
    { imagesList: UploadFile[]; colorId: number }[]
  >([]);

  console.log(colorImages);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { mutate: AddProduct } = useCreate({
    endpoint: endpoints.products.post,
    queryKey: endpoints.products.getAll,
  });

  const { data } = useGetList<allColorsType[]>({
    endpoint: endpoints.color.getAll,
  });

  const { data: allBrands, isLoading: allBrandsLoad } = useGetList<
    allBrandsType[]
  >({
    endpoint: endpoints.brand.getAll,
  });

  const { data: allParentCategory, isLoading: allParentCategoryLoad } =
    useGetList<CategoriesAllType[]>({
      endpoint: endpoints.category.getParent,
    });

  const { data: allSubCategory, isLoading: allSubCategoryLoad } = useGetList<
    CategoriesAllType[]
  >({
    endpoint: endpoints.category.getSub,
    // enabled: parentCategorySelected ? true : false,
  });

  const buildTreeData = () => {
    return allParentCategory?.map((parent) => {
      const children = allSubCategory
        ?.filter((sub) => sub.parentCategoryUZ === parent.nameUZB)
        .map((sub) => ({
          title: sub.nameUZB,
          value: sub.id.toString(),
          // icon: <SubnodeOutlined />,
          className: "text-lg",
        }));

      return {
        // icon: <AppstoreOutlined />,
        className: "text-xl",
        title: parent.nameUZB,
        value: parent.id.toString(),
        children: children?.length ? children : undefined,
      };
    });
  };

  const toggleColor = (id: number) => {
    const updated = selectedColors.includes(id)
      ? selectedColors.filter((colorId) => colorId !== id)
      : [...selectedColors, id];

    setSelectedColors(updated);
    console.log("Selected Colors:", updated);
  };

  const onFinish = (values: any) => {
    selectedColors.map((colorId) => {
      const productSizeVariantDtoList = sizeDetails
        .filter((item) => item.colorId === colorId)
        .map(({ size, barCode, quantity }) => ({
          size,
          barCode,
          quantity,
        }));

      let productImageList: File[] = [];
      colorImages.forEach((imageObj) => {
        if (imageObj.colorId === colorId) {
          productImageList = imageObj.imagesList
            .map((f) => f.originFileObj)
            .filter(Boolean) as File[];
        }
      });
      console.log(productImageList);
      const formData = new FormData();
      if (Array.isArray(values.ikpuNumber)) {
        values.ikpuNumber = values.ikpuNumber[0];
      }

      // Agar mxikNumber array bo‘lsa, birinchi elementini olish
      if (Array.isArray(values.mxikNumber)) {
        values.mxikNumber = values.mxikNumber[0];
      }

      let FullData = {
        nameUZB: values.nameUZB,
        nameRUS: values.nameRUS,
        descriptionUZB: values.descriptionUZB,
        descriptionRUS: values.descriptionRUS,
        ikpuNumber: values.ikpuNumber,
        mxikNumber: values.mxikNumber,
        active: true,
        referenceNumber: referenceNumber,
        importPrice: values.importPrice,
        sellPrice: values.sellPrice,
        sale: 0,
        brandId: values.brandId,
        categoryId: selectedCategories.map((id) => Number(id)),
        colorId,
        productSizeVariantDtoList,
      };

      console.log(FullData);

      formData.append("productDto", JSON.stringify(FullData));

      for (let i = 0; i < productImageList.length; i++) {
        formData.append("files", productImageList[i]);
      }

      console.log("Yuboriladigan mahsulotlar JSON:", FullData);
      return AddProduct(formData, {
        onSuccess: () => (
          toast.success("Yangi Mahsulot Qo'shildi!"),
          form.resetFields(),
          setColorImages([]),
          setReferenceNumber(""),
          setSelectedSizes([]),
          setSizeDetails([])
        ),
        onError: () =>
          toast.error("Mahsulot Qo'shishda Xatolik. Qayta urinib ko'ring..."),
      });
    });
  };

  console.log(selectedSizes);

  const handlePreview = async (file: UploadFile) => {
    let src = file.url as string;

    // Agar local fayl bo‘lsa (yangi qo‘shilgan)
    if (!src && file.originFileObj) {
      src = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }

    // Oynada ochish
    const image = document.createElement("img");
    image.src = src;
    const imgWindow = window.open(src);
    if (imgWindow) {
      imgWindow.document.write(image.outerHTML);
    }
  };

  const [newSize, setNewSize] = useState("");
  const [treeData, setTreeData] = useState(localSizesData);

  const addNewSize = () => {
    if (!newSize.trim()) return;
    const formattedSize = newSize.toUpperCase();

    // Format tekshirish
    const isShoeSize = /^\d{2}-\d+$/.test(formattedSize); // masalan 35-225
    const isClothSize = /^\d*[A-Z]+-\d+$/.test(formattedSize); // masalan M-44 yoki 3XL-546

    const updated = [...treeData];

    // Boshqalar parentini topish yoki yaratish
    let othersIndex = updated.findIndex((p) => p.value === "Boshqalar");
    if (othersIndex === -1) {
      updated.push({
        title: "Boshqalar",
        value: "Boshqalar",
        className: "text-xl text-red-500",
        selectable: false,
        children: [],
      });
      othersIndex = updated.length - 1;
    }

    // Avval mavjudligini tekshirish
    const exists = updated[othersIndex].children.some(
      (child) => child.value === formattedSize
    );

    if (!exists) {
      updated[othersIndex].children.push({
        title: formattedSize,
        value: formattedSize,
        className: isShoeSize
          ? "text-xl text-blue-500"
          : isClothSize
          ? "text-xl text-green-500"
          : "text-xl text-red-500", // rang formatga qarab
      });
    }

    setTreeData(updated);

    // Avtomatik tanlash
    setSelectedSizes((prev) =>
      prev.includes(formattedSize) ? prev : [...prev, formattedSize]
    );

    setNewSize("");
  };

  return (
    <div className="space-y-4">
      <Button
        size="large"
        type="primary"
        onClick={() => navigate("/admin/products")}
        icon={<LeftOutlined />}
        children="Mahsulotlarga qaytish"
      />

      <div className="">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={({ errorFields }) => {
            if (errorFields.length > 0) {
              toast.error("Iltimos, barcha majburiy maydonlarni to‘ldiring!", {
                position: "top-center",
              });
            }
          }}
        >
          <Flex className="flex-wrap md:flex-nowrap" gap={12}>
            <Form.Item
              rules={[{ required: true, message: "kiritish shart!" }]}
              className="w-full"
              name={"nameUZB"}
              label="Mahsulot nomi (UZB)"
            >
              <Input
                allowClear
                size="large"
                placeholder="Mahsulot nomini kiriting UZB"
              />
            </Form.Item>

            <Form.Item
              rules={[{ required: true, message: "kiritish shart!" }]}
              className="w-full"
              name={"nameRUS"}
              label="Mahsulot nomi (RUS)"
            >
              <Input
                allowClear
                size="large"
                placeholder="Mahsulot nomini kiriting RUS"
              />
            </Form.Item>
          </Flex>

          <Flex className="flex-wrap md:flex-nowrap" gap={12}>
            <Form.Item
              rules={[{ required: true, message: "kiritish shart!" }]}
              className="w-full"
              name={"descriptionUZB"}
              label="Mahsulot haqida (UZB)"
            >
              <Input.TextArea
                allowClear
                autoSize={{ minRows: 7 }}
                size="large"
                placeholder="Mahsulot tavsifini kiriting UZB"
              />
            </Form.Item>

            <Form.Item
              rules={[{ required: true, message: "kiritish shart!" }]}
              className="w-full"
              name={"descriptionRUS"}
              label="Mahsulot haqida (RUS)"
            >
              <Input.TextArea
                allowClear
                autoSize={{ minRows: 7 }}
                size="large"
                placeholder="Mahsulot tavsifini kiriting RUS"
              />
            </Form.Item>
          </Flex>

          <Flex
            className="flex-wrap md:flex-nowrap"
            gap={12}
            justify="space-between"
            align="center"
          >
            <Flex className="w-full flex-col">
              <Flex
                align="center"
                className="flex-wrap md:flex-nowrap"
                gap={12}
              >
                <Form.Item
                  className="w-full"
                  rules={[{ required: true, message: "kiritish shart!" }]}
                  name={"ikpuNumber"}
                  label="IKPU nomer"
                >
                  {/* <Input
                    allowClear
                    size="large"
                    placeholder="IKPU nomer kiriting"
                  /> */}
                  <Select
                    showSearch
                    mode="tags"
                    maxCount={1}
                    size="large"
                    optionFilterProp="label"
                    options={localIKPUNumbers.map((item) => ({
                      label: `${item.label}: ${item.value}`,
                      value: item.value,
                    }))}
                    onChange={(val) => {
                      console.log(val);

                      const selectOptions = localIKPUNumbers.map((item) => ({
                        label: item.label,
                        value: item.value,
                      }));
                      const selectedLabel = selectOptions.find(
                        (o) => o.value == val
                      )?.label;
                      const matched = localMXIKNumbers.find(
                        (o) => o.label === selectedLabel
                      );
                      if (matched) {
                        form.setFieldsValue({ mxikNumber: matched?.value });
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  className="w-full"
                  rules={[{ required: true, message: "kiritish shart!" }]}
                  name={"mxikNumber"}
                  label="MXIK nomer"
                >
                  {/* <Input
                    allowClear
                    size="large"
                    placeholder="MXIK nomer kiriting"
                  /> */}
                  <Select
                    mode="tags"
                    maxCount={1}
                    showSearch
                    size="large"
                    optionFilterProp="label"
                    options={localMXIKNumbers.map((item) => ({
                      label: `${item.label}: ${item.value}`,
                      value: item.value,
                    }))}
                    onChange={(val) => {
                      const selectOptions = localMXIKNumbers.map((item) => ({
                        label: item.label,
                        value: item.value,
                      }));
                      const selectedLabel = selectOptions.find(
                        (o) => o.value == val
                      )?.label;
                      const matched = localIKPUNumbers.find(
                        (o) => o.label === selectedLabel
                      );
                      console.log(matched);
                      if (matched) {
                        form.setFieldsValue({ ikpuNumber: matched?.value });
                      }
                    }}
                  />
                </Form.Item>
              </Flex>

              <Flex
                gap={12}
                align="center"
                className="flex-wrap md:flex-nowrap"
              >
                <Form.Item
                  className="w-full"
                  rules={[{ required: true, message: "kiritish shart!" }]}
                  name={"importPrice"}
                  label="Kirish narxi"
                >
                  <InputNumber
                    min={0}
                    type="number"
                    className="!w-full"
                    size="large"
                    placeholder="Kirish narxini kiriting"
                  />
                </Form.Item>

                <Form.Item
                  className="w-full"
                  rules={[{ required: true, message: "kiritish shart!" }]}
                  name={"sellPrice"}
                  label="Sotilish narxi"
                >
                  <InputNumber
                    min={0}
                    className="!w-full"
                    type="number"
                    size="large"
                    placeholder="Sotilish narxini kiriting"
                  />
                </Form.Item>
              </Flex>
            </Flex>

            <Flex className="w-full">
              <Flex vertical className="w-full">
                <Form.Item
                  rules={[
                    { required: true, message: "Kategoriya tanlash shart!" },
                  ]}
                  name="categoryId"
                  label="Kategoriya tanlang"
                  className="w-full"
                >
                  <TreeSelect
                    treeLine
                    treeIcon
                    multiple
                    allowClear
                    loading={allParentCategoryLoad || allSubCategoryLoad}
                    showSearch={true}
                    placeholder="Kategoriyalar tanlang"
                    size="large"
                    treeData={buildTreeData()}
                    value={selectedCategories}
                    filterTreeNode={(input, node) =>
                      (node.title as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value: string[]) => {
                      setSelectedCategories(value);
                    }}
                    tagRender={(props) => {
                      const flat = buildTreeData()?.flatMap((item) => [
                        { ...item, children: item.children ?? undefined },
                        ...(item.children
                          ? item.children.map((child) => ({
                              ...child,
                              children: undefined,
                            }))
                          : []),
                      ]);
                      const isParent =
                        flat?.find((n) => n.value === props.value)?.children !==
                        undefined;

                      return (
                        <Tag
                          color={isParent ? "green" : "blue"}
                          closable={props.closable}
                          onClose={props.onClose}
                          className="!px-3 !py-2 !text-base"
                        >
                          {props.label}
                        </Tag>
                      );
                    }}
                  />
                </Form.Item>

                <Flex
                  gap={12}
                  className="items-center flex-wrap md:flex-nowrap"
                >
                  <Form.Item
                    rules={[
                      {
                        required: referenceNumber ? false : true,
                        message: "kiritish shart!",
                      },
                    ]}
                    name={"referenceNumber"}
                    label="Reference nomer"
                    className="w-full"
                  >
                    <Flex>
                      <Input
                        allowClear
                        placeholder="Reference nomer kiriting"
                        size="large"
                        value={referenceNumber}
                        style={{
                          borderBottomRightRadius: 0,
                          borderTopRightRadius: 0,
                        }}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                      />
                      <Button
                        type="primary"
                        size="large"
                        children="Generatsiya"
                        style={{
                          borderBottomLeftRadius: 0,
                          borderTopLeftRadius: 0,
                        }}
                        onClick={() =>
                          setReferenceNumber("R" + new Date().getTime())
                        }
                      />
                    </Flex>
                  </Form.Item>

                  <Form.Item
                    rules={[{ required: true, message: "kiritish shart!" }]}
                    name={"brandId"}
                    label="Brand tanlang"
                    className="w-full"
                  >
                    <Select
                      className="!w-full"
                      placeholder="Brand tanlang"
                      size="large"
                      loading={allBrandsLoad}
                      options={allBrands?.map((brand) => ({
                        label: brand.name,
                        value: brand.id,
                      }))}
                    />
                  </Form.Item>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex className="flex-wrap-reverse md:flex-nowrap" gap={12}>
            <Form.Item name={"colorIds"} label="Ranglar" className="w-fit">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 border max-h-96 h-full overflow-y-scroll">
                {data?.map((color) => (
                  <Tooltip title={color.nameUZB} key={color.id}>
                    <Tag
                      className="!flex !justify-center !items-center"
                      key={color.id}
                      onClick={() => toggleColor(color.id)}
                      icon={
                        selectedColors.includes(color.id) ? (
                          <CheckCircleOutlined className="text-xl !text-primary bg-white rounded-full" />
                        ) : null
                      }
                      style={{
                        width: 60,
                        height: 40,
                        fontWeight: "bold",
                        cursor: "pointer",
                        background: color.colorCode,
                        color: "#fff",
                        padding: "4px",
                        borderRadius: 6,
                        border: "1px solid #000",
                      }}
                    />
                  </Tooltip>
                ))}
              </div>
            </Form.Item>

            <Form.Item
              rules={[
                {
                  required: selectedSizes.length > 0 ? false : true,
                  message: "kiritish shart!",
                },
              ]}
              name={"sizes"}
              className="w-full"
              label="O'lcham"
            >
              <Flex className="w-full">
                <TreeSelect
                  treeData={treeData}
                  value={selectedSizes}
                  placeholder="O'lchamni tanlang"
                  size="large"
                  className="md:!w-full !w-full !uppercase"
                  treeCheckable
                  // treeLine
                  allowClear
                  multiple
                  styles={{ popup: { root: { fontSize: 44 } } }}
                  popupRender={(menu) => (
                    <div className="space-y-3 !text-6xl">
                      <div
                        // className="border"
                        style={{ display: "flex", gap: 8, padding: 8 }}
                      >
                        <Input
                          placeholder="Yangi o'lcham kiriting"
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          onPressEnter={addNewSize}
                          allowClear
                        />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={addNewSize}
                        />
                      </div>
                      <div className="!text-xl space-y-5">{menu}</div>
                    </div>
                  )}
                  onChange={(val) =>
                    setSelectedSizes(val.map((v: string) => v.toUpperCase()))
                  }
                  tagRender={(props) => {
                    const { label, closable, onClose } = props;
                    return (
                      <span
                        style={{
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        className="rounded bg-primary/70 text-white m-2 p-1"
                      >
                        {label}
                        {closable && (
                          <CloseOutlined
                            onClick={onClose}
                            style={{
                              marginLeft: 10,
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: 14,
                              color: "red",
                            }}
                          />
                        )}
                      </span>
                    );
                  }}
                />
              </Flex>
            </Form.Item>
          </Flex>

          <div className="space-y-6 flex flex-col flex-wrap md:flex-nowrap">
            {selectedColors.map((colorId) => {
              const colorObj = data?.find((c) => c.id === colorId);

              return (
                <div
                  key={colorId}
                  className="border p-4 rounded-md space-y-2 flex justify-between flex-wrap md:flex-nowrap w-full gap-2"
                >
                  {/* Rang box va file tanlash */}
                  <div className="flex flex-wrap md:flex-nowrap gap-4">
                    <div className="flex flex-col items-center !gap-4 flex-wrap md:flex-nowrap">
                      <div className="text-center space-y-2">
                        <div
                          className="w-10 h-10 rounded-md border mx-auto"
                          style={{ backgroundColor: colorObj?.colorCode }}
                        />
                        <span className="font-medium">{colorObj?.nameUZB}</span>
                      </div>

                      <SortableUpload
                        colorId={colorId}
                        colorImages={colorImages}
                        setColorImages={setColorImages}
                        handlePreview={handlePreview}
                      />
                    </div>
                  </div>

                  <div className="!space-y-2">
                    {selectedSizes?.map((size) => (
                      <Flex
                        key={`${colorId}-${size}`}
                        justify="space-between"
                        className="w-full"
                        align="start"
                        gap={12}
                      >
                        <Flex className="border w-1/2">
                          <Tooltip title={size}>
                            <div
                              className="p-2 w-full text-center"
                              style={{ background: colorObj?.colorCode }}
                            >
                              {size}
                            </div>
                          </Tooltip>
                        </Flex>

                        <Form.Item
                          className="w-full"
                          rules={[
                            {
                              message: "kiritish shart!",
                              required: sizeDetails.find(
                                (item) =>
                                  item.colorId === colorId && item.size === size
                              )?.barCode
                                ? false
                                : true,
                            },
                          ]}
                          name={"barcode"}
                        >
                          <div className="w-full flex">
                            <Input
                              value={
                                sizeDetails.find(
                                  (item) =>
                                    item.colorId === colorId &&
                                    item.size === size
                                )?.barCode || undefined
                              }
                              onChange={(e) =>
                                updateSizeDetail(
                                  colorId,
                                  size,
                                  e.target.value,
                                  null
                                )
                              }
                              size="large"
                              className="md:!max-w-xs !min-w-48"
                              placeholder="barCode"
                              style={{
                                borderBottomRightRadius: 0,
                                borderTopRightRadius: 0,
                              }}
                            />

                            <Button
                              type="primary"
                              size="large"
                              style={{
                                borderBottomLeftRadius: 0,
                                borderTopLeftRadius: 0,
                              }}
                              onClick={() => {
                                const barCode = "B" + new Date().getTime();
                                updateSizeDetail(colorId, size, barCode, null);
                              }}
                            >
                              Generatsiya
                            </Button>
                          </div>
                        </Form.Item>

                        <Form.Item
                          rules={[
                            {
                              message: "kiritish shart!",
                              required: sizeDetails.find(
                                (item) =>
                                  item.colorId === colorId && item.size === size
                              )?.quantity
                                ? false
                                : true,
                            },
                          ]}
                          name={`quantity_${colorId}_${size}`}
                        >
                          <InputNumber
                            size="large"
                            type="number"
                            className="md:!w-56"
                            min={0}
                            placeholder="Soni"
                            onChange={(value) =>
                              updateSizeDetail(colorId, size, null, value || 0)
                            }
                          />
                        </Form.Item>
                      </Flex>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Form.Item className="!mt-5 text-center">
            <Button
              size="large"
              htmlType="submit"
              type="primary"
              children="Mahsulotlarni Qo'shish"
              icon={<PlusOutlined />}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateProduct;
