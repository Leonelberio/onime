"use client";

import { useActionState, useEffect, useState } from "react";
import { Alert, Field } from "@/components/ui";
import { FormModal } from "@/components/ui/form-modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { BarcodeScanButton } from "@/components/app/barcode-scan-button";
import { createProduct, adjustStock, createSale, createPurchase } from "@/lib/actions/inventory";
import type { ActionState } from "@/lib/actions/shared";
import type { ScannableProduct } from "@/lib/barcode/match-client";

type ProductOpt = ScannableProduct;
type SupplierOpt = { id: string; name: string };
type CustomerOpt = { id: string; name: string };

type FormAction = (prev: ActionState, fd: FormData) => Promise<ActionState>;

function FormShell({
  action,
  onSuccess,
  children,
}: {
  action: FormAction;
  onSuccess?: () => void;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok && onSuccess) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="grid gap-3">
      {state?.message && <Alert tone="success">{state.message}</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {children}
    </form>
  );
}

function NewProductFormBody({ onSuccess }: { onSuccess?: () => void }) {
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");

  return (
    <FormShell action={createProduct} onSuccess={onSuccess}>
      <BarcodeScanButton
        onProduct={(p, raw) => {
          setBarcode(p.barcode ?? raw);
          if (!sku) setSku(p.sku ?? raw);
        }}
        onUnknown={(raw) => {
          setBarcode(raw);
          if (!sku) setSku(raw);
        }}
        label="Scanner le code"
        className="w-full !justify-center"
      />
      <Field label="Nom" name="name">
        <input name="name" required className="onime-input" />
      </Field>
      <Field label="Référence (SKU)" name="sku">
        <input name="sku" className="onime-input" value={sku} onChange={(e) => setSku(e.target.value)} />
      </Field>
      <Field label="Code-barres" name="barcode">
        <input name="barcode" className="onime-input" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="EAN / UPC (optionnel)" />
      </Field>
      <Field label="Prix de vente" name="unitPrice">
        <input name="unitPrice" type="number" defaultValue={0} required className="onime-input" />
      </Field>
      <Field label="Stock initial" name="stockQty">
        <input name="stockQty" type="number" defaultValue={0} required className="onime-input" />
      </Field>
      <Field label="Seuil d'alerte" name="minStock">
        <input name="minStock" type="number" defaultValue={0} className="onime-input" />
      </Field>
      <SubmitButton variant="primary" className="!flex w-full !min-h-12 !justify-center">
        Ajouter
      </SubmitButton>
    </FormShell>
  );
}

function AdjustStockFormBody({ products, onSuccess }: { products: ProductOpt[]; onSuccess?: () => void }) {
  const [productId, setProductId] = useState("");

  return (
    <FormShell action={adjustStock} onSuccess={onSuccess}>
      <BarcodeScanButton
        products={products}
        onProduct={(p) => setProductId(p.id)}
        onUnknown={() => undefined}
        label="Scanner un produit"
        className="w-full !justify-center"
      />
      <label className="grid gap-1 text-body-sm">
        <span>Produit</span>
        <select name="productId" required className="onime-input" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Choisir…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.stockQty})
            </option>
          ))}
        </select>
      </label>
      <Field label="Variation (+ / −)" name="delta">
        <input name="delta" type="number" required className="onime-input" />
      </Field>
      <Field label="Motif" name="reason">
        <input name="reason" defaultValue="Inventaire" required className="onime-input" />
      </Field>
      <SubmitButton variant="secondary" className="!flex w-full !min-h-12 !justify-center">
        Appliquer
      </SubmitButton>
    </FormShell>
  );
}

