import { SectionHeader } from "@/components/ui/section-header";

type SettingsPageHeaderProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function SettingsPageHeader({
  description,
  eyebrow,
  title,
}: SettingsPageHeaderProps) {
  return (
    <header className="border-b border-border/60 pb-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {eyebrow}
      </div>
      <SectionHeader
        title={title}
        description={description}
        className="mt-1 mb-0 space-y-1"
        titleClassName="text-2xl"
      />
    </header>
  );
}
