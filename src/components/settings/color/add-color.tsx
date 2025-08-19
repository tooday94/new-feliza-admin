import {
  Table,
  Card,
  Button,
  Popconfirm,
  Tooltip,
  Modal,
  Form,
  Input,
} from "antd";
import { useGetList } from "../../../services/query/useGetList";
import { endpoints } from "../../../configs/endpoints";
import type { ColorCategoryType } from "../../../types/settingsTypes/color-category";
import { EditTwoTone, DeleteTwoTone, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useCreate } from "../../../services/mutation/useCreate";
import { toast } from "react-toastify";
import { useDeleteById } from "../../../services/mutation/useDeleteById";
import { useUpdate } from "../../../services/mutation/useUpdate";

function AddColor() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEditId, setselectedEditId] = useState("");
  const [editMode, setEditMode] = useState(false);
  const { data, isLoading, refetch } = useGetList<ColorCategoryType[]>({
    endpoint: endpoints.color.getAll,
  });
  console.log("Color data:", data);

  const { mutate } = useCreate({
    endpoint: endpoints.color.post,
    queryKey: endpoints.color.getAll,
  });
  const { mutate: deleteColor } = useDeleteById({
    endpoint: endpoints.color.delete,
    queryKey: endpoints.color.getAll,
  });
  const { mutate: editColor } = useUpdate({
    endpoint: endpoints.color.put,
    queryKey: endpoints.color.getAll,
  });
  const [form] = Form.useForm();
  const handleEditColor = (values: {
    id: string;
    nameUZB: string;
    nameRUS: string;
    colorCode: string;
  }) => {
    const payload = {
      nameUZB: values.nameUZB,
      nameRUS: values.nameRUS,
      colorCode: values.colorCode,
    };
    console.log(payload);
    console.log(selectedEditId);

    editColor(
      { id: selectedEditId, data: payload },
      {
        onSuccess: () => {
          form.resetFields();
          toast.success("Rang muvaffaqiyatli tahrirlandi!", {
            autoClose: 1500,
          });
          setIsModalOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(`Rang tahririda xatolik: ${error.message}`, {
            autoClose: 1500,
          });
          refetch();
        },
      }
    );
  };

  const handleDeleteColor = (id: number | string) => {
    deleteColor(
      { id },
      {
        onSuccess: () => {
          toast.success("Rang muvaffaqiyatli o'chirildi!", {
            autoClose: 1500,
          });
          refetch();
        },
        onError: (error: any) => {
          toast.error(`Rang o'chirishda xatolik: ${error.message}`);
        },
      }
    );
  };
  const handleAddColor = (values: any) => {
    const payload = {
      nameUZB: values.nameUZB,
      nameRUS: values.nameRUS,
      colorCode: values.colorCode,
    };
    mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        toast.success("Rang muvaffaqiyatli qo'shildi!", {
          autoClose: 1500,
        });
        setIsModalOpen(false);
      },
      onError: (error: any) => {
        toast.error(`Rang qo'shishda xatolik: ${error.message}`, {
          autoClose: 1500,
        });
      },
    });
  };
  const columns = [
    {
      title: "#",
      render: (_: any, __: any, index: number) => index + 1,
      key: "index",
    },
    {
      title: "Nomi (UZ)",
      dataIndex: "nameUZB",
      key: "nameUZB",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Nomi (RU)",
      dataIndex: "nameRUS",
      key: "nameRUS",
    },
    {
      title: "Rang",
      dataIndex: "colorCode",
      key: "colorCode",
      render: (code: string) => (
        <div className="flex items-center gap-2">
          <div
            className="w-20 h-6 rounded-sm "
            style={{
              backgroundColor: code,
            }}
          />
          <span>{code}</span>
        </div>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_text: any, record: any) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Tahrirlash">
            <Button
              onClick={() => {
                form.setFieldsValue({
                  id: record.id,
                  nameUZB: record.nameUZB,
                  nameRUS: record.nameRUS,
                  colorCode: record.colorCode,
                });
                setIsModalOpen(true);
                setEditMode(true);
                setselectedEditId(record.id);
              }}
              type="text"
              shape="circle"
              icon={<EditTwoTone twoToneColor="#1890ff" />}
            />
          </Tooltip>
          <Popconfirm
            title="Ushbu rangni o'chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() => handleDeleteColor(record.id)}
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
  const showModal = () => {
    setIsModalOpen(true);
    setEditMode(false);
    form.resetFields();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <Card
      loading={isLoading}
      className="shadow-md rounded-xl p-4 bg-white"
      title={
        <div className="text-lg font-semibold text-gray-800 flex justify-between items-center">
          <h2 className="">Ranglar</h2>
          <Button onClick={showModal} type="primary" icon={<PlusOutlined />}>
            Qo'shish
          </Button>
        </div>
      }
    >
      <Modal
        title={editMode ? "Rangni tahrirlash" : "Yangi rang qo'shish"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        maskClosable={false}
      >
        <div className="p-2">
          <Form
            form={form}
            onFinish={editMode ? handleEditColor : handleAddColor}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              label="Nomi (UZ)"
              name="nameUZB"
              rules={[{ required: true, message: "Nomi (UZ)ni kiriting!" }]}
            >
              <Input placeholder="Nomi (UZ)ni kiriting" />
            </Form.Item>
            <Form.Item
              label="Nomi (RU)"
              name="nameRUS"
              rules={[{ required: true, message: "Nomi (RU)ni kiriting!" }]}
            >
              <Input placeholder="Nomi (RU)ni kiriting" />
            </Form.Item>
            <Form.Item
              label="Rang kodi"
              name="colorCode"
              rules={[{ required: true, message: "Rang kodini kiriting!" }]}
            >
              <Input type="color" />
              {/* <Input /> */}
            </Form.Item>
            {/* <Form.Item> */}
            <Button type="primary" htmlType="submit">
              Qo'shish
            </Button>
            {/* </Form.Item> */}
          </Form>
        </div>
      </Modal>
      <Table
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: false,
        }}
        footer={() => (
          <div className="text-sm text-gray-500">
            Umumiy ranglar soni: {data?.length || 0}
          </div>
        )}
        bordered
      />
    </Card>
  );
}

export default AddColor;
