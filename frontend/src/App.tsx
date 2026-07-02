import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoadingScreen } from './components/feedback/LoadingState'

const LoginPage = React.lazy(() => import('./features/auth/LoginPage'))
const DashboardPage = React.lazy(() => import('./features/dashboard/DashboardPage'))
const PropertiesPage = React.lazy(() => import('./features/properties/PropertyListPage'))
const TenantsPage = React.lazy(() => import('./features/tenants/TenantListPage'))
const TenantDetailPage = React.lazy(() => import('./features/tenants/TenantDetailPage'))
const LeasesPage = React.lazy(() => import('./features/leases/LeaseListPage'))
const UnitsPage = React.lazy(() => import('./features/units/UnitListPage'))
const MaintenancePage = React.lazy(() => import('./features/maintenance/RequestListPage'))
const WorkOrdersPage = React.lazy(() => import('./features/work-orders/WorkOrderListPage'))
const EmployeesPage = React.lazy(() => import('./features/employees/EmployeeListPage'))
const InventoryPage = React.lazy(() => import('./features/inventory/InventoryListPage'))
const EquipmentPage = React.lazy(() => import('./features/equipment/EquipmentListPage'))
const VendorsPage = React.lazy(() => import('./features/vendors/VendorListPage'))
const DocumentsPage = React.lazy(() => import('./features/documents/DocumentListPage'))
const InboxPage = React.lazy(() => import('./features/messaging/InboxPage'))
const NotificationsPage = React.lazy(() => import('./features/notifications/NotificationPage'))
const ReportsPage = React.lazy(() => import('./features/reports/ReportListPage'))
const AnalyticsPage = React.lazy(() => import('./features/analytics/AnalyticsPage'))
const AIChatPage = React.lazy(() => import('./features/ai/AIChatPage'))
const AdminPage = React.lazy(() => import('./features/admin/AdminPage'))
const AuditLogPage = React.lazy(() => import('./features/audit-log/AuditLogPage'))
const SettingsPage = React.lazy(() => import('./features/settings/SettingsPage'))
const SchedulePage = React.lazy(() => import('./features/scheduling/SchedulePage'))

function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <AppShell>
      <Suspense fallback={<LoadingScreen />}>
        <Component />
      </Suspense>
    </AppShell>
  )
}

function LazyShell({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component />
    </Suspense>
  )
}

export default function App() {
  const { token } = useAuthStore()

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <LazyShell Component={LoginPage} />}
      />
      <Route path="/" element={<ProtectedRoute><LazyPage Component={DashboardPage} /></ProtectedRoute>} />
      <Route path="/properties" element={<ProtectedRoute><LazyPage Component={PropertiesPage} /></ProtectedRoute>} />
      <Route path="/tenants" element={<ProtectedRoute><LazyPage Component={TenantsPage} /></ProtectedRoute>} />
      <Route path="/tenants/:id" element={<ProtectedRoute><LazyPage Component={TenantDetailPage} /></ProtectedRoute>} />
      <Route path="/leases" element={<ProtectedRoute><LazyPage Component={LeasesPage} /></ProtectedRoute>} />
      <Route path="/units" element={<ProtectedRoute><LazyPage Component={UnitsPage} /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><LazyPage Component={MaintenancePage} /></ProtectedRoute>} />
      <Route path="/work-orders" element={<ProtectedRoute><LazyPage Component={WorkOrdersPage} /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><LazyPage Component={EmployeesPage} /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><LazyPage Component={InventoryPage} /></ProtectedRoute>} />
      <Route path="/equipment" element={<ProtectedRoute><LazyPage Component={EquipmentPage} /></ProtectedRoute>} />
      <Route path="/vendors" element={<ProtectedRoute><LazyPage Component={VendorsPage} /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><LazyPage Component={DocumentsPage} /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><LazyPage Component={InboxPage} /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><LazyPage Component={NotificationsPage} /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><LazyPage Component={ReportsPage} /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><LazyPage Component={AnalyticsPage} /></ProtectedRoute>} />
      <Route path="/ai" element={<ProtectedRoute><LazyPage Component={AIChatPage} /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><LazyPage Component={AdminPage} /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><LazyPage Component={AuditLogPage} /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><LazyPage Component={SettingsPage} /></ProtectedRoute>} />
      <Route path="/scheduling" element={<ProtectedRoute><LazyPage Component={SchedulePage} /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
