"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toggleSourceActive, deleteSource, runDiscoveryScan } from "@/lib/actions/admin-discovery";

export function SourceActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [scanning, setScanning] = React.useState(false);

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={active}
        onCheckedChange={async (v) => {
          await toggleSourceActive(id, v);
          router.refresh();
        }}
        aria-label="Active"
      />
      <Button
        variant="outline"
        size="sm"
        disabled={scanning}
        onClick={async () => {
          setScanning(true);
          await runDiscoveryScan(id);
          router.refresh();
          setScanning(false);
        }}
      >
        {scanning ? "Scanning..." : "Run Scan"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={async () => {
          if (confirm("Remove this source?")) {
            await deleteSource(id);
            router.refresh();
          }
        }}
      >
        Remove
      </Button>
    </div>
  );
}
