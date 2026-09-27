import { create } from 'zustand';
import { APP_NAME } from '@/consts/const_global';
import { getBusinessProfile } from '@/lib/api/business';
import type { BusinessProfile } from '@/types/business_type';

type BusinessStore = {
  profile: BusinessProfile | null;
  loaded: boolean;
  load: () => Promise<void>;
  setProfile: (profile: BusinessProfile) => void;
};

// The clinic's identity, shared by the sidebar, the tab title and printed invoices
export const useBusinessStore = create<BusinessStore>((set, get) => ({
  profile: null,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      set({ profile: await getBusinessProfile(), loaded: true });
    } catch {
      // Without a profile the app keeps its own name and icon
      set({ loaded: true });
    }
  },
  setProfile: (profile) => set({ profile, loaded: true }),
}));

export const useClinicName = () => useBusinessStore((s) => s.profile?.name || APP_NAME);
