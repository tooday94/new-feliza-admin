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
  Tooltip,
  Form,
} from "antd";
import { EyeOutlined, SettingFilled } from "@ant-design/icons";
import { useGetList } from "../../services/query/useGetList";
import { useCreate } from "../../services/mutation/useCreate";
import { endpoints } from "../../configs/endpoints";
import { toast } from "react-toastify";
// import { dateFormat } from "../../utils/formatDate";
// import type { Product } from "../../types/products-type";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Input } from "antd";
// import Highlighter from "react-highlight-words";

const { Search } = Input;

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
  const [modalEdit, setModalEdit] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const { data, isLoading } = useGetList<SaleItem[]>({
    endpoint: endpoints.sale.getAll,
  });

  // 🔹 O‘chirish uchun
  const { mutate } = useCreate({
    endpoint: endpoints.sale.delete,
    queryKey: endpoints.sale.getAll,
  });

  const { mutate: editSale } = useCreate({
    endpoint: endpoints.sale.put,
    queryKey: endpoints.sale.getAll,
  });

  const handleEdit = (values: any) => {
    const payload = {
      name: values.name,
      sale: Number(values.sale),
      referenceNumberList: values.referenceNumberList,
      categoryId: Number(values.categoryId),
    };
    editSale(
      {
        id: values.saleGroupId,
        data: payload,
      },
      {
        onSuccess: () =>
          toast.success("Chegirma muvaffaqiyatli tahrirlandi!", {
            autoClose: 1500,
          }),
        onError: () =>
          toast.error(
            "Chegirma tahrirlashda xatolik yuz berdi. Qayta urinib ko‘ring!",
            {
              autoClose: 1500,
            }
          ),
      }
    );
  };

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
    // setModalEdit(true);
  };

  // const filteredData = data?.filter((item) => {
  //   return item.name.toLowerCase().includes(searchText.toLowerCase());
  // });
  return (
    <>
      {/* 🔍 Search input */}
      <div className="flex justify-center mb-4">
        <Search
          placeholder="Chegirma nomi bo‘yicha qidirish..."
          allowClear
          enterButton="Qidirish"
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)} // keyin bu joyga filter funksiya yozamiz
          style={{ width: 600 }}
        />
      </div>
      <Table
        loading={isLoading}
        bordered
        dataSource={data?.map((item, index) => ({
          ...item,
          key: index + 1,
        }))}
        columns={[
          {
            title: "№",
            dataIndex: "key",
            width: 0,
            align: "center",
            responsive: ["md"],
          },
          {
            title: "ID",
            dataIndex: "saleId",
            width: 0,
            responsive: ["md"],
          },
          {
            title: "Nomi",
            dataIndex: "name",
            // render: (value) => <span className="font-semibold">{value}</span>,
            // render: (value) => (
            //   <Highlighter
            //     highlightStyle={{
            //       backgroundColor: "green",
            //       color: "white",
            //       padding: 0,
            //     }}
            //     searchWords={[searchText]}
            //     autoEscape
            //     textToHighlight={value ? value.toString() : ""}
            //   />
            // ),
          },
          {
            title: "%", // chegirma foizi
            dataIndex: "sale",
            align: "center",
            width: 0,
          },
          {
            title: "Mahsulot soni",
            dataIndex: "saleProductList",
            align: "center",
            render: (value) => value?.length || 0,
          },
          {
            title: <SettingFilled />,
            align: "center",
            width: 180,
            render: (_, record) => (
              <Flex justify="center" gap={8} wrap="wrap">
                {/* 👁️ Ko‘rish tugmasi */}
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleView(record)}
                  size="small"
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
                  <Button danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </Flex>
            ),
          },
          {
            title: "Edit",
            key: "edit",
            width: 100,
            align: "center",
            render: (_: any, record: SaleItem) => (
              <Tooltip title="Edit">
                <Button
                  size="small"
                  onClick={() => {
                    setModalEdit(true);
                    setSelectedSale(record);
                    form.setFieldsValue({
                      name: record.name,
                      sale: record.sale,
                      referenceNumberList: record.saleProductList
                        .map((item) => item.refNumber)
                        .join(","),
                      categoryId: record.saleId,
                      saleGroupId: record.saleId,
                    });
                  }}
                  icon={<EditOutlined />}
                />
              </Tooltip>
            ),
          },
        ]}
        pagination={{
          pageSize: limit,
          current: currentPage,
          total: data?.length || 0,
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

      {/* Edit modal */}
      <Modal
        open={modalEdit} // ⚡ endi modalEdit state bilan bog‘langan
        title="Chegirmani tahrirlash"
        onCancel={() => setModalEdit(false)}
        okText="Saqlash"
        onOk={() => {
          form.validateFields().then((values) => handleEdit(values));
        }}
        width={600}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Chegirma nomi"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="sale" label="Foiz (%)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="referenceNumberList" label="Ref raqamlar (, bilan)">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="categoryId" label="Kategoriya ID">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SalesListTab;
