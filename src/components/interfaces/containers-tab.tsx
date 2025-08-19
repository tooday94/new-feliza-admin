import { Flex } from "antd";
import MenuSettings from "./containers/menu-settings";
import SmallSliderSettings from "./containers/small-slider-settings";

const ContainersTab = () => {
  return (
    <Flex vertical gap={24}>
      <MenuSettings menuType="MENU_1" />
      <MenuSettings menuType="MENU_2" />
      <SmallSliderSettings />
    </Flex>
  );
};

export default ContainersTab;
