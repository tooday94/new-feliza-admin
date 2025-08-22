import { Tabs } from "antd";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ReusableOrderTab } from "../../components/orders/reusable-order-table";
import { endpoints } from "../../configs/endpoints";
import { ReachedOrdersTab } from "../../components/orders/reached-orders-tab";
import PaymentOrdersTab from "../../components/orders/payment-orders-tab";

const Orders = () => {
  const OrdersTabs = [
    {
      label: "Yangi buyurtmalar",
      chldren: <ReusableOrderTab endpoint={endpoints.order.getNew} />,
    },
    {
      label: "Tayyorlangan buyutmalar",
      chldren: <ReusableOrderTab endpoint={endpoints.order.getPackaged} />,
    },
    {
      label: "Jo'natilgan buyurtmalar",
      chldren: <ReusableOrderTab endpoint={endpoints.order.getShipped} />,
    },
    {
      label: "Yetkazilgan buyurtmalar",
      chldren: <ReachedOrdersTab endpoint={endpoints.order.getAllDelivered} />,
    },
    {
      label: "Bekor qilingan buyurtmalar",
      chldren: <ReusableOrderTab endpoint={endpoints.order.getCanceled} />,
    },
    {
      label: "Amalga oshmagan buyurtmalar",
      chldren: <ReusableOrderTab endpoint={endpoints.order.getAll} />,
    },
    {
      label: "Amalga oshgan buyurtmalar",
      chldren: <PaymentOrdersTab />,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "1";
  const [activeKey, setActiveKey] = useState(defaultTab);

  return (
    <Tabs
      className="custom-tabs"
      type="card"
      activeKey={activeKey}
      onChange={(key) => {
        setActiveKey(key);
        setSearchParams({ tab: key });
      }}
      items={OrdersTabs?.map((tab, i) => {
        const id = String(i + 1);
        return {
          label: tab.label,
          key: id,
          children: tab.chldren,
        };
      })}
    />
  );
};

export default Orders;
