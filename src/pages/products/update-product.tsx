import { useNavigate, useParams } from "react-router-dom";
import { useGetById } from "../../services/query/useGetById";
import { endpoints } from "../../configs/endpoints";
import type {
  allBrandsType,
  allColorsType,
  Product,
} from "../../types/products-type";
import {
  Button,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Spin,
  Switch,
  Tag,
  Tooltip,
  TreeSelect,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  LeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useGetList } from "../../services/query/useGetList";
import React, { useEffect, useState } from "react";
import {
  localIKPUNumbers,
  localMXIKNumbers,
  localSizesData,
} from "../../components/products/local-data";
import { useUpdate } from "../../services/mutation/useUpdate";
import { toast } from "react-toastify";
import type { CategoriesAllType } from "../../types/categories-type";
import { useCreate } from "../../services/mutation/useCreate";

const UpdateProduct = () => {
  const [form] = Form.useForm();
  const colorIdValue = Form.useWatch("colorId", form);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, refetch } = useGetById<Product>({
    id: id || "",
    endpoint: endpoints.products.getById,
  });

  const { data: allColors } = useGetList<allColorsType[]>({
    endpoint: endpoints.color.getAll,
  });

  const { data: allBrands, isLoading: allBrandsLoad } = useGetList<
    allBrandsType[]
  >({
    endpoint: endpoints.brand.getAll,
  });

  const mergedSizesData = React.useMemo(() => {
    // API dan kelgan size’lar
    const apiSizes = data?.productSizeVariantList?.map((i) => i.size) || [];

    // localSizesData ichidagi barcha qiymatlarni tekislab olish
    const allLocalValues = localSizesData.flatMap(
      (cat) => cat.children?.map((c) => c.value) || []
    );

    // Localda yo‘q bo‘lgan size’larni topish
    const extraSizes = apiSizes.filter(
      (size) => !allLocalValues.includes(size)
    );

    // Agar extraSizes bo‘lsa, Boshqa parentini qo‘shamiz
    if (extraSizes.length > 0) {
      return [
        ...localSizesData,
        {
          title: "Boshqa",
          value: "Boshqa",
          selectable: false,
          className: "text-xl font-bold",
          children: extraSizes.map((size) => ({
            className: "text-xl",
            title: size,
            value: size,
          })),
        },
      ];
    }

    // Agar hammasi localSizesData ichida bo‘lsa, shuni qaytaramiz
    return localSizesData;
  }, [data]);

  const { data: allParentCategory, isLoading: allParentCategoryLoad } =
    useGetList<CategoriesAllType[]>({
      endpoint: endpoints.category.getParent,
    });

  const { data: allSubCategory, isLoading: allSubCategoryLoad } = useGetList<
    CategoriesAllType[]
  >({
    endpoint: endpoints.category.getSub,
  });

  const { mutate: updateProduct, isPending: updateProductPending } = useUpdate({
    endpoint: endpoints.products.put,
    queryKey: endpoints.products.getAll,
  });

  const buildTreeData = () => {
    return allParentCategory?.map((parent) => {
      const children = allSubCategory
        ?.filter((sub) => sub.parentCategoryUZ === parent.nameUZB)
        .map((sub) => ({
          title: sub.nameUZB,
          value: sub.id.toString(),
          className: "text-lg",
        }));

      return {
        className: "text-xl",
        title: parent.nameUZB,
        value: parent.id.toString(),
        children: children?.length ? children : undefined,
      };
    });
  };

  const ref = data?.referenceNumber;
  const [updateRefValue, setUpdateRefValue] = useState(ref);
  const { mutate: updateProductRef, isPending: updateProductRefPending } =
    useUpdate({
      endpoint: endpoints.products.putByRefNumber,
      queryKey: endpoints.products.getById,
    });

  const { mutate: updateStatus, isPending: updateStatusPending } = useCreate({
    endpoint: "api/product/changeActive/" + id,
    queryKey: endpoints.products.getAll,
  });

  const handleUpdateRef = ({
    ref,
    id,
  }: {
    ref: string;
    id: number | string;
  }) => {
    console.log(ref);

    const formData = new FormData();
    formData.append("refNumber", ref);

    if (ref.length > 2 && id) {
      updateProductRef(
        { data: formData, id },
        {
          onSuccess: () => {
            toast.success("Ref Nomer O'zgartirildi!");
          },
          onError: () => {
            toast.error("Ref o'zgartirishda xatolik");
          },
        }
      );
    }
  };

  console.log(data);

  useEffect(() => {
    console.log("dadadada");

    if (data) {
      form.setFieldsValue({
        ...data,
        ikpuNumber: data.ikpunumber,
        brandId: data.brand?.id,
        colorId: data.color?.id,
        categoryId: data.category?.map((c) => String(c.id)),
        productSizeVariantDtoList:
          data.productSizeVariantList?.map((item) => ({
            size: String(item.size),
            barCode: item.barCode,
            quantity: item.quantity,
          })) || [],
      });
    }
  }, [data, form]);

  if (isLoading) {
    return <Spin />;
  }
  // console.log(selectedColorId);
  // console.log(data);

  return (
    <div className="space-y-3">
      <Button
        size="large"
        type="primary"
        children="Mahsulotlarga qaytish"
        icon={<LeftOutlined />}
        onClick={() => navigate(-1)}
      />

      <div className="grid grid-cols-3 md:!flex !justify-between gap-2">
        <Image.PreviewGroup>
          {data?.productImages.map((img) => (
            <Image key={img.id} src={img.url} />
          ))}
        </Image.PreviewGroup>
      </div>

      <Flex className="!mb-5" gap={24} justify="space-between">
        <Flex>
          <Popconfirm
            placement="left"
            title="Status o'zgarishini tasdiqlaysizmi?"
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() =>
              updateStatus(
                {},
                {
                  onSuccess: () => {
                    refetch();
                    toast.success("Mahsulot Statusi o'gartirilidi");
                  },
                  onError: () => {
                    toast.error("Mahsulot Status o'zgartirishda xatolik");
                  },
                }
              )
            }
          >
            <Flex align="center" gap={12}>
              <Typography.Title className="!m-0" level={3}>
                Mahsulot Statusi:
              </Typography.Title>
              <Switch
                loading={updateStatusPending}
                size="default"
                style={{ color: "red" }}
                className={`!text-primary ${data?.active ? "" : "!bg-red-500"}`}
                checkedChildren="faol"
                unCheckedChildren="faol emas"
                value={data?.active}
              />
            </Flex>
          </Popconfirm>
        </Flex>
        <Flex>
          <Input
            size="large"
            placeholder="ref"
            defaultValue={data?.referenceNumber}
            value={updateRefValue}
            onChange={(e) => setUpdateRefValue(e.target.value)}
          />

          <Button
            loading={updateProductRefPending}
            disabled={updateRefValue ? false : true}
            size="large"
            type="primary"
            children="Ref o'zgartirish"
            onClick={() =>
              handleUpdateRef({
                id: data?.id || "",
                ref: updateRefValue || "",
              })
            }
          />
        </Flex>
      </Flex>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...data,
          ikpuNumber: data?.ikpunumber,
          brandId: data?.brand.id,
          colorId: data?.color.id,
          categoryId: data?.category?.map((c) => String(c.id)),
          productSizeVariantDtoList:
            data?.productSizeVariantList?.map((item) => ({
              size: String(item.size),
              barCode: item.barCode,
              quantity: item.quantity,
            })) || [],
        }}
        onFinish={(values) => {
          if (Array.isArray(values.ikpuNumber)) {
            values.ikpuNumber = values.ikpuNumber[0];
          }

          // Agar mxikNumber array bo‘lsa, birinchi elementini olish
          if (Array.isArray(values.mxikNumber)) {
            values.mxikNumber = values.mxikNumber[0];
          }
          const payload = {
            ...values,
            active: data?.active,
            productSizeVariantDtoList: values.productSizeVariantDtoList.map(
              (v: any) => ({
                size: v.size,
                barCode: v.barCode,
                quantity: Number(v.quantity),
              })
            ),
          };
          console.log(payload);

          updateProduct(
            { data: payload, id },
            {
              onSuccess: () => {
                toast.success("Mahsulot o'zgartirildi");
                refetch();
              },
              onError: () => {
                toast.error("Mahsulot o'zgartirishda xatolik");
              },
            }
          );
        }}
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
            <Input size="large" placeholder="Mahsulot nomini kiriting UZB" />
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: "kiritish shart!" }]}
            className="w-full"
            name={"nameRUS"}
            label="Mahsulot nomi (RUS)"
          >
            <Input size="large" placeholder="Mahsulot nomini kiriting RUS" />
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
            </Flex>

            <Flex gap={12} align="center" className="flex-wrap md:flex-nowrap">
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
              <Form.Item
                className="w-full"
                rules={[{ required: true, message: "kiritish shart!" }]}
                name={"sellPrice"}
                label="Sotilish narxi"
              >
                <InputNumber
                  className="!w-full"
                  min={0}
                  type="number"
                  size="large"
                  placeholder="Sotilish narxini kiriting"
                />
              </Form.Item>
            </Flex>
          </Flex>
        </Flex>

        <Flex gap={12} className="flex-wrap-reverse md:flex-nowrap">
          <Form.Item className="w-full" name={"colorId"} label="Ranglar">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 max-h-96 h-full overflow-y-scroll w-full">
              {allColors?.map((color) => {
                const isSelected =
                  String(colorIdValue ?? "") === String(color.id);
                return (
                  <Tooltip title={color.nameUZB} key={color.id}>
                    <Tag
                      className="!flex !justify-center !items-center"
                      key={color.id}
                      onClick={() => form.setFieldsValue({ colorId: color.id })}
                      icon={
                        isSelected ? (
                          <CheckCircleOutlined className="text-xl !text-primary bg-white rounded-full" />
                        ) : null
                      }
                      style={{
                        width: 50,
                        height: 30,
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
                );
              })}
            </div>
          </Form.Item>

          <Form.Item
            rules={[{ required: true, message: "Kategoriya tanlash shart!" }]}
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
              filterTreeNode={(input, node) =>
                (node.title as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
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
        </Flex>

        <Form.List name="productSizeVariantDtoList">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Flex
                  key={key}
                  gap={12}
                  align="center"
                  wrap
                  className="border w-fit md:!p-3 rounded"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "size"]}
                    rules={[{ required: true, message: "Size kiriting!" }]}
                  >
                    <TreeSelect
                      treeDefaultExpandedKeys={["Boshqa"]}
                      showSearch={true}
                      treeData={mergedSizesData}
                      placeholder="O'lchamni tanlang"
                      size="large"
                      className="md:!w-full !w-full !uppercase min-w-xs"
                      loading={isLoading}
                      styles={{ popup: { root: { fontSize: 44 } } }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "barCode"]}
                    rules={[{ required: true, message: "Barcode kiriting!" }]}
                  >
                    <Input size="large" placeholder="Barcode" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[{ required: true, message: "Miqdor kiriting!" }]}
                  >
                    <InputNumber size="large" placeholder="Miqdor" min={0} />
                  </Form.Item>

                  <Button
                    className="mb-6"
                    size="large"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => remove(name)}
                  >
                    O‘chirish
                  </Button>
                </Flex>
              ))}
              <Button
                icon={<PlusOutlined />}
                size="large"
                className="my-6"
                type="dashed"
                onClick={() => add()}
              >
                Yangi variant qo‘shish
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item className="text-center">
          <Button
            loading={updateProductPending}
            className="max-w-md"
            block
            htmlType="submit"
            type="primary"
            children="Saqlash"
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default UpdateProduct;
