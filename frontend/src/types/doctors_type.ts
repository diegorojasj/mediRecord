export type WeekDay = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type DoctorStatus = 'active' | 'inactive' | 'retired' | 'not_available' | 'suspended';

export type WorkingHours = {
  // Hours of the day (0-23) the doctor attends, per week day
  week_days: Partial<Record<WeekDay, number[]>>;
};

export type Doctor = {
  id: string;
  first_name: string;
  first_surname: string;
  second_surname?: string | null;
  specialty: string;
  professional_registration_number: string;
  phone: string;
  schedule: WorkingHours;
  status: DoctorStatus;
  created_at: string;
  updated_at: string;
};
