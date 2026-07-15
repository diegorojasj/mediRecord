import { useEffect, useRef } from 'react';
import { CalendarPlus } from 'lucide-react';

const MENU_WIDTH = 224;
const MENU_HEIGHT = 44;
const VIEWPORT_MARGIN = 8;

const SelectionMenu = ({
  position,
  onClose,
  onCreateAppointment,
}: {
  position: { x: number; y: number };
  onClose: () => void;
  onCreateAppointment: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const left = Math.min(
    Math.max(position.x, VIEWPORT_MARGIN),
    window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
  );
  const top = Math.min(
    Math.max(position.y, VIEWPORT_MARGIN),
    window.innerHeight - MENU_HEIGHT - VIEWPORT_MARGIN,
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-40 w-56 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-xl"
      style={{ left, top }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        onClick={onCreateAppointment}
      >
        <CalendarPlus className="size-4 text-muted-foreground" />
        Create appointment
      </button>
    </div>
  );
};

export default SelectionMenu;
