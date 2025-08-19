import { Tabs } from "antd";
import BannerTab from "../../components/interfaces/banner-tab";
import ContainersTab from "../../components/interfaces/containers-tab";
import CollactionsTab from "../../components/interfaces/collactions-tab";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Interfaces = () => {
  const OrdersTabs = [
    {
      label: "Banner",
      chldren: <BannerTab />,
    },
    {
      label: "Container",
      chldren: <ContainersTab />,
    },
    {
      label: "Collections",
      chldren: <CollactionsTab />,
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

export default Interfaces;
