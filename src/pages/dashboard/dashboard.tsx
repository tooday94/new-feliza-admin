import {
  Card,
  Col,
  Row,
  Spin,
  Empty,
  Typography,
  Statistic,
  Button,
} from "antd";
import { Column, Pie } from "@ant-design/plots";
import { useGetList } from "../../services/query/useGetList";
import { endpoints } from "../../configs/endpoints";
import type { AdminType } from "../../types/admin-type";
import { GoDownload } from "react-icons/go";

const { Title, Text } = Typography;

const Dashboard = () => {
  const { data, isLoading } = useGetList<AdminType[]>({
    endpoint: endpoints.order.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Yuklanmoqda..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Empty description="Hozircha hech qanday ma'lumot yo'q" />
      </div>
    );
  }

  // Statistika hisoblash
  const totalOrders = data.length;
  const paidOrders = data.filter((item) => item.paid).length;
  const unpaidOrders = totalOrders - paidOrders;
  const notDelivered = data.filter(
    (item) =>
      item.orderStatusType !== "SEND" && item.orderStatusType !== "REJECTED"
  );

  // const statusCounts = notDelivered.reduce<Record<string, number>>(
  //   (acc, item) => {
  //     const status = item.orderStatusType || "Noma'lum";
  //     acc[status] = (acc[status] || 0) + 1;
  //     return acc;
  //   },
  //   {}
  // );
  const orderByDateData = (() => {
    const dateMap: Record<string, number> = {};
    data?.forEach((item) => {
      if (!item.paid) return;
      const date = item.createdAt.split("T")[0];
      if (!dateMap[date]) dateMap[date] = 0;
      dateMap[date] += item.orderCost;
    });

    return Object.entries(dateMap)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  })();

  const columnConfig = {
    data: orderByDateData,
    xField: "date",
    yField: "value",
    label: {
      position: "middle",
      style: {
        fill: "#fff",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    meta: {
      date: { alias: "Sana" },
      value: { alias: "Buyurtma Narxi" },
    },
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} className="!mb-0">
            Feliza Dashboard
          </Title>
          <Text type="secondary">
            So‘nggi 30 kunlik buyurtmalar statistikasi
          </Text>
        </div>
        <Button
          type="primary"
          icon={<GoDownload size={20} />}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md shadow border-none"
          onClick={() => {
            window.open(
              "https://felizabackend.uz/api/export/monthlyStats?year=2025&month=8"
            );
          }}
        >
          Yuklab olish
        </Button>
      </div>

      {/* Statistikalar */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="shadow-md rounded-xl">
            <Statistic title="Jami buyurtmalar" value={totalOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="shadow-md rounded-xl">
            <Statistic
              title="To‘langan"
              value={paidOrders}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="shadow-md rounded-xl">
            <Statistic
              title="To‘lanmagan"
              value={unpaidOrders}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="shadow-md rounded-xl">
            <Statistic
              title="Yetkazilmagan"
              value={notDelivered.length}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Diagrammalar */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="To‘lov holati" className="rounded-xl shadow">
            <Pie
              data={[
                { type: "To‘langan", value: paidOrders },
                { type: "To‘lanmagan", value: unpaidOrders },
              ]}
              angleField="value"
              colorField="type"
              color={["#52c41a", "#ff4d4f"]}
              radius={0.9}
              innerRadius={0.6}
              label={{
                type: "inner",
                offset: "-30%",
                content: ({ percent }: { percent: number }) =>
                  `${(percent * 100).toFixed(0)}%`,
                style: { fontSize: 14, textAlign: "center" },
              }}
              interactions={[{ type: "element-active" }]}
              legend={{ position: "bottom" }}
            />
          </Card>
        </Col>

        {/* <Col xs={24} lg={12}>
          <Card title="Buyurtma statuslari" className="rounded-xl shadow">
            <Pie
              data={Object.entries(statusCounts).map(([key, value]) => ({
                type: key,
                value,
              }))}
              angleField="value"
              colorField="type"
              radius={0.9}
              label={{
                type: "spider",
                content: "{name}: {value}",
              }}
              color={["#fa541c", "#faad14", "#13c2c2", "#a0d911", "#9254de"]}
              interactions={[{ type: "element-active" }]}
              legend={{ position: "bottom" }}
            />
          </Card>
        </Col> */}
        <Col span={24}>
          <Card>
            <Typography.Title level={5} style={{ textAlign: "center" }}>
              Oxirgi 30 kunlik buyurtmalar
            </Typography.Title>
            <Column {...columnConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
