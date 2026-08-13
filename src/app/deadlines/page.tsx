import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSavedOpportunities } from "@/lib/data/saved";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeadlinesList } from "@/components/deadlines/deadlines-list";
import { DeadlinesCalendar } from "@/components/deadlines/deadlines-calendar";

export const metadata: Metadata = { title: "Deadlines" };

export default async function DeadlinesPage() {
  await requireUser();
  const saved = await getSavedOpportunities();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Deadlines</h1>
      <p className="mt-2 text-muted-foreground">Every deadline for your saved opportunities, in one place.</p>

      <Tabs defaultValue="list" className="mt-6">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <DeadlinesList saved={saved} />
        </TabsContent>
        <TabsContent value="calendar">
          <DeadlinesCalendar saved={saved} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
