import { Tabs } from "antd";
import AddSalesTab from "../../components/sales/add-sales-tab";
import SalesListTab from "../../components/sales/sales-list-tab";
import CouponsTab from "../../components/sales/coupons-tab";
import CouponsCustomerTab from "../../components/sales/coupons-customer-tab";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Sales = () => {
  const salesTabs = [
    {
      label: "Yangi chegirmalar qo'shish",
      chldren: <AddSalesTab />,
    },
    {
      label: "Mavjud chegirmalar",
      chldren: <SalesListTab />,
    },
    {
      label: "Kuponlar",
      chldren: <CouponsTab />,
    },
    {
      label: "Mijoz uchun Kuponlar",
      chldren: <CouponsCustomerTab />,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "1";
  const [activeKey, setActiveKey] = useState(defaultTab);

  useEffect(() => {
    setSearchParams({ tab: activeKey }); // URL ni yangilaydi
  }, [activeKey]);
  
  return (
    <Tabs
      className="custom-tabs"
      type="card"
      activeKey={activeKey}
      onChange={(key) => setActiveKey(key)}
      items={salesTabs?.map((tab, i) => {
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

export default Sales;
