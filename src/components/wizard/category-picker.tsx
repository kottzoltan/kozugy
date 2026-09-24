"use client";

import { categories } from "@/lib/mock-data";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryPickerProps {
  value?: CategoryId;
  onChange: (id: CategoryId) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="listbox" aria-label="Kategória">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="option"
          aria-selected={value === cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors focus-ring",
            value === cat.id
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card hover:bg-muted/60",
          )}
        >
          <span className="text-2xl" aria-hidden>
            {cat.icon}
          </span>
          <span className="text-sm font-semibold">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
