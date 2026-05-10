interface Props {
  title: string;
  description?: string;
}

export function ReportsSectionHeader({ title, description }: Props) {
  return (
    <div className="mb-5">
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
