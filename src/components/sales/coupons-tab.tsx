import React, { useState } from "react";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import type { CouponsType } from "../../types/coupons-type";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
} from "antd";
import { dateFormat } from "../../utils/formatDate";
import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons";
import { useCreate } from "../../services/mutation/useCreate";
import { useUpdate } from "../../services/mutation/useUpdate";
import { useDeleteById } from "../../services/mutation/useDeleteById";
import { toast } from "react-toastify";

const CouponsTab: React.FC = () => {
  const [form] = Form.useForm();
  const [enebledEnum, setEnebledEnum] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [couponId, setCouponId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading } = useGetList<CouponsType[]>({
    endpoint: endpoints.coupon.getAll,
  });

  const { data: enumCouponNames } = useGetList<[]>({
    endpoint: endpoints.coupon.getByEnumNames,
    enabled: enebledEnum,
  });

  const { mutate: postCoupon } = useCreate({
    endpoint: endpoints.coupon.post,
    queryKey: endpoints.coupon.getAll,
  });

  const { mutate: putCoupon } = useUpdate({
    endpoint: endpoints.coupon.put,
    queryKey: endpoints.coupon.getAll,
  });
  const { mutate: deleteCoupon } = useDeleteById({
    endpoint: endpoints.coupon.delete,
    queryKey: endpoints.coupon.getAll,
  });

  return (
    <div>
      <Table
        tableLayout="auto"
        loading={isLoading}
        bordered
        dataSource={data?.map((item) => ({ ...item, key: item.id }))}
        title={() => (
          <Flex justify="end">
            <Button
              icon={<PlusOutlined />}
              type="primary"
              children="Kupon Qo'shish"
              onClick={() => (
                setIsCreate(true),
                form.resetFields(),
                setIsModalOpen(true),
                setEnebledEnum(true)
              )}
            />
          </Flex>
        )}
        columns={[
          {
            title: "Nomi",
            dataIndex: "name",
          },
          {
            responsive: ["md"],
            width: "0",
            title: "Holati",
            dataIndex: "active",
            render: (value) => (value ? "Faol" : "Faol emas"),
          },
          {
            responsive: ["md"],
            width: "0",
            title: "enumName",
            dataIndex: "enumName",
          },
          {
            width: "0",
            title: "miqdori",
            dataIndex: "credit",
          },
          {
            responsive: ["md"],
            width: "0",
            align: "center",
            title: "Qo'shilgan sana",
            dataIndex: "createdAt",
            render: (value) => dateFormat(value),
          },
          {
            width: "0",
            title: "Harakatlar",
            render: (_, record) => (
              <Flex gap={12}>
                <Button
                  onClick={() => {
                    setEnebledEnum(true);
                    setIsCreate(false);
                    setCouponId(record.enumName);
                    const coupon = {
                      enumName: record.enumName,
                      name: record.name,
                      credit: record.credit,
                      active: record.active,
                    };
                    form.setFieldsValue(coupon);
                  }}
                  icon={<EditFilled onClick={() => setIsModalOpen(true)} />}
                />

                <Popconfirm
                  title="Ishonchingiz komilmi?"
                  onConfirm={() =>
                    deleteCoupon(
                      { id: record.id },
                      {
                        onSuccess: () => {
                          toast.success("Kupon O'chirishdi!");
                        },
                        onError: () => {
                          toast.error(
                            "Kupon O'chirishda xatolik, Qayta urunib ko'ring!"
                          );
                        },
                      }
                    )
                  }
                  okText="Ha"
                  cancelText="Yo‘q"
                >
                  <Button type="default" icon={<DeleteFilled />} />
                </Popconfirm>
              </Flex>
            ),
          },
        ]}
      />

      <Modal
        maskClosable={false}
        title={isCreate ? "Kupon Qo'shish" : "Kupon O'zgartirish"}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            isCreate
              ? postCoupon(values, {
                  onSuccess: () => {
                    setIsModalOpen(false), toast.success("Kupon Qo'shildi!");
                  },
                  onError: () => {
                    toast.error(
                      "Kupon Qo'shishda xatolik, Qayta urunib ko'ring!"
                    );
                  },
                })
              : (console.log(couponId), console.log(values)),
              putCoupon(
                { id: couponId, data: values },
                {
                  onSuccess: () => {
                    setIsModalOpen(false),
                      toast.success("Kupon O'zgartirildi!");
                  },
                  onError: () => {
                    toast.error(
                      "Kupon O'zgartirishda xatolik, Qayta urunib ko'ring!"
                    );
                  },
                }
              );
          }}
        >
          <Form.Item
            label="Enum Tur"
            name={"enumName"}
            rules={[
              { required: true, message: "Iltimos Kupon Turini tanlang!" },
            ]}
          >
            <Select
              placeholder="Enum Turi"
              options={enumCouponNames?.map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Nomi"
            name={"name"}
            rules={[
              { required: true, message: "Iltimos Kkupon nomini kiriting!" },
            ]}
          >
            <Input placeholder="Nomi" />
          </Form.Item>
          <Form.Item
            label="Miqdor"
            name={"credit"}
            rules={[
              { required: true, message: "Iltimos Kkupon miqdorini kiriting!" },
            ]}
          >
            <Input placeholder="Kupon miqdori" />
          </Form.Item>
          <Form.Item name={"active"} label="Holati">
            <Switch />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              block
              children={"Submit"}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponsTab;
