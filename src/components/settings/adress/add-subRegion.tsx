import { Button, Form, Input, Modal, Popconfirm, Table, Tooltip } from "antd";
import { endpoints } from "../../../configs/endpoints";
import { useGetList } from "../../../services/query/useGetList";
import type { AddSubRegionType } from "../../../types/settingsTypes/add-subRegion";
import { EditTwoTone, DeleteTwoTone, PlusOutlined } from "@ant-design/icons";
import { useCreate } from "../../../services/mutation/useCreate";
import { toast } from "react-toastify";
import { useState } from "react";
import { useUpdate } from "../../../services/mutation/useUpdate";
import { useDeleteById } from "../../../services/mutation/useDeleteById";

const AddSubRegion = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // yangi holat
  const [form] = Form.useForm();

  const { data, isLoading } = useGetList<AddSubRegionType[]>({
    endpoint: endpoints.address.subRegions.getAll,
  });
  console.log("SubRegions Data:", data);

  const { data: regionsData } = useGetList<AddSubRegionType[]>({
    endpoint: endpoints.address.regions.getAll,
  });

  const { mutate } = useCreate({
    endpoint: endpoints.address.subRegions.post,
    queryKey: endpoints.address.subRegions.getAll,
  });
  const { mutate: editSubRegion } = useUpdate({
    endpoint: endpoints.address.subRegions.put,
    queryKey: endpoints.address.subRegions.getAll,
  });
  const { mutate: deleteSubRegion } = useDeleteById({
    endpoint: endpoints.address.subRegions.delete,
    queryKey: endpoints.address.subRegions.getAll,
  });
  const handleDeleteSubRegion = (id: number | string) => {
    deleteSubRegion(
      { id },
      {
        onSuccess: () => {
          toast.success("Tuman muvaffaqiyatli o'chirildi!", {
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
  const handleEditSubRegion = (values: any) => {
    const payload = {
      nameUZB: values.nameUZB || "",
      nameRUS: values.nameRUS || "",
      postCode: values.postCode || "",
      regionId: values.regionId || null,
    };
    editSubRegion(
      { id: values.id, data: payload },
      {
        onSuccess: () => {
          form.resetFields();
          setIsModalOpen(false);
          toast.success("Tuman muvaffaqiyatli tahrirlandi!", {
            autoClose: 1500,
          });
        },
        onError: (error: any) => {
          toast.error(`Xatolik: ${error?.message || "Xatolik yuz berdi!"}`, {
            autoClose: 1500,
          });
        },
      }
    );
  };
  const handleAddSubRegion = (values: any) => {
    const payload = {
      nameUZB: values.nameUZB || "",
      nameRUS: values.nameRUS || "",
      postCode: values.postCode || "",
      regionId: values.regionId || null,
    };

    mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        setIsModalOpen(false);
        toast.success("Tuman muvaffaqiyatli qo'shildi!", {
          autoClose: 1500,
        });
      },
      onError: (error: any) => {
        toast.error(`Xatolik: ${error?.message || "Xatolik yuz berdi!"}`, {
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
      title: "Viloyat",
      dataIndex: ["region", "nameUZB"],
      key: "regionName",
      render: (text: string) => text || "-",
    },
    {
      title: "Tuman (UZB)",
      dataIndex: "nameUZB",
      key: "nameUZB",
    },
    {
      title: "Tuman (RUS)",
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
                setIsEditing(true);
                form.setFieldsValue({
                  id: record.id,
                  nameUZB: record.nameUZB,
                  nameRUS: record.nameRUS,
                  postCode: record.postCode,
                  regionId: record.region?.id || null,
                });
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Ushbu tuman/hududni o'chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() => handleDeleteSubRegion(record.id)}
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
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div className="p-2">
      <Modal
        title="Yangi tuman/hudud qo'shish"
        open={isModalOpen}
        onCancel={handleCancel}
        maskClosable={false}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            isEditing
              ? handleEditSubRegion(values)
              : handleAddSubRegion(values);
          }}
          initialValues={{
            nameUZB: "",
            nameRUS: "",
            postCode: "",
            regionId: null,
          }}
        >
          <Form.Item
            label="Viloyat"
            name="regionId"
            rules={[{ required: true, message: "Viloyatni tanlang!" }]}
          >
            <select className="w-full p-2 border rounded">
              <option value="">Viloyatni tanlang</option>
              {regionsData?.map((region: any) => (
                <option key={region.id} value={region.id}>
                  {region.nameUZB}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item
            label="Tuman nomi (UZB)"
            name="nameUZB"
            rules={[{ required: true, message: "Tuman nomini kiriting!" }]}
          >
            <Input placeholder="Tuman nomi (UZB)" />
          </Form.Item>

          <Form.Item
            label="Tuman nomi (RUS)"
            name="nameRUS"
            rules={[{ required: true, message: "Tuman nomini kiriting!" }]}
          >
            <Input placeholder="Tuman nomi (RUS)" />
          </Form.Item>

          <Form.Item
            label="Post kodi"
            name="postCode"
            rules={[{ required: true, message: "Post kodini kiriting!" }]}
          >
            <Input placeholder="Post kodi" />
          </Form.Item>
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Qo'shish
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data || []}
        loading={isLoading}
        // pagination={{
        //   pageSize: 10,
        //   showSizeChanger: false,
        //   pageSizeOptions: ["10", "20", "50", "100"],
        // }}
        pagination={false}
        scroll={{ x: 800 }}
        bordered
        title={() => (
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Tumanlar ro‘yxati</h2>
            <Button onClick={showModal} type="primary" icon={<PlusOutlined />}>
              Qo‘shish
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export default AddSubRegion;
