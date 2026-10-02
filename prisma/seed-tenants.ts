import { prisma } from '../src/lib/prisma';
import {
  TenantPlan,
  TenantStatus,
} from '../src/generated/prisma/enums';

export async function seedTenants() {
  const tenantNames = [
    'Skyline Travels',
    'Global Adventures',
    'Desert Holidays',
    'Premium Travel Services',
    'Oceanic Tours',
    'Mountain Escape',
    'Luxury Getaways',
    'Budget Explorer',
    'World Wide Travel',
    'Dream Vacation',
    'Golden Journey',
    'Travel Horizon',
    'Blue Sky Holidays',
    'Wanderlust Travel',
    'Next Destination',
    'Elite Voyages',
    'Happy Trails Travel',
    'Sunrise Tours',
    'Moonlight Travels',
    'Safari Adventures',
    'Royal Journey',
    'Paradise Holidays',
    'City Explorer',
    'Coastal Escape',
    'Adventure Point',
    'Globe Trotters',
    'Easy Travel Hub',
    'Smart Trip Planner',
    'Holiday Makers',
    'Travel Experts',
    'Trip Masters',
    'Fly Away Travels',
    'Explore World Tours',
    'Vacation Express',
    'Destination Dreams',
    'Journey Makers',
    'Nomad Travel',
    'Holiday Connect',
    'Travel Gateway',
    'Amazing Destinations',
    'Jet Set Travels',
    'Travel Compass',
    'Escape Routes',
    'Holiday Horizon',
    'Infinite Journeys',
    'Urban Adventures',
    'Nature Trails Travel',
    'Discovery Tours',
    'Beyond Borders Travel',
    'Travel Legends',
    'Wonder World Tours',
    'Roam Free Travel',
    'Passport Adventures',
    'Journey Beyond',
    'Epic Escapes',
    'Dream Route Travel',
    'Voyage Masters',
    'Explore More',
    'Travel Universe',
    'World Explorer Tours',
    'Happy Journey Travel',
    'Smart Vacation',
    'Golden Holidays',
    'Blue Ocean Travels',
    'Desert Explorer',
    'Mountain Adventures',
    'Island Escape',
    'City Break Tours',
    'Luxury Journey',
    'Premium Holidays',
    'Family Travel Hub',
    'Corporate Travel Solutions',
    'Business Trip Experts',
    'Global Travel Network',
    'Travel Point',
    'Holiday Club',
    'Adventure Seekers',
    'Sky Travel',
    'Sun Travel',
    'Royal Holidays',
    'Elite Travel Group',
    'Future Travel',
    'Quick Trip',
    'Easy Holidays',
    'Travel World',
    'Explore Planet',
    'Destination Hub',
    'Voyager Travel',
    'Nomad Adventures',
    'Travel Nest',
    'Holiday Nest',
    'Trip Connect',
    'Journey Connect',
    'World Connect Travel',
    'Travel Avenue',
    'Travel Circle',
    'Dream Trips',
    'Perfect Getaway',
    'Ultimate Journey',
    'Infinite Travel',
    'Blue Horizon Tours',
  ];

  const plans = [
    TenantPlan.free,
    TenantPlan.starter,
    TenantPlan.pro,
    TenantPlan.enterprice,
  ];

  const statuses = [
    TenantStatus.active,
    TenantStatus.active,
    TenantStatus.active,
    TenantStatus.active,
    TenantStatus.active,
    TenantStatus.active,
    TenantStatus.suspended,
    TenantStatus.cancelled,
  ];

  const tenants = tenantNames.map((name, index) => ({
    name,

    subDomain: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),

    plan: plans[index % plans.length],

    status: statuses[index % statuses.length],

    logoUrl: null,
  }));

  const result = await prisma.tenant.createMany({
    data: tenants,
    skipDuplicates: true,
  });

  console.log(`Successfully seeded ${result.count} tenants`);

  return result;
}