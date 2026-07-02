INSERT INTO system_roles (id, name, permissions, is_system)
VALUES
  ('a0000000-0000-4000-a000-000000000001', 'ADMIN', '{"all": {"read": true, "create": true, "update": true, "delete": true}}', true),
  ('a0000000-0000-4000-a000-000000000002', 'MANAGER', '{"properties": {"read": true, "create": true, "update": true, "delete": false}, "tenants": {"read": true, "create": true, "update": true, "delete": false}, "leases": {"read": true, "create": true, "update": true, "delete": false}, "work_orders": {"read": true, "create": true, "update": true, "delete": false}, "users": {"read": true, "create": false, "update": false, "delete": false}}', true),
  ('a0000000-0000-4000-a000-000000000003', 'MAINT_SUPERVISOR', '{"work_orders": {"read": true, "create": true, "update": true, "delete": false}, "maintenance": {"read": true, "create": true, "update": true, "delete": false}, "inventory": {"read": true, "create": false, "update": false, "delete": false}}', true),
  ('a0000000-0000-4000-a000-000000000004', 'MAINT_TECH', '{"work_orders": {"read": true, "create": true, "update": true, "delete": false}, "maintenance": {"read": true, "create": false, "update": true, "delete": false}}', true),
  ('a0000000-0000-4000-a000-000000000005', 'OFFICE_STAFF', '{"properties": {"read": true, "create": false, "update": false, "delete": false}, "tenants": {"read": true, "create": true, "update": true, "delete": false}, "leases": {"read": true, "create": true, "update": false, "delete": false}, "payments": {"read": true, "create": true, "update": false, "delete": false}}', true),
  ('a0000000-0000-4000-a000-000000000006', 'PROPERTY_MANAGER', '{"properties": {"read": true, "create": false, "update": true, "delete": false}, "tenants": {"read": true, "create": true, "update": true, "delete": false}, "leases": {"read": true, "create": true, "update": true, "delete": false}, "work_orders": {"read": true, "create": true, "update": true, "delete": false}, "inspections": {"read": true, "create": true, "update": true, "delete": false}}', true),
  ('a0000000-0000-4000-a000-000000000007', 'TENANT', '{"profile": {"read": true, "create": false, "update": true, "delete": false}, "leases": {"read": true, "create": false, "update": false, "delete": false}, "payments": {"read": true, "create": false, "update": false, "delete": false}, "work_orders": {"read": true, "create": true, "update": false, "delete": false}}', true),
  ('a0000000-0000-4000-a000-000000000008', 'AUDITOR', '{"properties": {"read": true, "create": false, "update": false, "delete": false}, "tenants": {"read": true, "create": false, "update": false, "delete": false}, "leases": {"read": true, "create": false, "update": false, "delete": false}, "payments": {"read": true, "create": false, "update": false, "delete": false}, "audit_logs": {"read": true, "create": false, "update": false, "delete": false}}', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, force_password_change)
VALUES (
  '00000000-0000-4000-a000-000000000001',
  'admin',
  '$2b$10$5a8HxVYHV5Q5Z5x5Z5x5Z5x5Z5x5Z5x5Z5x5Z5x5Z5x5Z5x5Z5u',
  'System',
  'Administrator',
  true,
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
VALUES (
  '00000000-0000-4000-a000-000000000001',
  'a0000000-0000-4000-a000-000000000001'
)
ON CONFLICT DO NOTHING;

INSERT INTO properties (id, name, address, city, state, zip_code)
VALUES (
  '00000000-0000-4000-a000-000000000010',
  'Sunset Apartments',
  '123 Main St',
  'Springfield',
  'IL',
  '62701'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO units (id, property_id, unit_number, bedrooms, bathrooms, square_footage, rent_amount, security_deposit, is_available)
VALUES
  ('00000000-0000-4000-a000-000000000020', '00000000-0000-4000-a000-000000000010', '101', 1, 1, 650, 950.00, 950.00, false),
  ('00000000-0000-4000-a000-000000000021', '00000000-0000-4000-a000-000000000010', '102', 2, 1, 850, 1200.00, 1200.00, true),
  ('00000000-0000-4000-a000-000000000022', '00000000-0000-4000-a000-000000000010', '103', 0, 1, 450, 750.00, 750.00, true),
  ('00000000-0000-4000-a000-000000000023', '00000000-0000-4000-a000-000000000010', '201', 2, 2, 950, 1400.00, 1400.00, true),
  ('00000000-0000-4000-a000-000000000024', '00000000-0000-4000-a000-000000000010', '202', 1, 1, 700, 1000.00, 1000.00, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenants (id, first_name, last_name, email, phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
VALUES (
  '00000000-0000-4000-a000-000000000030',
  'John',
  'Doe',
  'john@example.com',
  '555-0100',
  'Jane Doe',
  '555-0101',
  'Spouse'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leases (id, tenant_id, unit_id, start_date, end_date, monthly_rent, security_deposit, status)
VALUES (
  '00000000-0000-4000-a000-000000000040',
  '00000000-0000-4000-a000-000000000030',
  '00000000-0000-4000-a000-000000000020',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '12 months',
  950.00,
  950.00,
  'active'
)
ON CONFLICT (id) DO NOTHING;
