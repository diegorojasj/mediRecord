import { useEffect, useState } from 'react';
import { deleteDoctor, type DoctorOptions, getAllDoctorOptions, getDoctors } from '@/lib/api/doctors';
import DoctorsPresentation from '@/pages/config/presentation/doctors/doctors.presentation';
import type { Doctor } from '@/types/doctors_type';

const DoctorsApplication = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [options, setOptions] = useState<DoctorOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Doctor | undefined>();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([getDoctors(), getAllDoctorOptions()])
      .then(([d, o]) => {
        setDoctors(d);
        setOptions(o);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([getDoctors(), getAllDoctorOptions()])
      .then(([d, o]) => {
        if (cancelled) return;
        setDoctors(d);
        setOptions(o);
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

  const onRequestDelete = (doctor: Doctor) => {
    setDeleteError(null);
    setPendingDelete(doctor);
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
      await deleteDoctor(pendingDelete.id);
      setDoctors((prev) => prev.filter((d) => d.id !== pendingDelete.id));
      setPendingDelete(undefined);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete doctor');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DoctorsPresentation
      doctors={doctors}
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

export default DoctorsApplication;
