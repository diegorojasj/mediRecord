import { PrinterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Invoice } from '@/types/billing_type';
import type { BusinessProfile } from '@/types/business_type';
import type { Patient } from '@/types/patients_type';
import { ClinicInvoice } from './clinicInvoice';
import { pageStyle, toInvoiceClinic, toInvoiceView } from './invoice_functions';

// Printer button that opens an A4 preview; only the sheet itself is printed
export function PrintableInvoice({
  invoice,
  patient,
  business,
}: {
  invoice: Invoice;
  patient?: Patient;
  business: BusinessProfile | null;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const view = toInvoiceView(invoice, patient);
  const clinic = toInvoiceClinic(business);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${view.number} - ${view.patient.name}`,
    pageStyle: pageStyle(clinic.name, view.number),
    // Fonts and the logo must be ready or the first print comes out with fallbacks
    onBeforePrint: async () => {
      await document.fonts.ready;
      const images = contentRef.current?.querySelectorAll('img') ?? [];
      await Promise.all([...images].map((img) => img.decode().catch(() => undefined)));
    },
    onAfterPrint: () => setPrinting(false),
    onPrintError: () => setPrinting(false),
  });

  return (
    <Dialog>
      <Tooltip delayDuration={800}>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Print invoice"
              className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <HugeiconsIcon icon={PrinterIcon} size={12} strokeWidth={2} />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Print</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="flex max-h-[92vh] flex-col gap-3 sm:max-w-[calc(210mm+5rem)]">
        <DialogHeader>
          <DialogTitle>Invoice {view.number}</DialogTitle>
          <DialogDescription>
            Print it or choose “Save as PDF” in the print dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="ci-canvas min-h-0 flex-1 overflow-auto rounded-md">
          <ClinicInvoice ref={contentRef} invoice={view} clinic={clinic} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={printing}
            onClick={() => {
              setPrinting(true);
              handlePrint();
            }}
          >
            <HugeiconsIcon icon={PrinterIcon} size={14} strokeWidth={2} />
            {printing ? 'Preparing…' : 'Print / Save PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
