import React from "react";
import { Upload, type UploadFile } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";

interface SortableItemProps {
  id: string;
  originNode: React.ReactNode;
}

function SortableItem({ id, originNode }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="relative" ref={setNodeRef} style={style}>
      {originNode}
      <div
        className="border absolute w-full cursor-grab text-center font-semibold"
        {...attributes}
        {...listeners}
      >
        tartiblash
      </div>
    </div>
  );
}

interface ColorImage {
  colorId: string;
  imagesList: any[];
}

interface SortableUploadProps {
  colorId: string | number;
  colorImages: { imagesList: UploadFile[]; colorId: number }[];
  setColorImages: any;
  handlePreview: (file: any) => void;
}

export default function SortableUpload({
  colorId,
  colorImages,
  setColorImages,
  handlePreview,
}: SortableUploadProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const fileList =
    colorImages.find((img) => img.colorId === colorId)?.imagesList || [];

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fileList.findIndex(
        (file) => file.uid === String(active.id)
      );
      const newIndex = fileList.findIndex(
        (file) => file.uid === String(over?.id)
      );
      const newList = arrayMove(fileList, oldIndex, newIndex);

      setColorImages((prev: ColorImage[]) => {
        const filtered = prev.filter((item) => item.colorId !== colorId);
        return [...filtered, { colorId, imagesList: newList }];
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={fileList.map((file) => file.uid)}
        strategy={verticalListSortingStrategy}
      >
        <Upload
          onPreview={handlePreview}
          multiple
          listType="picture-card"
          accept="image/*"
          fileList={fileList}
          itemRender={(originNode, file) => (
            <SortableItem id={file.uid} originNode={originNode} />
          )}
          beforeUpload={() => false}
          onChange={({ fileList }) => {
            setColorImages((prev: ColorImage[]) => {
              const filtered = prev.filter(
                (item: ColorImage) => item.colorId !== colorId
              );
              return [...filtered, { colorId, imagesList: fileList }];
            });
          }}
        >
          {fileList.length >= 8 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Yuklash</div>
            </div>
          )}
        </Upload>
      </SortableContext>
    </DndContext>
  );
}
