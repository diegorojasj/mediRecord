import { createLazyFileRoute } from '@tanstack/react-router';
import ConfigSectionApplication from '@/pages/config/application/configSection.application';

export const Route = createLazyFileRoute('/config/$section')({
  component: ConfigSectionApplication,
});
