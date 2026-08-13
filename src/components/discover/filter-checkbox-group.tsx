"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface FilterOption {
  key: string;
  label: string;
}

export function FilterCheckboxGroup({
  options,
  selected,
  onChange,
  scrollable = false,
}: {
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  scrollable?: boolean;
}) {
  function toggle(key: string, checked: boolean) {
    if (checked) onChange([...selected, key]);
    else onChange(selected.filter((k) => k !== key));
  }

  return (
    <div className={cn("flex flex-col gap-2.5", scrollable && "max-h-56 overflow-y-auto pr-1")}>
      {options.map((option) => {
        const id = `filter-${option.key}`;
        const checked = selected.includes(option.key);
        return (
          <label
            key={option.key}
            htmlFor={id}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/90 select-none"
          >
            <Checkbox id={id} checked={checked} onCheckedChange={(v) => toggle(option.key, v === true)} />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
