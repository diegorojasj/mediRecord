import { useEffect, useState } from 'react';
import PatientsPresentation from '../presentation/patients.presentation';
import type { Patient } from '@/types/patients_type';
import { getPatients, getAllPatientOptions, type PatientOptions } from '@/lib/api/patients';

const PatientsApplication = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [options, setOptions] = useState<PatientOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([getPatients(), getAllPatientOptions()])
      .then(([p, o]) => {
        setPatients(p);
        setOptions(o);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([getPatients(), getAllPatientOptions()])
      .then(([p, o]) => {
        if (cancelled) return;
        setPatients(p);
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

  return (
    <PatientsPresentation
      patients={patients}
      options={options}
      loading={loading}
      error={error}
      onRefresh={load}
    />
  );
};

export default PatientsApplication;
