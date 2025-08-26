import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tooltip,
} from "antd";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import { useGetList } from "../../../services/query/useGetList";
import { endpoints } from "../../../configs/endpoints";
import type { AddPostFilialType } from "../../../types/settingsTypes/add-postFilial";
import { useState } from "react";
import { useCreate } from "../../../services/mutation/useCreate";
import { toast } from "react-toastify";
import { useDeleteById } from "../../../services/mutation/useDeleteById";
import { useUpdate } from "../../../services/mutation/useUpdate";

const AddPostFilial = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // yangi holat
  // Ma'lumotlarni olish
  const { data: addPost, isLoading } = useGetList<AddPostFilialType[]>({
    endpoint: endpoints.address.postFilials.getAll,
  });
  // viloayt uchun
  const { data: regionsData } = useGetList<AddPostFilialType[]>({
    endpoint: endpoints.address.regions.getAll,
  });
  const { data: districtsData } = useGetList<AddPostFilialType[]>({
    endpoint: endpoints.address.subRegions.getAll,
  });
  // Pochta filialini qo'shish, tahrirlash va o'chirish uchun mutatsiyalar
  const { mutate: addMutate } = useCreate({
    endpoint: endpoints.address.postFilials.post,
    queryKey: endpoints.address.postFilials.getAll,
  });
  const { mutate: deletePostFilial } = useDeleteById({
    endpoint: endpoints.address.postFilials.delete,
    queryKey: endpoints.address.postFilials.getAll,
  });
  const { mutate: editPostFilial } = useUpdate({
    endpoint: endpoints.address.postFilials.put,
    queryKey: endpoints.address.postFilials.getAll,
  });
  const [form] = Form.useForm();

  // Pochta filialini tahrirlash funksiyasi
  const handleEditPostFilial = (values: any) => {
    const payload = {
      postName: values.postName || "",
      postFilialName: values.postFilialName || "",
      descriptionUZB: values.descriptionUZB || "",
      descriptionRUS: values.descriptionRUS || "",
      streetUZB: values.streetUZB || "",
      streetRUS: values.streetRUS || "",
      houseNumber: values.houseNumber || "",
      regionId: values.regionId || null,
      subRegionId: values.tumanId || null,
    };
    editPostFilial(
      { id: values.id, data: payload },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
          toast.success("Pochta filial muvaffaqiyatli tahrirlandi!", {
            autoClose: 1500,
          });
        },
        onError: (error) => {
          console.error("Error editing post filial:", error);
          toast.error(`Xatolik: ${error.message}`, {
            autoClose: 1500,
          });
        },
      }
    );
  };

  // Pochta filialini o'chirish funksiyasi
  const handleDeletePostFilial = (id: number) => {
    deletePostFilial(
      { id },
      {
        onSuccess: () => {
          toast.success("Pochta filial muvaffaqiyatli o'chirildi!", {
            autoClose: 1500,
          });
        },
        onError: (error) => {
          toast.error(`Xatolik: ${error.message}`, {
            autoClose: 1500,
          });
        },
      }
    );
  };
  // Pochta filialini qo'shish funksiyasi
  const handleAddPostFilial = (values: any) => {
    const payload = {
      postName: values.postName,
      postFilialName: values.postFilialName,
      descriptionUZB: values.descriptionUZB,
      descriptionRUS: values.descriptionRUS,
      streetUZB: values.streetUZB,
      streetRUS: values.streetRUS,
      houseNumber: values.houseNumber,
      regionId: values.regionId,
      subRegionId: values.tumanId,
    };

    addMutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        form.resetFields();
        toast.success("Pochta filial muvaffaqiyatli qo'shildi!", {
          autoClose: 1500,
        });
      },
      onError: (error) => {
        console.error("Error adding post filial:", error);
        toast.error(`Xatolik: ${error.message}`, {
          autoClose: 1500,
        });
      },
    });
  };
  // Jadval ustunlari
  const columns = [
    {
      title: "№",
      key: "index",
      width: "50px", // O'lchamni cheklash
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Viloyat",
      dataIndex: ["region", "nameUZB"],
      key: "region",
      width: "100px", // O'lchamni cheklash
      render: (text: string) => <span className=" font-semibold">{text}</span>,
    },
    {
      title: "Tuman",
      dataIndex: ["subRegion", "nameUZB"],
      key: "subRegion",
      width: "100px", // O'lchamni cheklash
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Pochta Nomi",
      dataIndex: "postName",
      key: "postName",
      width: "150px", // O'lchamni cheklash
    },
    {
      title: "Pochta filiali",
      dataIndex: "postFilialName",
      key: "postFilialName",
      width: "150px", // O'lchamni cheklash
    },
    {
      title: "Ko'cha nomi (UZB)",
      dataIndex: "streetUZB",
      key: "streetUZB",
      width: "150px", // O'lchamni cheklash
    },

    // {
    //   title: "Ko'cha nomi (RUS)",
    //   dataIndex: "streetRUS",
    //   key: "streetRUS",
    //   width: "150px", // O'lchamni cheklash
    // },
    {
      title: "Uy raqami",
      dataIndex: "houseNumber",
      key: "houseNumber",
      width: "100px", // O'lchamni cheklash
    },
    {
      title: "Info (UZB)",
      dataIndex: "descriptionUZB",
      key: "descriptionUZB",
      width: "150px", // O'lchamni cheklash
    },
    // {
    //   title: "Info (RUS)",
    //   dataIndex: "descriptionRUS",
    //   key: "descriptionRUS",
    //   width: "150px", // O'lchamni cheklash
    // },
    {
      title: "Amallar",
      key: "actions",
      width: "100px", // O'lchamni cheklash
      render: (_: any, record: AddPostFilialType) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Tahrirlash">
            <Button
              type="text"
              shape="circle"
              icon={<EditTwoTone twoToneColor="#1890ff" />}
              onClick={() => {
                setIsModalOpen(true);
                setIsEditing(true); // Bu edit rejimini yoqadi
                form.setFieldsValue({
                  id: record.id,
                  postName: record.postName,
                  postFilialName: record.postFilialName,
                  descriptionUZB: record.descriptionUZB,
                  descriptionRUS: record.descriptionRUS,
                  streetUZB: record.streetUZB,
                  streetRUS: record.streetRUS,
                  houseNumber: record.houseNumber,
                  regionId: record.region?.id || null,
                  tumanId: record.subRegion?.id || null,
                });
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Ushbu filialni o'chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo'q"
            onConfirm={() => {
              handleDeletePostFilial(record.id);
              console.log("O'chirish:", record);
            }}
          >
            <Button
              type="text"
              shape="circle"
              icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const showModal = () => {
    setIsModalOpen(true);
    setIsEditing(false); // yangi holat
    form.resetFields(); // Formni tozalash
  };
  console.log(showModal);

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields(); // Formni tozalash
  };
  return (
    <div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b">
          Pochta filial qo'shish
        </h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            isEditing
              ? handleEditPostFilial(values)
              : handleAddPostFilial(values)
          }
          initialValues={{
            regionId: null,
            tumanId: null,
            postName: "",
            postFilialName: "",
            streetUZB: "",
            streetRUS: "",
            houseNumber: "",
            descriptionUZB: "",
            descriptionRUS: "",
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-1"
        >
          {/* Viloyat tanlash */}
          <Form.Item
            label="Viloyat"
            name="regionId"
            rules={[{ required: true, message: "Viloyatni tanlang!" }]}
            className="w-full"
          >
            <Select
              placeholder="Viloyatni tanlang"
              className="h-[40px]!"
              options={regionsData?.map((region: any) => ({
                label: region.nameUZB,
                value: region.id,
              }))}
            />
          </Form.Item>

          {/* Tuman tanlash */}
          <Form.Item
            label="Tuman"
            name="tumanId"
            rules={[{ required: true, message: "Tumanni tanlang!" }]}
            className="w-full"
          >
            <Select
              placeholder="Tumanni tanlang"
              className="h-[40px]!"
              options={districtsData?.map((region: any) => ({
                label: region.nameUZB,
                value: region.id,
              }))}
            />
          </Form.Item>

          {/* Pochta Nomi */}
          <Form.Item
            label="Pochta Nomi"
            name="postName"
            rules={[{ required: true, message: "Pochta nomini kiriting!" }]}
          >
            <Input placeholder="Pochta Nomi" className="h-[40px]" />
          </Form.Item>

          {/* Pochta Filial Nomi */}
          <Form.Item
            label="Pochta filiali nomi"
            name="postFilialName"
            rules={[
              { required: true, message: "Pochta filial nomini kiriting!" },
            ]}
          >
            <Input placeholder="Pochta filiali nomi" className="h-[40px]" />
          </Form.Item>

          {/* Ko‘cha nomi (UZB) */}
          <Form.Item
            label="Ko'cha nomi (UZB)"
            name="streetUZB"
            rules={[{ required: true, message: "Ko'cha nomini kiriting!" }]}
          >
            <Input placeholder="Ko'cha nomi (UZB)" className="h-[40px]" />
          </Form.Item>

          {/* Ko‘cha nomi (RUS) */}
          <Form.Item
            label="Ko'cha nomi (RUS)"
            name="streetRUS"
            rules={[{ required: true, message: "Ko'cha nomini kiriting!" }]}
          >
            <Input placeholder="Ko'cha nomi (RUS)" className="h-[40px]" />
          </Form.Item>

          {/* Uy raqami */}
          <Form.Item
            label="Uy raqami"
            name="houseNumber"
            rules={[{ required: true, message: "Uy raqamini kiriting!" }]}
          >
            <Input placeholder="Uy raqami" className="h-[40px]" />
          </Form.Item>

          {/* Info (UZB) */}
          <Form.Item
            label="Info (UZB)"
            name="descriptionUZB"
            rules={[{ required: true, message: "Info (UZB) kiriting!" }]}
            className=""
          >
            <Input
              placeholder="Info (UZB)"
              maxLength={500}
              className="w-full h-[40px]"
            />
          </Form.Item>

          {/* Info (RUS) */}
          <Form.Item
            label="Info (RUS)"
            name="descriptionRUS"
            rules={[{ required: true, message: "Info (RUS) kiriting!" }]}
            className=""
          >
            <Input
              placeholder="Info (RUS)"
              maxLength={500}
              className="w-full h-[40px]"
            />
          </Form.Item>

          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>

          {/* Submit tugmasi */}
          <Form.Item className="w-full">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-[40px]! font-semibold"
            >
              Qo'shish
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Table
        title={() => (
          <h2 className="text-xl font-bold uppercase">
            Pochat Filial ro'yxati
          </h2>
        )}
        columns={columns}
        dataSource={addPost}
        rowKey={(record) => record.id.toString()}
        loading={isLoading}
        pagination={false}
        scroll={{ x: "max-content" }}
        bordered={true}
        className="mt-10"
      />
      {/* edit uchun modal */}
      <Modal
        title="Pochta filialini qo'shish"
        open={isModalOpen}
        onCancel={handleCancel}
        width={600}
        footer={null}
        maskClosable={false}
      >
        {/* Modal ichidagi form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            isEditing
              ? handleEditPostFilial(values)
              : handleAddPostFilial(values)
          }
          initialValues={{
            regionId: null,
            tumanId: null,
            postName: "",
            postFilialName: "",
            streetUZB: "",
            streetRUS: "",
            houseNumber: "",
            descriptionUZB: "",
            descriptionRUS: "",
          }}
          className="grid grid-cols-1 gap-4"
        >
          {/* Viloyat tanlash */}
          <Form.Item
            label="Viloyat"
            name="regionId"
            rules={[{ required: true, message: "Viloyatni tanlang!" }]}
          >
            <Select
              placeholder="Viloyatni tanlang"
              className="w-full"
              options={regionsData?.map((region: any) => ({
                label: region.nameUZB,
                value: region.id,
              }))}
            />
          </Form.Item>

          {/* Tuman tanlash */}
          <Form.Item
            label="Tuman"
            name="tumanId"
            rules={[{ required: true, message: "Tumanni tanlang!" }]}
          >
            <Select
              placeholder="Tumanni tanlang"
              className="w-full"
              options={districtsData?.map((region: any) => ({
                label: region.nameUZB,
                value: region.id,
              }))}
            />
          </Form.Item>

          {/* Pochta Nomi */}
          <Form.Item
            label="Pochta Nomi"
            name="postName"
            rules={[{ required: true, message: "Pochta nomini kiriting!" }]}
          >
            <Input placeholder="Pochta Nomi" className="h-[40px]" />
          </Form.Item>

          {/* Pochta Filial Nomi */}
          <Form.Item
            label="Pochta filiali nomi"
            name="postFilialName"
            rules={[
              { required: true, message: "Pochta filial nomini kiriting!" },
            ]}
          >
            <Input placeholder="Pochta filiali nomi" className="h-[40px]" />
          </Form.Item>
          {/* Ko‘cha nomi (UZB) */}
          <Form.Item
            label="Ko'cha nomi (UZB)"
            name="streetUZB"
            rules={[{ required: true, message: "Ko'cha nomini kiriting!" }]}
          >
            <Input placeholder="Ko'cha nomi (UZB)" className="h-[40px]" />
          </Form.Item>
          {/* Ko‘cha nomi (RUS) */}
          <Form.Item
            label="Ko'cha nomi (RUS)"
            name="streetRUS"
            rules={[{ required: true, message: "Ko'cha nomini kiriting!" }]}
          >
            <Input placeholder="Ko'cha nomi (RUS)" className="h-[40px]" />
          </Form.Item>
          {/* Uy raqami */}
          <Form.Item
            label="Uy raqami"
            name="houseNumber"
            rules={[{ required: true, message: "Uy raqamini kiriting!" }]}
          >
            <Input placeholder="Uy raqami" className="h-[40px]" />
          </Form.Item>
          {/* Info (UZB) */}
          <Form.Item
            label="Info (UZB)"
            name="descriptionUZB"
            rules={[{ required: true, message: "Info (UZB) kiriting!" }]}
          >
            <Input.TextArea
              placeholder="Info (UZB)"
              rows={3}
              maxLength={500}
              className="resize-none"
            />
          </Form.Item>
          {/* Info (RUS) */}
          <Form.Item
            label="Info (RUS)"
            name="descriptionRUS"
            rules={[{ required: true, message: "Info (RUS) kiriting!" }]}
          >
            <Input.TextArea
              placeholder="Info (RUS)"
              rows={3}
              maxLength={500}
              className="resize-none"
            />
          </Form.Item>
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>
          {/* Submit tugmasi */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-[45px] font-semibold"
            >
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddPostFilial;
