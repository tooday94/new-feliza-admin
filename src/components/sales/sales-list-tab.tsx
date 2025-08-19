import { Button, Popconfirm, Table } from "antd";
import React, { useState } from "react";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import type { Product } from "../../types/products-type";
import { dateFormat } from "../../utils/formatDate";
import { DeleteFilled, SettingFilled } from "@ant-design/icons";
import { useCreate } from "../../services/mutation/useCreate";
import { toast } from "react-toastify";

type SaleListType = [
  {
    id: number;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    name: string;
    sale: number;
    productList: Product[];
  }
];
const SalesListTab: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading } = useGetList<SaleListType>({
    endpoint: endpoints.sale.getAll,
  });

  const { mutate } = useCreate({
    endpoint: endpoints.sale.delete,
    queryKey: endpoints.sale.getAll,
  });
  const handleDelete = (obj: {}) => {
    mutate(obj, {
      onSuccess: () => {
        toast.success("Chegirma O'chirildi!");
      },
      onError: () => {
        toast.error("Chegirma O'chirishda xatolik, Qayta urunib ko'ring!");
      },
    });
  };

  return (
    <>
      <Table
        loading={isLoading}
        bordered
        dataSource={data?.map((item, index) => ({ ...item, key: index + 1 }))}
        columns={[
          {
            responsive: ["md"],
            width: "0",
            title: "№",
            dataIndex: "key",
          },
          {
            responsive: ["md"],
            width: "0",
            title: "ID",
            dataIndex: "id",
          },
          {
            title: "Nomi",
            dataIndex: "name",
          },
          {
            width: "0",
            title: "%",
            dataIndex: "sale",
          },
          {
            responsive: ["md"],
            width: "0",
            title: "Mahsulot soni",
            dataIndex: "productList",
            render: (value) => value.length,
          },
          {
            // width: "0",
            align: "center",
            title: "qo'shilgan sana",
            dataIndex: "createdAt",
            render: (value) => dateFormat(value),
          },
          {
            responsive: ["md"],
            // width: "0",
            align: "center",
            title: "O'zgartirilgan sana",
            dataIndex: "updatedAt",
            render: (value) => dateFormat(value),
          },
          {
            align: "center",
            width: "0",
            title: <SettingFilled />,
            render: (_, record) => (
              <Popconfirm
                title="Ishonchingiz komilmi?"
                onConfirm={() =>
                  handleDelete({
                    saleGroupId: record.id,
                    saleCategoryId: 7,
                  })
                }
                okText="Ha"
                cancelText="Yo‘q"
              >
                <Button type="text" icon={<DeleteFilled />} />
              </Popconfirm>
            ),
          },
        ]}
        pagination={{
          pageSize: limit,
          current: currentPage,
          showPrevNextJumpers: true,
          showQuickJumper: true,
          position: ["bottomCenter"],
          total: data?.length,
          onChange: (page, size) => {
            setCurrentPage(page);
            setLimit(size);
          },
        }}
      />
    </>
  );
};

export default SalesListTab;
