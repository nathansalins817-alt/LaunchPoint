"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORGANIZATION_TYPES } from "@/lib/types";
import type { OrgFormState } from "@/lib/actions/admin-organizations";
import type { OrganizationRow } from "@/lib/data/admin";

export function OrganizationForm({
  action,
  organization,
}: {
  action: (prevState: OrgFormState, formData: FormData) => Promise<OrgFormState>;
  organization?: OrganizationRow;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={organization?.name} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (auto-generated if blank)</Label>
        <Input id="slug" name="slug" defaultValue={organization?.slug} placeholder="nasa" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="organizationType">Type</Label>
        <Select name="organizationType" defaultValue={organization?.organization_type ?? "Company"}>
          <SelectTrigger id="organizationType" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORGANIZATION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="url" defaultValue={organization?.website} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="logoUrl">Logo URL (optional)</Label>
        <Input id="logoUrl" name="logoUrl" type="url" defaultValue={organization?.logo_url ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={organization?.description} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : organization ? "Save Changes" : "Create Organization"}
        </Button>
      </div>
    </form>
  );
}
