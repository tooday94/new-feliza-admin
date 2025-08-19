import { useState } from "react";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import type { LookType } from "../../types/look-type";
import { Button, Image, Modal, Popconfirm, Spin } from "antd";
import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useGetById } from "../../services/query/useGetById";
import Collection from "./add-collactions";
import { useDeleteById } from "../../services/mutation/useDeleteById";
import { toast } from "react-toastify";

const CollactionsTab = () => {
  const [modalDetail, setmodalDetail] = useState(false);
  const [detailId, setdetailId] = useState(0);

  const { data, isLoading } = useGetList<LookType[]>({
    endpoint: endpoints.look.getAll,
  });

  const { data: detail, isLoading: detailLoading } = useGetById<LookType>({
    endpoint: endpoints.look.getById,
    id: detailId,
  });

  const { mutate } = useDeleteById({
    endpoint: endpoints.look.delete,
    queryKey: endpoints.look.getAll,
  });

  const handleDelete = (id: string | number) => {
    mutate(
      { id: id },
      {
        onSuccess: (res) => {
          console.log(res);

          toast.success("Look O'chirildi!", { position: "top-center" });
        },
        onError: (err) => {
          console.log(err);

          toast.error("Look o'chirishda xatolik: " + err.message, {
            position: "top-center",
          });
        },
      }
    );
  };

  return (
    <div>
      <Collection />
      {isLoading ? (
        <Spin />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {data?.map((item) => (
            <div>
              {item.images.map((look) => (
                <div className="relative w-fit">
                  <Popconfirm
                    title="Tasdiqlash"
                    description="Haqiqatdan hamo'chirmoqchimisiz?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Albatta"
                    cancelText="Yo'q"
                  >
                    <Button
                      danger
                      className="!absolute !z-20 right-1 top-1"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                  <Button
                    onClick={() => (setdetailId(item.id), setmodalDetail(true))}
                    className="!absolute !z-20 left-1 top-1"
                    icon={<EyeFilled />}
                  />
                  <Image
                    className="min-h-64 !h-full max-h-96"
                    src={look.url}
                    alt={"look-" + look.id}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <Modal
        width={1200}
        loading={detailLoading}
        title="Lookning Mahsulotlari"
        closable={{ "aria-label": "Custom Close Button" }}
        footer={false}
        open={modalDetail}
        onCancel={() => setmodalDetail(false)}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {detail?.productResponseDtos.map((item) => (
            <div className="border">
              <div className="">
                <img
                  className="w-sm md:h-96 object-cover"
                  src={item.productImages[0]?.url}
                />
              </div>
              <div className="p-2">
                <h1 className="text-lg text-wrap">{item.nameUZB}</h1>
                <p className="font-bold">ID: {item.id}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CollactionsTab;
