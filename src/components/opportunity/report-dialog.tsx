"use client";

import * as React from "react";
import { useActionState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { reportOpportunity, type ReportFormState } from "@/lib/actions/reports";
import { REPORT_REASONS } from "@/lib/types";

const initialState: ReportFormState = { status: "idle" };

export function ReportDialog({ opportunityId }: { opportunityId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(reportOpportunity, initialState);

  React.useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => setOpen(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Flag className="size-3.5" />
          Report incorrect information
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report incorrect information</DialogTitle>
          <DialogDescription>
            Help us keep listings accurate. Your report goes to our team for review before anything changes.
          </DialogDescription>
        </DialogHeader>

        {state.status === "success" ? (
          <p className="py-4 text-sm font-medium text-success">{state.message}</p>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="opportunityId" value={opportunityId} />

            <div className="space-y-2">
              <Label>What&rsquo;s wrong?</Label>
              <RadioGroup name="reason" defaultValue={REPORT_REASONS[0]} className="gap-2">
                {REPORT_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={reason} id={`reason-${reason}`} />
                    {reason}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details (optional)</Label>
              <Textarea id="details" name="details" rows={3} placeholder="Anything specific we should know?" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporterEmail">Your email (optional)</Label>
              <Input id="reporterEmail" name="reporterEmail" type="email" placeholder="you@example.com" />
            </div>

            {state.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
