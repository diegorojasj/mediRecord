import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMoney, itemSubtotal } from '../billing_functions';
import type { ItemFormState } from './creationForm_types';

const ItemsEditor = ({
  items,
  currency,
  disabled,
  onChange,
  onAdd,
  onRemove,
}: {
  items: ItemFormState[];
  currency: string;
  disabled?: boolean;
  onChange: (index: number, key: keyof ItemFormState, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) => (
  <div className="flex flex-col gap-3">
    {items.map((item, index) => (
      // Items have no id of their own: the position identifies them while editing
      <div key={index} className="rounded-md border border-border p-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-6 space-y-1 sm:col-span-4">
            <Label htmlFor={`item_description_${index}`}>Description *</Label>
            <Input
              id={`item_description_${index}`}
              value={item.description}
              onChange={(e) => onChange(index, 'description', e.target.value)}
              placeholder="General medical consultation"
              disabled={disabled}
              required
            />
          </div>
          <div className="col-span-6 space-y-1 sm:col-span-2">
            <Label htmlFor={`item_code_${index}`}>SIN code</Label>
            <Input
              id={`item_code_${index}`}
              value={item.sin_service_code}
              onChange={(e) => onChange(index, 'sin_service_code', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor={`item_quantity_${index}`}>Quantity *</Label>
            <Input
              id={`item_quantity_${index}`}
              type="number"
              min="0.01"
              step="0.01"
              value={item.quantity}
              onChange={(e) => onChange(index, 'quantity', e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor={`item_unit_price_${index}`}>Unit price *</Label>
            <Input
              id={`item_unit_price_${index}`}
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price}
              onChange={(e) => onChange(index, 'unit_price', e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          <div className="col-span-2 flex items-end justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Subtotal</p>
              <p className="truncate text-xs font-semibold text-foreground">
                {formatMoney(itemSubtotal(item), currency)}
              </p>
            </div>
            {items.length > 1 && !disabled && (
              <button
                type="button"
                aria-label="Remove item"
                className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                onClick={() => onRemove(index)}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
    {!disabled && (
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={onAdd}>
        <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
        Add item
      </Button>
    )}
  </div>
);

export default ItemsEditor;
