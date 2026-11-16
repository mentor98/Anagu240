-- ============================================================
-- Anagu — Core Database Schema
-- PostgreSQL 15 + PostGIS 3
-- All spatial data referenced to WGS 84 (EPSG:4326)
-- ============================================================

-- ── Enum types ────────────────────────────────────────────────
CREATE TYPE application_status AS ENUM (
    'SUBMITTED',
    'SPATIAL_VERIFIED',
    'OWNERSHIP_VERIFIED',
    'LEGAL_VERIFIED',
    'APPROVED',
    'BLOCKCHAIN_REGISTERED',
    'NFT_ISSUED',
    'COMPLETED',
    'REJECTED',
    'CANCELLED'
);

CREATE TYPE parcel_status AS ENUM (
    'PENDING',
    'ACTIVE',
    'REVOKED',
    'DISPUTED'
);

CREATE TYPE user_role AS ENUM (
    'CITIZEN',
    'SURVEYOR',
    'REGISTRAR',
    'LAND_ADMINISTRATOR',
    'GOVERNOR'
);

CREATE TYPE revocation_ground AS ENUM (
    'OVERRIDING_PUBLIC_INTEREST',
    'BREACH_OF_STATUTORY_CONDITION'
);

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT,
    full_name       TEXT NOT NULL,
    national_id     TEXT UNIQUE,
    phone           TEXT,
    role            user_role NOT NULL DEFAULT 'CITIZEN',
    wallet_address  VARCHAR(42),            -- Ethereum address
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_national_id  ON users(national_id);
CREATE INDEX idx_users_role         ON users(role);

-- ── Land parcels (spatial) ────────────────────────────────────
CREATE TABLE parcels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom            GEOMETRY(POLYGON, 4326) NOT NULL,
    spatial_hash    BYTEA NOT NULL,         -- keccak256(WKT) stored for on-chain reference
    area_sqm        DOUBLE PRECISION,       -- computed on insert
    status          parcel_status NOT NULL DEFAULT 'PENDING',
    overlap_tolerance_m DOUBLE PRECISION DEFAULT 0.5,  -- record the value used
    lga             TEXT,                   -- Local Government Area
    state           TEXT,
    address_desc    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index — essential for ST_Intersects performance
CREATE INDEX idx_parcels_geom   ON parcels USING GIST(geom);
CREATE INDEX idx_parcels_status ON parcels(status);

-- ── Applications ──────────────────────────────────────────────
CREATE TABLE applications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id           UUID NOT NULL REFERENCES parcels(id),
    applicant_id        UUID NOT NULL REFERENCES users(id),
    owner_name          TEXT NOT NULL,
    national_id         TEXT NOT NULL,
    survey_plan_number  TEXT,
    community_witnesses JSONB,              -- array of witness identifiers
    legal_clearance_hash TEXT,              -- document hash
    status              application_status NOT NULL DEFAULT 'SUBMITTED',
    rejection_stage     TEXT,
    rejection_reason    TEXT,
    registrar_id        UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_parcel      ON applications(parcel_id);
CREATE INDEX idx_applications_applicant   ON applications(applicant_id);
CREATE INDEX idx_applications_status      ON applications(status);

-- ── Documents (metadata; files stored in MinIO) ───────────────
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id  UUID NOT NULL REFERENCES applications(id),
    document_type   TEXT NOT NULL,          -- 'SURVEY_PLAN' | 'TITLE_DEED' | etc.
    file_name       TEXT NOT NULL,
    minio_key       TEXT NOT NULL UNIQUE,   -- object key in MinIO
    file_hash       TEXT NOT NULL,          -- SHA-256 of file content
    file_size_bytes BIGINT,
    uploaded_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_application ON documents(application_id);

-- ── Land titles (NFTs) ────────────────────────────────────────
CREATE TABLE land_titles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id            BIGINT UNIQUE NOT NULL,     -- ERC-721 token ID on-chain
    parcel_id           UUID NOT NULL REFERENCES parcels(id),
    application_id      UUID NOT NULL REFERENCES applications(id),
    owner_address       VARCHAR(42) NOT NULL,        -- Ethereum address of titleholder
    owner_user_id       UUID REFERENCES users(id),
    tx_hash             VARCHAR(66) NOT NULL,         -- issuance transaction hash
    block_number        BIGINT,
    token_uri           TEXT,                         -- IPFS / MinIO metadata URI
    is_revoked          BOOLEAN DEFAULT FALSE,
    revocation_tx       VARCHAR(66),
    revocation_ground   revocation_ground,
    revoked_by_address  VARCHAR(42),
    issued_at           TIMESTAMPTZ DEFAULT NOW(),
    revoked_at          TIMESTAMPTZ
);

CREATE INDEX idx_titles_parcel      ON land_titles(parcel_id);
CREATE INDEX idx_titles_owner       ON land_titles(owner_address);
CREATE INDEX idx_titles_token_id    ON land_titles(token_id);
CREATE INDEX idx_titles_is_revoked  ON land_titles(is_revoked);

-- ── Oracle verification records ───────────────────────────────
CREATE TABLE oracle_verifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id  UUID NOT NULL REFERENCES applications(id),
    outcome         TEXT NOT NULL,          -- VerificationOutcome enum value
    score           INTEGER NOT NULL,       -- 0–100
    reasons         JSONB,                  -- array of failure reasons
    raw_response    JSONB,                  -- full oracle response for audit
    verified_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_oracle_application ON oracle_verifications(application_id);

-- ── MQTT event log ────────────────────────────────────────────
CREATE TABLE mqtt_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic           TEXT NOT NULL,
    payload         JSONB NOT NULL,
    qos             SMALLINT NOT NULL DEFAULT 1,
    payload_bytes   INTEGER,                -- JSON.stringify(payload).length
    delivered       BOOLEAN DEFAULT FALSE,
    published_at    TIMESTAMPTZ DEFAULT NOW(),
    delivered_at    TIMESTAMPTZ
);

CREATE INDEX idx_mqtt_topic     ON mqtt_events(topic);
CREATE INDEX idx_mqtt_published ON mqtt_events(published_at);

-- ── Immutable audit trail ─────────────────────────────────────
-- No UPDATE or DELETE is permitted on this table (enforced below).
CREATE TABLE audit_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type     TEXT NOT NULL,          -- 'application' | 'parcel' | 'title' | 'user'
    entity_id       UUID NOT NULL,
    event_type      TEXT NOT NULL,          -- e.g. 'SPATIAL_VERIFIED', 'NFT_ISSUED'
    from_status     TEXT,
    to_status       TEXT,
    actor_role      user_role,
    actor_id        TEXT NOT NULL,
    actor_address   VARCHAR(42),
    metadata        JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity  ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_events(created_at);

-- Immutability rules: block all updates and deletes on audit_events
CREATE RULE no_update_audit AS ON UPDATE TO audit_events DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_events DO INSTEAD NOTHING;

-- ── Triggers: auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_parcels_updated_at
    BEFORE UPDATE ON parcels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Trigger: auto-compute area on parcel insert/update ────────
CREATE OR REPLACE FUNCTION compute_parcel_area()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.area_sqm = ST_Area(NEW.geom::geography);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_parcels_area
    BEFORE INSERT OR UPDATE OF geom ON parcels
    FOR EACH ROW EXECUTE FUNCTION compute_parcel_area();
