import { type ChangeEvent, type SyntheticEvent, useEffect, useState } from 'react';
import { getBusinessProfile, profileToFormState, saveBusinessProfile } from '@/lib/api/business';
import { useBusinessStore } from '@/stores/business_store';
import BusinessPresentation from '@/pages/config/presentation/business/business.presentation';
import { logoFromFile } from '@/pages/config/presentation/business/business_functions';
import {
  type FormState,
  INITIAL_STATE,
  type TextField,
} from '@/pages/config/presentation/business/business_types';

const BusinessApplication = () => {
  const publishProfile = useBusinessStore((s) => s.setProfile);
  const [saved, setSaved] = useState<FormState>(INITIAL_STATE);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getBusinessProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        const state = profileToFormState(profile);
        setSaved(state);
        setForm(state);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (changes: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...changes }));
    setJustSaved(false);
  };

  const set = (key: TextField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    update({ [key]: e.target.value });

  const onPickLogo = async (file: File) => {
    setLogoError(null);
    try {
      update({ logo: await logoFromFile(file) });
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : 'The image could not be used');
    }
  };

  const onRemoveLogo = () => {
    setLogoError(null);
    update({ logo: '' });
  };

  const onReset = () => {
    setForm(saved);
    setError(null);
    setLogoError(null);
  };

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const profile = await saveBusinessProfile(form);
      // Sidebar, tab title and invoices pick the change up right away
      publishProfile(profile);
      const state = profileToFormState(profile);
      setSaved(state);
      setForm(state);
      setJustSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the business information');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BusinessPresentation
      form={form}
      dirty={JSON.stringify(form) !== JSON.stringify(saved)}
      loading={loading}
      loadError={loadError}
      saving={saving}
      error={error}
      logoError={logoError}
      justSaved={justSaved}
      set={set}
      onPickLogo={onPickLogo}
      onRemoveLogo={onRemoveLogo}
      onReset={onReset}
      onSubmit={onSubmit}
    />
  );
};

export default BusinessApplication;
