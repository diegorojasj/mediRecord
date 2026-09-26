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
  invoiceNumber,
  deleting,
  error,
  onConfirm,
  onClose,
}: {
  invoiceNumber?: string;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={!!invoiceNumber} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete invoice</DialogTitle>
        <DialogDescription>
          Invoice {invoiceNumber} will be removed from billing. Only drafts can be deleted: invoices
          with payments or submitted to SIN must be voided instead.
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
