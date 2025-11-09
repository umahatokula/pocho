# Security Posture

Pocho enforces a defense-in-depth strategy to protect customer, vendor, and rider data.

## Platform Controls

- **Authentication & Authorization**: JWT access/refresh tokens, TOTP-ready 2FA, RBAC guards, and API keys for internal services.
- **Transport Security**: All external traffic terminates over TLS. HSTS and secure cookies are recommended for edge deployments.
- **Input Validation**: DTO validation via `class-validator` on every request and structured parsing for WebSocket payloads.
- **Rate Limiting**: Global and route-specific throttling backed by Redis to mitigate brute-force attempts.
- **Content Security**: Helmet middleware with restrictive headers and strict CORS policies per environment.
- **Secrets Management**: Environment variables sourced from encrypted secret stores (e.g., AWS Secrets Manager). `.env` files are for local development only.
- **Data Protection**: Sensitive PII fields (phone, email) can be encrypted using application-level crypto helpers before persistence. NDPR requests (erasure/export) are honored via dedicated endpoints.
- **Audit Logging**: Admin and financial actions emit immutable audit events stored in PostgreSQL and shipped to long-term storage.
- **Payments Compliance**: Paystack and Flutterwave webhook handlers verify signatures, enforce idempotency, and redact payloads before logging.
- **File Security**: Signed URLs restrict upload scope by MIME type and size; antivirus scanning is advised before exposing assets.

## Operational Practices

- Automated CI/CD runs linting, tests, vulnerability scans, and migrations before deploy.
- Dependencies are monitored via Dependabot/GitHub security advisories.
- Production metrics and logs feed dashboards with alerting on anomalies.

Refer to module-specific docs for granular policies and incident response procedures.
