import { ManagerIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@tanstack/react-router';
import H4 from '@/components/h4';
import { Card } from '@/components/ui/card';

const configSections = [
  {
    icon: ManagerIcon,
    label: 'Doctors',
    to: 'doctors',
  },
];

const ConfigPresentation = () => {
  return (
    <div className="p-6 space-y-4">
      <H4>Configuration</H4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
        {configSections.map((section) => (
          <Link key={section.label} to="/config/$section" params={{ section: section.to }}>
            <Card
              className="w-full cursor-pointer items-center gap-2 py-5 text-center transition-all hover:-translate-y-0.5 hover:ring-foreground/50 hover:shadow-sm"
            >
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg text-foreground ring-1 ring-foreground/20 transition-colors group-hover/card:bg-foreground group-hover/card:text-background">
                <HugeiconsIcon icon={section.icon} strokeWidth={1.6} size={20} />
              </div>
              <span className="text-xs font-medium text-foreground">{section.label}</span>
            </Card>
          </Link>

        ))}
      </div>
    </div>
  );
};

export default ConfigPresentation;
