import React from "react";
import { Steps } from "antd";

const { Step } = Steps;

type OrderStatus =
  | "NEW"
  | "SEND"
  | "REACHED"
  | "REJECTED"
  | "PAIDFALSE"
  | "PACK";

interface OrderShowStepsProps {
  status: OrderStatus;
}

const steps = [
  { key: "NEW", title: "Yangi" },
  { key: "PACK", title: "Tayyorlangan" },
  { key: "SEND", title: "Jo'natilgan" },
  { key: "REACHED", title: "Yetkazilgan" },
  { key: "REJECTED", title: "Bekor qilingan" },
  { key: "PAIDFALSE", title: "Amalga oshmagan" },
];

const getCurrentStep = (status: OrderStatus) => {
  return steps.findIndex((step) => step.key === status);
};

const OrderShowSteps: React.FC<OrderShowStepsProps> = ({ status }) => {
  const current = getCurrentStep(status);

  return (
    <Steps progressDot current={current} direction="horizontal" size="small">
      {steps.map((step) => (
        <Step key={step.key} title={step.title} />
      ))}
    </Steps>
  );
};

export default OrderShowSteps;
