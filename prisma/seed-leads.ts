import { prisma } from '../src/lib/prisma';
import type { Prisma } from '../src/generated/prisma/client';
import {
  LeadHandlingMode,
  LeadSource,
  LeadStatus,
  LeadType,
  TenantStatus,
} from '../src/generated/prisma/enums';

type SampleLead = Omit<Prisma.LeadCreateManyInput, 'tenantId'>;

// One lead per "Lead Type" of the create-lead form, so every shape of
// `details` is covered.
const sampleLeads: SampleLead[] = [
  {
    fullName: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phone: '+923001234567',
    customerLocation: 'Lahore',
    leadType: LeadType.flight,
    source: LeadSource.phone,
    status: LeadStatus.new,
    details: { from: 'LHE', to: 'DXB', tripType: 'return', cabinClass: 'economy' },
    startDate: new Date('2026-11-15'),
    endDate: new Date('2026-11-25'),
    adults: 2,
    children: 1,
    infants: 0,
    remarks: 'Prefers a morning departure.',
  },
  {
    fullName: 'Sara Malik',
    email: 'sara.malik@example.com',
    customerLocation: 'Karachi',
    leadType: LeadType.hotel,
    source: LeadSource.website,
    status: LeadStatus.contacted,
    details: { city: 'Istanbul', rating: '4 star', rooms: 2, boardBasis: 'bed and breakfast' },
    startDate: new Date('2026-12-05'),
    endDate: new Date('2026-12-10'),
    adults: 4,
    remarks: 'Rooms close to Taksim Square.',
  },
  {
    fullName: 'Bilal Hussain',
    phone: '+923211112233',
    customerLocation: 'Islamabad',
    leadType: LeadType.visa,
    source: LeadSource.walk_in,
    status: LeadStatus.new,
    details: { country: 'United Kingdom', visaType: 'visit' },
    startDate: new Date('2027-01-20'),
    adults: 1,
  },
  {
    fullName: 'Fatima Noor',
    email: 'fatima.noor@example.com',
    customerLocation: 'Faisalabad',
    leadType: LeadType.tour,
    source: LeadSource.social_media,
    status: LeadStatus.qualified,
    details: { destinations: 'Baku, Gabala', needVisa: true, hotel: '4 star', days: 7 },
    startDate: new Date('2026-12-20'),
    endDate: new Date('2026-12-27'),
    adults: 2,
    children: 2,
    remarks: 'Family trip, needs a vehicle with a child seat.',
  },
  {
    fullName: 'Usman Tariq',
    email: 'usman.tariq@example.com',
    phone: '+923334445566',
    customerLocation: 'Multan',
    leadType: LeadType.umrah,
    source: LeadSource.referral,
    status: LeadStatus.proposal_sent,
    details: { route: 'Jeddah - Makkah - Madina - Jeddah', makkahNights: 8, madinaNights: 6, package: 'economy' },
    startDate: new Date('2027-02-10'),
    endDate: new Date('2027-02-24'),
    adults: 3,
    infants: 1,
  },
  {
    fullName: 'Haji Abdul Rehman',
    phone: '+923005556677',
    customerLocation: 'Peshawar',
    leadType: LeadType.hajj,
    source: LeadSource.referral,
    status: LeadStatus.new,
    details: { package: 'Private Hajj - Aziziyah', days: 21 },
    startDate: new Date('2027-05-10'),
    endDate: new Date('2027-05-31'),
    adults: 2,
  },
  {
    fullName: 'Zainab Ali',
    email: 'zainab.ali@example.com',
    customerLocation: 'Lahore',
    leadType: LeadType.insurance,
    source: LeadSource.email,
    status: LeadStatus.won,
    details: { country: 'Schengen', stay: '30 days', vendor: 'Adamjee', planName: 'Travel Sure Gold' },
    startDate: new Date('2026-11-01'),
    endDate: new Date('2026-11-30'),
    adults: 1,
  },
  {
    fullName: 'Omar Farooq',
    email: 'omar.farooq@example.com',
    phone: '+923451239876',
    customerLocation: 'Sialkot',
    leadType: LeadType.package,
    source: LeadSource.website,
    status: LeadStatus.contacted,
    details: { requiredAt: 'Maldives', serviceDetail: 'Honeymoon package with water villa and transfers' },
    startDate: new Date('2027-03-05'),
    endDate: new Date('2027-03-11'),
    adults: 2,
  },
  {
    fullName: 'Hina Raza',
    customerLocation: 'Rawalpindi',
    leadType: LeadType.other,
    source: LeadSource.other,
    status: LeadStatus.lost,
    details: { serviceDetail: 'Airport meet and assist at DXB' },
    startDate: new Date('2026-10-28'),
    adults: 1,
    remarks: 'Booked with another agency.',
  },
];

export async function seedLeads() {
  // Tenants that already have a user come first, so some leads get an owner.
  const tenants = await prisma.tenant.findMany({
    where: { status: TenantStatus.active, deletedAt: null },
    orderBy: [{ users: { _count: 'desc' } }, { createdAt: 'asc' }],
    take: 3,
    select: {
      id: true,
      name: true,
      users: { where: { deletedAt: null }, select: { id: true }, take: 1 },
      _count: { select: { leads: true } },
    },
  });

  let created = 0;

  for (const tenant of tenants) {
    if (tenant._count.leads > 0) {
      console.log(`Skipping "${tenant.name}": already has leads`);
      continue;
    }

    const userId = tenant.users[0]?.id ?? null;

    const result = await prisma.lead.createMany({
      data: sampleLeads.map((lead) => ({
        ...lead,
        tenantId: tenant.id,
        handlingMode: LeadHandlingMode.self,
        createdById: userId,
        assignedToId: userId,
      })),
    });

    created += result.count;
  }

  console.log(`Successfully seeded ${created} leads`);

  return created;
}

// Allows `npm run prisma:seed:leads` without re-running the other seeders.
if (require.main === module) {
  seedLeads()
    .catch((e) => {
      console.error('Lead seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
