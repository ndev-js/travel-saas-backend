-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('FLIGHT', 'HOTEL', 'VISA', 'TOUR', 'UMRAH', 'HAJJ', 'INSURANCE', 'PACKAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WALK_IN', 'REFERENCE', 'PHONE_CALL', 'WEBSITE', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "LeadHandlingMode" AS ENUM ('SELF', 'ON_BEHALF', 'TRANSFERRED');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT,
    "customer_location" TEXT,
    "lead_type" "LeadType",
    "lead_source" "LeadSource",
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "handling_mode" "LeadHandlingMode" NOT NULL DEFAULT 'SELF',
    "notes" TEXT,
    "assigned_to_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_tenant_id_status_idx" ON "leads"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "leads_tenant_id_assigned_to_id_idx" ON "leads"("tenant_id", "assigned_to_id");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
