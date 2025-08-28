import { Table, Button, Popconfirm, Tooltip, Form, Input, Modal } from "antd";
import { endpoints } from "../../../configs/endpoints";
import { useGetList } from "../../../services/query/useGetList";
import type { RegionType } from "../../../types/settingsTypes/region-type";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import { useState } from "react";
import { useCreate } from "../../../services/mutation/useCreate";
import { toast } from "react-toastify";
import { useUpdate } from "../../../services/mutation/useUpdate";
import { useDeleteById } from "../../../services/mutation/useDeleteById";
import AddSubRegion from "./add-subRegion";
import AddPostFilial from "./add-postFilial";

const AddRegion = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "region" | "subRegion" | "postFilial"
  >("region");
  const { data, isLoading } = useGetList<RegionType[]>({
    endpoint: endpoints.address.regions.getAll,
  });
  console.log(isEditing);

  const { mutate } = useCreate({
    endpoint: endpoints.address.regions.post,
    queryKey: endpoints.address.regions.getAll,
  });

  const { mutate: editRegion } = useUpdate({
    endpoint: endpoints.address.regions.put,
    queryKey: endpoints.address.regions.getAll,
  });

  const { mutate: deleteRegion } = useDeleteById({
    endpoint: endpoints.address.regions.delete,
    queryKey: endpoints.address.regions.getAll,
  });

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleDeleteRegion = (id: number | string) => {
    deleteRegion(
      { id },
      {
        onSuccess: () =>
          toast.success("Hudud muvaffaqiyatli o'chirildi!", {
            autoClose: 1500,
          }),
        onError: (error) =>
          toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
      }
    );
  };

  const handleAddRegion = (values: any) => {
    const payload = {
      nameUZB: values.nameUZB || "",
      nameRUS: values.nameRUS || "",
      postCode: values.postCode || "",
    };
    mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        toast.success("Hudud muvaffaqiyatli qo'shildi!", { autoClose: 1500 });
      },
      onError: (error) =>
        toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
    });
  };

  const handleEditRegion = (values: any) => {
    const payload = {
      nameUZB: values.nameUZB || "",
      nameRUS: values.nameRUS || "",
      postCode: values.postCode || "",
    };
    editRegion(
      { id: values.id, data: payload },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setIsEditing(false);
          editForm.resetFields();
          toast.success("Hudud muvaffaqiyatli tahrirlandi!", {
            autoClose: 1500,
          });
        },
        onError: (error) =>
          toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
      }
    );
  };

  const columns = [
    {
      title: "№",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Hudud nomi (UZB)",
      dataIndex: "nameUZB",
      key: "nameUZB",
    },
    {
      title: "Hudud nomi (RUS)",
      dataIndex: "nameRUS",
      key: "nameRUS",
    },
    {
      title: "Post kodi",
      dataIndex: "postCode",
      key: "postCode",
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_text: any, record: any) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Tahrirlash">
            <Button
              type="text"
              shape="circle"
              icon={<EditTwoTone twoToneColor="#1890ff" />}
              onClick={() => {
                setIsEditing(true);
                editForm.setFieldsValue({
                  id: record.id,
                  nameUZB: record.nameUZB,
                  nameRUS: record.nameRUS,
                  postCode: record.postCode,
                });
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Ushbu hududni o'chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() => handleDeleteRegion(record.id)}
          >
            <Button
              shape="circle"
              icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2">
      {/* uchta button boladi viloyat tuman pochta uchun */}
      <div className="flex gap-3 mb-4">
        {[
          { key: "region", label: "Viloyat" },
          { key: "subRegion", label: "Tuman" },
          { key: "postFilial", label: "Pochta filial" },
        ].map((tab: any) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`!px-12 font-semibold border cursor-pointer !py-2 rounded-sm transition-all duration-300 ${
              activeTab === tab.key
                ? "bg-black text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Form for Adding */}
      {activeTab === "region" && (
        <div className="shadow p-6 bg-white rounded-md mb-5">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 ">
            Viloyat qo'shish
          </h2>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddRegion}
            initialValues={{ nameUZB: "", nameRUS: "", postCode: "" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-1 items-end"
          >
            <Form.Item
              label="Hudud nomi (UZB)"
              name="nameUZB"
              rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
            >
              <Input placeholder="Hudud nomi (UZB)" className="h-[40px]!" />
            </Form.Item>

            <Form.Item
              label="Hudud nomi (RUS)"
              name="nameRUS"
              rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
            >
              <Input placeholder="Hudud nomi (RUS)" className="h-[40px]" />
            </Form.Item>

            <Form.Item
              label="Post kodi"
              name="postCode"
              rules={[{ required: true, message: "Post kodini kiriting!" }]}
            >
              <Input placeholder="Post kodi" className="h-[40px]" />
            </Form.Item>

            <Form.Item className="w-full">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-[40px]!"
              >
                Qo'shish
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}

      {/* Jadval */}
      {activeTab === "region" && (
        <Table
          dataSource={data || []}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          loading={isLoading}
        />
      )}

      {/* Edit uchun Modal */}
      <Modal
        title="Hududni tahrirlash"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          editForm.resetFields();
        }}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditRegion}
          initialValues={{ nameUZB: "", nameRUS: "", postCode: "" }}
        >
          <Form.Item name="id" hidden>
            <input type="hidden" />
          </Form.Item>

          <Form.Item
            label="Hudud nomi (UZB)"
            name="nameUZB"
            rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
          >
            <Input placeholder="Hudud nomi (UZB)" />
          </Form.Item>

          <Form.Item
            label="Hudud nomi (RUS)"
            name="nameRUS"
            rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
          >
            <Input placeholder="Hudud nomi (RUS)" />
          </Form.Item>

          <Form.Item
            label="Post kodi"
            name="postCode"
            rules={[{ required: true, message: "Post kodini kiriting!" }]}
          >
            <Input placeholder="Post kodi" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Qo'shimcha bo'limlar */}
      <div className="pt-5">
        {activeTab === "subRegion" && <AddSubRegion />}
        {activeTab === "postFilial" && <AddPostFilial />}
      </div>
    </div>
  );
};

export default AddRegion;

// // import { Table, Button, Popconfirm, Tooltip, Form, Input, Modal } from "antd";
// // import { endpoints } from "../../../configs/endpoints";
// // import { useGetList } from "../../../services/query/useGetList";
// // import type { RegionType } from "../../../types/settingsTypes/region-type";
// // import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
// // import { useState } from "react";
// // import { useCreate } from "../../../services/mutation/useCreate";
// // import { toast } from "react-toastify";
// // import { useUpdate } from "../../../services/mutation/useUpdate";
// // import { useDeleteById } from "../../../services/mutation/useDeleteById";
// // import AddSubRegion from "./add-subRegion";
// // import AddPostFilial from "./add-postFilial";

// // const AddRegion = () => {
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const { data, isLoading } = useGetList<RegionType[]>({
// //     endpoint: endpoints.address.regions.getAll,
// //   });
// //   console.log(isEditing);

// //   const { mutate } = useCreate({
// //     endpoint: endpoints.address.regions.post,
// //     queryKey: endpoints.address.regions.getAll,
// //   });

// //   const { mutate: editRegion } = useUpdate({
// //     endpoint: endpoints.address.regions.put,
// //     queryKey: endpoints.address.regions.getAll,
// //   });

// //   const { mutate: deleteRegion } = useDeleteById({
// //     endpoint: endpoints.address.regions.delete,
// //     queryKey: endpoints.address.regions.getAll,
// //   });

// //   const [form] = Form.useForm();
// //   const [editForm] = Form.useForm();

// //   const handleDeleteRegion = (id: number | string) => {
// //     deleteRegion(
// //       { id },
// //       {
// //         onSuccess: () =>
// //           toast.success("Hudud muvaffaqiyatli o'chirildi!", {
// //             autoClose: 1500,
// //           }),
// //         onError: (error) =>
// //           toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
// //       }
// //     );
// //   };

// //   const handleAddRegion = (values: any) => {
// //     const payload = {
// //       nameUZB: values.nameUZB || "",
// //       nameRUS: values.nameRUS || "",
// //       postCode: values.postCode || "",
// //     };
// //     mutate(payload, {
// //       onSuccess: () => {
// //         form.resetFields();
// //         toast.success("Hudud muvaffaqiyatli qo'shildi!", { autoClose: 1500 });
// //       },
// //       onError: (error) =>
// //         toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
// //     });
// //   };

// //   const handleEditRegion = (values: any) => {
// //     const payload = {
// //       nameUZB: values.nameUZB || "",
// //       nameRUS: values.nameRUS || "",
// //       postCode: values.postCode || "",
// //     };
// //     editRegion(
// //       { id: values.id, data: payload },
// //       {
// //         onSuccess: () => {
// //           setIsModalOpen(false);
// //           setIsEditing(false);
// //           editForm.resetFields();
// //           toast.success("Hudud muvaffaqiyatli tahrirlandi!", {
// //             autoClose: 1500,
// //           });
// //         },
// //         onError: (error) =>
// //           toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
// //       }
// //     );
// //   };

// //   const columns = [
// //     {
// //       title: "№",
// //       dataIndex: "index",
// //       key: "index",
// //       render: (_: any, __: any, index: number) => index + 1,
// //     },
// //     {
// //       title: "Hudud nomi (UZB)",
// //       dataIndex: "nameUZB",
// //       key: "nameUZB",
// //     },
// //     {
// //       title: "Hudud nomi (RUS)",
// //       dataIndex: "nameRUS",
// //       key: "nameRUS",
// //     },
// //     {
// //       title: "Post kodi",
// //       dataIndex: "postCode",
// //       key: "postCode",
// //     },
// //     {
// //       title: "Amallar",
// //       key: "actions",
// //       render: (_text: any, record: any) => (
// //         <div className="flex items-center gap-2">
// //           <Tooltip title="Tahrirlash">
// //             <Button
// //               type="text"
// //               shape="circle"
// //               icon={<EditTwoTone twoToneColor="#1890ff" />}
// //               onClick={() => {
// //                 setIsEditing(true);
// //                 editForm.setFieldsValue({
// //                   id: record.id,
// //                   nameUZB: record.nameUZB,
// //                   nameRUS: record.nameRUS,
// //                   postCode: record.postCode,
// //                 });
// //                 setIsModalOpen(true);
// //               }}
// //             />
// //           </Tooltip>
// //           <Popconfirm
// //             title="Ushbu hududni o'chirmoqchimisiz?"
// //             okText="Ha"
// //             cancelText="Yo'q"
// //             onConfirm={() => handleDeleteRegion(record.id)}
// //           >
// //             <Button
// //               shape="circle"
// //               icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
// //             />
// //           </Popconfirm>
// //         </div>
// //       ),
// //     },
// //   ];

// //   return (
// //     <div className="p-2">
// //       {/* Form for Adding */}
// //       <div className="shadow p-4 bg-white rounded-md">
// //         <h2 className="text-xl font-semibold mb-4 border-b pb-2">
// //           Viloyat qo'shish
// //         </h2>
// //         <Form
// //           form={form}
// //           layout="vertical"
// //           onFinish={handleAddRegion}
// //           initialValues={{ nameUZB: "", nameRUS: "", postCode: "" }}
// //           className="grid grid-cols-1 md:grid-cols-4 gap-1 items-end"
// //         >
// //           <Form.Item
// //             label="Hudud nomi (UZB)"
// //             name="nameUZB"
// //             rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
// //           >
// //             <Input placeholder="Hudud nomi (UZB)" className="h-[40px]!" />
// //           </Form.Item>

// //           <Form.Item
// //             label="Hudud nomi (RUS)"
// //             name="nameRUS"
// //             rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
// //           >
// //             <Input placeholder="Hudud nomi (RUS)" className="h-[40px]" />
// //           </Form.Item>

// //           <Form.Item
// //             label="Post kodi"
// //             name="postCode"
// //             rules={[{ required: true, message: "Post kodini kiriting!" }]}
// //           >
// //             <Input placeholder="Post kodi" className="h-[40px]" />
// //           </Form.Item>

// //           <Form.Item className="w-full">
// //             <Button
// //               type="primary"
// //               htmlType="submit"
// //               className="w-full h-[40px]!"
// //             >
// //               Qo'shish
// //             </Button>
// //           </Form.Item>
// //         </Form>
// //       </div>

// //       {/* Jadval */}
// //       <Table
// //         dataSource={data || []}
// //         columns={columns}
// //         rowKey="id"
// //         pagination={false}
// //         bordered
// //         loading={isLoading}
// //       />

// //       {/* Edit uchun Modal */}
// //       <Modal
// //         title="Hududni tahrirlash"
// //         open={isModalOpen}
// //         onCancel={() => {
// //           setIsModalOpen(false);
// //           setIsEditing(false);
// //           editForm.resetFields();
// //         }}
// //         footer={null}
// //         maskClosable={false}
// //       >
// //         <Form
// //           form={editForm}
// //           layout="vertical"
// //           onFinish={handleEditRegion}
// //           initialValues={{ nameUZB: "", nameRUS: "", postCode: "" }}
// //         >
// //           <Form.Item name="id" hidden>
// //             <input type="hidden" />
// //           </Form.Item>

// //           <Form.Item
// //             label="Hudud nomi (UZB)"
// //             name="nameUZB"
// //             rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
// //           >
// //             <Input placeholder="Hudud nomi (UZB)" />
// //           </Form.Item>

// //           <Form.Item
// //             label="Hudud nomi (RUS)"
// //             name="nameRUS"
// //             rules={[{ required: true, message: "Hudud nomini kiriting!" }]}
// //           >
// //             <Input placeholder="Hudud nomi (RUS)" />
// //           </Form.Item>

// //           <Form.Item
// //             label="Post kodi"
// //             name="postCode"
// //             rules={[{ required: true, message: "Post kodini kiriting!" }]}
// //           >
// //             <Input placeholder="Post kodi" />
// //           </Form.Item>

// //           <Form.Item>
// //             <Button type="primary" htmlType="submit" block>
// //               Saqlash
// //             </Button>
// //           </Form.Item>
// //         </Form>
// //       </Modal>

// //       {/* Qo'shimcha bo'limlar */}
// //       <div className="pt-10">
// //         <AddSubRegion />
// //       </div>
// //       <div className="pt-5">
// //         <AddPostFilial />
// //       </div>
// //     </div>
// //   );
// // };

// // export default AddRegion;
// import { Table, Button, Popconfirm, Tooltip, Form, Input, Modal } from "antd";
// import { endpoints } from "../../../configs/endpoints";
// import { useGetList } from "../../../services/query/useGetList";
// import type { RegionType } from "../../../types/settingsTypes/region-type";
// import type { AddSubRegionType } from "../../../types/settingsTypes/add-subRegion";
// import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
// import { useState } from "react";
// import { useCreate } from "../../../services/mutation/useCreate";
// import { toast } from "react-toastify";
// import { useUpdate } from "../../../services/mutation/useUpdate";
// import { useDeleteById } from "../../../services/mutation/useDeleteById";
// import AddPostFilial from "./add-postFilial";
// // import AddPostFilial from "./add-postFilial";

// const AddRegion = () => {
//   // ==== REGION (Viloyat) ====
//   const [isEditing, setIsEditing] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const { data, isLoading } = useGetList<RegionType[]>({
//     endpoint: endpoints.address.regions.getAll,
//   });

//   const { mutate } = useCreate({
//     endpoint: endpoints.address.regions.post,
//     queryKey: endpoints.address.regions.getAll,
//   });
//   console.log(isEditing);

//   const { mutate: editRegion } = useUpdate({
//     endpoint: endpoints.address.regions.put,
//     queryKey: endpoints.address.regions.getAll,
//   });

//   const { mutate: deleteRegion } = useDeleteById({
//     endpoint: endpoints.address.regions.delete,
//     queryKey: endpoints.address.regions.getAll,
//   });

//   const [form] = Form.useForm();
//   const [editForm] = Form.useForm();

//   const handleDeleteRegion = (id: number | string) => {
//     deleteRegion(
//       { id },
//       {
//         onSuccess: () =>
//           toast.success("Hudud muvaffaqiyatli o'chirildi!", {
//             autoClose: 1500,
//           }),
//         onError: (error) =>
//           toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
//       }
//     );
//   };

//   const handleAddRegion = (values: any) => {
//     const payload = {
//       nameUZB: values.nameUZB || "",
//       nameRUS: values.nameRUS || "",
//       postCode: values.postCode || "",
//     };
//     mutate(payload, {
//       onSuccess: () => {
//         form.resetFields();
//         toast.success("Hudud muvaffaqiyatli qo'shildi!", { autoClose: 1500 });
//       },
//       onError: (error) =>
//         toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
//     });
//   };

//   const handleEditRegion = (values: any) => {
//     const payload = {
//       nameUZB: values.nameUZB || "",
//       nameRUS: values.nameRUS || "",
//       postCode: values.postCode || "",
//     };
//     editRegion(
//       { id: values.id, data: payload },
//       {
//         onSuccess: () => {
//           setIsModalOpen(false);
//           setIsEditing(false);
//           editForm.resetFields();
//           toast.success("Hudud muvaffaqiyatli tahrirlandi!", {
//             autoClose: 1500,
//           });
//         },
//         onError: (error) =>
//           toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
//       }
//     );
//   };

//   const regionColumns = [
//     {
//       title: "№",
//       dataIndex: "index",
//       key: "index",
//       render: (_: any, __: any, index: number) => index + 1,
//     },
//     { title: "Hudud nomi (UZB)", dataIndex: "nameUZB", key: "nameUZB" },
//     { title: "Hudud nomi (RUS)", dataIndex: "nameRUS", key: "nameRUS" },
//     { title: "Post kodi", dataIndex: "postCode", key: "postCode" },
//     {
//       title: "Amallar",
//       key: "actions",
//       render: (_: any, record: any) => (
//         <div className="flex items-center gap-2">
//           <Tooltip title="Tahrirlash">
//             <Button
//               type="text"
//               shape="circle"
//               icon={<EditTwoTone twoToneColor="#1890ff" />}
//               onClick={() => {
//                 setIsEditing(true);
//                 editForm.setFieldsValue(record);
//                 setIsModalOpen(true);
//               }}
//             />
//           </Tooltip>
//           <Popconfirm
//             title="Ushbu hududni o'chirmoqchimisiz?"
//             okText="Ha"
//             cancelText="Yo'q"
//             onConfirm={() => handleDeleteRegion(record.id)}
//           >
//             <Button
//               shape="circle"
//               icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
//             />
//           </Popconfirm>
//         </div>
//       ),
//     },
//   ];

//   // ==== SUBREGION (Tuman) ====
//   const [subForm] = Form.useForm();
//   const [isSubEditing, setIsSubEditing] = useState(false);
//   const [isSubModalOpen, setIsSubModalOpen] = useState(false);

//   const { data: subRegions, isLoading: isSubLoading } = useGetList<
//     AddSubRegionType[]
//   >({
//     endpoint: endpoints.address.subRegions.getAll,
//   });

//   const { data: regionsData } = useGetList<RegionType[]>({
//     endpoint: endpoints.address.regions.getAll,
//   });

//   const { mutate: addSubRegion } = useCreate({
//     endpoint: endpoints.address.subRegions.post,
//     queryKey: endpoints.address.subRegions.getAll,
//   });
//   const { mutate: editSubRegion } = useUpdate({
//     endpoint: endpoints.address.subRegions.put,
//     queryKey: endpoints.address.subRegions.getAll,
//   });
//   const { mutate: deleteSubRegion } = useDeleteById({
//     endpoint: endpoints.address.subRegions.delete,
//     queryKey: endpoints.address.subRegions.getAll,
//   });

//   const handleDeleteSubRegion = (id: number | string) => {
//     deleteSubRegion(
//       { id },
//       {
//         onSuccess: () =>
//           toast.success("Tuman muvaffaqiyatli o'chirildi!", {
//             autoClose: 1500,
//           }),
//         onError: (error) =>
//           toast.error(`Xatolik: ${error.message}`, { autoClose: 1500 }),
//       }
//     );
//   };

//   const handleSaveSubRegion = (values: any) => {
//     const payload = {
//       nameUZB: values.nameUZB || "",
//       nameRUS: values.nameRUS || "",
//       postCode: values.postCode || "",
//       regionId: values.regionId || null,
//     };

//     if (isSubEditing) {
//       editSubRegion(
//         { id: values.id, data: payload },
//         {
//           onSuccess: () => {
//             subForm.resetFields();
//             setIsSubModalOpen(false);
//             setIsSubEditing(false);
//             toast.success("Tuman muvaffaqiyatli tahrirlandi!", {
//               autoClose: 1500,
//             });
//           },
//           onError: (error: any) =>
//             toast.error(`Xatolik: ${error?.message || "Xatolik yuz berdi!"}`, {
//               autoClose: 1500,
//             }),
//         }
//       );
//     } else {
//       addSubRegion(payload, {
//         onSuccess: () => {
//           subForm.resetFields();
//           toast.success("Tuman muvaffaqiyatli qo'shildi!", { autoClose: 1500 });
//         },
//         onError: (error: any) =>
//           toast.error(`Xatolik: ${error?.message || "Xatolik yuz berdi!"}`, {
//             autoClose: 1500,
//           }),
//       });
//     }
//   };

//   const subColumns = [
//     { title: "№", render: (_: any, __: any, index: number) => index + 1 },
//     {
//       title: "Viloyat",
//       dataIndex: ["region", "nameUZB"],
//       key: "regionName",
//       render: (text: string) => text || "-",
//     },
//     { title: "Tuman (UZB)", dataIndex: "nameUZB", key: "nameUZB" },
//     { title: "Tuman (RUS)", dataIndex: "nameRUS", key: "nameRUS" },
//     { title: "Post kodi", dataIndex: "postCode", key: "postCode" },
//     {
//       title: "Amallar",
//       render: (_: any, record: any) => (
//         <div className="flex items-center gap-2">
//           <Tooltip title="Tahrirlash">
//             <Button
//               type="text"
//               shape="circle"
//               icon={<EditTwoTone twoToneColor="#1890ff" />}
//               onClick={() => {
//                 setIsSubEditing(true);
//                 subForm.setFieldsValue({
//                   id: record.id,
//                   nameUZB: record.nameUZB,
//                   nameRUS: record.nameRUS,
//                   postCode: record.postCode,
//                   regionId: record.region?.id || null,
//                 });
//                 setIsSubModalOpen(true);
//               }}
//             />
//           </Tooltip>
//           <Popconfirm
//             title="Ushbu tuman/hududni o'chirmoqchimisiz?"
//             okText="Ha"
//             cancelText="Yo'q"
//             onConfirm={() => handleDeleteSubRegion(record.id)}
//           >
//             <Button
//               shape="circle"
//               icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
//             />
//           </Popconfirm>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="p-2">
//       <div className="grid gap-5">
//         {/* Viloyat qo'shish */}
//         <div className="shadow p-4 bg-white rounded-md">
//           <h2 className="text-xl font-semibold mb-4 border-b pb-2">
//             Viloyat qo'shish
//           </h2>
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleAddRegion}
//             initialValues={{ nameUZB: "", nameRUS: "", postCode: "" }}
//             className="grid grid-cols-1 md:grid-cols-4 gap-1 items-end"
//           >
//             <Form.Item
//               label="Hudud nomi (UZB)"
//               name="nameUZB"
//               rules={[{ required: true }]}
//             >
//               <Input placeholder="Hudud nomi (UZB)" className="h-[40px]!" />
//             </Form.Item>
//             <Form.Item
//               label="Hudud nomi (RUS)"
//               name="nameRUS"
//               rules={[{ required: true }]}
//             >
//               <Input placeholder="Hudud nomi (RUS)" className="h-[40px]" />
//             </Form.Item>
//             <Form.Item
//               label="Post kodi"
//               name="postCode"
//               rules={[{ required: true }]}
//             >
//               <Input placeholder="Post kodi" className="h-[40px]" />
//             </Form.Item>
//             <Form.Item>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 className="w-full h-[40px]!"
//               >
//                 Qo'shish
//               </Button>
//             </Form.Item>
//           </Form>
//         </div>

//         {/* Tuman qo'shish */}
//         <div className="shadow p-4 bg-white rounded-md">
//           <h2 className="text-xl font-semibold mb-4 border-b pb-2">
//             Tuman qo'shish
//           </h2>
//           <Form
//             form={subForm}
//             layout="vertical"
//             onFinish={handleSaveSubRegion}
//             initialValues={{
//               nameUZB: "",
//               nameRUS: "",
//               postCode: "",
//               regionId: null,
//             }}
//             className="grid grid-cols-1 md:grid-cols-5 gap-1 items-end"
//           >
//             <Form.Item
//               label="Viloyat"
//               name="regionId"
//               rules={[{ required: true, message: "Viloyatni tanlang!" }]}
//             >
//               <select className="w-full h-[40px] rounded border px-3">
//                 <option value="">Viloyatni tanlang</option>
//                 {regionsData?.map((region) => (
//                   <option key={region.id} value={region.id}>
//                     {region.nameUZB}
//                   </option>
//                 ))}
//               </select>
//             </Form.Item>
//             <Form.Item
//               label="Tuman nomi (UZB)"
//               name="nameUZB"
//               rules={[{ required: true }]}
//             >
//               <Input placeholder="Tuman nomi (UZB)" className="h-[40px]!" />
//             </Form.Item>
//             <Form.Item
//               label="Tuman nomi (RUS)"
//               name="nameRUS"
//               rules={[{ required: true }]}
//             >
//               <Input placeholder="Tuman nomi (RUS)" className="h-[40px]" />
//             </Form.Item>
//             <Form.Item
//               label="Post kodi"
//               name="postCode"
//               rules={[{ required: true }]}
//             >
//               <Input placeholder="Post kodi" className="h-[40px]" />
//             </Form.Item>
//             <Form.Item>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 className="w-full h-[40px]!"
//               >
//                 Qo'shish
//               </Button>
//             </Form.Item>
//           </Form>
//         </div>
//       </div>

//       {/* Viloyatlar jadvali */}
//       <Table
//         title={() => (
//           <h2 className="text-xl font-bold uppercase">Viloyatlar ro'yxati</h2>
//         )}
//         dataSource={data || []}
//         columns={regionColumns}
//         rowKey="id"
//         pagination={false}
//         bordered
//         loading={isLoading}
//         className="mt-10 pb-10"
//       />

//       <Modal
//         title="Hududni tahrirlash"
//         open={isModalOpen}
//         onCancel={() => {
//           setIsModalOpen(false);
//           setIsEditing(false);
//           editForm.resetFields();
//         }}
//         footer={null}
//         maskClosable={false}
//       >
//         <Form form={editForm} layout="vertical" onFinish={handleEditRegion}>
//           <Form.Item name="id" hidden>
//             <input type="hidden" />
//           </Form.Item>
//           <Form.Item
//             label="Hudud nomi (UZB)"
//             name="nameUZB"
//             rules={[{ required: true }]}
//           >
//             <Input placeholder="Hudud nomi (UZB)" />
//           </Form.Item>
//           <Form.Item
//             label="Hudud nomi (RUS)"
//             name="nameRUS"
//             rules={[{ required: true }]}
//           >
//             <Input placeholder="Hudud nomi (RUS)" />
//           </Form.Item>
//           <Form.Item
//             label="Post kodi"
//             name="postCode"
//             rules={[{ required: true }]}
//           >
//             <Input placeholder="Post kodi" />
//           </Form.Item>
//           <Button type="primary" htmlType="submit" block>
//             Saqlash
//           </Button>
//         </Form>
//       </Modal>

//       <Table
//         title={() => (
//           <h2 className="text-xl font-bold uppercase">Tumanlar ro'yxati</h2>
//         )}
//         rowKey="id"
//         columns={subColumns}
//         dataSource={subRegions || []}
//         loading={isSubLoading}
//         pagination={false}
//         bordered
//       />

//       <Modal
//         title="Tuman tahrirlash"
//         open={isSubModalOpen}
//         onCancel={() => {
//           setIsSubModalOpen(false);
//           setIsSubEditing(false);
//           subForm.resetFields();
//         }}
//         footer={null}
//         maskClosable={false}
//       >
//         <Form form={subForm} layout="vertical" onFinish={handleSaveSubRegion}>
//           <Form.Item name="id" hidden>
//             <Input type="hidden" />
//           </Form.Item>
//           <Form.Item
//             label="Viloyat"
//             name="regionId"
//             rules={[{ required: true }]}
//           >
//             <select className="w-full h-[40px] rounded border px-3">
//               <option value="">Viloyatni tanlang</option>
//               {regionsData?.map((region) => (
//                 <option key={region.id} value={region.id}>
//                   {region.nameUZB}
//                 </option>
//               ))}
//             </select>
//           </Form.Item>
//           <Form.Item
//             label="Tuman nomi (UZB)"
//             name="nameUZB"
//             rules={[{ required: true }]}
//           >
//             <Input placeholder="Tuman nomi (UZB)" />
//           </Form.Item>
//           <Form.Item
//             label="Tuman nomi (RUS)"
//             name="nameRUS"
//             rules={[{ required: true }]}
//           >
//             <Input placeholder="Tuman nomi (RUS)" />
//           </Form.Item>
//           <Form.Item
//             label="Post kodi"
//             name="postCode"
//             rules={[{ required: true }]}
//           >
//             <Input placeholder="Post kodi" />
//           </Form.Item>
//           <Button type="primary" htmlType="submit" className="w-full h-[40px]">
//             Saqlash
//           </Button>
//         </Form>
//       </Modal>

//       <div className="pt-5">
//         <AddPostFilial />
//       </div>
//     </div>
//   );
// };

// export default AddRegion;
