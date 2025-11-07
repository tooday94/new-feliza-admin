import React, { useState } from "react";
import {
  Button,
  Popconfirm,
  Table,
  Modal,
  Image,
  Row,
  Col,
  Flex,
  Typography,
} from "antd";
import { DeleteFilled, EyeOutlined, SettingFilled } from "@ant-design/icons";
import { useGetList } from "../../services/query/useGetList";
import { useCreate } from "../../services/mutation/useCreate";
import { endpoints } from "../../configs/endpoints";
import { toast } from "react-toastify";
// import { dateFormat } from "../../utils/formatDate";
// import type { Product } from "../../types/products-type";
const { Text } = Typography;

type SaleItem = {
  saleId: number;
  name: string;
  sale: number;
  createdAt: string | null;
  updatedAt: string | null;
  saleProductList: {
    productId: number;
    refNumber: string;
    productImage: string;
  }[];
};

const SalesListTab: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data } = useGetList<SaleItem[]>({
    endpoint: endpoints.sale.getAll,
  });
  console.log("data:", data);

  // 🔹 Ma'lumotlarni olish
  const { data: fullGetAllData, isLoading } = useGetList<SaleItem[]>({
    endpoint: endpoints.sale.fullGetAll,
  });

  // console.log("fullGetAllData:", fullGetAllData);

  // 🔹 O‘chirish uchun
  const { mutate } = useCreate({
    endpoint: endpoints.sale.delete,
    queryKey: endpoints.sale.getAll,
  });

  const handleDelete = (obj: {}) => {
    mutate(obj, {
      onSuccess: () => toast.success("Chegirma muvaffaqiyatli o‘chirildi!"),
      onError: () =>
        toast.error(
          "Chegirma o‘chirishda xatolik yuz berdi. Qayta urinib ko‘ring!"
        ),
    });
  };

  // 🔹 Modalni ochish
  const handleView = (record: SaleItem) => {
    setSelectedSale(record);
    setIsModalOpen(true);
  };

  return (
    <>
      <Table
        loading={isLoading}
        bordered
        dataSource={fullGetAllData?.map((item, index) => ({
          ...item,
          key: index + 1,
        }))}
        columns={[
          {
            title: "№",
            dataIndex: "key",
            width: 60,
            align: "center",
            responsive: ["md"],
          },
          {
            title: "ID",
            dataIndex: "saleId",
            width: 100,
            responsive: ["md"],
          },
          {
            title: "Nomi",
            dataIndex: "name",
            render: (value) => <span className="font-semibold">{value}</span>,
          },
          {
            title: "%", // chegirma foizi
            dataIndex: "sale",
            align: "center",
            width: 80,
          },
          {
            title: "Mahsulot soni",
            dataIndex: "saleProductList",
            align: "center",
            render: (value) => value?.length || 0,
          },
          // {
          //   title: "Qo‘shilgan sana",
          //   dataIndex: "createdAt",
          //   align: "center",
          //   render: (value) => (value ? dateFormat(value) : "-"),
          // },
          // {
          //   title: "O‘zgartirilgan sana",
          //   dataIndex: "updatedAt",
          //   align: "center",
          //   render: (value) => (value ? dateFormat(value) : "-"),
          //   responsive: ["md"],
          // },
          {
            title: <SettingFilled />,
            align: "center",
            width: 150,
            render: (_, record) => (
              <Flex justify="center" gap={10}>
                {/* 👁️ Ko‘rish tugmasi */}
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleView(record)}
                >
                  Ko‘rish
                </Button>

                {/* 🗑️ O‘chirish tugmasi */}
                <Popconfirm
                  title="Ishonchingiz komilmi?"
                  onConfirm={() =>
                    handleDelete({
                      saleGroupId: record.saleId,
                      saleCategoryId: 7,
                    })
                  }
                  okText="Ha"
                  cancelText="Yo‘q"
                >
                  <Button danger icon={<DeleteFilled />} />
                </Popconfirm>
              </Flex>
            ),
          },
        ]}
        pagination={{
          pageSize: limit,
          current: currentPage,
          total: fullGetAllData?.length || 0,
          showQuickJumper: true,
          position: ["bottomCenter"],
          onChange: (page, size) => {
            setCurrentPage(page);
            setLimit(size);
          },
        }}
      />

      {/* 🪟 Modal: Mahsulotlar ro‘yxati */}
      <Modal
        open={isModalOpen}
        title={`Chegirma: ${selectedSale?.name} (${selectedSale?.sale}%)`}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1000}
      >
        {selectedSale?.saleProductList?.length ? (
          <Row gutter={[16, 16]}>
            {selectedSale.saleProductList.map((product) => (
              <Col
                key={product.productId}
                xs={24}
                sm={12}
                md={8}
                className="flex flex-col items-center"
              >
                <div className="border rounded-lg shadow-md p-3 hover:shadow-lg transition-all">
                  <Image
                    src={product.productImage}
                    alt={product.refNumber}
                    className="rounded-md"
                    height={300}
                    width={"100%"}
                    style={{ objectFit: "cover" }}
                  />
                  <Text
                    copyable={{ text: product.refNumber }}
                    className="mt-2 block text-sm font-semibold text-gray-700"
                  >
                    Ref: {product.refNumber}
                  </Text>
                  <Text
                    copyable={{ text: product.productId.toString() }}
                    className="text-sm font-semibold text-gray-700"
                  >
                    Mahsulot ID: {product.productId}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-center text-gray-500">Mahsulotlar topilmadi</p>
        )}
      </Modal>
    </>
  );
};

export default SalesListTab;
