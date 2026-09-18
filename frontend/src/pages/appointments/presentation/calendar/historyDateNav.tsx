import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HistoryDateNav = ({
  label,
  onPrevious,
  onNext,
}: {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
}) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button type="button" variant="ghost" size="icon" onClick={onPrevious}>
        <ChevronLeft className="size-4" />
        <span className="sr-only">Previous month</span>
      </Button>
      <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold capitalize text-foreground">
        {label}
      </span>
      <Button type="button" variant="ghost" size="icon" onClick={onNext}>
        <ChevronRight className="size-4" />
        <span className="sr-only">Next month</span>
      </Button>
    </div>
  );
};

export default HistoryDateNav;
