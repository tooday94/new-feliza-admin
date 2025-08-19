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
const OrderDetail: React.FC = () => {
  const [trackNumber, setTrackNumber] = useState("");
  const { id } = useParams();

  const { data, isLoading } = useGetById<newOrders>({
    endpoint: endpoints.order.getById,
    id: id || "",
  });
  console.log(data);

  const { mutate: orderToSend, isPending: orderToSendPending } = useUpdate({
    endpoint: endpoints.order.putToSend,
    queryKey: endpoints.order.getById,
  });
  const { mutate: orderToPack, isPending: orderToPackPending } = useUpdate({
    endpoint: endpoints.order.putToPack,
    queryKey: endpoints.order.getById,
  });
  const { mutate: orderToCancel, isPending: orderToCancelPending } = useUpdate({
    endpoint: endpoints.order.putToRejected,
    queryKey: endpoints.order.getById,
  });

  const { mutate: orderToDelivered } = useUpdate({
    endpoint: endpoints.order.putToReached,
    queryKey: endpoints.order.getById,
  });

  return (
    <Flex vertical gap={48} className="w-full">
      <Flex gap={24} justify="space-between" className="w-full">
        <Flex vertical gap={24} className="h-fit max-w-2/3 w-full">
          <Flex gap={12} className="rounded-md bg-white !p-3 w-full ">
            {data?.customer?.image?.url ? (
              <img
                className="rounded-md w-48"
                src={data?.customer?.image?.url}
                alt=""
              />
            ) : (
              <div className="rounded-md w-48 flex justify-center items-center">
                <BiUser size={48} />
              </div>
            )}
            <Flex className="" justify="space-between" vertical gap={12}>
              <h1>
                <b>Ism Familiya: </b>
                {data?.receiverName}
              </h1>
              <h1>
                <b>Tel:</b> {data?.receiverPhoneNumber}
              </h1>
              <h1>
                <b>Manzil: </b>
                {data?.address?.region?.nameUZB},{" "}
                {data?.address?.subRegion?.nameUZB},{" "}
                {data?.address?.street
                  ? data?.address?.street
                  : data?.address?.postFilial?.postName +
                    ", " +
                    data?.address?.postFilial?.postFilialName}
                {data?.address?.houseNumber}
              </h1>
              <h1>
                <b>Buyurtma raqami: </b>
                {data?.orderNumber}
              </h1>
              <h1>
                <b>Buyurtma umumiy qiymati: </b>
                {data?.orderCost}
              </h1>
              <h1>
                <b>To'lov Turi: </b>
                {data?.paymentMethod}
              </h1>
              <h1>
                <b>Kupon: </b>
                {data?.couponCustomer ? (
                  <span className="text-secondary">
                    {data?.couponCustomer?.coupon?.name}
                  </span>
                ) : (
                  <span className="text-red-500">Yo'q</span>
                )}
              </h1>
            </Flex>
          </Flex>
          <OrderShowSteps status={data?.orderStatusType as OrderStatus} />
        </Flex>
        <Flex
          align="end"
          vertical
          justify="space-between"
          className="w-full max-w-1/3"
        >
          <Flex gap={48} justify="start" vertical className="w-full">
            <Popconfirm
              title="Tasdiqlash"
              description="Buyurtmani bekor qilmoqchimisiz?"
              okText="Tasdiqlash"
              cancelText="Yo'q"
              onConfirm={() => (
                console.log("Bekor qilish"),
                orderToCancel(
                  { id: data?.orderId, data: {} },
                  { onError: () => console.log(data?.orderId) }
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
              onConfirm={() => (
                console.log("Tayyorlandi"),
                orderToPack({ id: data?.orderId, data: {} })
              )}
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
                orderToDelivered({ id: data?.orderId, data: {} })
              )}
              onOpenChange={() => console.log("open change")}
            >
              <Button
                loading={orderToPackPending}
                size="large"
                type="primary"
                className="!bg-green-500"
                style={{
                  display: data?.orderStatusType != "SEND" ? "none" : "block",
                }}
                icon={<CheckCircleOutlined />}
                children="Yetkazildi"
              />
            </Popconfirm>

            <Flex
              vertical
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
                  orderToSend({
                    id: data?.orderId,
                    data: { postTrackingNumber: trackNumber },
                  })
                )}
                onOpenChange={() => console.log("open change")}
              >
                <Button
                  disabled={!trackNumber.trim()}
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

      <Table
        bordered
        loading={isLoading}
        dataSource={data?.orderDetailDtos}
        columns={[
          {
            width: "0",
            title: "Rasm",
            dataIndex: ["productImages", ""],
            render: (_, record) => (
              <Image width={56} src={record.productImages[0].url} />
            ),
          },
          {
            width: "0",
            title: "Mahsulot nomi",
            dataIndex: "productName",
          },
          {
            width: "0",
            title: "Mahsulot Ref",
            dataIndex: ["referenceNumber"],
          },
          {
            width: "0",
            title: "Sotish narxi",
            dataIndex: ["sellPrice"],
          },
          {
            width: "0",
            title: "Mahsulot soni",
            dataIndex: "quantity",
          },
          {
            width: "0",
            title: "Mahsulot O'lchami",
            dataIndex: ["productSizeVariant", "size"],
          },
        ]}
      />
    </Flex>
  );
};

export default OrderDetail;
