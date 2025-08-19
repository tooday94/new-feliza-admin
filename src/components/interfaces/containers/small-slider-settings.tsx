import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Modal, Button, Spin, Form } from "antd";
import { useEffect, useState } from "react";
import { MdModeEditOutline } from "react-icons/md";
import { toast } from "react-toastify";

import type {
  Category,
  SmallSliderItem,
} from "../../../types/interface/small-slider-type";

import { useGetList } from "../../../services/query/useGetList";
import { useUpdate } from "../../../services/mutation/useUpdate";
import { endpoints } from "../../../configs/endpoints";
import SelectCategory from "./selectCategory";

const { Meta } = Card;

const SortableCard = ({
  item,
  onEdit,
}: {
  item: SmallSliderItem;
  onEdit: (item: SmallSliderItem) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef, // 👈 handle uchun
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: 220,
    marginBottom: 12,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border !w-[49%] md:!w-fit !z-50"
    >
      <Card
        styles={{ body: { padding: 5 } }}
        className="!w-full md:!w-52"
        cover={
          <div className="relative">
            {/* Drag + Edit Icon handle */}
            <div
              ref={setActivatorNodeRef}
              // ✅ Faqat shu joyga listeners qo‘shamiz
              className="absolute right-1 top-1 z-10 rounded-full bg-primary text-white p-1.5 cursor-pointer"
              onClick={(e) => {
                console.log("ff");

                e.stopPropagation(); // Drag'ga to'sqinlik qilmasin
                onEdit(item);
              }}
            >
              <MdModeEditOutline size={18} />
            </div>

            <img
              {...attributes}
              {...listeners}
              src={item.category.verticalImage?.url || ""}
              alt={item.category.nameUZB || "Rasm"}
              className="h-64 w-full object-cover cursor-grab"
            />
          </div>
        }
      >
        <Meta
          title={item.category.nameUZB}
          description={`Joy raqami: ${item.placeNumber}`}
        />
      </Card>
    </div>
  );
};

const SmallSliderSettings = () => {
  const [selectedParentName] = useState("");

  const [form] = Form.useForm();
  const { data, isLoading, refetch } = useGetList<SmallSliderItem[]>({
    endpoint: endpoints.smallSlider.getAll,
  });

  const { data: parentCategories } = useGetList<Category[]>({
    endpoint: endpoints.category.getParent,
  });
  const { data: categories } = useGetList<Category[]>({
    endpoint: endpoints.category.getSubByParentName + selectedParentName,
    enabled: !!selectedParentName,
  });

  const updateSlider = useUpdate({
    endpoint: endpoints.smallSlider.put,
    queryKey: endpoints.smallSlider.getAll,
  });

  const [editItem, setEditItem] = useState<SmallSliderItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localData, setLocalData] = useState<SmallSliderItem[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleEdit = (item: SmallSliderItem) => {
    setEditItem(item);
    // form.setFieldsValue({ categoryId: item.category.id });
    setIsModalOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localData.findIndex((item) => item.id === active.id);
    const newIndex = localData.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(localData, oldIndex, newIndex).map(
      (item, idx) => ({
        ...item,
        placeNumber: idx + 1,
      })
    );

    setLocalData(reordered);
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        localData.map((item) =>
          updateSlider.mutateAsync({
            id: item.id,
            data: {
              placeNumber: item.placeNumber,
              categoryId: item.category.id,
            },
          })
        )
      );
      toast.success("Barcha sliderlar muvaffaqiyatli saqlandi");
      refetch();
    } catch (err) {
      toast.error("Xatolik yuz berdi");
      console.error(err);
    }
  };

  useEffect(() => {
    if (data) {
      const sorted = [...data].sort((a, b) => a.placeNumber - b.placeNumber);
      setLocalData(sorted);
    }
  }, [data]);

  if (isLoading || !data) return <Spin className="m-4" />;

  return (
    <div>
      <h1 className="text-lg font-bold pb-2">Small Slider</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localData.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-wrap md:gap-4 justify-between md:justify-start">
            {localData.map((item) => (
              <SortableCard key={item.id} item={item} onEdit={handleEdit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="text-center mt-6">
        <Button
          type="primary"
          onClick={handleSave}
          loading={updateSlider.isPending}
        >
          Saqlash
        </Button>
      </div>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title="Kategoriya o'zgartirish"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const updatedItem = {
              placeNumber: editItem?.placeNumber,
              ...values,
            };

            if (typeof values.categoryId === "string") {
              parentCategories?.forEach((cat) => {
                if (cat.nameUZB === values.categoryId) {
                  updatedItem.categoryId = cat.id;
                }
              });
            }

            console.log(updatedItem);

            updateSlider.mutate(
              {
                id: editItem?.id,
                data: updatedItem,
              },
              {
                onSuccess: () => {
                  setIsModalOpen(false);
                  toast.success("Small slider kategoriyasi o'zgartirildi!", {
                    position: "top-center",
                  });
                },
                onError: () => {
                  toast.error(
                    "Small slider kategoriyasini o'zgartirishda xatolik",
                    {
                      position: "top-center",
                    }
                  );
                },
              }
            );
          }}
        >
          <Form.Item name={"categoryId"}>
            <SelectCategory
              value={editItem?.category?.id}
              onChange={(val) => {
                const selectedCategory = categories?.find((c) => c.id === val);
                if (selectedCategory && editItem) {
                  setEditItem({ ...editItem, category: selectedCategory });
                }
                form.setFieldValue("categoryId", val);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button block htmlType="submit" type="primary" children="Saqlash" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmallSliderSettings;
