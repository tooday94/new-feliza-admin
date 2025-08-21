import React, { useMemo, useRef, useState } from "react";
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
import { toast } from "react-toastify";

export const ReusableOrderTab = ({ endpoint }: { endpoint: string }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const { data, isLoading, refetch } = useGetList<newOrders[]>({
    endpoint,
  });

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
          size="large"
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
            size="large"
            style={{ width: 90 }}
          >
            Qidirish
          </Button>
          <Button
            type="default"
            size="large"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0] as string);
              setSearchedColumn(dataIndex);
            }}
          >
            Filterlash
          </Button>
          {/* <Button
            danger
            icon={<ClearOutlined />}
            onClick={() => {
              clearFilters?.();
              setSearchText("");
            }}
            size="large"
          >
            Tozalash
          </Button> */}

          <Button
            disabled={searchText ? false : true}
            icon={<ReloadOutlined />}
            type="link"
            size="large"
            children="Tozalash"
            danger
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
      width: "0",
      title: "№",
      render: (_, __, index) => (currentPage - 1) * limit + index + 1,
    },
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
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend", // default holatda eng yangi yuqorida
    },
    {
      title: "Status",
      dataIndex: ["orderStatusType"],
    },
    {
      fixed: "right",
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

  const isCanceled = endpoint == endpoints.order.getCanceled;
  const isNotPaid = endpoint == endpoints.order.getAll;
  const notPaidOrders = useMemo(() => {
    if (!data) return [];

    return data
      .filter((item) => item.paid === false)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [data]);
  return (
    <>
      <Table<newOrders>
        caption={
          selectedRowKeys.length > 0
            ? "Tanlangan buyurtmalar: " + selectedRowKeys.length
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
        dataSource={isNotPaid ? notPaidOrders : data}
        rowKey="id"
        title={() => (
          <Flex align="center" justify="space-between" gap={24} wrap>
            <div className="md:text-lg font-semibold">
              <h1>
                Jami buyurtmalar: <b>{data?.length}</b>
              </h1>
              <h1>
                Umumiy summa: <b>{totalCost?.toLocaleString()} so'm</b>
              </h1>
            </div>

            <div className="flex gap-2">
              <Popover
                // open={selectedRowKeys.length > 0}
                trigger={["click"]}
                // placement="leftBottom"
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
                              {
                                onError: () =>
                                  toast.error("Buyurtma(lar) bekor qilinmadi"),
                                onSuccess: () => {
                                  toast.success("Buyurtma(lar) bekor qilindi");
                                  refetch();
                                  setSelectedRowKeys([]);
                                },
                              }
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
                          style={{
                            display: isCanceled ? "none" : "block",
                          }}
                        />
                      </Popconfirm>

                      <Popconfirm
                        title="Tasdiqlash"
                        description="Buyurtma tayyorlandimi?"
                        okText="Tasdiqlash"
                        cancelText="Yo'q"
                        onConfirm={() =>
                          selectedRowKeys.map((id) =>
                            orderToPack(
                              { id, data: {} },
                              {
                                onError: () =>
                                  toast.error("Buyurtma(lar) Tayyorlanmadi"),
                                onSuccess: () => {
                                  toast.success("Buyurtma(lar) Tayyorlandi");
                                  refetch();
                                  setSelectedRowKeys([]);
                                },
                              }
                            )
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
                        description="Buyurtma yetkazildimi?"
                        okText="Tasdiqlash"
                        cancelText="Yo'q"
                        onConfirm={() =>
                          selectedRowKeys.map((id) =>
                            orderToDelivered(
                              { id, data: {} },
                              {
                                onError: () =>
                                  toast.error("Buyurtma(lar) Yetkazilmadi"),
                                onSuccess: () => {
                                  toast.success("Buyurtma(lar) Yetkazildi");
                                  refetch();
                                  setSelectedRowKeys([]);
                                },
                              }
                            )
                          )
                        }
                        onOpenChange={() => console.log("open change")}
                      >
                        <Button
                          loading={orderToPackPending}
                          size="large"
                          type="primary"
                          className="!bg-green-500"
                          icon={<CheckCircleOutlined />}
                          children="Yetkazildi"
                        />
                      </Popconfirm>
                    </Flex>
                  </Flex>
                }
              >
                <Button
                  size="large"
                  type="primary"
                  disabled={selectedRowKeys.length == 0}
                  className="mb-2"
                >
                  Tanlanganlarni o‘zgartirish
                </Button>
              </Popover>
              <Button
                size="large"
                type="primary"
                onClick={() => refetch()}
                icon={<ReloadOutlined />}
              />
            </div>
          </Flex>
        )}
        columns={columns}
        pagination={{
          position: ["bottomCenter"],
          current: currentPage,
          showSizeChanger: true,
          showQuickJumper: true,
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
