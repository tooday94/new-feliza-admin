import React from "react";
import { Button, Flex, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Flex justify="center" align="center" className="border h-screen">
      <Result
        status="404"
        title="404"
        subTitle="Kechirasiz, siz tashrif buyurgan sahifa mavjud emas."
        extra={
          <Button
            icon={<IoHomeOutline size={24} />}
            type="primary"
            size="large"
            onClick={() => navigate("/admin/dashboard")}
          >
            Uyga qaytish
          </Button>
        }
      />
    </Flex>
  );
};
