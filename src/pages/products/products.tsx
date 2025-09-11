import { Tabs, type TabsProps } from "antd";
import SiteProducts from "./site-products";
import BillzProducts from "./billz-products";
import { useSearchParams } from "react-router-dom";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "site";

  const onChange = (key: string) => {
    setSearchParams({
      type: key === "1" ? "site" : "billz",
      tab: searchParams.get("tab") || "all",
    });
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Saytda bor",
      children: <SiteProducts />,
    },
    {
      key: "2",
      label: "Billz Mahsulotlari",
      children: <BillzProducts />,
    },
  ];

  return (
    <div>
      <Tabs
        className="custom-tabs"
        type="card"
        activeKey={initialType === "site" ? "1" : "2"}
        items={items}
        onChange={onChange}
      />
    </div>
  );
};

export default Products;
