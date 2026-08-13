"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SOURCE_TYPES } from "@/lib/types";
import { createSource, type SourceFormState } from "@/lib/actions/admin-discovery";

const initialState: SourceFormState = {};

export function AddSourceForm() {
  const [state, formAction, pending] = useActionState(createSource, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="organizationName">Organization name</Label>
        <Input id="organizationName" name="organizationName" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input id="sourceUrl" name="sourceUrl" type="url" required placeholder="https://" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sourceType">Source type</Label>
        <Select name="sourceType" defaultValue="nonprofit">
          <SelectTrigger id="sourceType" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="checkFrequency">Check frequency</Label>
        <Select name="checkFrequency" defaultValue="weekly">
          <SelectTrigger id="checkFrequency" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      {state.error && <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add Source"}
        </Button>
      </div>
    </form>
  );
}
