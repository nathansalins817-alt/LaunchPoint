import type { Metadata } from "next";
import { DiscoveryPreferencesForm } from "@/components/admin/discovery-preferences-form";
import { getDiscoveryPreferences } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Discovery Settings" };

export default async function DiscoverySettingsPage() {
  const preferences = await getDiscoveryPreferences();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Discovery Settings</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Configure what &ldquo;Find New Opportunities&rdquo; looks for. Every discovered candidate is scored against these
        preferences (see the match-score badge in the review queue) - this tunes relevance, it never filters out or
        auto-approves anything.
      </p>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <DiscoveryPreferencesForm preferences={preferences} />
      </div>
    </div>
  );
}
