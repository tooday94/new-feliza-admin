import { Table, Empty } from "antd";
import { endpoints } from "../../configs/endpoints";
import { useGetList } from "../../services/query/useGetList";
import type { MessageType } from "../../types/messag-type";

const Messages = () => {
  const { data, isLoading } = useGetList<MessageType[]>({
    endpoint: endpoints.messages.getAll,
  });

  console.log("Message-Data", data);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Xabar",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Yaratilgan sana",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  return (
    <div>
      {data && data.length > 0 ? (
        <Table
          loading={isLoading}
          rowKey="id"
          dataSource={data}
          columns={columns}
        />
      ) : (
        <Empty description="Xozircha Xabarlar yo‘q" />
      )}
    </div>
  );
};

export default Messages;
