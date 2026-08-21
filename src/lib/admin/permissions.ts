/**
 * SANO LUNA — Admin Permissions
 * Server-only. Granular role-based permission checks.
 */
import type { AdminRole } from './auth'

const ROLE_LEVEL: Record<AdminRole, number> = {
  staff: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
}

function hasMinRole(role: string, min: AdminRole): boolean {
  return (ROLE_LEVEL[role as AdminRole] ?? 0) >= ROLE_LEVEL[min]
}

export const can = {
  // Bookings
  viewBookings: (role: string) => hasMinRole(role, 'staff'),
  manageBookings: (role: string) => hasMinRole(role, 'manager'),
  rescheduleBookings: (role: string) => hasMinRole(role, 'manager'),

  // Services & Packages
  viewCatalog: (role: string) => hasMinRole(role, 'manager'),
  manageCatalog: (role: string) => hasMinRole(role, 'admin'),

  // Customers
  viewCustomers: (role: string) => hasMinRole(role, 'manager'),
  manageCustomers: (role: string) => hasMinRole(role, 'admin'),

  // Staff
  viewStaff: (role: string) => hasMinRole(role, 'manager'),
  manageStaff: (role: string) => hasMinRole(role, 'admin'),

  // Locations & Settings
  viewLocations: (role: string) => hasMinRole(role, 'manager'),
  manageLocations: (role: string) => hasMinRole(role, 'admin'),
  manageHours: (role: string) => hasMinRole(role, 'manager'),
  manageBlackouts: (role: string) => hasMinRole(role, 'manager'),

  // Reports
  viewReports: (role: string) => hasMinRole(role, 'manager'),
  exportReports: (role: string) => hasMinRole(role, 'admin'),

  // Financial (Outflows)
  viewExpenses: (role: string) => hasMinRole(role, 'manager'),
  manageExpenses: (role: string) => hasMinRole(role, 'manager'),
  viewPurchases: (role: string) => hasMinRole(role, 'manager'),
  managePurchases: (role: string) => hasMinRole(role, 'manager'),
  viewSuppliers: (role: string) => hasMinRole(role, 'manager'),
  manageSuppliers: (role: string) => hasMinRole(role, 'manager'),
  manageExpenseCategories: (role: string) => hasMinRole(role, 'manager'),

  // Admin management
  manageAdmins: (role: string) => hasMinRole(role, 'super_admin'),
  viewAuditLogs: (role: string) => hasMinRole(role, 'super_admin'),
}

/** Navigation items visible to a given role */
export function getNavItems(role: string) {
  return {
    dashboard: true,
    bookings: can.viewBookings(role),
    calendar: can.viewBookings(role),
    services: can.viewCatalog(role),
    packages: can.viewCatalog(role),
    customers: can.viewCustomers(role),
    staff: can.viewStaff(role),
    locations: can.viewLocations(role),
    expenses: can.viewExpenses(role),
    purchases: can.viewPurchases(role),
    suppliers: can.viewSuppliers(role),
    expenseCategories: can.manageExpenseCategories(role),
    settings: can.manageHours(role),
    reports: can.viewReports(role),
  }
}
