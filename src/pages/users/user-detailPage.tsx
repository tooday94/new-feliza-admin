import { useParams } from "react-router-dom";
import { useGetById } from "../../services/query/useGetById";
import type { UserType } from "../../types/user-type";
import { endpoints } from "../../configs/endpoints";
import { Image, Skeleton, Tag, Badge } from "antd";

function UserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useGetById<UserType>({
    endpoint: endpoints.users.useById,
    id: id ?? "",
  });
  console.log("user ID ", data);

  if (isLoading || !data) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 py-8 bg-white shadow-2xl rounded-2xl space-y-8">
      {/* PROFILE HEADER */}
      <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6">
        <Image
          src={data.image?.url}
          alt={data.fullName || "Foydalanuvchi"}
          fallback="https://via.placeholder.com/112?text=No+Image"
          style={{ width: 120, height: 120, objectFit: "cover" }}
          className="rounded-full border shadow-md"
        />
        <div className="text-center sm:text-left space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            {data.fullName}
          </h2>
          <Badge
            status={data.enabled ? "success" : "error"}
            text={data.enabled ? "Faol" : "NoFaol"}
          />
          <p className="text-sm text-gray-500">{data.gender}</p>
        </div>
      </div>

      {/* SHAXSIY MA’LUMOTLAR */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-700 border-b pb-2">
          Shaxsiy ma'lumotlar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-gray-600 text-sm">
          <p>
            <strong>Tug‘ilgan sana:</strong> {data.birthDate || "—"}
          </p>
          <p>
            <strong>Ro‘yxatdan o‘tgan:</strong> {data.createdAt?.slice(0, 10)}
          </p>
          <p>
            <strong>Telefon:</strong> {data.phoneNumber || "—"}
          </p>
          <p>
            <strong>Status:</strong> {data.status?.statusName || "—"}
          </p>
        </div>
      </div>

      {/* MOLIYAVIY MA’LUMOTLAR */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-700 border-b pb-2">
          Moliyaviy ma'lumotlar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-gray-600 text-sm">
          <p>
            <strong>Savdo summasi:</strong> {data.saleSum || 0} so'm
          </p>
          <p>
            <strong>Cashback:</strong> {data.cashback || "Yo‘q"}
          </p>
        </div>
      </div>

      {/* ROLLAR */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-700 border-b pb-2">
          Rollar
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.roles?.length ? (
            data.roles.map((role, index) => (
              <Tag key={index} color="processing">
                {role.roleName}
              </Tag>
            ))
          ) : (
            <p className="text-sm text-gray-500">Rollar mavjud emas</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetailPage;
