-- ============================================================
-- Anagu — Development Seed Data
-- Provides test users, a seeded parcel for overlap testing,
-- and sample application data.
-- ============================================================

-- ── Test Users ────────────────────────────────────────────────
-- Passwords are hashed: all test passwords = "Password123!"
-- Hash generated with bcrypt (cost factor 10)
INSERT INTO users (id, email, password_hash, full_name, national_id, role, wallet_address) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'registrar@anagu.gov.ng',
    '$2b$10$placeholder_registrar_hash',
    'Registrar Office Lagos',
    'REG-001',
    'REGISTRAR',
    '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73'
),
(
    '00000000-0000-0000-0000-000000000002',
    'governor@anagu.gov.ng',
    '$2b$10$placeholder_governor_hash',
    'Governor Test Account',
    'GOV-001',
    'GOVERNOR',
    '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
),
(
    '00000000-0000-0000-0000-000000000003',
    'citizen@test.com',
    '$2b$10$placeholder_citizen_hash',
    'Adewale Okonkwo',
    'NIN-123456789',
    'CITIZEN',
    '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
),
(
    '00000000-0000-0000-0000-000000000004',
    'surveyor@anagu.gov.ng',
    '$2b$10$placeholder_surveyor_hash',
    'Surveyor Emeka Nwosu',
    'SUR-001',
    'SURVEYOR',
    NULL
),
(
    '00000000-0000-0000-0000-000000000005',
    'admin@anagu.gov.ng',
    '$2b$10$placeholder_admin_hash',
    'Land Administrator',
    'ADM-001',
    'LAND_ADMINISTRATOR',
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- ── Seeded Parcel (for overlap testing in Component 1) ────────
-- A valid registered parcel in Lagos Island area
INSERT INTO parcels (
    id,
    geom,
    spatial_hash,
    status,
    lga,
    state,
    address_desc
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ST_GeomFromText(
        'POLYGON((3.396 6.454, 3.397 6.454, 3.397 6.455, 3.396 6.455, 3.396 6.454))',
        4326
    ),
    decode('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'hex'),
    'ACTIVE',
    'Lagos Island',
    'Lagos',
    'Plot 1, Broad Street, Lagos Island — SEED PARCEL FOR TESTING'
)
ON CONFLICT (id) DO NOTHING;
