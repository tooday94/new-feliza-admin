import { Button, Flex, Image, Input, Popconfirm, Table } from "antd";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetById } from "../../services/query/useGetById";
import { endpoints } from "../../configs/endpoints";
import type { newOrders, OrderStatus } from "../../types/orders";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { BiUser } from "react-icons/bi";
import OrderShowSteps from "../../components/orders/order-show-steps";
import { useUpdate } from "../../services/mutation/useUpdate";
import { toast } from "react-toastify";
import { dateFormat } from "../../utils/formatDate";
const OrderDetail: React.FC = () => {
  const [trackNumber, setTrackNumber] = useState("");
  const { id } = useParams();

  const { data, isLoading, refetch } = useGetById<newOrders>({
    endpoint: endpoints.order.getById,
    id: id || "",
  });

  const { mutate: orderToSend, isPending: orderToSendPending } = useUpdate({
    endpoint: endpoints.order.putToSend,
    queryKey: endpoints.order.getShipped,
  });
  const { mutate: orderToPack, isPending: orderToPackPending } = useUpdate({
    endpoint: endpoints.order.putToPack,
    queryKey: endpoints.order.getPackaged,
  });
  const { mutate: orderToCancel, isPending: orderToCancelPending } = useUpdate({
    endpoint: endpoints.order.putToRejected,
    queryKey: endpoints.order.getCanceled,
  });

  const { mutate: orderToDelivered } = useUpdate({
    endpoint: endpoints.order.putToReached,
    queryKey: endpoints.order.getAllDelivered,
  });

  return (
    <Flex vertical gap={48} className="w-full !mb-4">
      <Flex
        gap={24}
        justify="space-between"
        className="w-full flex-wrap md:flex-nowrap"
      >
        <Flex vertical gap={24} className="h-fit w-full">
          <Flex
            gap={12}
            className="rounded-md bg-white !p-3 w-full justify-between"
          >
            <Flex gap={12} align="center">
              {data?.customer?.image?.url ? (
                <Image
                  className="rounded-md !w-48 !h-full"
                  src={data?.customer?.image?.url}
                />
              ) : (
                <div className="rounded-md w-48 flex justify-center items-center">
                  <BiUser size={48} />
                </div>
              )}
              <Flex
                className="text-accent"
                justify="space-between"
                vertical
                gap={6}
              >
                <h1>
                  Ism Familiya:
                  <b className="text-primary ml-2">{data?.receiverName}</b>
                </h1>
                <h1>Tel: {data?.receiverPhoneNumber}</h1>
                <h1>
                  Manzil:
                  <b className="text-primary ml-2">
                    {data?.address?.region?.nameUZB},{" "}
                    {data?.address?.subRegion?.nameUZB},{" "}
                    {data?.address?.street
                      ? data?.address?.street
                      : data?.address?.postFilial?.postName +
                        ", " +
                        data?.address?.postFilial?.postFilialName}
                    {data?.address?.houseNumber}
                  </b>
                </h1>
                <h1>
                  Buyurtma raqami:
                  <b className="text-primary ml-2">{data?.orderNumber}</b>
                </h1>
                <h1>
                  Buyurtma umumiy qiymati:
                  <b className="text-primary ml-2">{data?.orderCost}</b>
                </h1>
                <h1>
                  To'lov Turi:
                  <b className="text-primary ml-2">{data?.paymentMethod}</b>
                </h1>
                <h1>
                  Kupon:
                  {data?.couponCustomer ? (
                    <b className="text-primary ml-2">
                      {data?.couponCustomer?.coupon?.name}
                    </b>
                  ) : (
                    <b className="text-red-500 ml-2">Yo'q</b>
                  )}
                </h1>
                <h1>
                  Buyurtma qilingan vaqt:
                  <b className="text-primary ml-2">
                    {dateFormat(data?.createdAt || "")}
                  </b>
                </h1>
              </Flex>
            </Flex>

            <Flex align="start" justify="space-between">
              <Flex gap={24} justify="start" className="!w-full">
                <Popconfirm
                  title="Tasdiqlash"
                  description="Buyurtmani bekor qilmoqchimisiz?"
                  okText="Tasdiqlash"
                  cancelText="Yo'q"
                  onConfirm={() => (
                    console.log("Bekor qilish"),
                    orderToCancel(
                      { id: data?.orderId, data: {} },
                      {
                        onError: () => toast.error("Buyurtma bekor qilinmadi"),
                        onSuccess: () => {
                          toast.success("Buyurtma bekor qilindi");
                          refetch();
                        },
                      }
                    )
                  )}
                  onOpenChange={() => console.log("open change")}
                >
                  <Button
                    size="large"
                    danger
                    icon={<CloseCircleOutlined />}
                    loading={orderToCancelPending}
                    children="Bekor qilish"
                    style={{
                      display:
                        data?.orderStatusType == "REJECTED" ? "none" : "block",
                    }}
                  />
                </Popconfirm>

                <Popconfirm
                  title="Tasdiqlash"
                  description="Buyurtma tayyorlandimi?"
                  okText="Tasdiqlash"
                  cancelText="Yo'q"
                  onConfirm={() =>
                    orderToPack(
                      { id: data?.orderId, data: {} },
                      {
                        onError: () => toast.error("Buyurtma Tayyorlanmadi"),
                        onSuccess: () => {
                          toast.success("Buyurtma Tayyorlandi");
                          refetch();
                        },
                      }
                    )
                  }
                  onOpenChange={() => console.log("open change")}
                >
                  <Button
                    loading={orderToPackPending}
                    size="large"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    children="Tayyorlandi"
                  />
                </Popconfirm>
                <Popconfirm
                  title="Tasdiqlash"
                  description="Buyurtma tayyorlandimi?"
                  okText="Tasdiqlash"
                  cancelText="Yo'q"
                  onConfirm={() => (
                    console.log("Tayyorlandi"),
                    orderToDelivered(
                      { id: data?.orderId, data: {} },
                      {
                        onError: () => toast.error("Buyurtma Yetkazilmadi"),
                        onSuccess: () => {
                          toast.success("Buyurtma Yetkazildi");
                          refetch();
                        },
                      }
                    )
                  )}
                  onOpenChange={() => console.log("open change")}
                >
                  <Button
                    loading={orderToPackPending}
                    size="large"
                    type="primary"
                    className="!bg-green-500"
                    style={{
                      display:
                        data?.orderStatusType != "SEND" ? "none" : "block",
                    }}
                    icon={<CheckCircleOutlined />}
                    children="Yetkazildi"
                  />
                </Popconfirm>

                <Flex
                  // vertical
                  gap={12}
                  className={data?.orderStatusType == "SEND" ? "!hidden" : ""}
                >
                  <Input
                    size="large"
                    placeholder="Jo'natma Raqamini kiriting"
                    className="h-fit"
                    onChange={(e) => setTrackNumber(e.target.value)}
                  />

                  <Popconfirm
                    title="Tasdiqlash"
                    description="Buyurtma Jo'natishga tayyormi? va Jo'natma Raqamini to'g'ri kiritdingizmi?"
                    okText="Tasdiqlash"
                    cancelText="Yo'q"
                    onConfirm={() => (
                      console.log("Jo'natildi", data?.orderId),
                      orderToSend(
                        {
                          id: data?.orderId,
                          data: { postTrackingNumber: trackNumber },
                        },
                        {
                          onError: () => toast.error("Buyurtma Jo'natilmadi"),
                          onSuccess: () => {
                            toast.success("Buyurtma Jo'natildi");
                            refetch();
                            setTrackNumber("");
                          },
                        }
                      )
                    )}
                    onOpenChange={() => console.log("open change")}
                  >
                    <Button
                      // disabled={!trackNumber.trim()}
                      type="primary"
                      loading={orderToSendPending}
                      size="large"
                      icon={<SendOutlined />}
                      children="Jo'natildi"
                    />
                  </Popconfirm>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <OrderShowSteps
            status={
              data?.orderStatusType && data.paid
                ? (data.orderStatusType as OrderStatus)
                : ("PAIDFALSE" as OrderStatus)
            }
          />
        </Flex>
      </Flex>

      <Table
        bordered
        size="small"
        scroll={{ x: "max-content" }}
        loading={isLoading}
        dataSource={data?.orderDetailDtos}
        columns={[
          {
            width: "0",
            title: "Rasm",
            dataIndex: "productImages",
            render: (_, record) => (
              <Image.PreviewGroup>
                {record.productImages.length > 0 ? (
                  <>
                    <Image
                      width={120}
                      src={record.productImages[0].url}
                      className="rounded-md"
                    />

                    {record.productImages.slice(1).map((image) => (
                      <Image
                        key={image.id}
                        width={0}
                        src={image.url}
                        style={{ display: "none" }}
                      />
                    ))}
                  </>
                ) : (
                  <Image width={56} src="/images/no-image.png" />
                )}
              </Image.PreviewGroup>
            ),
          },
          {
            title: "Mahsulot nomi",
            dataIndex: "productName",
          },
          {
            title: "Mahsulot Ref",
            dataIndex: ["referenceNumber"],
          },
          {
            title: "BarCode",
            dataIndex: ["productSizeVariant", "barCode"],
          },
          {
            title: "Sotish narxi",
            dataIndex: ["sellPrice"],
          },
          {
            title: "Chegirmadagi narxi",
            dataIndex: ["productCost"],
          },
          {
            title: "Mahsulot O'lchami",
            dataIndex: ["productSizeVariant", "size"],
          },
          {
            width: "0",
            align: "center",
            title: "Mahsulot soni",
            dataIndex: "quantity",
          },
        ]}
        pagination={false}
      />
    </Flex>
  );
};

export default OrderDetail;
