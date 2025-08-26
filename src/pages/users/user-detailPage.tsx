import { useNavigate, useParams } from "react-router-dom";
import { useGetById } from "../../services/query/useGetById";
import type { UserType } from "../../types/user-type";
import { endpoints } from "../../configs/endpoints";
import { Image, Skeleton, Tag, Badge, Button, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useGetById<UserType>({
    endpoint: endpoints.users.useById,
    id: id ?? "",
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          Orqaga
        </Button>
      </div>

      <Card
        className="rounded-2xl shadow-lg overflow-hidden"
        bodyStyle={{ padding: "24px" }}
      >
        {/* PROFILE HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6">
          <Image
            src={
              data.image?.url ||
              "https://avatars.mds.yandex.net/get-altay/9686455/2a00000189eed44b6685985d251dc572b3e6/XL"
            }
            alt={data.fullName || "Foydalanuvchi"}
            style={{
              width: 130,
              height: 130,
              objectFit: "cover",
              borderRadius: "50%",
            }}
            className="shadow-md"
          />
          <div className="text-center sm:text-left space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">
              {data.fullName || "Ism mavjud emas"}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge
                status={data.enabled ? "success" : "error"}
                text={data.enabled ? "Faol" : "NoFaol"}
              />
            </div>
            <p className="text-gray-500 text-sm">{data.gender || "—"}</p>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Shaxsiy ma'lumotlar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-600 text-sm">
            <p>
              <strong>Tug‘ilgan sana:</strong> {data.birthDate || "—"}
            </p>
            <p>
              <strong>Ro‘yxatdan o‘tgan:</strong>{" "}
              {data.createdAt?.slice(0, 10) || "—"}
            </p>
            <p>
              <strong>Telefon:</strong> {data.phoneNumber || "—"}
            </p>
            <p>
              <strong>Status:</strong> {data.status?.statusName || "—"}
            </p>
          </div>
        </div>

        {/* FINANCIAL INFO */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Moliyaviy ma'lumotlar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-600 text-sm">
            <p>
              <strong>Savdo summasi:</strong> {data.saleSum || 0} so'm
            </p>
            <p>
              <strong>Cashback:</strong> {data.cashback || "Yo‘q"}
            </p>
          </div>
        </div>

        {/* ROLES */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Rollar</h3>
          <div className="flex flex-wrap gap-2">
            {data.roles?.length ? (
              data.roles.map((role, index) => (
                <Tag key={index} color="blue">
                  {role.roleName}
                </Tag>
              ))
            ) : (
              <p className="text-sm text-gray-500">Rollar mavjud emas</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default UserDetailPage;
