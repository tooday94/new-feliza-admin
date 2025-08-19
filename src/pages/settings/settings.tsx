import { useEffect, useState } from "react";
import AddCategory from "../../components/settings/category/add-category";
import AddColor from "../../components/settings/color/add-color";
import AddCategoryBrand from "../../components/settings/brand/add-category";
import SmsCategory from "../../components/settings/sms/sms-category";
import AddRegion from "../../components/settings/adress/add-region";

const Settings = () => {
  const [settingisType, setSettingisType] = useState<number>(1);

  const menu = [
    { id: 1, label: "Kategoriya" },
    { id: 2, label: "Rang" },
    { id: 3, label: "Brend" },
    { id: 4, label: "Adress" },
    { id: 5, label: "SMS" },
  ];

  // useEffect sahifa yuklanganda localStorage dan o‘qib olish
  useEffect(() => {
    const savedTab = localStorage.getItem("selectedSettingTab");
    if (savedTab) {
      setSettingisType(parseInt(savedTab));
    }
  }, []);

  // Tab o‘zgarganda localStorage ga yozish
  const handleTabChange = (id: number) => {
    setSettingisType(id);
    localStorage.setItem("selectedSettingTab", id.toString());
  };

  return (
    <div className="p-1 min-h-screen">
      {/* Navbar / Toggle Buttons */}
      <div className=" flex justify-between gap-4 overflow-x-auto">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex-1 px-7 py-3 text-sm font-semibold rounded-sm transition-all duration-200 ease-in-out cursor-pointer 
              ${
                settingisType === item.id
                  ? "bg-black text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-black hover:text-white hover:shadow-md"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <hr
        style={{
          margin: "10px 0",
          borderColor: "black",
          borderWidth: "1px",
        }}
      />

      {/* Content */}
      <div className="mt-6 p-1">
        {settingisType === 1 && (
          <div>
            <AddCategory />
          </div>
        )}
        {settingisType === 2 && (
          <div>
            <AddColor />
          </div>
        )}
        {settingisType === 3 && <AddCategoryBrand />}
        {settingisType === 4 && (
          <div className="text-gray-500">
            <AddRegion />
          </div>
        )}
        {settingisType === 5 && (
          <div className="text-gray-500">
            <SmsCategory />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
