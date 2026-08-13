import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSavedOpportunities } from "@/lib/data/saved";
import { SavedBoard } from "@/components/saved/saved-board";

export const metadata: Metadata = { title: "Saved Opportunities" };

export default async function SavedPage() {
  await requireUser();
  const saved = await getSavedOpportunities();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Saved Opportunities</h1>
      <p className="mt-2 text-muted-foreground">
        Track where you are in the process — from interested to accepted.
      </p>
      <SavedBoard saved={saved} />
    </div>
  );
}
