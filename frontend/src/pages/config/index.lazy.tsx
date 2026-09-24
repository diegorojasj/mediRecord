import { createLazyFileRoute } from '@tanstack/react-router';
import ConfigApplication from '@/pages/config/application/config.application';

export const Route = createLazyFileRoute('/config/')({
  component: ConfigApplication,
});
