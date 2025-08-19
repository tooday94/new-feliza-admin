import { Button, Form, Input, Modal, Table, Tooltip } from "antd";
import { endpoints } from "../../../configs/endpoints";
import { useGetList } from "../../../services/query/useGetList";
import type { SmsCategoryType } from "../../../types/settingsTypes/sms-category";
import dayjs from "dayjs";
import { EditTwoTone, PlusOutlined } from "@ant-design/icons";
import { useUpdate } from "../../../services/mutation/useUpdate";
import { useState } from "react";
import { useCreate } from "../../../services/mutation/useCreate";
import { toast } from "react-toastify";

const SmsCategory = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEditSmsName, setSelectedEditSmsName] = useState<string | null>(
    null
  );
  const { data, isLoading } = useGetList<SmsCategoryType[]>({
    endpoint: endpoints.sms.getAll,
  });
  const { data: getNames } = useGetList<string[]>({
    endpoint: endpoints.sms.getTemplateNames,
  });

  const { mutate: createSms } = useCreate({
    endpoint: endpoints.sms.post,
    queryKey: endpoints.sms.getAll,
  });
  const { mutate: editSms } = useUpdate({
    endpoint: endpoints.sms.put,
    queryKey: endpoints.sms.getAll,
  });
  const [form] = Form.useForm();

  const handleCreateSms = (values: any) => {
    const payload = {
      smsName: values.smsName || "Yangi SMS",
      text: values.text || "Matn kiritilmagan",
    };
    createSms(payload, {
      onSuccess: () => {
        toast.success("Yangi SMS qo'shildi!", {
          autoClose: 1500,
        });
        setModalOpen(false);
        form.resetFields();
      },
      onError: (error) => {
        toast.error(`Xatolik: ${error.message}`, {
          autoClose: 1500,
        });
      },
    });
  };
  const handleEditSms = (smsName: string, values: any) => {
    const payload = {
      text: values.text || "Matn kiritilmagan",
    };
    editSms(
      { id: smsName, data: payload },
      {
        onSuccess: () => {
          toast.success("SMS yangilandi!", {
            autoClose: 1500,
          });
          setModalOpen(false);
          form.resetFields();
          setSelectedEditSmsName(null);
        },
        onError: (error) => {
          toast.error(`Xatolik: ${error.message}`, {
            autoClose: 1500,
          });
        },
      }
    );
  };

  const columns = [
    {
      title: "#",
      render: (_: any, __: any, index: number) => index + 1,
      key: "index",
    },
    {
      title: "SMS Nomi",
      dataIndex: "smsName",
      key: "smsName",
    },
    {
      title: "Matn",
      dataIndex: "text",
      key: "text",
      render: (text: string) => (
        <div style={{ whiteSpace: "pre-wrap", maxWidth: 400 }}>{text}</div>
      ),
    },
    {
      title: "Yaratilgan sana",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
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
                form.setFieldsValue({
                  smsName: record.smsName,
                  text: record.text,
                });
                setSelectedEditSmsName(record.smsName); // id emas!
                setModalOpen(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const showModal = () => {
    setModalOpen(true);
    form.resetFields();
    setSelectedEditSmsName(null);
  };

  return (
    <div className="p-1">
      <Modal
        title={selectedEditSmsName ? "SMS Tahrirlash" : "Yangi SMS Qo'shish"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setSelectedEditSmsName(null);
        }}
        onOk={handleCreateSms}
        okText="Qo'shish"
        cancelText="Bekor qilish"
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (selectedEditSmsName) {
              handleEditSms(selectedEditSmsName, values);
            } else {
              handleCreateSms(values);
            }
          }}
        >
          {!selectedEditSmsName && (
            <Form.Item
              label="SMS Nomi"
              name="smsName"
              rules={[{ required: true, message: "SMS nomini kiriting!" }]}
            >
              <Input
                placeholder="SMS Nomi"
                list="smsNames"
                autoComplete="off"
              />
              <datalist id="smsNames">
                {getNames?.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Form.Item>
          )}

          <Form.Item
            label="Matn"
            name="text"
            rules={[{ required: true, message: "Matnni kiriting!" }]}
          >
            <Input.TextArea placeholder="Matn" rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedEditSmsName ? "Yangilash" : "Qo'shish"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        title={() => (
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              SMS Kategoriyalar Ro'yxati
            </h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Qo'shish
            </Button>
          </div>
        )}
        dataSource={data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={columns}
        bordered
      />
    </div>
  );
};

export default SmsCategory;
