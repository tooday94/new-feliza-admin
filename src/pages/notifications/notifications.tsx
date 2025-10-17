import {
  Avatar,
  Button,
  Flex,
  Form,
  Grid,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Typography,
  Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { endpoints } from "../../configs/endpoints";
import { useGetById } from "../../services/query/useGetById";
import type { NotificationsType } from "../../types/notifications-type";
import { dateFormat } from "../../utils/formatDate";
import { useState } from "react";
import type { CategoriesAllType } from "../../types/categories-type";
import { useCreate } from "../../services/mutation/useCreate";
import { useGetList } from "../../services/query/useGetList";
import { toast } from "react-toastify";
import type { UserType } from "../../types/user-type";
import { useNavigate } from "react-router-dom";
import { useDeleteById } from "../../services/mutation/useDeleteById";
import { DeleteOutlined } from "@ant-design/icons";

const Notifications = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const [open, setOpen] = useState(false);
  const [openType, setOpenType] = useState<"all" | "user" | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState("text");
  const [userPhoneNumber, setUserPhoneNumber] = useState("+998");
  const [searchedUserID, setsearchedUserID] = useState<string | number>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useGetById<NotificationsType[]>({
    endpoint: endpoints.notifications.getById,
    id: searchedUserID
      ? searchedUserID
      : "1d37f0d2-6cb2-4e75-9982-cd9fea0556af",
  });
  const { data: searchedUserData } = useGetById<NotificationsType[]>({
    endpoint: endpoints.notifications.getById,
    id: searchedUserID,
    enabled: searchedUserID ? true : false,
  });
  // console.log(searchedUserData);

  const { data: allCategory } = useGetList<CategoriesAllType[]>({
    endpoint: endpoints.category.getAll,
    enabled: selectedType == "sale",
  });

  const { data: user } = useGetList<UserType>({
    endpoint: "/api/customers/getCustomerByPhoneNumber/" + userPhoneNumber,
    enabled: userPhoneNumber.length == 13 ? true : false,
  });

  const { mutate } = useCreate({
    endpoint: endpoints.notifications.postAll,
    queryKey: endpoints.notifications.getById,
  });

  const { mutate: postToUser } = useCreate({
    endpoint: endpoints.notifications.postToUser,
    queryKey: endpoints.notifications.getById,
  });
  const { mutate: NotificationDelete } = useDeleteById({
    endpoint: endpoints.notifications.delete,
    queryKey: endpoints.notifications.getById,
  });

  const handleDelete = (id: string | string) => {
    NotificationDelete(
      { id: id },
      {
        onSuccess: () => {
          toast.success("Xabar o'chirildi!", {
            position: "top-center",
            autoClose: 1500,
          });
        },
        onError: () => {
          toast.error("Xabarni o'chirishda xatolik!", {
            position: "top-center",
          });
        },
      }
    );
  };
  const createAll = (values: {
    type: string;
    title: string;
    message: string;
    reserveId: string;
  }) => {
    setIsSubmitting(true); // ⬅️ Bosilganda disable holatga o‘tadi

    if (openType == "all" && !file) {
      return toast.error("Iltimos, rasm tanlang");
    }

    const formData = new FormData();
    formData.append(
      "addNotificationDto",
      JSON.stringify({
        ...values,
        read: false,
        reserveId: values?.reserveId ? values.reserveId.toString() : "",
      })
    );
    formData.append("image", file || "");

    openType == "all"
      ? mutate(formData, {
          onSuccess: () => {
            toast.success("Hammaga xabar yuborildi!", {
              position: "top-center",
              autoClose: 1500,
            });
            setIsSubmitting(false); // ✅ Bosish yana faollashadi
            form.resetFields();
            setOpen(false);
          },
          onError: () => {
            toast.error("Hamma uchun xabar yuborishda xatolik", {
              position: "top-center",
            });
          },
        })
      : postToUser(
          {
            title: values.title,
            message: values.message,
            link: values?.reserveId ? values.reserveId.toString() : "",
            type: values.type,
            read: false,
            customerId: user?.id,
            imageUrl:
              "https://feliza-images.s3.ap-southeast-1.amazonaws.com/Feliza-logo.png",
          },
          {
            onSuccess: () => {
              toast.success("Mijozga xabar yuborildi!", {
                position: "top-center",
                autoClose: 1500,
              });
              form.resetFields();
              setOpen(false);
              setIsSubmitting(false); // ✅ Bosish yana faollashadi
            },
            onError: () => {
              toast.error("Mijozga xabar yuborishda xatolik", {
                position: "top-center",
              });
            },
          }
        );
  };

  return (
    <div className="">
      <Table
        caption={
          searchedUserData ? (
            <Flex className="border" justify="start" align="center" gap={12}>
              <Avatar src={user?.image?.url} />
              <h1
                className="font-semibold text-lg cursor-pointer hover:underline"
                onClick={() => navigate("/admin/user-detail/" + user?.id)}
              >
                {user?.fullName}
              </h1>
              <h1 className="font-semibold text-lg">{user?.phoneNumber}</h1>
              <h1 className="font-semibold text-lg px-2 border rounded">
                {user?.status.statusName}
              </h1>
            </Flex>
          ) : (
            "Hammasi"
          )
        }
        dataSource={data?.map((item) => ({ ...item, key: item.id }))}
        loading={isLoading}
        bordered
        size={screens.lg ? "large" : "small"}
        title={() => (
          <Flex justify="space-between" align="center">
            <Typography.Title level={3}>Notifications</Typography.Title>
            <Flex>
              <Input.Search
                allowClear
                placeholder="Mijoz Telefon raqami bilan qidirish"
                maxLength={13}
                className="!w-md"
                value={userPhoneNumber}
                onChange={(e) => setUserPhoneNumber(e.target.value)}
                onSearch={() => setsearchedUserID(user?.id || "")}
                onClear={() => setsearchedUserID("")}
              />
            </Flex>
            <Flex gap={24} align="center">
              <Button
                onClick={() => (setOpenType("user"), setOpen(true))}
                type="primary"
                icon={<PlusOutlined />}
                children="Mijoz"
              />
              <Button
                onClick={() => (setOpenType("all"), setOpen(true))}
                type="primary"
                icon={<PlusOutlined />}
                children="Hammaga"
              />
            </Flex>
          </Flex>
        )}
        columns={[
          { title: "reserveId", dataIndex: "reserveId", responsive: ["lg"] },
          { title: "Sarlavha", dataIndex: "title" },
          { title: "Xabar", dataIndex: "message" },
          {
            title: "Tur",
            dataIndex: "type",
            filters: [
              { text: "Chegirma", value: "sale" },
              { text: "Text", value: "text" },
            ],
            onFilter: (value, record) => record.type === value,
          },
          {
            responsive: ["lg"],
            align: "center",
            title: "Vaqt",
            dataIndex: "createdAt",
            render: (data) => dateFormat(data),
          },
          // delete qoshish uchu
          {
            title: "Amallar",
            align: "center",
            render: (_, record: any) => (
              <Popconfirm
                title="Delete qilmoqchimisiz?"
                okText="Ha"
                cancelText="Yo'q"
                onConfirm={() => handleDelete(record.id)}
              >
                <Button icon={<DeleteOutlined />} danger />
              </Popconfirm>
            ),
          },
        ]}
        pagination={{
          position: ["bottomCenter"],
          showQuickJumper: true,
          defaultPageSize: 10,
        }}
      />

      <Modal
        centered
        maskClosable={false}
        footer={false}
        title={
          openType == "all"
            ? "Hamma uchun xabar jo'natish"
            : "Mijoz uchun Xabar Jo'natish"
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createAll}
          initialValues={{ read: false, type: "text" }}
        >
          <Form.Item
            name={"title"}
            label="Sarlavha"
            rules={[{ required: true, message: "Iltimos Sarlavha kiriting!" }]}
          >
            <Input />
          </Form.Item>

          {openType == "user" && (
            <Form.Item
              name={"customerId"}
              label="Mijoz Tel"
              rules={[
                { required: true, message: "Iltimos Mijoz(lar) ni tanlang!" },
              ]}
            >
              <Input
                value={userPhoneNumber}
                onChange={(e) => setUserPhoneNumber(e.target.value)}
                placeholder="+998"
                maxLength={13}
              />
            </Form.Item>
          )}

          {openType != "user" && (
            <Form.Item
              // name={"img"}
              label="Rasm yuklash"
              rules={[{ required: true, message: "Iltimos Rasm tanlang!" }]}
            >
              <Upload
                listType="picture"
                multiple={false}
                beforeUpload={(file) => {
                  setFile(file);
                  return false;
                }}
                maxCount={1}
                accept="image/*"
              >
                <Button>Rasm tanlang</Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item name={"type"} label={"Turni Tanlash"}>
            <Select
              // defaultValue={"text"}
              options={[
                { value: "text", label: "Text" },
                { value: "sale", label: "Sale" },
              ]}
              onChange={(e) => setSelectedType(e)}
            />
          </Form.Item>
          {selectedType != "text" && (
            <Form.Item
              name={"reserveId"}
              label={"Kategoriya Tanlash"}
              rules={[
                { required: true, message: "Iltimos kategoriyani tanlang!" },
              ]}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allCategory?.map((item) => ({
                  value: item.id,
                  label: item.nameUZB,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name={"message"}
            label="Xabar"
            rules={[{ required: true, message: "Iltimos Xabar kiriting!" }]}
          >
            <Input.TextArea placeholder="Xabar kiriting!" />
          </Form.Item>

          <Form.Item className="!mb-0 !mt-10">
            <Button
              size="large"
              block
              type="primary"
              htmlType="submit"
              loading={isSubmitting} // ✅ loading holati
              disabled={isSubmitting} // ✅ bosib bo‘lmaydi
              children="Jo'natish"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Notifications;
