import React, { useState } from "react";
import { Table, Button, Tooltip, Popconfirm, Tag, Modal } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useGetList } from "../../services/query/useGetList";
import type { AdminType } from "../../types/admin-type";
import { endpoints } from "../../configs/endpoints";
import { useCreate } from "../../services/mutation/useCreate";
import { Form, Input, DatePicker, Select, Switch } from "antd";
import { toast } from "react-toastify";
import type { RoleType } from "../../types/role-type";
import { useUpdate } from "../../services/mutation/useUpdate";

const Admins: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminType | null>(null);
  const { data, isLoading, refetch } = useGetList<AdminType[]>({
    endpoint: endpoints.admins.getAll,
  });
  const { mutate } = useCreate({
    endpoint: endpoints.admins.post,
    queryKey: endpoints.admins.getAll,
  });
  const { mutate: update } = useUpdate({
    endpoint: endpoints.admins.put,
    queryKey: endpoints.admins.getAll,
  });

  // roles
  const { data: rolesData } = useGetList<RoleType[]>({
    endpoint: endpoints.role.getAll,
  });
  const [form] = Form.useForm();
  console.log("Admins rolesData:", data);

  //  upadte admin function
  const handleEdit = (admin: AdminType) => {
    setSelectedAdmin(admin);
    form.setFieldsValue({
      fullName: admin.fullName,
      phoneNumber: admin.phoneNumber,
      roles: admin?.roles?.map((role) => role.id),
      enabled: admin.enabled,
    });
    setIsModalOpen(true);
  };

  const onFinish = (values: any) => {
    refetch();
    const formatted: any = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      roleIdList: values.roles,
      active: values.enabled,
    };

    // Faqat yangi admin qo‘shilayotganida (selectedAdmin yo‘q bo‘lsa)
    if (!selectedAdmin) {
      formatted.birthDate = values.birthDate?.format("YYYY-MM-DD");
      formatted.password = values.password;
    }

    if (selectedAdmin) {
      // EDIT
      update(
        { id: selectedAdmin.id, data: formatted },
        {
          onSuccess: () => {
            toast.success("Admin muvaffaqiyatli yangilandi!", {
              autoClose: 1500,
            });
            setIsModalOpen(false);
            form.resetFields();
            setSelectedAdmin(null);
          },
          onError: () => {
            toast.error("Xatolik yuz berdi. Yangilash amalga oshmadi.", {
              autoClose: 1500,
            });
          },
        }
      );
    } else {
      // CREATE
      mutate(formatted, {
        onSuccess: () => {
          toast.success("Admin muvaffaqiyatli qo‘shildi!", {
            autoClose: 1500,
          });
          setIsModalOpen(false);
          form.resetFields();
        },
        onError: () => {
          toast.error("Xatolik yuz berdi. Admin qo‘shilmadi.", {
            autoClose: 1500,
          });
        },
      });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      render: (_: any, __: any, index: number) => index + 1,
      // render: (text: string, record: AdminType, index: number) => (
      //   <span>{index + 1}</span>
      // ),
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Birth Date",
      dataIndex: "birthDate",
      key: "birthDate".slice(0, 10),
      render: (text: string) => text?.slice(0, 10),
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles: AdminType["roles"]) => {
        if (!roles || roles.length === 0) return "No Roles";
        return (
          <Tooltip
            title={
              <div>
                {roles.map((role, index) => (
                  <div
                    style={{
                      marginBottom: "4px",
                      color: "white",
                      fontSize: "14px",
                    }}
                    key={index}
                  >
                    • {role.roleName}
                  </div>
                ))}
              </div>
            }
          >
            <Tag
              style={{
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              color="blue"
            >
              {roles[0].roleName}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: AdminType) => (
        <>
          <Tooltip title="Edit">
            <Button
              onClick={() => handleEdit(record)}
              icon={<EditOutlined />}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete qilmoqchimisiz?"
            okText="Ha"
            cancelText="Yo'q"
          >
            <Tooltip>
              <Button icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </>
      ),
    },
  ];
  return (
    <div className="p-1 bg-white shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold p-1">Admins Panel</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Add Admin
        </Button>
        <Modal
          title={selectedAdmin ? "Adminni tahrirlash" : "Yangi admin qo‘shish"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedAdmin(null);
            form.resetFields();
          }}
          footer={false}
          maskClosable={false}
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{
              fullName: selectedAdmin?.fullName,
              phoneNumber: selectedAdmin?.phoneNumber,
              roles: selectedAdmin?.roles?.map((role) => role.id) || [],
              enabled: true,
            }}
          >
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Iltimos, ismni kiriting" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: "Iltimos, telefon raqamni kiriting",
                },
              ]}
            >
              <Input />
            </Form.Item>

            {/* Faqat create vaqtida ko‘rinadi */}
            {!selectedAdmin && (
              <Form.Item
                name="birthDate"
                label="Birth Date"
                rules={[
                  {
                    required: true,
                    message: "Iltimos, tug‘ilgan sanani tanlang",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            )}

            {!selectedAdmin && (
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Iltimos, parolni kiriting" },
                ]}
              >
                <Input.Password />
              </Form.Item>
            )}

            <Form.Item
              name="roles"
              label="Roles"
              rules={[{ required: true, message: "Iltimos, rollarni tanlang" }]}
            >
              <Select mode="multiple" placeholder="Rollarni tanlang">
                {rolesData?.map((role) => (
                  <Select.Option key={role.id} value={role.id}>
                    {role?.roleName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="enabled" label="Enabled" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {selectedAdmin ? "Yangilash" : "Qo'shish"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default Admins;
