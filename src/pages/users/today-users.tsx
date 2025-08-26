import { Table, Tooltip, Button, Popconfirm, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { CiSearch } from "react-icons/ci";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { endpoints } from "../../configs/endpoints";
import { useGetList } from "../../services/query/useGetList";
import { useDeleteById } from "../../services/mutation/useDeleteById";
import type { UserType } from "../../types/user-type";

const TodayUsers = () => {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState<UserType[] | null>();
  const [searchPhone, setSearchPhone] = useState("");

  const { data, isLoading, refetch } = useGetList<UserType[]>({
    endpoint: endpoints.users.getAll,
  });

  const { mutate } = useDeleteById({
    endpoint: endpoints.users.userDelete,
    queryKey: "usersDelete",
  });

  // Bugungi sana
  const today = new Date().toISOString().slice(0, 10);
  const todayUsers = data?.filter(
    (user) => user.createdAt.slice(0, 10) === today && !!user.status?.statusName
  );

  // qidiruv
  const handleSearch = (value: string) => {
    setSearchPhone(value);
    if (value.trim() === "") {
      setFilteredData(undefined);
    } else {
      const result = todayUsers?.filter((user) =>
        user.phoneNumber.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(result || []);
    }
  };

  const handleDelete = (id: number | string) => {
    mutate(
      { id: Number(id) },
      {
        onSuccess: () => {
          toast.success("Mijoz muvaffaqiyatli o'chirildi.", {
            autoClose: 1500,
          });
          refetch();
        },
        onError: () => {
          toast.error("Xatolik yuz berdi.", { autoClose: 1500 });
        },
      }
    );
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Bugungi Ro'yxatdan O'tgan Mijozlar
          </h1>
          <p className="text-sm text-gray-600">
            Jami mijozlar soni: {todayUsers?.length || 0}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Bosh sahifaga o'tish */}
          <Button
            type="primary"
            onClick={() => navigate("/admin/users")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md shadow"
          >
            Barcha mijozlar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="p-2 bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={(filteredData ?? todayUsers) || []}
            rowKey={(record) => record.id}
            bordered
            // pagination={{
            //   position: ["bottomRight"],
            //   showSizeChanger: true,
            //   pageSizeOptions: ["10", "20", "50", "100"],
            //   defaultPageSize: 10,
            //   showQuickJumper: true,
            // }}
            pagination={false}
            scroll={{ x: "max-content" }}
            columns={[
              {
                title: "№",
                key: "index",
                render: (_text, _record, index) => index + 1,
                width: 60,
              },
              {
                title: "F.I.SH",
                dataIndex: "fullName",
                key: "fullName",
                render: (_text: string, record: UserType) => (
                  <span
                    onClick={() => navigate(`/admin/user-detail/${record.id}`)}
                    className="font-medium text-slate-700 cursor-pointer hover:text-blue-600 hover:underline"
                  >
                    {_text}
                  </span>
                ),
              },
              {
                title: "Jinsi",
                dataIndex: "gender",
                key: "gender",
                render: (gender: string) => (
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      gender === "Erkak" ? "bg-blue-500" : "bg-pink-500"
                    }`}
                  >
                    {gender === "Erkak" ? "Erkak" : "Ayol"}
                  </span>
                ),
              },
              {
                title: (
                  <div className="flex gap-2 justify-between items-center">
                    <span className="text-gray-700 font-semibold">Telefon</span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        className="pl-9 pr-3 py-1.5 w-48 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                      <CiSearch
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>
                ),
                dataIndex: "phoneNumber",
                key: "phoneNumber",
                render: (text: string) => (
                  <Highlighter
                    highlightClassName=" bg-green-500"
                    searchWords={[searchPhone]}
                    autoEscape={true}
                    textToHighlight={text}
                  />
                ),
              },
              {
                title: "Ro'yxatga olingan",
                dataIndex: "createdAt",
                key: "createdAt",
                render: (date: string) => (
                  <span className="text-gray-500">{date?.slice(0, 10)}</span>
                ),
              },
              {
                title: "Status",
                dataIndex: ["status", "statusName"],
                key: "status",
                render: (statusName: string) => (
                  <span className="text-green-600 font-semibold">
                    {statusName}
                  </span>
                ),
              },
              {
                title: "Summa",
                dataIndex: "saleSum",
                key: "saleSum",
                render: (saleSum: number) => (
                  <span className="text-gray-600">{saleSum || 0} so'm</span>
                ),
              },
              {
                title: "Harakatlar",
                key: "actions",
                width: 100,
                render: (_text, record) => (
                  <Tooltip title="O'chirish">
                    <Popconfirm
                      title="O'chirishni tasdiqlaysizmi?"
                      onConfirm={() => handleDelete(record.id)}
                      okText="Ha"
                      cancelText="Yo'q"
                    >
                      <Button shape="circle" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Tooltip>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default TodayUsers;
