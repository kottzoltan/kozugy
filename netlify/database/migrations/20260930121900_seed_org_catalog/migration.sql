-- Seed national utilities + link demo issues
ALTER TABLE "organizations" ALTER COLUMN "org_type" SET DEFAULT 'egyeb';

UPDATE "organizations" SET "org_type" = 'onkormanyzat', "settlement" = 'Budaörs' WHERE "id" = 'org-budaors';
UPDATE "organizations" SET "org_type" = 'kozut' WHERE "id" = 'org-kozut';
UPDATE "organizations" SET "org_type" = 'onkormanyzat', "settlement" = 'Érd' WHERE "id" = 'org-erd';
UPDATE "organizations" SET "org_type" = 'onkormanyzat', "settlement" = 'Törökbálint' WHERE "id" = 'org-torokbalint';
UPDATE "organizations" SET "org_type" = 'onkormanyzat', "settlement" = 'Budakeszi' WHERE "id" = 'org-budakeszi';
UPDATE "organizations" SET "org_type" = 'onkormanyzat', "settlement" = 'Solymár' WHERE "id" = 'org-solymar';

INSERT INTO "organizations" ("id", "slug", "name", "org_type", "settlement", "website", "contact_email", "avg_response_days") VALUES
  ('org-fovaros', 'budapest-fovaros-onkormanyzata', 'Budapest Főváros Önkormányzata', 'fovaros', 'Budapest', 'https://budapest.hu', NULL, NULL),
  ('org-kormanyhivatal-pest', 'pest-varmegyei-kormanyhivatal', 'Pest Vármegyei Kormányhivatal', 'kormanyhivatal', NULL, 'https://kormanyhivatalok.hu', NULL, NULL),
  ('org-mvm', 'mvm-next', 'MVM Next Energiakereskedelmi Zrt.', 'kozmu', NULL, 'https://www.mvm.hu', NULL, NULL),
  ('org-elmu', 'elmu-halozati', 'ELMŰ Hálózati Kft.', 'kozmu', NULL, 'https://www.elmu.hu', NULL, NULL),
  ('org-eon', 'eon-hungaria', 'E.ON Hungária Zrt.', 'kozmu', NULL, 'https://www.eon.hu', NULL, NULL),
  ('org-foviz', 'foviz', 'Fővárosi Vízművek Zrt.', 'kozmu', 'Budapest', 'https://www.vizmuvek.hu', NULL, NULL)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "issue_organizations" ("issue_id", "organization_id", "role", "link_status", "notified_at", "responded_at")
SELECT i.id, 'org-budaors', 'illetekes', 'valaszolt', '2026-09-25T09:00:00+02:00'::timestamptz, '2026-09-27T14:30:00+02:00'::timestamptz
FROM "issues" i WHERE i.slug = 'zebra-kell-az-iskola-ele'
ON CONFLICT DO NOTHING;

INSERT INTO "issue_organizations" ("issue_id", "organization_id", "role", "link_status", "notified_at", "responded_at")
SELECT i.id, 'org-kozut', 'illetekes', 'folyamatban', '2026-09-12T10:00:00+02:00'::timestamptz, '2026-09-21T11:15:00+02:00'::timestamptz
FROM "issues" i WHERE i.slug = 'katyus-utszakasz-az-m1-felhajtonal'
ON CONFLICT DO NOTHING;

INSERT INTO "issue_organizations" ("issue_id", "organization_id", "role", "link_status")
SELECT i.id, 'org-fovaros', 'megfigyelo', 'hozzarendelve'
FROM "issues" i WHERE i.slug = 'katyus-utszakasz-az-m1-felhajtonal'
ON CONFLICT DO NOTHING;

INSERT INTO "issue_organizations" ("issue_id", "organization_id", "role", "link_status", "notified_at")
SELECT i.id, 'org-erd', 'illetekes', 'ertesitve', '2026-09-19T08:30:00+02:00'::timestamptz
FROM "issues" i WHERE i.slug = 'vilagitas-hianyzik-a-jatszoteron'
ON CONFLICT DO NOTHING;

INSERT INTO "issue_organizations" ("issue_id", "organization_id", "role", "link_status")
SELECT i.id, 'org-elmu', 'kozmu', 'hozzarendelve'
FROM "issues" i WHERE i.slug = 'vilagitas-hianyzik-a-jatszoteron'
ON CONFLICT DO NOTHING;
