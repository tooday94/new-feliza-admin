import React from "react";
import { useGetList } from "../../services/query/useGetList";
import type { NotificationsType } from "../../types/notifications-type";
import { endpoints } from "../../configs/endpoints";
import { Table, Tag, Image, Switch, Tooltip, Button } from "antd";
import { CiStar } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import type { ColumnsType } from "antd/es/table";
import { useDeleteById } from "../../services/mutation/useDeleteById";
import { toast } from "react-toastify";
import { useUpdate } from "../../services/mutation/useUpdate";

const Review: React.FC = () => {
  const { data, isLoading, refetch } = useGetList<NotificationsType[]>({
    endpoint: endpoints.review.reviewAll,
    // queryKey: endpoints.review.reviewDelete,
  });
  const { mutate } = useDeleteById({
    endpoint: endpoints.review.reviewDelete,
    queryKey: endpoints.review.reviewDelete,
  });

  // moderateReview ni ishga tushirish uchun
  const { mutate: moderateReviews } = useUpdate({
    endpoint: endpoints.review.reviewModerate,
    queryKey: endpoints.review.reviewDelete,
  });

  const checkedModerateReviews = (id: number, checked: boolean) => {
    moderateReviews(
      { data: { reviewId: id, moder: checked } },
      {
        onSuccess: () => {
          toast.success("Izoh muvaffaqiyatli moderatsiyadan o'tdi.", {
            autoClose: 1500,
          });
          refetch();
        },
        onError: (error) => {
          console.error("Izohni moderatsiyadan o'tkazishda xato:", error);
          toast.error("Izohni moderatsiyadan o'tkazishda xato.", {
            autoClose: 1500,
          });
        },
      }
    );
  };

  const columns: ColumnsType<NotificationsType> = [
    {
      title: "Rasm",
      dataIndex: "reviewImages",
      render: (images: any[]) => (
        <div className="flex gap-2">
          {images?.map((img, idx) => (
            <Image
              key={idx}
              src={img?.url}
              width={50}
              height={50}
              preview={true}
              style={{
                objectFit: "cover",
                border: "1px solid #ddd",
              }}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Foydalanuvchi",
      dataIndex: "customer",
      render: (customer: any) => (
        <div className="flex flex-col">
          <span className="font-semibold">
            {customer?.fullName || "Nomaʼlum"}
          </span>
          <span className="text-gray-500 text-sm">
            {customer?.phoneNumber || "Nomaʼlum"}
          </span>
        </div>
      ),
    },
    {
      title: "Izoh",
      dataIndex: "content",
      render: (text: string) => (
        <div className="text-gray-700 max-w-xs line-clamp-3">
          {text || "Izoh mavjud emas."}
        </div>
      ),
    },
    {
      title: "Mahsulot",
      dataIndex: "product",
      render: (product: any) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium">{product?.nameUZB || "Nomaʼlum"}</span>
          <span className="text-gray-500">
            Brend: {product?.brand?.name || "—"}
          </span>
          <span className="text-black font-bold">
            {product?.sellPrice ? `${product.sellPrice} so'm` : ""}
          </span>
        </div>
      ),
    },
    {
      title: "Reyting",
      dataIndex: "rating",
      render: (rating: number) => (
        <div className="flex items-center gap-1 text-yellow-500 text-lg">
          {[...Array(rating)].map((_, index) => (
            <CiStar key={index} />
          ))}
        </div>
      ),
    },
    {
      title: "Moderate",
      dataIndex: "moderation", // yoki active/moder - field nomi qanday bo‘lsa
      render: (moder: boolean, record: NotificationsType) => (
        <Switch
          checked={moder}
          style={{
            backgroundColor: moder ? "#52c41a" : "#f5222d",
          }}
          onChange={(checked) => {
            checkedModerateReviews(record.id, checked);
          }}
        />
      ),
    },
    {
      title: "Sanasi",
      dataIndex: "createdAt",
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
      render: (date: string) => (
        <Tag color="geekblue" className="text-xs font-medium">
          {date?.slice(0, 10)}
        </Tag>
      ),
    },
    {
      title: "Amallar",
      render: (_: any, record: NotificationsType) => (
        <Tooltip title="Oʻchirish">
          <Button
            onClick={() => handleDelete(record.id)}
            danger
            shape="circle"
            icon={<AiOutlineDelete />}
          />
        </Tooltip>
      ),
    },
  ];

  const handleDelete = (id: number) => {
    mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Izoh muvaffaqiyatli o'chirildi.", {
            autoClose: 1500,
          });
          refetch();
        },
        onError: (error) => {
          console.error("Izohni o'chirishda xato:", error);
        },
      }
    );
  };

  return (
    <div className=" bg-white rounded-md shadow-sm">
      <h1 className="text-xl font-bold mb-4">🗨️ Foydalanuvchi Izohlari</h1>
      {/* jami izohlari soni */}
      <div className="mb-2">
        <span className="text-gray-600">Jami izohlar: </span>
        <span className="font-semibold text-blue-600">{data?.length || 0}</span>
      </div>

      <Table
        dataSource={data || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default Review;
