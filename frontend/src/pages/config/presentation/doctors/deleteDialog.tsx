import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DeleteDialog = ({
  doctorName,
  deleting,
  error,
  onConfirm,
  onClose,
}: {
  doctorName?: string;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={!!doctorName} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete doctor</DialogTitle>
        <DialogDescription>
          {doctorName} will be permanently removed. To keep their record, set their status to
          inactive instead.
        </DialogDescription>
      </DialogHeader>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="destructive" type="button" onClick={onConfirm} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteDialog;
