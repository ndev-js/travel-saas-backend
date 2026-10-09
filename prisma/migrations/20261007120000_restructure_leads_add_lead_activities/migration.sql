-- Reshape "leads" to the new pipeline design (table is empty) and add lead_activities.

-- DropIndex
DROP INDEX "leads_tenant_id_assigned_to_id_idx";
DROP INDEX "leads_tenant_id_status_idx";

-- Drop old columns, then the enums they used
ALTER TABLE "leads"
  DROP COLUMN "customer_location",
  DROP COLUMN "handling_mode",
  DROP COLUMN "lead_source",
  DROP COLUMN "lead_type",
  DROP COLUMN "phone_number";

DROP TYPE "LeadHandlingMode";
DROP TYPE "LeadType";
DROP TYPE "LeadSource";

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('website', 'referral', 'social_media', 'phone', 'email', 'walk_in', 'other');
CREATE TYPE "LeadActivityType" AS ENUM ('note', 'call', 'email', 'meeting', 'status_change');

-- AlterEnum LeadStatus
BEGIN;
CREATE TYPE "LeadStatus_new" AS ENUM ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost');
ALTER TABLE "leads" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "leads" ALTER COLUMN "status" TYPE "LeadStatus_new" USING ("status"::text::"LeadStatus_new");
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
DROP TYPE "LeadStatus_old";
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'new';
COMMIT;

-- Add new columns
ALTER TABLE "leads"
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "source" "LeadSource" NOT NULL DEFAULT 'other',
  ADD COLUMN "destination" TEXT,
  ADD COLUMN "travel_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "LeadActivityType" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
