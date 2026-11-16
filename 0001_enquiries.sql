CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  route TEXT NOT NULL CHECK (route IN ('bulk','private-label','horticulture','sample')),
  details TEXT NOT NULL,
  created_at TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  notification TEXT NOT NULL DEFAULT 'pending' CHECK (notification IN ('pending','sent')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','qualified','awaiting_buyer','supplier_review','sample_review','quoted','closed')),
  owner TEXT NOT NULL DEFAULT 'Sourcing desk'
);
CREATE INDEX IF NOT EXISTS enquiry_queue ON enquiries (status, notification, created_at);
