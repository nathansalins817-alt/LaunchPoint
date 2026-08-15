-- Adds "Hackathon" as its own category, split out from "Competition" now
-- that the discovery pipeline is surfacing real hackathons (MLH, Devpost-style
-- listings) that deserve their own filter rather than being lumped in.

alter table opportunities drop constraint opportunities_category_check;
alter table opportunities add constraint opportunities_category_check check (
  category in ('Internship','Research','Summer Program','Scholarship','Competition','Hackathon','Volunteering','Entrepreneurship','Fellowship','Academic Program')
);

alter table opportunity_submissions drop constraint opportunity_submissions_category_check;
alter table opportunity_submissions add constraint opportunity_submissions_category_check check (
  category in ('Internship','Research','Summer Program','Scholarship','Competition','Hackathon','Volunteering','Entrepreneurship','Fellowship','Academic Program')
);

-- Recategorize the hackathons the discovery pipeline already approved under
-- "Competition" (the only option available to it before this migration) so
-- the new Hackathon filter isn't empty on day one.
update opportunities set category = 'Hackathon'
where category = 'Competition' and title ilike '%hack%';
