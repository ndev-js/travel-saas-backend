import { LeadHandlingMode, LeadSource, LeadType } from '@/generated/prisma/enums'
import { z } from 'zod'

const text = (message: string) => z.string().trim().min(1, message)
const optionalText = z.string().trim().min(1).optional()
const optionalCount = z.number().int().min(0).optional()

// Fields shared by every lead type (top of the form, dates & travelers, lead handling).
const leadBaseSchema = z.object({
  fullName: text('Customer name is required'),
  email: z.string().trim().toLowerCase().email('Invalid email address').optional(),
  phone: optionalText,
  customerLocation: optionalText,
  source: z.nativeEnum(LeadSource).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  adults: z.number().int().min(1, 'At least one adult is required').default(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  remarks: optionalText,
  handlingMode: z.nativeEnum(LeadHandlingMode).default(LeadHandlingMode.self),
  createdById: z.string().uuid('Invalid created by id').optional(),
  assignedToId: z.string().uuid('Invalid assigned to id').optional(),
})

// Type-specific section of the form: `details` is validated against `leadType`.
const leadByTypeSchema = z.discriminatedUnion('leadType', [
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.flight),
    details: z.object({
      from: text('From is required'),
      to: text('To is required'),
      tripType: optionalText,
      cabinClass: optionalText,
    }),
  }),
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.hotel),
    details: z.object({
      city: text('City is required'),
      rating: optionalText,
      rooms: z.number().int().min(1).optional(),
      boardBasis: optionalText,
    }),
  }),
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.visa),
    details: z.object({
      country: text('Country is required'),
      visaType: optionalText,
    }),
  }),
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.tour),
    details: z.object({
      destinations: text('Destination is required'),
      needVisa: z.boolean().optional(),
      hotel: optionalText,
      days: z.number().int().min(1).optional(),
    }),
  }),
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.umrah),
    details: z.object({
      route: text('Route is required'),
      makkahNights: optionalCount,
      madinaNights: optionalCount,
      package: optionalText,
    }),
  }),
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.hajj),
    details: z.object({
      package: text('Package is required'),
      days: z.number().int().min(1).optional(),
    }),
  }),
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.insurance),
    details: z.object({
      country: text('Country is required'),
      stay: optionalText,
      vendor: optionalText,
      planName: optionalText,
    }),
  }),
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.package),
    details: z.object({
      requiredAt: text('Required at is required'),
      serviceDetail: optionalText,
    }),
  }),
  leadBaseSchema.extend({
    leadType: z.literal(LeadType.other),
    details: z.object({
      serviceDetail: text('Service detail is required'),
    }),
  }),
])

export const createLeadSchema = leadByTypeSchema
  .refine((lead) => !lead.startDate || !lead.endDate || lead.endDate >= lead.startDate, {
    path: ['endDate'],
    message: 'End date cannot be before start date',
  })
  // "Create for Others" and "Create and Transfer to Staff" need a staff member to hand the lead to.
  .refine((lead) => lead.handlingMode === LeadHandlingMode.self || !!lead.assignedToId, {
    path: ['assignedToId'],
    message: 'Assigned to is required when the lead is created for or transferred to someone else',
  })

export const leadTenantIdParamSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant id'),
})
