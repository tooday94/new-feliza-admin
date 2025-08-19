import { Table, Button, Popconfirm, Tooltip, Modal, Form } from "antd";
import { endpoints } from "../../../configs/endpoints";
import { useGetList } from "../../../services/query/useGetList";
import type { RegionType } from "../../../types/settingsTypes/region-type";
import { EditTwoTone, DeleteTwoTone, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useCreate } from "../../../services/mutation/useCreate";
import { toast } from "react-toastify";
import { useUpdate } from "../../../services/mutation/useUpdate";
import { useDeleteById } from "../../../services/mutation/useDeleteById";
import AddSubRegion from "./add-subRegion";
import AddPostFilial from "./add-postFilial";

const AddRegion = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // yangi holat
  const { data, isLoading } = useGetList<RegionType[]>({
    endpoint: endpoints.address.regions.getAll,
  });

  const { mutate } = useCreate({
    endpoint: endpoints.address.regions.post,
    queryKey: endpoints.address.regions.getAll,
  });

  const { mutate: editRegion } = useUpdate({
    endpoint: endpoints.address.regions.put,
    queryKey: endpoints.address.regions.getAll,
  });

  const { mutate: deleteRegion } = useDeleteById({
    endpoint: endpoints.address.regions.delete,
    queryKey: endpoints.address.regions.getAll,
  });

  const [form] = Form.useForm();
  const handleDeleteRegion = (id: number | string) => {
    deleteRegion(
      { id },
      {
        onSuccess: () => {
          toast.success("Hudud muvaffaqiyatli o'chirildi!", {
            autoClose: 1500,
          });
        },
        onError: (error) => {
          toast.error(`Xatolik: ${error.message}`, {
            autoClose: 1500,
          });
        },
      }
    );
  };

  const handleEditRegion = (values: any) => {
    const payload = {
      nameUZB: values.nameUZB || "",
      nameRUS: values.nameRUS || "",
      postCode: values.postCode || "",
    };
    editRegion(
      { id: values.id, data: payload },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
          toast.success("Hudud muvaffaqiyatli tahrirlandi!", {
            autoClose: 1500,
          });
        },
        onError: (error) => {
          toast.error(`Xatolik: ${error.message}`, {
            autoClose: 1500,
          });
        },
      }
    );
  };

  const handleAddRegion = (values: any) => {
    const payload = {
      nameUZB: values.nameUZB || "",
      nameRUS: values.nameRUS || "",
      postCode: values.postCode || "",
    };
    mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        form.resetFields();
        toast.success("Hudud muvaffaqiyatli qo'shildi!", {
          autoClose: 1500,
        });
      },
      onError: (error) => {
        toast.error(`Xatolik: ${error.message}`, {
          autoClose: 1500,
        });
      },
    });
  };

  const columns = [
    {
      title: "№",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Hudud nomi (UZB)",
      dataIndex: "nameUZB",
      key: "nameUZB",
    },
    {
      title: "Hudud nomi (RUS)",
      dataIndex: "nameRUS",
      key: "nameRUS",
    },
    {
      title: "Post kodi",
      dataIndex: "postCode",
      key: "postCode",
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_text: any, record: any) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Tahrirlash">
            <Button
              type="text"
              shape="circle"
              icon={<EditTwoTone twoToneColor="#1890ff" />}
              onClick={() => {
                setIsEditing(true); // tahrirlash
                form.setFieldsValue({
                  id: record.id,
                  nameUZB: record.nameUZB,
                  nameRUS: record.nameRUS,
                  postCode: record.postCode,
                });
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Ushbu hududni o'chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() => handleDeleteRegion(record.id)}
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
    setIsEditing(false);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div className="p-1">
      {/* Viloyat qo'shish */}
      <Modal
        title={isEditing ? "Hududni tahrirlash" : "Hudud qo'shish"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            isEditing ? handleEditRegion(values) : handleAddRegion(values);
          }}
          initialValues={{ nameUZB: "", nameRUS: "", postCode: "" }}
        >
          <Form.Item name="id" hidden>
            <input type="hidden" />
          </Form.Item>

          <Form.Item
            label="Hudud nomi (UZB)"
            name="nameUZB"
            rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
          >
            <input
              type="text"
              placeholder="Hudud nomi (UZB)"
              className="w-full p-2 border rounded"
            />
          </Form.Item>

          <Form.Item
            label="Hudud nomi (RUS)"
            name="nameRUS"
            rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
          >
            <input
              type="text"
              placeholder="Hudud nomi (RUS)"
              className="w-full p-2 border rounded"
            />
          </Form.Item>

          <Form.Item
            label="Post kodi"
            name="postCode"
            rules={[{ required: true, message: "Post kodini kiriting!" }]}
          >
            <input
              type="text"
              placeholder="Post kodi"
              className="w-full p-2 border rounded"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              {isEditing ? "Saqlash" : "Qo'shish"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        title={() => (
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Viloyat ro'yxati</h2>
            <Button onClick={showModal} type="primary" icon={<PlusOutlined />}>
              Qo'shish
            </Button>
          </div>
        )}
        dataSource={data || []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
        loading={isLoading}
      />
      {/* Tuman qo'shish */}
      <div className="pt-10">
        <AddSubRegion />
      </div>
      <div className="pt-10">
        <AddPostFilial />
      </div>
    </div>
  );
};

export default AddRegion;
