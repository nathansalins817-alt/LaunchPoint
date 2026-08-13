import { AlertCircle } from "lucide-react";

export function SupabaseNotice() {
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
      <p>
        Accounts aren&rsquo;t connected yet in this preview. Add <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code> to enable sign in.
      </p>
    </div>
  );
}
