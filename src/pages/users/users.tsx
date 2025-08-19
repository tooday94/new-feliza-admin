import { Table, Tooltip, Button, Modal, Popconfirm } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { endpoints } from "../../configs/endpoints";
import { useGetList } from "../../services/query/useGetList";
import type { UserType } from "../../types/user-type";
import { useNavigate } from "react-router-dom";
import { useDeleteById } from "../../services/mutation/useDeleteById";
import { toast } from "react-toastify";
import { GoDownload } from "react-icons/go";
import { useState } from "react";
import { UserAddOutlined } from "@ant-design/icons";
import { CiSearch } from "react-icons/ci";
import Highlighter from "react-highlight-words";

const Users = () => {
  const navigate = useNavigate();
  const [isTodayModalOpen, setIsTodayModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<UserType[] | null>();
  const [searchPhone, setSearchPhone] = useState(""); // <-- Bu string

  const { data, isLoading, refetch } = useGetList<UserType[]>({
    endpoint: endpoints.users.getAll,
  });

  console.log("user data", data);

  // delete user function
  const { mutate } = useDeleteById({
    endpoint: endpoints.users.userDelete,
    queryKey: "usersDelete",
  });

  //  bugingi sanada ro'yxatdan o'tgan mijozlarni olish
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
  const todayUser = data?.filter((user) => {
    return user.createdAt.slice(0, 10) === today;
  });

  // qidiruv boyyicha filtirlash
  const handleSearch = (value: string) => {
    setSearchPhone(value);
    if (value.trim() === "") {
      setFilteredData(undefined);
      refetch();
    } else {
      const result = data?.filter((user) =>
        user.phoneNumber.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(result);
    }
  };

  const handleDelete = (id: number | string) => {
    mutate(
      { id: Number(id) },
      {
        onSuccess: () => {
          console.log("User deleted successfully");
          toast.success("Mijoz muvaffaqiyatli o'chirildi.", {
            autoClose: 1500,
          });
          refetch();
        },
        onError: (error) => {
          console.error("Error deleting user:", error);
        },
      }
    );
  };

  return (
    <div className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm mb-2">
        {/* mijozlar soni */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Mijozlar Ro'yxati
          </h1>
          <p className="text-sm text-gray-600">
            Jami mijozlar soni:{" "}
            {data?.filter((user) => !!user.status?.statusName).length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Bugungi mijozlar  */}
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsTodayModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md shadow"
          >
            Bugungi mijozlar
          </Button>
          {/* mijozlar royhati */}
          <Modal
            title={
              <div className="text-lg font-semibold text-slate-800">
                Bugungi ro'yxatdan o'tgan mijozlar
                <span>
                  {todayUser?.length ? ` (${todayUser.length} ta)` : " (0 ta)"}
                </span>
              </div>
            }
            open={isTodayModalOpen}
            onCancel={() => setIsTodayModalOpen(false)}
            footer={null}
            centered
            className="rounded-xl"
          >
            {todayUser?.length ? (
              <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {todayUser.map((user, index) => (
                  <li
                    key={user.id}
                    className="bg-gray-100 hover:bg-gray-200 transition-all duration-200 p-3 rounded-lg flex items-center justify-between shadow-sm"
                  >
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold text-base mr-1">
                        {index + 1}.
                      </span>
                      <span className="font-medium">{user.fullName}</span>{" "}
                      <span className="text-gray-500">
                        | {user.phoneNumber}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Tooltip title="User haqida malumot">
                        <Button
                          shape="circle"
                          icon={<EyeOutlined />}
                          size="middle"
                          className="bg-blue-500 hover:bg-blue-600 text-white border-none"
                          onClick={() => {
                            setIsTodayModalOpen(false);
                            navigate(`/admin/user-detail/${user.id}`);
                          }}
                        />
                      </Tooltip>

                      <Tooltip title="O'chirish">
                        <Button
                          shape="circle"
                          danger
                          icon={<DeleteOutlined />}
                          size="middle"
                          className="bg-red-500 hover:bg-red-600 text-white border-none"
                          onClick={() => handleDelete(user.id)}
                        />
                      </Tooltip>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                Bugun hech qanday foydalanuvchi ro'yxatdan o'tmagan.
              </div>
            )}
          </Modal>

          {/* Download button */}
          <Button
            type="primary"
            icon={<GoDownload size={20} />}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md shadow border-none"
            onClick={() => {
              window.open(
                "https://felizabackend.uz/api/export/exportCustomers"
              );
            }}
          >
            Yuklab olish
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="p-2 bg-white rounded-lg shadow">
        <Table
          loading={isLoading}
          dataSource={(filteredData ?? data)?.filter(
            (user) => !!user.status?.statusName
          )}
          rowKey={(record) => record.id}
          bordered
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
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
                  className="font-medium text-slate-700 cursor-pointer transition duration-200 hover:text-blue-600 hover:underline active:text-blue-800"
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
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
              key: "saleSum",
              render: (saleSum: string) => (
                <span className="text-green-600 font-semibold">{saleSum}</span>
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
                    title="Haqiqatan ham o‘chirmoqchimisiz?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Ha"
                    cancelText="Yo'q"
                  >
                    <Button
                      shape="circle"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                </Tooltip>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Users;
