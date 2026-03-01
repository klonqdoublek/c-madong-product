"use client";

interface Props {
  flexJson: Record<string, unknown> | null;
}

export function FlexMessagePreview({ flexJson }: Props) {
  if (!flexJson) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 text-sm text-muted-foreground">
        No Flex JSON to preview
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-xl bg-white p-4 shadow-md">
        <pre className="max-h-96 overflow-auto text-xs text-gray-700">
          {JSON.stringify(flexJson, null, 2)}
        </pre>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        LINE Flex Message Preview (JSON)
      </p>
    </div>
  );
}
