-- Recover a fresh DB stuck after a failed bootstrap migration (no ONIME tenant yet).
-- Skips when Organization exists (real data — fix migrations manually).

DO $do$
BEGIN
  IF to_regclass('public."Organization"') IS NOT NULL THEN
    RAISE NOTICE 'Organization present — bootstrap recovery skipped';
    RETURN;
  END IF;
END
$do$;

DROP TABLE IF EXISTS "PointageAuditLog" CASCADE;
DROP TABLE IF EXISTS "PointageAttempt" CASCADE;
DROP TABLE IF EXISTS "EmployeeDevice" CASCADE;
DROP TABLE IF EXISTS "TimeEntry" CASCADE;
DROP TABLE IF EXISTS "StockMovement" CASCADE;
DROP TABLE IF EXISTS "SaleLine" CASCADE;
DROP TABLE IF EXISTS "Sale" CASCADE;
DROP TABLE IF EXISTS "PurchaseLine" CASCADE;
DROP TABLE IF EXISTS "Purchase" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "Supplier" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Invitation" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Boutique" CASCADE;
DROP TABLE IF EXISTS "Organization" CASCADE;
DROP TABLE IF EXISTS "Plan" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "SaleStatus" CASCADE;
DROP TYPE IF EXISTS "PurchaseStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;
