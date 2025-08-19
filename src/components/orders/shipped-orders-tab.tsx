import React, { useRef, useState } from "react";
import { Table, Input, Button, Space, Flex } from "antd";
import {
  ClearOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { InputRef, TableColumnType } from "antd";
import Highlighter from "react-highlight-words";
import type { ColumnsType } from "antd/es/table";
import type { newOrders } from "../../types/orders";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import { dateFormat } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";

const ShippedOrdersTab: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetList<newOrders[]>({
    endpoint: endpoints.order.getShipped,
  });
  console.log(data);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const totalCost = data?.reduce((acc, order) => acc + order.orderCost, 0);

  const getValueByPath = (obj: any, path: string) => {
    return path.split(".").reduce((acc: any, key: string) => acc?.[key], obj);
  };

  const getColumnSearchProps = (
    dataIndex: string
  ): TableColumnType<newOrders> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Qidirish`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => {
            confirm();
            setSearchText(selectedKeys[0] as string);
            setSearchedColumn(dataIndex);
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
              setSearchText(selectedKeys[0] as string);
              setSearchedColumn(dataIndex);
            }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Qidirish
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0] as string);
              setSearchedColumn(dataIndex);
            }}
          >
            Filterlash
          </Button>
          <Button
            danger
            icon={<ClearOutlined />}
            onClick={() => {
              clearFilters?.();
              setSearchText("");
            }}
            size="small"
          >
            Tozalash
          </Button>

          <Button
            disabled={searchText ? false : true}
            icon={<ReloadOutlined />}
            type="link"
            size="small"
            onClick={() => {
              setSearchText("");
              setSearchedColumn("");
              clearFilters?.(); // bu dropdownni ichidagi filterlarni tozalaydi
              confirm(); // bu table data-ni asl holiga qaytaradi
              close(); // dropdownni yopadi
            }}
          />
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const fieldValue = getValueByPath(record, dataIndex);
      return fieldValue
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (_, record) => {
      const field = getValueByPath(record, dataIndex);
      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={field ? field.toString() : ""}
        />
      ) : (
        field
      );
    },
  });

  const columns: ColumnsType<newOrders> = [
    {
      title: "Buyurtma raqami",
      dataIndex: "orderNumber",
      key: "orderNumber",
      ...getColumnSearchProps("orderNumber"),
    },
    {
      title: "Ism",
      dataIndex: "receiverName",
      key: "receiverName",
      ...getColumnSearchProps("receiverName"),
    },
    {
      title: "Telefon",
      dataIndex: "receiverPhoneNumber",
      key: "receiverPhoneNumber",
      ...getColumnSearchProps("receiverPhoneNumber"),
    },
    {
      title: "Region",
      key: "region",
      render: (_, record) => (
        <>
          {record.address.region.nameUZB}, {record.address.subRegion.nameUZB}
        </>
      ),
    },
    {
      align: "center",
      title: "Narx",
      dataIndex: "orderCost",
      key: "orderCost",
      render: (cost) => `${cost.toLocaleString()} so'm`,
    },
    {
      align: "center",
      title: "Sana",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dateFormat(date),
    },
    {
      title: "Status",
      dataIndex: ["orderStatusType"],
    },
  ];

  return (
    <>
      <Table<newOrders>
        bordered
        scroll={{ x: "max-content" }}
        loading={isLoading}
        dataSource={data}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => navigate("/admin/order-detail/" + record.id),
        })}
        title={() => (
          <Flex align="center" justify="space-between" gap={24}>
            <div className="">
              <h1>
                Jami buyurtmalar: <b>{data?.length}</b>
              </h1>
              <h1>
                Umumiy summa: <b>{totalCost?.toLocaleString()} so'm</b>
              </h1>
            </div>

            <div className="">
              <Button
                type="primary"
                onClick={() => refetch()}
                icon={<ReloadOutlined />}
              />
            </div>
          </Flex>
        )}
        columns={columns}
      />
    </>
  );
};

export default ShippedOrdersTab;
