import {
  Avatar,
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Switch,
  Table,
  Typography,
} from "antd";
import {
  PlusCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useGetById } from "../../services/query/useGetById";
import { endpoints } from "../../configs/endpoints";
import { useState } from "react";
import type { CouponsType, CustomerCouponType } from "../../types/coupons-type";
import { dateFormat } from "../../utils/formatDate";
import { useGetList } from "../../services/query/useGetList";
import { useNavigate } from "react-router-dom";
import { useCreate } from "../../services/mutation/useCreate";
import { toast } from "react-toastify";

const CouponsCustomerTab = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchedPhoneNumber, setSearchedPhoneNumber] = useState("+998");
  const { data: userData, isLoading: userLoad } = useGetById<{
    id: string;
    fullName: string;
    birthDate: string;
    image: {
      url: string;
    };
    status: {
      statusName: string;
    };
  }>({
    endpoint: "/api/customers/getCustomerByPhoneNumber/",
    id: searchedPhoneNumber,
    enabled: searchedPhoneNumber.length == 13 ? true : false,
  });

  const { data: userCoupons, isLoading: userCouponLoad } = useGetById<
    CustomerCouponType[]
  >({
    endpoint: "/api/couponCustomer/getCouponsByCustomerId/",
    id: userData?.id || "",
    enabled: userData ? true : false,
  });

  const { data: allCoupons } = useGetList<CouponsType[]>({
    endpoint: endpoints.coupon.getAll,
  });

  const { mutate, isPending } = useCreate({
    endpoint: "/api/couponCustomer/addCouponToCustomer",
    queryKey: "/api/couponCustomer/getCouponsByCustomerId/",
  });

  const handleSearch = (phone: string) => {
    setSearchedPhoneNumber(phone);
  };

  return (
    <Flex vertical gap={24} className="space-y-6">
      <Flex justify="space-between" align="center" gap={24}>
        <Typography.Title level={3}>Mijoz Kuponlari</Typography.Title>

        <Input.Search
          allowClear
          loading={userLoad}
          size="large"
          className="max-w-md"
          placeholder="mijozni tel raqami orqali qidirish"
          value={searchedPhoneNumber}
          onClear={() => setSearchedPhoneNumber("+998")}
          onChange={(e) => setSearchedPhoneNumber(e.target.value)}
          onSearch={(value) => handleSearch(value)}
        />

        <Button
          size="large"
          type="primary"
          icon={<PlusOutlined />}
          children="Mijozga Kupon Qo'shish"
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      </Flex>

      <Table
        bordered
        dataSource={userCoupons}
        loading={userCouponLoad}
        title={() =>
          userData && (
            <Flex justify="space-between" align="center" gap={24}>
              <Flex align="center" justify="end" gap={24}>
                <Avatar
                  icon={<UserOutlined />}
                  size={"large"}
                  src={
                    userData && userData?.image?.url ? userData?.image.url : ""
                  }
                />
                <Typography.Title
                  level={3}
                  className="!mb-0 hover:underline cursor-pointer"
                  onClick={() => navigate("/admin/user-detail/" + userData.id)}
                >
                  {userData ? userData?.fullName : "Ism kiritilmagan"}
                </Typography.Title>
                <Typography.Title level={4} className="!m-0">
                  {userData
                    ? dateFormat(userData?.birthDate, false)
                    : "Sana kiritilmagan"}
                </Typography.Title>
                <Typography.Title
                  level={4}
                  className="!m-0 border px-3 py-0.5 rounded bg-primary !text-white"
                >
                  {userData ? userData?.status?.statusName : "yoq"}
                </Typography.Title>
              </Flex>

              <Button
                size="large"
                type="primary"
                icon={<PlusCircleOutlined />}
                children="Yana kupon qo'shish"
                onClick={() => {
                  form.setFieldValue("phoneNumber", searchedPhoneNumber);
                  setIsModalOpen(true);
                }}
              />
            </Flex>
          )
        }
        columns={[
          {
            title: "Kupon nomi",
            dataIndex: ["coupon", "name"],
          },
          {
            title: "Kupon narxi",
            dataIndex: ["coupon", "credit"],
          },
          {
            title: "Qo'shilgan Vaqti",
            dataIndex: ["createdAt"],
            render: (date) => (date ? dateFormat(date) : "belgilanmagan"),
          },
          {
            title: "Holati",
            dataIndex: ["coupon", "active"],
            render: (status) => (status ? "faol" : "faol emas"),
          },
          {
            title: "Muddati",
            dataIndex: "expireDate",
            render: (date) => (date ? dateFormat(date) : "belgilanmagan"),
          },
        ]}
      />

      <Modal
        title="Mijozga Kupon Qo'shish"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        footer={false}
        maskClosable={false}
        onCancel={() => {
          setIsModalOpen(false);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActiveCustomerCoupon: true }}
          onFinish={(values) => {
            console.log(values);

            setSearchedPhoneNumber(values.phoneNumber);

            const fullData = {
              customerId: userData?.id,
              couponName: values.couponName,
              expireDate: values.expireDate,
              isActiveCustomerCoupon: values.isActiveCustomerCoupon,
            };

            console.log("Full", fullData);

            mutate(fullData, {
              onSuccess: () => {
                toast.success("Mijozga Kupon qo'shildi!", {
                  position: "top-center",
                });
                form.resetFields();
                setIsModalOpen(false);
              },
              onError: () => {
                toast.error("Mijozga Kupon qo'shishda xatolik", {
                  position: "top-center",
                });
              },
            });
          }}
        >
          <Form.Item
            label="Kupon"
            name={"couponName"}
            rules={[{ required: true, message: "Kiritilishi shart" }]}
          >
            <Select
              size="large"
              placeholder="Kupon Tanlang"
              options={allCoupons?.map((item) => {
                const customLabel = `${item.name}-${item.enumName}-${item.credit}`;
                return {
                  label: customLabel,
                  value: item.enumName,
                };
              })}
            />
          </Form.Item>

          <Form.Item
            label="Mijoz Telefon raqami"
            name={"phoneNumber"}
            rules={[{ required: true, message: "Kiritilishi shart" }]}
          >
            <Input
              size="large"
              placeholder="+998 bilan kiriting"
              value={searchedPhoneNumber}
              onChange={(e) => setSearchedPhoneNumber(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Muddati (ixtiyoriy)" name={"expireDate"}>
            <Input size="large" type="date" />
          </Form.Item>

          <Form.Item
            label="Holati"
            name={"isActiveCustomerCoupon"}
            rules={[{ required: true, message: "Kiritilishi shart" }]}
          >
            <Switch
              size="default"
              unCheckedChildren="faol emas"
              checkedChildren="faol"
              defaultValue={true}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              htmlType="submit"
              block
              loading={isPending}
              size="large"
              type="primary"
              children="Saqlash"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};

export default CouponsCustomerTab;
