import { Select, Form } from "antd";
import { useEffect, useState } from "react";
import { useGetList } from "../../../services/query/useGetList";
import { endpoints } from "../../../configs/endpoints";
import type { Category } from "../../../types/interface/small-slider-type";

const SelectCategory = ({
  value,
  onChange,
}: {
  value?: number | string;
  onChange?: (value: number) => void;
}) => {
  const [parentSelect, setParentSelect] = useState(true);
  const [selectedParentName, setSelectedParentName] = useState("");

  const { data: parentCategories } = useGetList<Category[]>({
    endpoint: endpoints.category.getParent,
  });

  const { data: categories, isLoading: subCategoryLoad } = useGetList<
    Category[]
  >({
    endpoint: endpoints.category.getSubByParentName + selectedParentName,
    enabled: !!selectedParentName,
  });

  useEffect(() => {
    // Reset form state if parentSelect is true again
    if (!parentSelect) return;
    setSelectedParentName("");
  }, [parentSelect]);

  return (
    <Form.Item name="categoryId">
      {parentSelect ? (
        <Select
          allowClear
          style={{ width: "100%" }}
          placeholder="Parent Kategoriya tanlang"
          onChange={(val) => {
            setSelectedParentName(val.toString());
            setParentSelect(false);
            onChange?.(val);
          }}
          options={
            parentCategories?.map((cat) => ({
              label: cat.nameUZB,
              value: cat.nameUZB,
            })) ?? []
          }
        />
      ) : (
        <Select
          onClear={() => {
            setParentSelect(true);
            setSelectedParentName("");
          }}
          showSearch
          optionFilterProp="label"
          allowClear
          loading={subCategoryLoad}
          style={{ width: "100%" }}
          placeholder="Kategoriya tanlang"
          value={typeof value === "number" ? value : undefined}
          onChange={onChange}
          options={
            categories?.map((cat) => ({
              label: cat.nameUZB,
              value: cat.id,
            })) ?? []
          }
        />
      )}
    </Form.Item>
  );
};

export default SelectCategory;
