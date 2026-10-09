import { LeadHandlingMode, LeadSource, LeadType } from '@/generated/prisma/enums'

// Type-specific section of the create-lead form, stored in leads.details.
type FlightLeadDetails = {
  from: string
  to: string
  tripType?: string
  cabinClass?: string
}

type HotelLeadDetails = {
  city: string
  rating?: string
  rooms?: number
  boardBasis?: string
}

type VisaLeadDetails = {
  country: string
  visaType?: string
}

type TourLeadDetails = {
  destinations: string
  needVisa?: boolean
  hotel?: string
  days?: number
}

type UmrahLeadDetails = {
  route: string
  makkahNights?: number
  madinaNights?: number
  package?: string
}

type HajjLeadDetails = {
  package: string
  days?: number
}

type InsuranceLeadDetails = {
  country: string
  stay?: string
  vendor?: string
  planName?: string
}

type PackageLeadDetails = {
  requiredAt: string
  serviceDetail?: string
}

type OtherLeadDetails = {
  serviceDetail: string
}

interface LeadDetailsByType {
  flight: FlightLeadDetails
  hotel: HotelLeadDetails
  visa: VisaLeadDetails
  tour: TourLeadDetails
  umrah: UmrahLeadDetails
  hajj: HajjLeadDetails
  insurance: InsuranceLeadDetails
  package: PackageLeadDetails
  other: OtherLeadDetails
}

interface LeadCreateBase {
  fullName: string
  email?: string
  phone?: string
  customerLocation?: string
  source?: LeadSource
  startDate?: Date
  endDate?: Date
  adults?: number
  children?: number
  infants?: number
  remarks?: string
  handlingMode?: LeadHandlingMode
  createdById?: string
  assignedToId?: string
}

// One variant per lead type, so `details` is narrowed by `leadType`.
type LeadCreateReq = {
  [T in LeadType]: LeadCreateBase & { leadType: T; details: LeadDetailsByType[T] }
}[LeadType]

export { LeadCreateReq, LeadDetailsByType }
