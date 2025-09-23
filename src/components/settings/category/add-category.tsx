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

  // ✅ Tahrirlash
  const handleEditCategory = async () => {
    try {
      const values = await form.validateFields();

      // payload faqat nameUZB va nameRUS + eski parentCategory
      const payload = {
        nameUZB: values.nameUZB,
        nameRUS: values.nameRUS,
        parentCategoryUZ: editingCategory?.parentCategoryUZ || "",
        // parentCategoryRU: editingCategory?.parentCategoryRU || "",
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
            refetch();
          },
        }
      );
    } catch {
      toast.error("Formani to‘ldirishda xatolik!");
    }
  };

  // ✅ Qo‘shish
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
            toast.error("Kategoriya qo‘shishda xatolik!", { autoClose: 1500 });
            console.error("Xatolik:", error);
            setIsModalOpen(false);
            form.resetFields();
            refetch();
          },
        });
      })
      .catch(() => {
        toast.error("Formani to'ldirishda xatolik!", { autoClose: 1500 });
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
        okText={editingCategory ? "Saqlash" : "Qo'shish"}
        cancelText="Bekor qilish"
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          {/* ✅ faqat qo‘shishda ko‘rinadi */}
          {!editingCategory && (
            <Form.Item
              label="Parent Category"
              name="parentCategory"
              rules={[
                { required: true, message: "Parent Categoryni tanlang!" },
              ]}
            >
              <Select placeholder="Parent Category tanlang">
                {parentCategories?.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.nameUZB}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

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

          {/* ✅ Rasm faqat tahrirlashda */}
          {editingCategory && (
            <>
              {/* Horizontal Rasm */}
              <Form.Item label="Horizontal Rasm">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {(horizontalImage ||
                    editingCategory?.horizontalImage?.url) && (
                    <Image
                      src={
                        horizontalImage
                          ? URL.createObjectURL(horizontalImage)
                          : editingCategory?.horizontalImage?.url
                      }
                      alt="Horizontal"
                      style={{
                        width: 250,
                        height: 250,
                        objectFit: "cover",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                      }}
                    />
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    {/* Rasm tanlash doimo ko‘rinadi */}
                    <label
                      htmlFor="horizontal-upload"
                      style={{
                        padding: "6px 12px",
                        background: "#000",
                        color: "#fff",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Rasm tanlash
                    </label>

                    {/* Delete tugmasi faqat rasm mavjud bo‘lsa */}
                    {(horizontalImage ||
                      editingCategory?.horizontalImage?.url) && (
                      <Button
                        danger
                        onClick={() => setHorizontalImage(null)}
                        icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                      >
                        Delete
                      </Button>
                    )}
                  </div>

                  <input
                    id="horizontal-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setHorizontalImage(e.target.files?.[0] || null)
                    }
                    style={{ display: "none" }}
                  />
                </div>
              </Form.Item>

              {/* Vertical Rasm */}
              <Form.Item label="Vertical Rasm">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {(verticalImage || editingCategory?.verticalImage?.url) && (
                    <Image
                      src={
                        verticalImage
                          ? URL.createObjectURL(verticalImage)
                          : editingCategory?.verticalImage?.url
                      }
                      alt="Vertical"
                      style={{
                        width: 250,
                        height: 250,
                        objectFit: "cover",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                      }}
                    />
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <label
                      htmlFor="vertical-upload"
                      style={{
                        padding: "6px 12px",
                        background: "#000",
                        color: "#fff",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Rasm tanlash
                    </label>

                    {(verticalImage || editingCategory?.verticalImage?.url) && (
                      <Button
                        danger
                        onClick={() => setVerticalImage(null)}
                        icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                      >
                        Delete
                      </Button>
                    )}
                  </div>

                  <input
                    id="vertical-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setVerticalImage(e.target.files?.[0] || null)
                    }
                    style={{ display: "none" }}
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
                          toast.error("O‘chirishda xatolik!");
                          console.error("Delete Error:", err);
                          refetch();
                        },
                      }
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
