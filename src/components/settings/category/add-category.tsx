import {
  Table,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Image,
} from "antd";
import { EditTwoTone, DeleteTwoTone, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useGetList } from "../../../services/query/useGetList";
import { useCreate } from "../../../services/mutation/useCreate";
import { endpoints } from "../../../configs/endpoints";
import type { AddCategoryType } from "../../../types/settingsTypes/add-category";
import { toast } from "react-toastify";
import { useDeleteById } from "../../../services/mutation/useDeleteById";
import { useUpdate } from "../../../services/mutation/useUpdate";

function AddCategory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AddCategoryType | null>(null);
  const [horizontalImage, setHorizontalImage] = useState<File | null>(null);
  const [verticalImage, setVerticalImage] = useState<File | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useGetList<AddCategoryType[]>({
    endpoint: endpoints.category.getAll,
  });

  const { data: parentCategories } = useGetList<AddCategoryType[]>({
    endpoint: endpoints.category.getParent,
  });

  const { mutate } = useCreate({
    endpoint: endpoints.category.post,
    queryKey: endpoints.category.getAll,
  });
  const { mutate: deleteCategory } = useDeleteById({
    endpoint: endpoints.category.delete,
    queryKey: endpoints.category.getAll,
  });
  const { mutate: editCategory } = useUpdate({
    endpoint: endpoints.category.put,
    queryKey: endpoints.category.getAll,
  });

  const handleEditCategory = async () => {
    try {
      const values = await form.validateFields();

      const selectedCategory = parentCategories?.find(
        (c) => c.id === values.parentCategory
      );

      const payload = {
        nameUZB: values.nameUZB,
        nameRUS: values.nameRUS,
        parentCategoryUZ: selectedCategory?.nameUZB || "",
        parentCategoryRU: selectedCategory?.nameRUS || "",
      };

      if (!editingCategory?.id) {
        toast.error("Tahrirlanadigan kategoriya topilmadi");
        return;
      }

      const formData = new FormData();
      formData.append("editCategoryDto", JSON.stringify(payload));
      if (horizontalImage) formData.append("horizontal", horizontalImage);
      if (verticalImage) formData.append("vertical", verticalImage);

      editCategory(
        { id: editingCategory.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Kategoriya muvaffaqiyatli tahrirlandi!", {
              autoClose: 1500,
            });
            refetch();
            setIsModalOpen(false);
            setEditingCategory(null);
            setHorizontalImage(null);
            setVerticalImage(null);
            form.resetFields();
          },
          onError: (err) => {
            toast.error("Tahrirlashda xatolik yuz berdi!");
            console.error("Edit error:", err);
          },
        }
      );
    } catch (err) {
      toast.error("Formani to‘ldirishda xatolik!");
    }
  };

  const handleAddCategory = () => {
    form
      .validateFields()
      .then((values) => {
        const selectedCategory = parentCategories?.find(
          (c) => c.id === values.parentCategory
        );

        const payload = {
          nameUZB: values.nameUZB,
          nameRUS: values.nameRUS,
          parentCategoryUZ: selectedCategory?.nameUZB || "",
          parentCategoryRU: selectedCategory?.nameRUS || "",
        };

        mutate(payload, {
          onSuccess: () => {
            form.resetFields();
            setIsModalOpen(false);
            toast.success("Kategoriya muvaffaqiyatli qo'shildi!", {
              autoClose: 1500,
            });
          },
          onError: (error) => {
            refetch(); // Refetch to update the table
            form.resetFields();
            setIsModalOpen(false);
            toast.success("Kategoriya qo'shildi (lekin xatolik yuz berdi)", {
              autoClose: 1500,
            });
            console.error("Xatolik:", error);
          },
        });
      })
      .catch(() => {
        toast.error("Formani to'ldirishda xatolik!", {
          autoClose: 1500,
        });
      });
  };

  return (
    <div className="rounded-md">
      <Modal
        title={
          editingCategory ? "Kategoriya tahrirlash" : "Kategoriya qo'shish"
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          setHorizontalImage(null);
          setVerticalImage(null);
          form.resetFields();
        }}
        onOk={editingCategory ? handleEditCategory : handleAddCategory}
        okText={editingCategory ? "Tahrirlash" : "Qo'shish"}
        cancelText="Bekor qilish"
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Parent Category"
            name="parentCategory"
            rules={[{ required: true, message: "Parent Categoryni tanlang!" }]}
          >
            <Select placeholder="Parent Category tanlang">
              {parentCategories?.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.nameUZB}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Name UZB"
            name="nameUZB"
            rules={[{ required: true, message: "Name UZBni kiriting!" }]}
          >
            <Input placeholder="Name UZB" />
          </Form.Item>

          <Form.Item
            label="Name RUS"
            name="nameRUS"
            rules={[{ required: true, message: "Name RUSni kiriting!" }]}
          >
            <Input placeholder="Name RUS" />
          </Form.Item>
          {/*  */}
          {editingCategory && (
            <>
              {/* Horizontal Rasm */}
              <Form.Item label="Horizontal Rasm">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {(horizontalImage ||
                    editingCategory?.horizontalImage?.url) && (
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <Image
                        src={
                          horizontalImage
                            ? URL.createObjectURL(horizontalImage)
                            : editingCategory?.horizontalImage?.url
                        }
                        alt="Horizontal"
                        style={{
                          width: 140,
                          height: "auto",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                        }}
                      />
                      <Button
                        danger
                        type="link"
                        onClick={() => {
                          setHorizontalImage(null);
                          if (editingCategory.horizontalImage)
                            editingCategory.horizontalImage = null;
                        }}
                        style={{ paddingLeft: 0 }}
                        icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                      ></Button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setHorizontalImage(e.target.files?.[0] || null)
                    }
                  />
                </div>
              </Form.Item>

              {/* Vertical Rasm */}
              <Form.Item label="Vertical Rasm">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {(verticalImage || editingCategory.verticalImage?.url) && (
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <Image
                        src={
                          verticalImage
                            ? URL.createObjectURL(verticalImage)
                            : editingCategory.verticalImage?.url
                        }
                        alt="Vertical"
                        style={{
                          width: 140,
                          height: "auto",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                        }}
                      />
                      <Button
                        danger
                        type="link"
                        onClick={() => {
                          setVerticalImage(null);
                          if (editingCategory.verticalImage)
                            editingCategory.verticalImage = null;
                        }}
                        style={{ paddingLeft: 0 }}
                        icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                      ></Button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setVerticalImage(e.target.files?.[0] || null)
                    }
                  />
                </div>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Table
        loading={isLoading}
        dataSource={data}
        rowKey="id"
        bordered
        scroll={{ x: true }}
        // pagination={{ pageSize: 15, showSizeChanger: false }} pagination false
        pagination={false}
        title={() => (
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Kategoriya qo'shish</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Qo'shish
            </Button>
          </div>
        )}
        columns={[
          {
            title: "#",
            render: (_, __, index) => <span>{index + 1}</span>,
          },
          {
            title: "Main Category",
            dataIndex: "parentCategoryUZ",
          },
          {
            title: "Name UZB",
            dataIndex: "nameUZB",
          },
          {
            title: "Name RUS",
            dataIndex: "nameRUS",
          },
          {
            title: "ID",
            dataIndex: "id",
          },
          {
            title: "Actions",
            align: "center",
            render: (_, record) => (
              <div className="flex gap-2 justify-center">
                {/* tahrirlash */}
                <Tooltip title="Tahrirlash">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<EditTwoTone twoToneColor="#1890ff" />}
                    onClick={() => {
                      setEditingCategory(record);
                      form.setFieldsValue({
                        nameUZB: record.nameUZB,
                        nameRUS: record.nameRUS,
                        parentCategory: parentCategories?.find(
                          (cat) => cat.nameUZB === record.parentCategoryUZ
                        )?.id,
                      });
                      setIsModalOpen(true);
                    }}
                  />
                </Tooltip>

                {/* delete */}
                <Popconfirm
                  onConfirm={() =>
                    deleteCategory(
                      { id: record?.id || "" },
                      {
                        onSuccess: () => {
                          toast.success(
                            "Kategoriya muvaffaqiyatli o‘chirildi!"
                          );
                        },
                        onError: (err) => {
                          toast.success(
                            "Kategoriya muvaffaqiyatli o‘chirildi!"
                          );
                          console.error("Delete Error:", err);
                          refetch();
                        },
                      } // yoki faqat id bo‘lishi mumkin: deleteCategory(id)
                    )
                  }
                  title="O‘chirishni tasdiqlaysizmi?"
                  okText="Ha"
                  cancelText="Yo'q"
                >
                  <Button
                    shape="circle"
                    icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                  />
                </Popconfirm>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default AddCategory;
