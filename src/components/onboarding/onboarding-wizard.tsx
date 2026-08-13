"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GRADES } from "@/lib/types";
import { ONBOARDING_INTERESTS, ONBOARDING_OPPORTUNITY_TYPES } from "@/lib/constants";
import { completeOnboarding, skipOnboarding, type OnboardingFormState } from "@/lib/actions/onboarding";

const STEPS = ["Grade", "Interests", "Looking for", "Location", "Cost"] as const;

const LOCATION_OPTIONS = [
  { value: "remote", label: "Remote", description: "I mainly want online / remote opportunities." },
  { value: "near-me", label: "Near Me", description: "I prefer opportunities close to home." },
  { value: "anywhere", label: "Anywhere in the U.S.", description: "I'm open to traveling anywhere." },
];

const COST_OPTIONS = [
  { value: "free-only", label: "Free only", description: "Only show me opportunities with no cost." },
  { value: "financial-aid", label: "Financial aid available", description: "Show paid programs that offer aid too." },
  { value: "any", label: "Any", description: "Cost doesn't matter to me." },
];

function ToggleCard({
  label,
  description,
  selected,
  onClick,
  icon,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        selected ? "border-primary bg-accent/60" : "border-border hover:bg-muted"
      )}
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
      </span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        )}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

const initialState: OnboardingFormState = {};

export function OnboardingWizard({ firstName }: { firstName: string }) {
  const [state, formAction, pending] = useActionState(completeOnboarding, initialState);
  const [step, setStep] = React.useState(0);
  const [grade, setGrade] = React.useState("");
  const [interests, setInterests] = React.useState<string[]>([]);
  const [oppTypes, setOppTypes] = React.useState<string[]>([]);
  const [locationPreference, setLocationPreference] = React.useState("");
  const [costPreference, setCostPreference] = React.useState("");

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const canAdvance = step !== 0 || grade !== "";
  const isLast = step === STEPS.length - 1;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          Welcome{firstName ? `, ${firstName}` : ""} — let&rsquo;s personalize LaunchPoint for you.
        </p>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
      </div>

      <form action={formAction}>
        <input type="hidden" name="grade" value={grade} />
        {interests.map((i) => (
          <input key={i} type="hidden" name="interests" value={i} />
        ))}
        {oppTypes.map((o) => (
          <input key={o} type="hidden" name="opportunityInterests" value={o} />
        ))}
        <input type="hidden" name="locationPreference" value={locationPreference} />
        <input type="hidden" name="costPreference" value={costPreference} />

        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground">What grade are you in?</h2>
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(String(g))}
                  aria-pressed={grade === String(g)}
                  className={cn(
                    "rounded-xl border py-4 text-center text-lg font-semibold transition-colors",
                    grade === String(g) ? "border-primary bg-accent/60 text-primary" : "border-border hover:bg-muted"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground">Choose your interests</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick as many as apply — you can change these later.</p>
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {ONBOARDING_INTERESTS.map((g) => (
                <ToggleCard
                  key={g.label}
                  label={g.label}
                  selected={interests.includes(g.label)}
                  onClick={() => toggle(interests, setInterests, g.label)}
                  icon={<g.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground">What are you looking for?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select the types of opportunities you want to see first.</p>
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {ONBOARDING_OPPORTUNITY_TYPES.map((c) => (
                <ToggleCard key={c} label={c} selected={oppTypes.includes(c)} onClick={() => toggle(oppTypes, setOppTypes, c)} />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground">Location preference</h2>
            <div className="mt-5 space-y-2.5">
              {LOCATION_OPTIONS.map((opt) => (
                <ToggleCard
                  key={opt.value}
                  label={opt.label}
                  description={opt.description}
                  selected={locationPreference === opt.value}
                  onClick={() => setLocationPreference(opt.value)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground">Cost preference</h2>
            <div className="mt-5 space-y-2.5">
              {COST_OPTIONS.map((opt) => (
                <ToggleCard
                  key={opt.value}
                  label={opt.label}
                  description={opt.description}
                  selected={costPreference === opt.value}
                  onClick={() => setCostPreference(opt.value)}
                />
              ))}
            </div>
          </div>
        )}

        {state.error && <p className="mt-4 text-sm text-destructive">{state.error}</p>}

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => skipOnboarding()} className="text-sm text-muted-foreground hover:text-foreground">
              Skip for now
            </button>
            {isLast ? (
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Finish"}
              </Button>
            ) : (
              <Button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canAdvance}>
                Next
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