function NewSaleFormBody({
  products,
  customers,
  onSuccess,
}: {
  products: ProductOpt[];
  customers: CustomerOpt[];
  onSuccess?: () => void;
}) {
  const [productId, setProductId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const applyProduct = (p: ProductOpt) => {
    setProductId(p.id);
    setUnitPrice(String(p.unitPrice));
  };

  return (
    <FormShell action={createSale} onSuccess={onSuccess}>
      <BarcodeScanButton
        products={products}
        onProduct={(p) => applyProduct(p)}
        label="Scanner pour ajouter"
        className="w-full !justify-center"
      />
      <label className="grid gap-1 text-body-sm">
        <span>Client enregistré</span>
        <select name="customerId" className="onime-input" defaultValue="">
          <option value="">Comptoir / autre</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <Field label="Nom client (si comptoir)" name="customerName">
        <input name="customerName" className="onime-input" placeholder="Optionnel" />
      </Field>
      <Field label="Référence" name="reference">
        <input name="reference" className="onime-input" />
      </Field>
      <label className="grid gap-1 text-body-sm">
        <span>Produit</span>
        <select name="productId" required className="onime-input" value={productId} onChange={(e) => {
          setProductId(e.target.value);
          const p = products.find((x) => x.id === e.target.value);
          if (p) setUnitPrice(String(p.unitPrice));
        }}>
          <option value="">Choisir…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — stock {p.stockQty}
            </option>
          ))}
        </select>
      </label>
      <Field label="Quantité" name="quantity">
        <input name="quantity" type="number" defaultValue={1} required className="onime-input" />
      </Field>
      <Field label="Prix unitaire" name="unitPrice">
        <input name="unitPrice" type="number" required className="onime-input" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
      </Field>
      <SubmitButton variant="primary" className="!flex w-full !min-h-12 !justify-center">
        Enregistrer la vente
      </SubmitButton>
    </FormShell>
  );
}

function NewPurchaseFormBody({
  products,
  suppliers,
  onSuccess,
}: {
  products: ProductOpt[];
  suppliers: SupplierOpt[];
  onSuccess?: () => void;
}) {
  const [productId, setProductId] = useState("");

  return (
    <FormShell action={createPurchase} onSuccess={onSuccess}>
      <BarcodeScanButton
        products={products}
        onProduct={(p) => setProductId(p.id)}
        label="Scanner un produit"
        className="w-full !justify-center"
      />
      <label className="grid gap-1 text-body-sm">
        <span>Fournisseur</span>
        <select name="supplierId" className="onime-input">
          <option value="">—</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <Field label="Référence bon" name="reference">
        <input name="reference" className="onime-input" />
      </Field>
      <label className="grid gap-1 text-body-sm">
        <span>Produit</span>
        <select name="productId" required className="onime-input" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Choisir…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <Field label="Quantité" name="quantity">
        <input name="quantity" type="number" defaultValue={1} required className="onime-input" />
      </Field>
      <Field label="Coût unitaire" name="unitCost">
        <input name="unitCost" type="number" required className="onime-input" />
      </Field>
      <SubmitButton variant="primary" className="!flex w-full !min-h-12 !justify-center">
        Enregistrer
      </SubmitButton>
    </FormShell>
  );
}

export function StockFormModals({ products }: { products: ProductOpt[] }) {
  return (
    <>
      <FormModal triggerLabel="Nouveau produit" title="Nouveau produit">
        {({ close }) => <NewProductFormBody onSuccess={close} />}
      </FormModal>
      <FormModal triggerLabel="Ajustement stock" title="Ajustement manuel" variant="secondary">
        {({ close }) => <AdjustStockFormBody products={products} onSuccess={close} />}
      </FormModal>
    </>
  );
}

export function SaleFormModal({
  products,
  customers,
}: {
  products: ProductOpt[];
  customers: CustomerOpt[];
}) {
  return (
    <FormModal triggerLabel="Nouvelle vente" title="Nouvelle vente">
      {({ close }) => <NewSaleFormBody products={products} customers={customers} onSuccess={close} />}
    </FormModal>
  );
}

export function PurchaseFormModal({
  products,
  suppliers,
}: {
  products: ProductOpt[];
  suppliers: SupplierOpt[];
}) {
  return (
    <FormModal triggerLabel="Réception achat" title="Réception achat">
      {({ close }) => <NewPurchaseFormBody products={products} suppliers={suppliers} onSuccess={close} />}
    </FormModal>
  );
}

export function toScannableProduct(p: {
  id: string;
  name: string;
  stockQty: number;
  unitPrice: number;
  sku: string | null;
  barcode?: string | null;
}): ScannableProduct {
  return {
    id: p.id,
    name: p.name,
    stockQty: p.stockQty,
    unitPrice: p.unitPrice,
    sku: p.sku,
    barcode: p.barcode ?? null,
  };
}
