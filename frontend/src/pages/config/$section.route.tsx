import { createFileRoute, notFound } from '@tanstack/react-router';

const KNOWN_SECTIONS = ['doctors'];

export const Route = createFileRoute('/config/$section')({
  beforeLoad: ({ params }) => {
    if (!KNOWN_SECTIONS.includes(params.section)) {
      throw notFound();
    }
  },
});
