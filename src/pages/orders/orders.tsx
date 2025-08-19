import { Tabs } from "antd";
// import NewOrdersTab from "../../components/orders/new-orders-tab";
// import PackagedOrdersTab from "../../components/orders/packaged-orders-tab";
// import ShippedOrdersTab from "../../components/orders/shipped-orders-tab";
// import NotPaidOrdersTab from "../../components/orders/not-paid-orders-tab";
// import RejectedOrdersTab from "../../components/orders/rejected-orders-tab";
// import ReachedOrdersTab from "../../components/orders/reached-orders-tab";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ReusableOrderTab } from "../../components/orders/reusable-order-table";
import { endpoints } from "../../configs/endpoints";
import { ReachedOrdersTab } from "../../components/orders/reached-orders-tab";

const Orders = () => {
  const OrdersTabs = [
    {
      label: "Yangi buyurtmalar",
      chldren: <ReusableOrderTab endpoint={endpoints.order.getNew} />,
    },
    {
      label: "Tayyorlangan buyutmalar",
      // chldren: <PackagedOrdersTab />,
      chldren: <ReusableOrderTab endpoint={endpoints.order.getPackaged} />,
    },
    {
      label: "Jo'natilgan buyurtmalar",
      // chldren: <ShippedOrdersTab />,
      chldren: <ReusableOrderTab endpoint={endpoints.order.getShipped} />,
    },
    {
      label: "Yetkazilgan buyurtmalar",
      chldren: <ReachedOrdersTab endpoint={endpoints.order.getAllDelivered} />,
      // chldren: <ReusableOrderTab endpoint={endpoints.order.getAllDelivered} />,
    },
    {
      label: "Bekor qilingan buyurtmalar",
      // chldren: <RejectedOrdersTab />,
      chldren: <ReusableOrderTab endpoint={endpoints.order.getCanceled} />,
    },
    {
      label: "Amalga oshmagan buyurtmalar",
      // chldren: <NotPaidOrdersTab />,
      chldren: <ReusableOrderTab endpoint={endpoints.order.getAll} />,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "1";
  const [activeKey, setActiveKey] = useState(defaultTab);

  useEffect(() => {
    setSearchParams({ tab: activeKey }); // URL ni yangilaydi
  }, [activeKey]);
  return (
    <div>
      <Tabs
        className="custom-tabs"
        type="card"
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        items={OrdersTabs?.map((tab, i) => {
          const id = String(i + 1);
          return {
            label: tab.label,
            key: id,
            children: tab.chldren,
          };
        })}
      />
    </div>
  );
};

export default Orders;
