import { Table, Button, Tooltip, Popconfirm, Modal, Form, Input } from "antd";
import { PlusOutlined, EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import { endpoints } from "../../../configs/endpoints";
import { useGetList } from "../../../services/query/useGetList";
import type { BrandCategory } from "../../../types/settingsTypes/brand-category";
import { useState } from "react";
import { useCreate } from "../../../services/mutation/useCreate";
import { toast } from "react-toastify";
import { useDeleteById } from "../../../services/mutation/useDeleteById";
import { useUpdate } from "../../../services/mutation/useUpdate";

const AddCategory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data, isLoading, refetch } = useGetList<BrandCategory[]>({
    endpoint: endpoints.brand.getAll,
  });

  const { mutate } = useCreate({
    endpoint: endpoints.brand.post,
    queryKey: endpoints.brand.getAll,
  });

  const { mutate: deleteBrand } = useDeleteById({
    endpoint: endpoints.brand.delete,
    queryKey: endpoints.brand.getAll,
  });

  const { mutate: editBrand } = useUpdate({
    endpoint: endpoints.brand.put,
    queryKey: endpoints.brand.getAll,
  });

  const [form] = Form.useForm();

  const showModal = () => {
    setEditingId(null); // yangi brend qo‘shiladi
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (record: BrandCategory) => {
    setEditingId(record.id);
    form.setFieldsValue({ name: record.name });
    setIsModalOpen(true);
  };

  const handleDeleteBrand = (id: number) => {
    deleteBrand(
      { id },
      {
        onSuccess: () => {
          refetch();
          toast.success("Brend muvaffaqiyatli o'chirildi!", {
            autoClose: 1500,
          });
        },
        onError: () => {
          toast.error("Brend o'chirishda xatolik yuz berdi!", {
            autoClose: 1500,
          });
        },
      }
    );
  };

  const handleFinish = (values: { name: string }) => {
    const payload = { name: values.name };

    if (editingId) {
      editBrand(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            refetch();
            setIsModalOpen(false);
            form.resetFields();
            setEditingId(null);
            toast.success("Brend muvaffaqiyatli tahrirlandi!", {
              autoClose: 1500,
            });
          },
          onError: () => {
            toast.error("Tahrirlashda xatolik!", {
              autoClose: 1500,
            });
          },
        }
      );
    } else {
      mutate(payload, {
        onSuccess: () => {
          refetch();
          setIsModalOpen(false);
          form.resetFields();
          toast.success("Brend muvaffaqiyatli qo‘shildi!", {
            autoClose: 1500,
          });
        },
        onError: () => {
          toast.error("Qo‘shishda xatolik!", {
            autoClose: 1500,
          });
        },
      });
    }
  };

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Nomi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_: any, record: BrandCategory) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Tahrirlash">
            <Button
              type="text"
              shape="circle"
              icon={<EditTwoTone twoToneColor="#1890ff" />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Ushbu brendni o‘chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo‘q"
            onConfirm={() => handleDeleteBrand(record.id)}
          >
            <Button
              shape="circle"
              icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Brendlar ro'yxati</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Qo‘shish
        </Button>
      </div>

      <Modal
        title={editingId ? "Brendni tahrirlash" : "Yangi brend qo‘shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ name: "" }}
        >
          <Form.Item
            label="Brend nomi"
            name="name"
            rules={[{ required: true, message: "Brend nomini kiriting!" }]}
          >
            <Input placeholder="Brend nomini kiriting" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingId ? "Saqlash" : "Qo‘shish"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        dataSource={(data || []).map((item) => ({
          ...item,
          key: item.id,
        }))}
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </div>
  );
};

export default AddCategory;
