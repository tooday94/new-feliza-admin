import React, { useRef, useState } from "react";
import { Table, Input, Button, Space, Flex, Popover, Popconfirm } from "antd";
import {
  CheckCircleOutlined,
  ClearOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingFilled,
} from "@ant-design/icons";
import type { InputRef, TableColumnType } from "antd";
import Highlighter from "react-highlight-words";
import type { ColumnsType } from "antd/es/table";
import type { newOrders } from "../../types/orders";
import { useGetList } from "../../services/query/useGetList";
import { dateFormat } from "../../utils/formatDate";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUpdate } from "../../services/mutation/useUpdate";
import { endpoints } from "../../configs/endpoints";
type ReachedType = {
  content: newOrders[];
  totalElements: number;
  totalPages: number;
};
export const ReachedOrdersTab = ({ endpoint }: { endpoint: string }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const { data, isLoading, refetch } = useGetList<ReachedType>({
    endpoint,
    params: {
      page: currentPage - 1,
      size: limit,
    },
  });

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const totalCost = data?.content?.reduce(
    (acc, order) => acc + order.orderCost,
    0
  );

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
          {record?.address?.region?.nameUZB},{" "}
          {record?.address?.subRegion?.nameUZB}
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
    {
      align: "center",
      width: "0",
      title: <SettingFilled />,
      dataIndex: "id",
      render: (id) => (
        <Button
          size="large"
          type="text"
          onClick={() => navigate("/admin/order-detail/" + id)}
          icon={<EyeOutlined />}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const { mutate: orderToPack, isPending: orderToPackPending } = useUpdate({
    endpoint: endpoints.order.putToPack,
    queryKey: endpoints.order.getById,
  });
  const { mutate: orderToCancel, isPending: orderToCancelPending } = useUpdate({
    endpoint: endpoints.order.putToRejected,
    queryKey: endpoints.order.getById,
  });

  return (
    <>
      <Table<newOrders>
        caption={
          selectedRowKeys.length > 0
            ? "Tanlangan buyurtmalar" + selectedRowKeys.length
            : ""
        }
        size="large"
        rowSelection={rowSelection}
        rowClassName={(record) =>
          selectedRowKeys.includes(record.id)
            ? "text-white" // Tailwind
            : ""
        }
        bordered
        scroll={{ x: "max-content" }}
        loading={isLoading}
        dataSource={data?.content}
        rowKey="id"
        title={() => (
          <Flex align="center" justify="space-between" gap={24}>
            <div className="">
              <h1>
                Jami buyurtmalar: <b>{data?.totalElements}</b>
              </h1>
              <h1>
                Umumiy summa: <b>{totalCost?.toLocaleString()} so'm</b>
              </h1>
            </div>

            <div className="flex gap-2">
              <Popover
                trigger={["click"]}
                placement="leftBottom"
                title="Tanlangan buyurtmalarni o'zgartirish"
                content={
                  <Flex vertical gap={24}>
                    <Button
                      size="large"
                      danger
                      disabled={selectedRowKeys.length === 0}
                      type="default"
                      onClick={() => setSelectedRowKeys([])}
                      icon={<ClearOutlined />}
                    >
                      Tanlashni tozalash
                    </Button>

                    <Flex gap={24} justify="start" vertical className="w-full">
                      <Popconfirm
                        title="Tasdiqlash"
                        description="Buyurtmani bekor qilmoqchimisiz?"
                        okText="Tasdiqlash"
                        cancelText="Yo'q"
                        onConfirm={() => {
                          return selectedRowKeys.map((id) =>
                            orderToCancel(
                              { id, data: {} },
                              { onError: () => console.log(id) }
                            )
                          );
                        }}
                        onOpenChange={() => console.log("open change")}
                      >
                        <Button
                          size="large"
                          danger
                          icon={<CloseCircleOutlined />}
                          loading={orderToCancelPending}
                          children="Bekor qilish"
                        />
                      </Popconfirm>

                      <Popconfirm
                        title="Tasdiqlash"
                        description="Buyurtma tayyorlandimi?"
                        okText="Tasdiqlash"
                        cancelText="Yo'q"
                        onConfirm={() =>
                          selectedRowKeys.map((id) =>
                            orderToPack({ id, data: {} })
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
                    </Flex>
                  </Flex>
                }
              >
                <Button
                  type="primary"
                  disabled={selectedRowKeys.length == 0}
                  className="mb-2"
                >
                  Tanlanganlarni o‘zgartirish
                </Button>
              </Popover>
              <Button
                type="primary"
                onClick={() => refetch()}
                icon={<ReloadOutlined />}
              />
            </div>
          </Flex>
        )}
        columns={columns}
        pagination={{
          size: "default",
          pageSize: limit,
          current: currentPage,
          showPrevNextJumpers: true,
          showQuickJumper: true,
          position: ["bottomCenter"],
          total: data?.totalElements,
          onChange: (page, size) => {
            setCurrentPage(page);
            setLimit(size);
            setSearchParams({
              tab: initialTab,
              page: String(page),
              limit: String(size),
            });
          },
        }}
      />
    </>
  );
};
