import { useEffect, useState } from 'react';
import { getAppointments, getConstAppointmentType } from '@/lib/api/appointments';
import { getConstPaymentMethod, getInvoices } from '@/lib/api/billing';
import { getConstDoctorSpecialty, getDoctors } from '@/lib/api/doctors';
import { getPatients } from '@/lib/api/patients';
import { Skeleton } from '@/components/ui/skeleton';
import HomePresentation, {
  type DashboardData,
  type DashboardOptions,
} from '@/pages/home/presentation/home.presentation';

type Loaded = { data: DashboardData; options: DashboardOptions; failedSources: string[]; now: Date };

// Each source loads on its own: a service being down leaves its figures empty, not the page
const settle = async <T,>(name: string, load: () => Promise<T>, fallback: T, failed: string[]) => {
  try {
    return await load();
  } catch {
    failed.push(name);
    return fallback;
  }
};

async function loadDashboard(): Promise<Loaded> {
  const failed: string[] = [];
  const [appointments, invoices, patients, doctors, appointmentType, paymentMethod, specialty] = await Promise.all([
    settle('appointments', getAppointments, [], failed),
    settle('invoices', getInvoices, [], failed),
    settle('patients', getPatients, [], failed),
    settle('doctors', getDoctors, [], failed),
    // Labels only: without them the raw values are shown humanized
    getConstAppointmentType().catch(() => []),
    getConstPaymentMethod().catch(() => []),
    getConstDoctorSpecialty().catch(() => []),
  ]);
  return {
    data: { appointments, invoices, patients, doctors },
    options: { appointmentType, paymentMethod, specialty },
    failedSources: failed,
    now: new Date(),
  };
}

const HomeApplication = () => {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadDashboard().then((result) => {
      if (cancelled) return;
      setLoaded(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onRefresh = () => {
    setLoading(true);
    loadDashboard().then((result) => {
      setLoaded(result);
      setLoading(false);
    });
  };

  if (!loaded) {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <HomePresentation
      data={loaded.data}
      options={loaded.options}
      failedSources={loaded.failedSources}
      loading={loading}
      onRefresh={onRefresh}
      now={loaded.now}
    />
  );
};

export default HomeApplication;
