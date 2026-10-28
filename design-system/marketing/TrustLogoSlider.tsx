import { PartnerLogo } from "./PartnerLogo";
import type { MarketingTrustPartner } from "./types";

export function TrustLogoSlider({ partners, label }: { partners: MarketingTrustPartner[]; label: string }) {
  if (partners.length === 0) return null;

  const loop = [...partners, ...partners];

  return (
    <div className="landing-trust-slider mt-8" aria-label={label}>
      <div className="landing-trust-slider-track">
        {loop.map((partner, index) => (
          <div key={`${partner.name}-${index}`} className="landing-trust-slide">
            <PartnerLogo {...partner} />
          </div>
        ))}
      </div>
    </div>
  );
}
