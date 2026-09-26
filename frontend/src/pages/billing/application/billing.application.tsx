import { useEffect, useState } from 'react';
import {
  type BillingOptions,
  deleteInvoice,
  getAllBillingOptions,
  getInvoices,
} from '@/lib/api/billing';
import { getPatients } from '@/lib/api/patients';
import BillingPresentation from '@/pages/billing/presentation/billing.presentation';
import type { Invoice } from '@/types/billing_type';
import type { Patient } from '@/types/patients_type';

// Patient names are a nice-to-have on the list: if they can't be loaded,
// invoices still show (with the receiver name) instead of failing the whole page
const loadAll = () =>
  Promise.all([getInvoices(), getAllBillingOptions(), getPatients().catch(() => [])]);

const BillingApplication = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [options, setOptions] = useState<BillingOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Invoice | undefined>();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    loadAll()
      .then(([i, o, p]) => {
        setInvoices(i);
        setOptions(o);
        setPatients(p);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    loadAll()
      .then(([i, o, p]) => {
        if (cancelled) return;
        setInvoices(i);
        setOptions(o);
        setPatients(p);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const onRequestDelete = (invoice: Invoice) => {
    setDeleteError(null);
    setPendingDelete(invoice);
  };

  const onCancelDelete = () => {
    if (deleting) return;
    setPendingDelete(undefined);
  };

  const onConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteInvoice(pendingDelete.id);
      setInvoices((prev) => prev.filter((i) => i.id !== pendingDelete.id));
      setPendingDelete(undefined);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete invoice');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <BillingPresentation
      invoices={invoices}
      patients={patients}
      options={options}
      loading={loading}
      error={error}
      pendingDelete={pendingDelete}
      deleting={deleting}
      deleteError={deleteError}
      onRequestDelete={onRequestDelete}
      onCancelDelete={onCancelDelete}
      onConfirmDelete={onConfirmDelete}
      onRefresh={load}
    />
  );
};

export default BillingApplication;
