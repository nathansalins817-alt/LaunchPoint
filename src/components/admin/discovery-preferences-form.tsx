"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateDiscoveryPreferences } from "@/lib/actions/admin-discovery";
import { DISCOVERY_INTERESTS, FORMAT_PREFERENCES } from "@/lib/discovery/constants";
import { CATEGORIES, GRADES } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type Preferences = Database["public"]["Tables"]["discovery_preferences"]["Row"] | null;

export function DiscoveryPreferencesForm({ preferences }: { preferences: Preferences }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setSaved(false);
    await updateDiscoveryPreferences(formData);
    router.refresh();
    setPending(false);
    setSaved(true);
  }

  return (
    <form action={action} className="space-y-6">
      <div>
        <Label className="text-sm font-semibold text-foreground">Interests</Label>
        <p className="text-xs text-muted-foreground">Candidates tagged with these get a higher match score.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DISCOVERY_INTERESTS.map((interest) => (
            <label key={interest} className="flex items-center gap-2 text-sm">
              <Checkbox name="interests" value={interest} defaultChecked={preferences?.interests.includes(interest)} />
              {interest}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-foreground">Opportunity Type</Label>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 text-sm">
              <Checkbox name="opportunityTypes" value={category} defaultChecked={preferences?.opportunity_types.includes(category)} />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="minGrade">Min grade</Label>
          <Select name="minGrade" defaultValue={preferences?.min_grade ? String(preferences.min_grade) : "none"}>
            <SelectTrigger id="minGrade" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any</SelectItem>
              {GRADES.map((g) => (
                <SelectItem key={g} value={String(g)}>
                  Grade {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxGrade">Max grade</Label>
          <Select name="maxGrade" defaultValue={preferences?.max_grade ? String(preferences.max_grade) : "none"}>
            <SelectTrigger id="maxGrade" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any</SelectItem>
              {GRADES.map((g) => (
                <SelectItem key={g} value={String(g)}>
                  Grade {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="formatPreference">Online/in-person</Label>
          <Select name="formatPreference" defaultValue={preferences?.format_preference ?? "any"}>
            <SelectTrigger id="formatPreference" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_PREFERENCES.map((f) => (
                <SelectItem key={f} value={f}>
                  {f === "any" ? "Any" : f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="geographicNotes">Geographic restrictions (optional)</Label>
        <Textarea
          id="geographicNotes"
          name="geographicNotes"
          rows={2}
          defaultValue={preferences?.geographic_notes ?? ""}
          placeholder="e.g. prioritize opportunities open to California students"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Preferences"}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
      </div>
    </form>
  );
}
