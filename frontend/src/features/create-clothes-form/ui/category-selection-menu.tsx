import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/ui/dropdown-menu";
import type { ClothesCategory } from "@capsule/common";
import { objectEntries } from "@/shared/lib/typescript/object-entries";

const mapCategoryToLabel = {
  SHIRT: "Футболка",
  PANTS: "Штаны",
  DRESS: "Платье",
  JACKET: "Куртка",
  COAT: "Пальто",
  SKIRT: "Юбка",
  SHORTS: "Шорты",
  JEANS: "Джинсы",
  SWIMWEAR: "Спортивная одежда",
  ACCESSORY: "Аксессуары",
  SHOES: "Обувь",
  BAG: "Сумка",
  OTHER: "Другое",
  UNDERWEAR: "Нижнее белье",
  SLEEPWEAR: "Спальное белье",
  SWIMSUIT: "Купальник",
} as const satisfies Record<ClothesCategory, string>;

export function CategorySelectionMenu({
  value,
  onChange,
}: {
  value: Maybe<ClothesCategory>;
  onChange: (value: ClothesCategory) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer border border-border py-1 rounded-md w-full">
        {value ? mapCategoryToLabel[value] : "Выберите категорию"}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Категория</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {objectEntries(mapCategoryToLabel).map(([category, label]) => (
          <DropdownMenuItem onClick={() => onChange(category)} key={category}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
