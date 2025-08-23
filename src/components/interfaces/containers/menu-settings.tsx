import React, { useEffect, useRef, useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { Card, Button, Row, Col, Modal, Form, Flex, Spin } from "antd";
import { useGetList } from "../../../services/query/useGetList";
import { useUpdate } from "../../../services/mutation/useUpdate";
import { toast } from "react-toastify";
import { MdModeEditOutline } from "react-icons/md";
import SelectCategory from "./selectCategory";
import { endpoints } from "../../../configs/endpoints";
import type { Category } from "../../../types/interface/small-slider-type";

interface ImageType {
  id: number;
  url: string;
}
interface CategoryType {
  id: number;
  nameUZB: string;
  horizontalImage: ImageType;
  verticalImage: ImageType;
}
interface CategoryBlockType {
  id: number;
  categoryBlockType: string;
  placementNumber: number;
  category: CategoryType;
}
interface BoxType {
  id: number | string;
  containerBlock: CategoryBlockType;
}

const MenuSettings = ({ menuType }: { menuType: "MENU_1" | "MENU_2" }) => {
  const [form] = Form.useForm();
  const [editItem, setEditItem] = useState<CategoryBlockType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentName] = useState("");
  // console.log(editItem);

  const { data: parentCategories } = useGetList<Category[]>({
    endpoint: endpoints.category.getParent,
  });
  const { data: categories } = useGetList<Category[]>({
    endpoint: endpoints.category.getSubByParentName + selectedParentName,
    enabled: !!selectedParentName,
  });

  const updateSlider = useUpdate({
    endpoint: "/api/categoryBlock/editCategoryBlock/",
    queryKey: endpoints.smallSlider.getAll,
  });

  const [boxes, setBoxes] = useState<BoxType[]>([]);
  const initialBoxesRef = useRef<BoxType[]>([]);

  const { data, isLoading } = useGetList<CategoryBlockType[]>({
    endpoint: "/api/categoryBlock/getAllByCategoryBlockType/" + menuType,
  });
  // console.log(data);

  const { mutate } = useUpdate({
    endpoint: "/api/categoryBlock/editCategoryBlock/",
    queryKey: "/api/categoryBlock/getAllByCategoryBlockType/" + menuType,
  });

  useEffect(() => {
    if (data?.length) {
      const mapped = data
        .sort((a, b) => a.placementNumber - b.placementNumber)
        .map((block) => ({
          id: block.id,
          containerBlock: block,
        }));

      setBoxes(mapped);
      initialBoxesRef.current = JSON.parse(JSON.stringify(mapped)); // deep copy
    }
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = boxes.findIndex((item) => item.id === active.id);
    const newIndex = boxes.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(boxes, oldIndex, newIndex);

    // Update placementNumber for all boxes
    const updatedBoxes = reordered.map((box, index) => ({
      ...box,
      containerBlock: {
        ...box.containerBlock,
        placementNumber: index + 1,
      },
    }));

    setBoxes(updatedBoxes);

    // Find changed items compared to initial
    const changed = updatedBoxes.filter((box) => {
      const original = initialBoxesRef.current.find(
        (item) => item.id === box.id
      );
      return (
        original &&
        original.containerBlock.placementNumber !==
          box.containerBlock.placementNumber
      );
    });

    if (changed.length === 0) return;
    console.log(changed);

    changed.forEach((item, idx) => {
      const dataToSend = {
        categoryBlockType: menuType,
        placementNumber: item.containerBlock.placementNumber,
        categoryId: item.containerBlock.category.id,
      };

      mutate(
        { id: item.containerBlock.id, data: dataToSend },
        {
          onSuccess: () => {
            if (idx === changed.length - 1) {
              toast.success("O‘zgartirishlar saqlandi");
              initialBoxesRef.current = JSON.parse(
                JSON.stringify(updatedBoxes)
              );
            }
          },
          onError: (err) => {
            console.log(err);
            toast.error("O‘zgartirishlarni saqlashda xatolik", {
              position: "top-center",
            });
          },
        }
      );
    });
  };

  const SortableCard: React.FC<{
    id: number | string;
    containerBlock: CategoryBlockType;
  }> = ({ id, containerBlock }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id });

    return (
      <Flex
        className="w-96 md:w-fit !min-w-full !max-w-full border"
        ref={setNodeRef}
      >
        <div className="w-full">
          <Flex className="flex-row md:flex-col !w-full gap-2 relative">
            <div className="md:relative">
              <Button
                type="primary"
                className="!absolute right-1 top-1 z-10 !rounded-full !shadow-none"
                icon={
                  <MdModeEditOutline
                    size={18}
                    onClick={() => {
                      setEditItem(containerBlock);
                      setIsModalOpen(true);
                    }}
                  />
                }
              />
              <img
                className="!w-20 md:!w-40 !h-24 md:!h-48 object-cover cursor-grab"
                {...attributes}
                {...listeners}
                alt="category"
                src={containerBlock.category.verticalImage?.url}
              />
            </div>
            <Card.Meta
              style={{ padding: "10px" }}
              title={containerBlock.category.nameUZB}
              description={`Tartib: ${containerBlock.placementNumber}`}
            />
          </Flex>
        </div>
      </Flex>
    );
  };

  if (isLoading) {
    return <Spin className="m-4" />;
  }

  return (
    <div className="!w-full">
      <h1 className="text-lg font-bold pb-2">{menuType}</h1>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={boxes.map((box) => box.id)}
          strategy={rectSortingStrategy}
        >
          <Row gutter={[16, 16]}>
            {boxes.map((box) => (
              <Col key={`MENU_1_${box.id}`}>
                <SortableCard id={box.id} containerBlock={box.containerBlock} />
              </Col>
            ))}
          </Row>
        </SortableContext>
      </DndContext>

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
              categoryBlockType: menuType,
              placementNumber: 1,
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

export default MenuSettings;
