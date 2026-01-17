import {
  Button,
  Drawer,
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
  CloseOutlined,
  LeftOutlined,
  PlusOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import type { CategoriesAllType } from "../../types/categories-type";
import { toast } from "react-toastify";
import type { allBrandsType, allColorsType } from "../../types/products-type";
import SortableUpload from "../../components/products/sortable-upload";
import {
  localIKPUNumbers,
  localMXIKNumbers,
  localSizesData,
} from "../../components/products/local-data";
import { useBillzGet } from "../../services/billz/query/useBillzGet";
import type { BillzProductType } from "../../types/billz/product-type";
import { useCreate } from "../../services/mutation/useCreate";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

type objectType = {
  products: BillzProductType[];
  count: number;
};

// ✅ partial override (barcode/soni bir-birini o‘chirmasligi uchun)
type SizeDetail = {
  colorId: number;
  size: string; // ADMIN size (masalan L-48)
  barCode?: string;
  quantity?: number;
};

type ColorImages = { imagesList: UploadFile[]; colorId: number };

const getBillzField = (p: BillzProductType, fieldName: string) => {
  const f = p.custom_fields?.find((x) => x.custom_field_name === fieldName);
  return f?.custom_field_value?.toString() || "";
};

const toUpper = (s: any) => (s ?? "").toString().toUpperCase().trim();

const CreateBillzProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [referenceNumber, setReferenceNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [sizOpen, setSizeOpen] = useState(false);
  const [openBlizz, setOpenBlizz] = useState(true);

  // Drawer qaysi billz rang uchun ochildi
  const [activeBillzColor, setActiveBillzColor] = useState<string>("");

  // Billz qidiruv
  const [searchValue, setSearchValue] = useState("");

  // Admin tanlaydigan razmerlar (DEFAULT BO‘SH)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Billz rang nomi -> system colorId mapping
  const [billzColorToColorId, setBillzColorToColorId] = useState<
    Record<string, number>
  >({});

  // ADMIN override values
  const [sizeDetails, setSizeDetails] = useState<SizeDetail[]>([]);

  const [colorImages, setColorImages] = useState<ColorImages[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { mutate: AddProduct, isPending } = useCreate({
    endpoint: endpoints.products.post,
    queryKey: endpoints.products.getAll,
  });

  const { data: colorsData } = useGetList<allColorsType[]>({
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
  });

  // Billz GET
  const { data: BillzProducts, refetch } = useBillzGet<objectType>({
    endpoint: "/v2/products",
    params: {
      search: searchValue,
      limit: 100,
    },
    enabled: true,
  });

  // Billz matrix: billzColor -> billzSize -> { barcode, qty }
  const billzMatrix = useMemo(() => {
    const matrix: Record<
      string,
      Record<string, { barcode: string; quantity: number }>
    > = {};
    const list = BillzProducts?.products || [];

    list.forEach((p) => {
      const billzColor = getBillzField(p, "Цвет") || "N/A";
      const sizeRaw = getBillzField(p, "Размер") || "STANDART";
      const billzSize = sizeRaw === "0" ? "STANDART" : sizeRaw;

      const qty =
        p.shop_measurement_values?.find((v) => v.shop_name === "Online")
          ?.active_measurement_value || 0;

      const barcode = p.barcode || "";

      if (!matrix[billzColor]) matrix[billzColor] = {};
      if (!matrix[billzColor][billzSize]) {
        matrix[billzColor][billzSize] = { barcode, quantity: qty };
      }
    });

    return matrix;
  }, [BillzProducts]);

  const billzColors = useMemo(() => Object.keys(billzMatrix), [billzMatrix]);

  // UI’dan o‘chirish uchun visible ranglar
  const [visibleBillzColors, setVisibleBillzColors] = useState<string[]>([]);
  useEffect(() => {
    setVisibleBillzColors(billzColors);
  }, [billzColors]);

  // ✅ Billz ko‘rish dropdown tanlovi (har rang blok uchun)
  const [billzViewSizeByColor, setBillzViewSizeByColor] = useState<
    Record<string, string>
  >({});

  // Default view size
  useEffect(() => {
    setBillzViewSizeByColor((prev) => {
      const next = { ...prev };
      visibleBillzColors.forEach((cName) => {
        const sizes = Object.keys(billzMatrix[cName] || {});
        if (!sizes.length) return;
        if (!next[cName] || !sizes.includes(next[cName])) {
          next[cName] = sizes[0];
        }
      });
      return next;
    });
  }, [billzMatrix, visibleBillzColors]);

  // Auto-fill: faqat form va reference
  useEffect(() => {
    const list = BillzProducts?.products || [];
    if (!list.length) return;

    const firstProduct = list[0];

    form.setFieldsValue({
      nameUZB: firstProduct.name,
      nameRUS: firstProduct.name,
      importPrice:
        firstProduct?.product_supplier_stock?.[0]?.max_supply_price || 0,
      sellPrice: firstProduct?.shop_prices?.[0]?.retail_price || 0,
    });

    setReferenceNumber(firstProduct?.sku || "");
  }, [BillzProducts, form]);

  // ======== BILLZ SIZE -> ADMIN SIZE mapping logika ========
  const getBaseSize = (adminSize: string) =>
    toUpper(adminSize).split("-")[0].trim();

  const findBillzSizeKey = (billzSizes: string[], adminSize: string) => {
    const adminUpper = toUpper(adminSize);
    const base = getBaseSize(adminSize);
    const upperBillz = billzSizes.map((x) => toUpper(x));

    const exactIndex = upperBillz.findIndex((x) => x === adminUpper);
    if (exactIndex !== -1) return billzSizes[exactIndex];

    const baseIndex = upperBillz.findIndex((x) => x === base);
    if (baseIndex !== -1) return billzSizes[baseIndex];

    const startsIndex = upperBillz.findIndex((x) => x.startsWith(base));
    if (startsIndex !== -1) return billzSizes[startsIndex];

    return null;
  };

  const getBillzDefaultForAdminSize = (
    billzColorName: string,
    adminSize: string
  ) => {
    const variants = billzMatrix[billzColorName] || {};
    const keys = Object.keys(variants);
    const matchedKey = findBillzSizeKey(keys, adminSize);

    if (!matchedKey) return { barcode: "", quantity: 0, matchedKey: "" };

    return {
      barcode: variants[matchedKey]?.barcode || "",
      quantity: variants[matchedKey]?.quantity || 0,
      matchedKey,
    };
  };

  // helper: colorId boshqa billz ranglarda ishlatilganmi?
  const countUsage = (map: Record<string, number>, colorId: number) =>
    Object.values(map).filter((v) => v === colorId).length;

  const toggleColorForActiveBillzColor = (newColorId: number) => {
    if (!activeBillzColor) return;

    setBillzColorToColorId((prev) => {
      const next = { ...prev };
      const prevId = next[activeBillzColor];

      // same id bosilsa -> unassign
      if (prevId === newColorId) {
        delete next[activeBillzColor];

        if (prevId && countUsage(prev, prevId) === 1) {
          setColorImages((imgs) => imgs.filter((x) => x.colorId !== prevId));
          setSizeDetails((sd) => sd.filter((x) => x.colorId !== prevId));
        }
        return next;
      }

      next[activeBillzColor] = newColorId;

      // oldId endi ishlatilmasa cleanup
      if (prevId && countUsage(prev, prevId) === 1) {
        setColorImages((imgs) => imgs.filter((x) => x.colorId !== prevId));
        setSizeDetails((sd) => sd.filter((x) => x.colorId !== prevId));
      }

      return next;
    });
  };

  const showDrawer = (billzColorName: string) => {
    setActiveBillzColor(billzColorName);
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
    setActiveBillzColor("");
  };

  const sizShowDrawer = () => setSizeOpen(true);
  const sizOnClose = () => setSizeOpen(false);

  // ✅ FIX: faqat o‘zgargan field override bo‘ladi
  const updateSizeDetail = (
    colorId: number,
    size: string,
    barCode: string | null,
    quantity: number | null
  ) => {
    const s = toUpper(size);

    setSizeDetails((prev) => {
      const idx = prev.findIndex((x) => x.colorId === colorId && x.size === s);

      if (idx !== -1) {
        const current = prev[idx];
        const updated: SizeDetail = {
          ...current,
          ...(barCode !== null ? { barCode } : {}),
          ...(quantity !== null ? { quantity } : {}),
        };
        const next = [...prev];
        next[idx] = updated;
        return next;
      }

      const created: SizeDetail = {
        colorId,
        size: s,
        ...(barCode !== null ? { barCode } : {}),
        ...(quantity !== null ? { quantity } : {}),
      };
      return [...prev, created];
    });
  };

  const removeBillzColorVariant = (billzColorName: string) => {
    setVisibleBillzColors((prev) => prev.filter((c) => c !== billzColorName));

    setBillzColorToColorId((prev) => {
      const next = { ...prev };
      const colorId = next[billzColorName];
      delete next[billzColorName];

      if (colorId && countUsage(prev, colorId) === 1) {
        setColorImages((imgs) => imgs.filter((x) => x.colorId !== colorId));
        setSizeDetails((sd) => sd.filter((x) => x.colorId !== colorId));
      }
      return next;
    });

    setBillzViewSizeByColor((prev) => {
      const next = { ...prev };
      delete next[billzColorName];
      return next;
    });

    if (activeBillzColor === billzColorName) {
      setOpen(false);
      setActiveBillzColor("");
    }
  };

  const handlePreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src && file.originFileObj) {
      src = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = document.createElement("img");
    image.src = src;
    const imgWindow = window.open(src);
    if (imgWindow) imgWindow.document.write(image.outerHTML);
  };

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

  // ===== Sizes drawer (local tree) =====
  const [newSize, setNewSize] = useState("");
  const [treeData, setTreeData] = useState(localSizesData);

  const addNewSize = () => {
    if (!newSize.trim()) return;
    const formattedSize = toUpper(newSize);

    const isShoeSize = /^\d{2}-\d+$/.test(formattedSize);
    const isClothSize = /^\d*[A-Z]+-\d+$/.test(formattedSize);

    const updated: any[] = [...treeData];

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

    const exists = updated[othersIndex].children?.some(
      (child: any) => child.value === formattedSize
    );

    if (!exists) {
      updated[othersIndex].children.push({
        title: formattedSize,
        value: formattedSize,
        className: isShoeSize
          ? "text-xl text-blue-500"
          : isClothSize
          ? "text-xl text-green-500"
          : "text-xl text-red-500",
      });
    }

    setTreeData(updated);
    setSelectedSizes((prev) =>
      prev.includes(formattedSize) ? prev : [...prev, formattedSize]
    );
    setNewSize("");
  };

  // selectedSizes o‘zgarsa: sizeDetailsdan kerakmaslarini tozalash
  useEffect(() => {
    const allowed = new Set(selectedSizes.map((s) => toUpper(s)));
    setSizeDetails((prev) => prev.filter((x) => allowed.has(x.size)));
  }, [selectedSizes]);

  const onFinish = (values: any) => {
    const mappedEntries = Object.entries(billzColorToColorId).filter(
      ([billzColorName, colorId]) =>
        visibleBillzColors.includes(billzColorName) && !!colorId
    );

    if (!mappedEntries.length) {
      toast.error("Hech bo‘lmasa 1 ta Billz rangga sistemadan rang moslang!");
      return;
    }
    if (!selectedSizes.length) {
      toast.error("Razmer tanlang!");
      return;
    }

    if (Array.isArray(values.ikpuNumber))
      values.ikpuNumber = values.ikpuNumber[0];
    if (Array.isArray(values.mxikNumber))
      values.mxikNumber = values.mxikNumber[0];

    mappedEntries.forEach(([billzColorName, colorId]) => {
      const productSizeVariantDtoList = selectedSizes.map((raw) => {
        const adminSize = toUpper(raw);
        const override = sizeDetails.find(
          (x) => x.colorId === colorId && x.size === adminSize
        );
        const billzDefault = getBillzDefaultForAdminSize(
          billzColorName,
          adminSize
        );

        return {
          size: adminSize,
          barCode: override?.barCode ?? billzDefault.barcode,
          quantity: override?.quantity ?? billzDefault.quantity,
        };
      });

      const imgObj = colorImages.find((x) => x.colorId === colorId);
      const productImageList: File[] =
        (imgObj?.imagesList
          ?.map((f) => f.originFileObj)
          .filter(Boolean) as File[]) || [];

      const FullData = {
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

      const formData = new FormData();
      formData.append("productDto", JSON.stringify(FullData));
      productImageList.forEach((f) => formData.append("files", f));

      AddProduct(formData, {
        onSuccess: () => {
          toast.success(`Qo‘shildi! (Billz rang: ${billzColorName})`);
          form.resetFields();
          setColorImages([]);
          setReferenceNumber("");
          setSelectedSizes([]);
          setSizeDetails([]);
          setBillzColorToColorId({});
          setSelectedCategories([]);
          setVisibleBillzColors([]);
          setBillzViewSizeByColor({});
        },
        onError: () =>
          toast.error("Mahsulot Qo'shishda Xatolik. Qayta urinib ko'ring..."),
      });
    });
  };

  return (
    <div className="space-y-4">
      <h1>106964</h1>

      <Button
        size="large"
        type="primary"
        onClick={() => navigate(-1)}
        icon={<LeftOutlined />}
        children="Mahsulotlarga qaytish"
      />

      <Input
        placeholder="Billz Mahsulot qidirish Ref nomer bilan"
        onChange={(e) => setSearchValue(e.target.value)}
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
            className="flex-wrap-reverse"
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
                  label={
                    <div className="space-x-2">
                      <h1>IKPU nomer</h1>
                      <div className="border p-1 text-lg">
                        {BillzProducts?.products?.[0]?.categories
                          ?.map((item) => item.name)
                          .join(", ")}
                      </div>
                    </div>
                  }
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
                    className="w-full"
                    label={
                      <div className="space-x-2">
                        <h1>Brand tanlang</h1>
                        <div className="border p-1 text-lg">
                          {BillzProducts?.products?.[0]?.brand_name ||
                            "Brand yo'q"}
                        </div>
                      </div>
                    }
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

          {/* ====== Rang/razmer bloklari ====== */}
          <Flex className="flex-wrap-reverse md:flex-wrap" gap={12}>
            <Flex className="w-full flex-col gap-6">
              {visibleBillzColors.map((billzColorName) => {
                const variants = billzMatrix[billzColorName] || {};
                const billzSizeKeys = Object.keys(variants);

                const mappedColorId = billzColorToColorId[billzColorName];
                const colorObj = colorsData?.find(
                  (c) => c.id === mappedColorId
                );

                const viewSize = billzViewSizeByColor[billzColorName];
                const viewMeta = viewSize ? variants[viewSize] : undefined;

                // ✅ Admin tanlagan size'lar qaysi Billz size'ga mos keladi? -> disable qilamiz
                const disabledBillzSizes = new Set(
                  selectedSizes
                    .map((adminSize) =>
                      findBillzSizeKey(billzSizeKeys, adminSize)
                    )
                    .filter(Boolean) as string[]
                );

                return (
                  <div
                    key={billzColorName}
                    className="border relative shadow-md hover:shadow-lg transition-all bg-white p-4"
                  >
                    <Button
                      className="!absolute top-[-5px] right-[-5px] !p-0 !w-5 !h-5 flex items-center justify-center"
                      danger
                      size="small"
                      onClick={() => removeBillzColorVariant(billzColorName)}
                    >
                      X
                    </Button>

                    <div className="border-b flex justify-between items-center pb-2 mb-3">
                      <h2 className="text-lg font-semibold text-black">
                        Rang: <b>{billzColorName}</b>
                      </h2>
                      <Button
                        onClick={() => showDrawer(billzColorName)}
                        type="primary"
                        size="middle"
                        className="font-semibold"
                      >
                        Rang Tanlash
                      </Button>
                    </div>

                    {/* ADMIN TANLAGAN RANG + UPLOAD + SELECTED SIZES */}
                    {mappedColorId ? (
                      <div className="space-y-6 flex flex-col flex-wrap md:flex-nowrap mb-4">
                        <div className="p-1 rounded-md space-y-6 flex justify-between flex-wrap md:flex-nowrap w-full gap-2">
                          <div className="flex flex-wrap md:flex-nowrap gap-4 w-[900px]">
                            <SortableUpload
                              colorId={mappedColorId}
                              colorImages={colorImages}
                              setColorImages={setColorImages}
                              handlePreview={handlePreview}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="grid grid-cols-4 gap-2">
                              {selectedSizes?.map((size) => (
                                <div
                                  key={`${mappedColorId}-${size}`}
                                  className="border rounded-md p-2 text-center text-sm font-medium"
                                  style={{ background: colorObj?.colorCode }}
                                >
                                  <span className="text-white">
                                    {toUpper(size)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* ADMIN SIZE DETAILS EDIT */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">
                              Admin tanlagan razmerlar (Barcode/Soni)
                            </h3>
                            <Button
                              onClick={sizShowDrawer}
                              type="primary"
                              size="small"
                            >
                              Razmer Tanlash
                            </Button>
                          </div>

                          {selectedSizes.map((raw) => {
                            const adminSize = toUpper(raw);
                            const current = sizeDetails.find(
                              (x) =>
                                x.colorId === mappedColorId &&
                                x.size === adminSize
                            );

                            const billzDefault = getBillzDefaultForAdminSize(
                              billzColorName,
                              adminSize
                            );

                            const barcodeValue =
                              current?.barCode ?? billzDefault.barcode;
                            const qtyValue =
                              current?.quantity ?? billzDefault.quantity;

                            return (
                              <div
                                key={`${mappedColorId}-${adminSize}`}
                                className="rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <p>O‘lcham:</p>
                                    <b>{adminSize}</b>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Billz mosligi:{" "}
                                    {billzDefault.matchedKey || "Topilmadi"}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center border-t mt-3 pt-2">
                                  <div className="flex gap-2 text-gray-700">
                                    <p>Barcode:</p>
                                    <span className="font-semibold">
                                      {barcodeValue || "-"}
                                    </span>
                                  </div>
                                  <Input
                                    placeholder="Barcode"
                                    value={barcodeValue}
                                    className="!w-56"
                                    onChange={(e) =>
                                      updateSizeDetail(
                                        mappedColorId,
                                        adminSize,
                                        e.target.value,
                                        null
                                      )
                                    }
                                  />
                                </div>

                                <div className="flex justify-between items-center border-t mt-3 pt-2">
                                  <div className="flex gap-2 text-gray-700">
                                    <p>Soni:</p>
                                    <span className="font-semibold">
                                      {qtyValue}
                                    </span>
                                  </div>
                                  <InputNumber
                                    placeholder="Soni"
                                    value={qtyValue}
                                    className="!w-56"
                                    onChange={(val) =>
                                      updateSizeDetail(
                                        mappedColorId,
                                        adminSize,
                                        null,
                                        Number(val || 0)
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 text-sm text-red-500">
                        Bu Billz rang uchun sistemadan rang tanlanmagan.
                      </div>
                    )}

                    {/* BILLZ VARIANTS (FAKAT KO‘RISH) — admin tanlagan billz size'lar disabled */}
                    <Button
                      type="dashed"
                      onClick={() => setOpenBlizz(!openBlizz)}
                      className="!flex !justify-center !items-center"
                    >
                      {openBlizz
                        ? " Billz variantlar yopish"
                        : " Billz variantlar ko'rish"}
                      {openBlizz ? <UpOutlined /> : <DownOutlined />}
                    </Button>
                    {openBlizz && (
                      <div className="mt-2 border rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <h3 className="font-semibold text-gray-800">
                            Billz variantlar ma'lumoti
                          </h3>

                          <Select
                            style={{ width: 260 }}
                            placeholder="Ko‘rish uchun razmer tanlang"
                            value={undefined}
                            onChange={(val: any) =>
                              setBillzViewSizeByColor((prev) => ({
                                ...prev,
                                [billzColorName]: val as string,
                              }))
                            }
                            options={billzSizeKeys.map((s) => ({
                              label: (s === "0" ? "STANDART" : s).toUpperCase(),
                              value: s,
                              disabled: disabledBillzSizes.has(s),
                            }))}
                          />
                        </div>

                        {viewMeta ? (
                          <div className="mt-3 rounded-lg p-3 bg-gray-50">
                            <div className="text-gray-700">
                              <b>Razmer:</b>{" "}
                              {(viewSize === "0"
                                ? "STANDART"
                                : viewSize
                              ).toUpperCase()}
                            </div>

                            <div className="flex justify-between items-center border-t mt-3 pt-2">
                              <div className="text-gray-700">
                                <b>Barcode:</b> {viewMeta.barcode || "N/A"}
                              </div>
                              <Input
                                disabled
                                value={viewMeta.barcode || ""}
                                className="!w-56"
                              />
                            </div>

                            <div className="flex justify-between items-center border-t mt-3 pt-2">
                              <div className="text-gray-700">
                                <b>Soni:</b> {viewMeta.quantity}
                              </div>
                              <InputNumber
                                disabled
                                value={viewMeta.quantity}
                                className="!w-56"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 text-sm text-gray-500">
                            Razmer tanlang.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </Flex>

            {/* Drawer - Rang tanlash */}
            <Drawer
              width={600}
              title="Rangni Belgilang"
              onClose={onClose}
              open={open}
              bodyStyle={{ background: "#fafafa" }}
            >
              <Form.Item
                name="colorIds"
                label={
                  <Flex align="center" gap={10}>
                    <h1 className="font-semibold text-gray-700">
                      Ranglar{" "}
                      {activeBillzColor ? `(Billz: ${activeBillzColor})` : ""}
                    </h1>
                    <Button
                      title="Yangilash"
                      size="small"
                      icon={<ReloadOutlined />}
                      type="primary"
                      onClick={() => refetch()}
                    />
                  </Flex>
                }
              >
                <div className="flex flex-wrap gap-2 justify-center md:justify-start border rounded-lg p-3 bg-white max-h-96 overflow-y-auto">
                  {colorsData?.map((color) => {
                    const assignedId = activeBillzColor
                      ? billzColorToColorId[activeBillzColor]
                      : undefined;

                    const isSelected = assignedId === color.id;

                    return (
                      <Tooltip title={color.nameUZB} key={color.id}>
                        <Tag
                          className="!flex !justify-center !items-center transition-transform hover:scale-110"
                          onClick={() =>
                            toggleColorForActiveBillzColor(color.id)
                          }
                          icon={
                            isSelected ? (
                              <CheckCircleOutlined className="text-xl text-white" />
                            ) : null
                          }
                          style={{
                            width: 50,
                            height: 30,
                            fontWeight: "bold",
                            cursor: "pointer",
                            background: color.colorCode,
                            color: "#fff",
                            border: "1px solid #00000040",
                            borderRadius: 8,
                            opacity: activeBillzColor ? 1 : 0.6,
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              </Form.Item>
            </Drawer>

            {/* Drawer - O‘lcham tanlash */}
            <Drawer
              width={600}
              title="O‘lchamlarni Belgilang"
              onClose={sizOnClose}
              open={sizOpen}
              bodyStyle={{ background: "#fafafa" }}
            >
              <Form.Item
                name="sizes"
                label="O‘lcham"
                rules={[
                  {
                    required: selectedSizes.length === 0,
                    message: "O‘lchamni tanlash shart!",
                  },
                ]}
              >
                <Flex className="w-full">
                  <TreeSelect
                    treeData={treeData}
                    value={selectedSizes}
                    placeholder="O‘lchamni tanlang"
                    size="large"
                    className="w-full uppercase"
                    treeCheckable
                    allowClear
                    multiple
                    popupRender={(menu) => (
                      <div className="space-y-3 text-base">
                        <div className="flex gap-2 p-2">
                          <Input
                            placeholder="Yangi o‘lcham kiriting"
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
                        {menu}
                      </div>
                    )}
                    onChange={(val) =>
                      setSelectedSizes((val as string[]).map((v) => toUpper(v)))
                    }
                    tagRender={(props) => {
                      const { label, closable, onClose } = props;
                      return (
                        <span
                          className="rounded bg-blue-600 text-white px-2 py-1 m-1 flex items-center gap-1"
                          style={{ textTransform: "uppercase" }}
                        >
                          {label}
                          {closable && (
                            <CloseOutlined
                              onClick={onClose}
                              className="cursor-pointer text-red-300"
                            />
                          )}
                        </span>
                      );
                    }}
                  />
                </Flex>
              </Form.Item>
            </Drawer>
          </Flex>

          <Form.Item className="!mt-5 text-center ">
            <Button
              loading={isPending}
              size="large"
              htmlType="submit"
              type="primary"
              children="Mahsulotlarni Qo'shish"
              icon={<PlusOutlined />}
              className="!w-full !p-5"
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateBillzProduct;
