import { useEffect, useState } from "react";
import {
  ShoppingCartOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import NewOrder from "../../components/kassa/new-order";

const Kassa = () => {
  const [kassaType, setKassaType] = useState<
    "new" | "all" | "shifts" | "operations"
  >("new");

  const menu = [
    { id: "new", label: "Yangi sotuv", icon: <ShoppingCartOutlined /> },
    { id: "all", label: "Barcha savdolar", icon: <UnorderedListOutlined /> },
    { id: "shifts", label: "Kassa smenalari", icon: <ClockCircleOutlined /> },
    { id: "operations", label: "Kassa operatsiyalari", icon: <SwapOutlined /> },
  ];

  // LocalStorage bilan ishlash
  useEffect(() => {
    const savedTab = localStorage.getItem("selectedKassaTab");
    if (
      savedTab === "new" ||
      savedTab === "all" ||
      savedTab === "shifts" ||
      savedTab === "operations"
    ) {
      setKassaType(savedTab);
    }
  }, []);

  const handleTabChange = (id: "new" | "all" | "shifts" | "operations") => {
    setKassaType(id);
    localStorage.setItem("selectedKassaTab", id);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-slate-200 border-r shadow flex flex-col">
        {/* Logo */}
        <div className="p-2 border-b">
          <h1 className="text-xl font-bold text-blue-600">Kassa</h1>
        </div>

        {/* Menu */}
        <div className="flex-1 p-3 space-y-2">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left font-medium rounded-md transition-all cursor-pointer
                ${
                  kassaType === item.id
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {kassaType === "new" && <NewOrder />}
        {kassaType === "all" && <div>Barcha savdolar</div>}
        {kassaType === "shifts" && <div>Kassa smenalari</div>}
        {kassaType === "operations" && <div>Kassa operatsiyalari</div>}
      </div>
    </div>
  );
};

export default Kassa;
