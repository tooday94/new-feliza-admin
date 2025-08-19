import {
  Form,
  Input,
  Table,
  Button,
  InputNumber,
  Popconfirm,
  Spin,
} from "antd";
import React, { useMemo, useState } from "react";
import { useGetById } from "../../services/query/useGetById";
import { endpoints } from "../../configs/endpoints";
import type { Product } from "../../types/products-type";
import { DeleteFilled, SettingFilled } from "@ant-design/icons";
import { useCreate } from "../../services/mutation/useCreate";
import { toast } from "react-toastify";
type SelectedPack = {
  products: Product[];
  discount: number;
};
const AddSalesTab: React.FC = () => {
  const [form] = Form.useForm();
  const [searchRef, setSearchRef] = useState("");
  const [refList, setRefList] = useState<string[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<SelectedPack[]>([]);

  const { data, isLoading } = useGetById<Product[]>({
    endpoint: endpoints.products.getByRefNumber,
    id: searchRef,
    enabled: !!searchRef,
  });

  const { mutate } = useCreate({
    endpoint: endpoints.sale.post,
    queryKey: endpoints.sale.getAll,
  });

  const groupedByRef = useMemo(() => {
    if (!data) return [];
    const groups: { [ref: string]: Product[] } = {};
    data.forEach((item) => {
      const ref = item.referenceNumber;
      if (!groups[ref]) groups[ref] = [];
      groups[ref].push(item);
    });
    return Object.values(groups);
  }, [data]);

  const handlePackSelect = (pack: Product[]) => {
    const ref = pack[0].referenceNumber;
    if (refList.includes(ref)) return;

    const currentDiscount = form.getFieldValue("discount") || 0;

    setRefList((prev) => [...prev, ref]);
    setSelectedPacks((prev) => [
      ...prev,
      { products: pack, discount: currentDiscount },
    ]);
  };

  const handleDelete = (refToDelete: string) => {
    setSelectedPacks((prev) =>
      prev.filter((pack) => pack.products[0].referenceNumber !== refToDelete)
    );
    setRefList((prev) => prev.filter((ref) => ref !== refToDelete));
  };

  const tableData = selectedPacks.map(({ products, discount }) => ({
    ...products[0],
    count: products.length,
    discount,
  }));

  const onFinish = (values: any) => {
    console.log("Saqlanadigan qiymatlar:");
    console.log("Sale nomi:", values.name);
    console.log("Chegirma %:", values.discount);
    console.log("Tanlangan ref list:", refList);
    const postData = {
      name: values.name,
      sale: values.discount,
      referenceNumberList: refList,
      categoryId: 7,
    };
    console.log(postData);
    mutate(postData, {
      onSuccess: () => {
        toast.success("Yangi Chegirma Qo'shildi!");
      },
      onError: () => {
        toast.error("Yangi Chegirma Qo'shishda xatolik, Qayta urunib ko'ring!");
      },
    });
  };

  console.log(selectedPacks);

  console.log(tableData);

  return (
    <div className="flex flex-col gap-3 md:gap-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="flex gap-3 md:gap-6 flex-wrap"
      >
        <Form.Item
          name="name"
          className="w-60"
          rules={[{ required: true, message: "Chegirma nomini kiriting!" }]}
        >
          <Input placeholder="Chegirma nomi" />
        </Form.Item>

        <Form.Item
          name="discount"
          className=""
          rules={[{ required: true, message: "Chegirmani kiriting 1-100" }]}
        >
          <InputNumber min={1} max={100} placeholder="%" className="w-full" />
        </Form.Item>

        <Form.Item name="search" className="w-60">
          <Input
            placeholder="Ref raqam kiriting"
            value={searchRef}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setSearchRef(val);
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Saqlash
          </Button>
        </Form.Item>
      </Form>

      {/* 🔍 Qidiruv natijalari: packlar */}
      {!isLoading ? (
        <div className="flex flex-wrap gap-4">
          {groupedByRef.map((pack) => {
            const item = pack[0];
            const isSelected = refList.includes(item.referenceNumber);
            return (
              <div
                key={item.id}
                className={`border w-48 shadow hover:shadow-lg ${
                  isSelected
                    ? "border-secondary opacity-65 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => handlePackSelect(pack)}
              >
                <img
                  src={item.productImages?.[0]?.url}
                  alt=""
                  className="w-full min-h-56 h-full max-h-56 object-cover"
                />
                <div className="p-2">
                  <p className="font-semibold line-clamp-1">{item.nameUZB}</p>
                  <p className=" text-gray-500">Ref: {item.referenceNumber}</p>
                  <p className=" text-gray-500">Narxi: {item.sellPrice}</p>
                  <p className=" text-blue-500 font-medium">
                    Ranglari Soni: {pack.length} ta
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Spin />
      )}

      {/* 📋 Tanlangan packlar table */}
      <Table
        dataSource={tableData}
        columns={[
          { title: "ID", dataIndex: "id", responsive: ["md"] },
          { title: "Nomi", dataIndex: "nameUZB" },
          {
            width: "0",
            title: "Rasm",
            dataIndex: "productImages",
            render: (images: any[]) => (
              <img src={images?.[0]?.url} className="w-24 h-20 object-cover" />
            ),
          },
          { title: "Ref №", dataIndex: "referenceNumber", responsive: ["md"] },
          { title: "Ranglar Soni", dataIndex: "count", responsive: ["md"] },
          {
            title: "Chegirma",
            dataIndex: "discount",
            render: (value: string) => `${value}%`,
            responsive: ["md"],
          },
          { title: "Narx", dataIndex: "sellPrice", responsive: ["md"] },
          {
            title: "Chegirma bilan",
            dataIndex: "sellPrice",
            render: (value: any) =>
              value * ((100 - form.getFieldValue("discount")) / 100),
          },
          {
            width: "0",
            align: "center",
            title: <SettingFilled />,
            render: (_: any, record: any) => (
              <Popconfirm
                title="Ishonchingiz komilmi?"
                onConfirm={() => handleDelete(record.referenceNumber)}
                okText="Ha"
                cancelText="Yo‘q"
              >
                <Button type="text" icon={<DeleteFilled />} />
              </Popconfirm>
            ),
          },
        ]}
        rowKey="id"
        pagination={false}
        bordered
      />
    </div>
  );
};

export default AddSalesTab;
