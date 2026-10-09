-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('flight', 'hotel', 'visa', 'tour', 'umrah', 'hajj', 'insurance', 'package', 'other');

-- CreateEnum
CREATE TYPE "LeadHandlingMode" AS ENUM ('self', 'on_behalf', 'transferred');

-- DropForeignKey
ALTER TABLE "lead_activities" DROP CONSTRAINT "lead_activities_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "lead_activities" DROP CONSTRAINT "lead_activities_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "lead_activities" DROP CONSTRAINT "lead_activities_user_id_fkey";

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "destination",
DROP COLUMN "notes",
DROP COLUMN "travel_date",
ADD COLUMN     "adults" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "children" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "customer_location" TEXT,
ADD COLUMN     "details" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "end_date" DATE,
ADD COLUMN     "handling_mode" "LeadHandlingMode" NOT NULL DEFAULT 'self',
ADD COLUMN     "infants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lead_type" "LeadType" NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "start_date" DATE;

-- DropTable
DROP TABLE "lead_activities";

-- DropEnum
DROP TYPE "LeadActivityType";

-- CreateIndex
CREATE INDEX "leads_tenant_id_status_idx" ON "leads"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "leads_tenant_id_lead_type_idx" ON "leads"("tenant_id", "lead_type");

-- CreateIndex
CREATE INDEX "leads_tenant_id_assigned_to_id_idx" ON "leads"("tenant_id", "assigned_to_id");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

