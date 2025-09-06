import { useState } from "react";
import { useGetList } from "../../services/query/useGetList";
import { Button, DatePicker, Flex, Table } from "antd";
import { dateFormat } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

interface PaymentOrdersTabProps {
  cancelled: boolean;
  customerId: string;
  id: string;
  orderTransactionId: string;
  payDate: string;
  paySum: number;
  transactionId: string;
  customerFullName: string;
  phoneNumber: string;
}
const PaymentOrdersTab = () => {
  const navigate = useNavigate();
  const today: string = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data, isLoading } = useGetList<PaymentOrdersTabProps[]>({
    endpoint: "/payment/by-date",
    params: {
      date: selectedDate,
    },
    enabled: !!selectedDate,
  });

  const { data: allPaymentData, isLoading: allPaymentLoading } = useGetList<
    PaymentOrdersTabProps[]
  >({
    endpoint: "/payment/getAllPayments",
    enabled: !selectedDate,
  });

  return (
    <Table
      bordered
      dataSource={selectedDate ? data : allPaymentData}
      loading={isLoading || allPaymentLoading}
      scroll={{ x: "max-content" }}
      caption={
        <Flex justify="space-between" className="md:!mx-3">
          <Flex align="center" gap={12} className="md:text-lg font-semibold">
            <h1>Jami To'lov Summasi:</h1>

            {selectedDate ? (
              <b>
                {new Intl.NumberFormat("uz-UZ").format(
                  data?.reduce((acc, curr) => acc + curr.paySum, 0) || 0
                )}{" "}
                so'm
              </b>
            ) : (
              <b>
                {new Intl.NumberFormat("uz-UZ").format(
                  allPaymentData?.reduce((acc, curr) => acc + curr.paySum, 0) ||
                    0
                )}{" "}
                so'm
              </b>
            )}
          </Flex>

          {selectedDate && (
            <p className="md:text-lg font-semibold">
              Tanlangan sana:
              <b> {dateFormat(selectedDate, false)}</b>
            </p>
          )}
        </Flex>
      }
      title={() => (
        <Flex justify="space-between" align="center" wrap gap={12}>
          <p className="md:text-lg font-semibold">
            {selectedDate
              ? `To'lovlar soni: ${data?.length}`
              : `Barcha to'lovlar ( ${allPaymentData?.length || 0} )`}
          </p>
          <Flex align="center" gap={12}>
            <Button
              size="large"
              children="Barchasini ko'rish"
              onClick={() => setSelectedDate("")}
              type="primary"
              disabled={!selectedDate}
            />
            <DatePicker
              size="large"
              onChange={(_: any, dateString: string | string[]) => {
                if (typeof dateString === "string") {
                  setSelectedDate(dateString);
                }
                if (!dateString) {
                  setSelectedDate(""); // state tozalanadi
                  return;
                }
              }}
              format="YYYY-MM-DD"
              value={selectedDate ? dayjs(selectedDate) : null}
            />
          </Flex>
        </Flex>
      )}
      columns={[
        {
          width: "30%",
          title: "To'lov Sanasi",
          dataIndex: "payDate",
          render: (date) => (
            <p className="md:text-lg font-semibold">{dateFormat(date)}</p>
          ),
          sorter: (a, b) =>
            new Date(a.payDate).getTime() - new Date(b.payDate).getTime(),
          defaultSortOrder: "descend",
        },
        {
          width: "20%",
          title: "To'lov Miqdori",
          dataIndex: "paySum",
          render: (sum) => (
            <span className="md:text-lg font-semibold">
              {new Intl.NumberFormat("uz-UZ").format(sum)} so'm
            </span>
          ),
        },
        {
          width: "20%",
          title: "Mijoz",
          dataIndex: "customerFullName",
          render: (cancelled, record) => (
            <div className="md:text-lg font-semibold">
              <h1
                title="Mijozni ko'rish"
                onClick={() =>
                  navigate("/admin/user-detail/" + record.customerId)
                }
                className="hover:underline cursor-pointer hover:text-blue-500 transition-all"
              >
                {cancelled}
              </h1>
            </div>
          ),
        },
        {
          fixed: "right",
          width: "20%",
          align: "center",
          title: "Tel",
          dataIndex: "phoneNumber",
        },
      ]}
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: true,
        showQuickJumper: true,
        hideOnSinglePage: true,
      }}
    />
  );
};

export default PaymentOrdersTab;
