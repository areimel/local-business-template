export interface PageEntry {
  path: string;
  label: string;
  type: 'static' | 'hub' | 'service';
  category?: string;
  hasContactForm: boolean;
  hasQuickContactForm: boolean;
}

export const ALL_PAGES: PageEntry[] = [
  // ── Static pages ──────────────────────────────────────────────────
  { path: '/', label: 'Homepage', type: 'static', hasContactForm: true, hasQuickContactForm: false },
  { path: '/about/', label: 'About', type: 'static', hasContactForm: false, hasQuickContactForm: false },
  { path: '/contact/', label: 'Contact', type: 'static', hasContactForm: true, hasQuickContactForm: false },
  { path: '/faqs/', label: 'FAQs', type: 'static', hasContactForm: false, hasQuickContactForm: true },
  { path: '/thank-you/', label: 'Thank You', type: 'static', hasContactForm: false, hasQuickContactForm: false },
  { path: '/styleguide/', label: 'Styleguide', type: 'static', hasContactForm: true, hasQuickContactForm: true },

  // ── Hub pages ─────────────────────────────────────────────────────
  { path: '/air-conditioning/', label: 'Air Conditioning Hub', type: 'hub', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/heating/', label: 'Heating Hub', type: 'hub', category: 'heating', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/', label: 'Plumbing Hub', type: 'hub', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/gas/', label: 'Gas Hub', type: 'hub', category: 'gas', hasContactForm: true, hasQuickContactForm: false },
  { path: '/electrical-services/', label: 'Electrical Services Hub', type: 'hub', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },

  // ── Air Conditioning services ─────────────────────────────────────
  { path: '/air-conditioning/ac-repair/', label: 'AC Repair', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/emergency-ac-repair/', label: 'Emergency AC Repair', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/ac-installation-replacement/', label: 'AC Installation & Replacement', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/ac-maintenance/', label: 'AC Maintenance', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/coastal-ac-systems/', label: 'Coastal AC Systems', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/air-filters/', label: 'Air Filters', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/thermostats/', label: 'Thermostats', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/whole-home-dehumidifiers/', label: 'Whole Home Dehumidifiers', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/indoor-air-quality/', label: 'Indoor Air Quality', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },
  { path: '/air-conditioning/ductless-mini-split-systems/', label: 'Ductless Mini Split Systems', type: 'service', category: 'air-conditioning', hasContactForm: true, hasQuickContactForm: false },

  // ── Heating services ──────────────────────────────────────────────
  { path: '/heating/heating-installation-replacement/', label: 'Heating Installation & Replacement', type: 'service', category: 'heating', hasContactForm: true, hasQuickContactForm: false },
  { path: '/heating/heating-maintenance/', label: 'Heating Maintenance', type: 'service', category: 'heating', hasContactForm: true, hasQuickContactForm: false },
  { path: '/heating/heat-pump-heating-services/', label: 'Heat Pump Heating Services', type: 'service', category: 'heating', hasContactForm: true, hasQuickContactForm: false },
  { path: '/heating/heating-system-safety/', label: 'Heating System Safety', type: 'service', category: 'heating', hasContactForm: true, hasQuickContactForm: false },
  { path: '/heating/heating-repair/', label: 'Heating Repair', type: 'service', category: 'heating', hasContactForm: true, hasQuickContactForm: false },

  // ── Plumbing services ─────────────────────────────────────────────
  { path: '/plumbing/water-heater-services/', label: 'Water Heater Services', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/water-heater-installation/', label: 'Water Heater Installation', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/water-heater-maintenance/', label: 'Water Heater Maintenance', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/water-heater-repair/', label: 'Water Heater Repair', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/tankless-water-heaters/', label: 'Tankless Water Heaters', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/hybrid-water-heaters/', label: 'Hybrid Water Heaters', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/repiping-services/', label: 'Repiping Services', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/water-filtration-installation/', label: 'Water Filtration Installation', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/water-line-services/', label: 'Water Line Services', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/leak-detection/', label: 'Leak Detection', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/drain-cleaning-clog-repair/', label: 'Drain Cleaning & Clog Repair', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/plumbing-fixtures/', label: 'Plumbing Fixtures', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },
  { path: '/plumbing/water-treatment-services/', label: 'Water Treatment Services', type: 'service', category: 'plumbing', hasContactForm: true, hasQuickContactForm: false },

  // ── Gas services ──────────────────────────────────────────────────
  { path: '/gas/natural-gas-propane-services/', label: 'Natural Gas & Propane Services', type: 'service', category: 'gas', hasContactForm: true, hasQuickContactForm: false },
  { path: '/gas/gas-installations-repairs/', label: 'Gas Installations & Repairs', type: 'service', category: 'gas', hasContactForm: true, hasQuickContactForm: false },
  { path: '/gas/gas-safety-inspections/', label: 'Gas Safety Inspections', type: 'service', category: 'gas', hasContactForm: true, hasQuickContactForm: false },
  { path: '/gas/gas-leak-detection/', label: 'Gas Leak Detection', type: 'service', category: 'gas', hasContactForm: true, hasQuickContactForm: false },

  // ── Electrical services ───────────────────────────────────────────
  { path: '/electrical-services/electrical-installation-repairs/', label: 'Electrical Installation & Repairs', type: 'service', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },
  { path: '/electrical-services/lighting-installation/', label: 'Lighting Installation', type: 'service', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },
  { path: '/electrical-services/home-surge-protection/', label: 'Home Surge Protection', type: 'service', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },
  { path: '/electrical-services/electrical-panel-replacement/', label: 'Electrical Panel Replacement', type: 'service', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },
  { path: '/electrical-services/smart-home-electrical-upgrades/', label: 'Smart Home Electrical Upgrades', type: 'service', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },
  { path: '/electrical-services/ev-charger-installation/', label: 'EV Charger Installation', type: 'service', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },
  { path: '/electrical-services/ceiling-fan-installation/', label: 'Ceiling Fan Installation', type: 'service', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },
  { path: '/electrical-services/electrical-switch-outlet-services/', label: 'Electrical Switch & Outlet Services', type: 'service', category: 'electrical-services', hasContactForm: true, hasQuickContactForm: false },
];

// ── Convenience filters ───────────────────────────────────────────────
export const STATIC_PAGES = ALL_PAGES.filter((p) => p.type === 'static');
export const HUB_PAGES = ALL_PAGES.filter((p) => p.type === 'hub');
export const SERVICE_PAGES = ALL_PAGES.filter((p) => p.type === 'service');
export const PAGES_WITH_CONTACT_FORM = ALL_PAGES.filter((p) => p.hasContactForm);
export const PAGES_WITH_QUICK_FORM = ALL_PAGES.filter((p) => p.hasQuickContactForm);
