"use client";

import type { VehicleCostMethod } from "@/data/expenseCategories";

/**
 * Summary of HMRC “simplified expenses” vehicle mileage for self-employed traders.
 * Source: GOV.UK “Simplified expenses if you're self-employed: Vehicles” (rates and rules can change each tax year).
 */

/** Live GOV.UK slug (includes trailing hyphen). */
const GOV_UK_VEHICLES =
  "https://www.gov.uk/simpler-income-tax-simplified-expenses/vehicles-";

const TEMPLATES_WITH_VEHICLE_COSTS = new Set(["transport_driving", "trades", "teaching_training"]);

type Props = {
  trade: string;
  templateId: string;
  vehicleCostMethod: VehicleCostMethod | null;
};

export function HmrcSimplifiedMileageNotice({ trade, templateId, vehicleCostMethod }: Props) {
  if (!TEMPLATES_WITH_VEHICLE_COSTS.has(templateId)) return null;

  const t = trade.toLowerCase();
  const isDrivingInstructor = t.includes("driving instructor");
  const isTaxiOrHackneyContext = t.includes("taxi");

  return (
    <aside
      className="mt-8 rounded-2xl border border-brand-green/20 bg-brand-mint/40 px-4 py-4 text-sm text-brand-black shadow-sm min-[900px]:px-6 min-[900px]:py-5"
      aria-labelledby="hmrc-mileage-heading"
    >
      <h2 id="hmrc-mileage-heading" className="text-base font-bold text-brand-black">
        Vehicle costs and HMRC simplified mileage
      </h2>

      {vehicleCostMethod === "simplified" ? (
        <p className="mt-2 rounded-lg border border-brand-green/30 bg-white/90 px-3 py-2 text-sm text-brand-black">
          <strong>Your selection:</strong> simplified mileage for this return — use the{" "}
          <strong>single vehicle mileage expense line</strong> for running costs, and do not also enter fuel, insurance,
          repairs, MOT, finance or breakdown for the <strong>same vehicle</strong> this period.
        </p>
      ) : vehicleCostMethod === "actual" ? (
        <p className="mt-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm text-brand-muted">
          <strong className="text-brand-black">Your selection:</strong> full / actual vehicle costs — enter fuel,
          insurance, repairs, MOT, etc. on their own lines. Do not also add a simplified mileage total for the same
          vehicle.
        </p>
      ) : null}

      <p className="mt-2 leading-relaxed text-brand-muted">
        If you are self-employed, you can work out vehicle costs using a{" "}
        <strong className="text-brand-black">flat rate per business mile</strong> (simplified expenses){" "}
        <em>instead of</em> the actual costs of buying and running the vehicle (for example insurance, repairs,
        servicing, and fuel). You do <strong className="text-brand-black">not</strong> have to use flat rates for every
        vehicle you use, but once you use simplified mileage for a vehicle you must keep using it for as long as you
        use that vehicle for the business. You{" "}
        <strong className="text-brand-black">cannot</strong> use simplified mileage for a vehicle you have already
        claimed capital allowances on, or that you have already included as an actual expense when working out your
        profits.
      </p>

      {isTaxiOrHackneyContext ? (
        <p className="mt-2 rounded-lg bg-white/60 px-3 py-2 text-brand-muted">
          <strong className="text-brand-black">Taxis:</strong> HMRC excludes certain commercially designed vehicles from
          the car simplified rates (for example <strong className="text-brand-black">black cabs and hackney</strong>
          carriages). Check the GOV.UK page below to see what applies to your vehicle.
        </p>
      ) : null}

      {isDrivingInstructor ? (
        <p className="mt-2 rounded-lg bg-white/60 px-3 py-2 text-brand-muted">
          <strong className="text-brand-black">Driving instructors:</strong> HMRC specifically excludes{" "}
          <strong className="text-brand-black">dual-control cars used for driving instruction</strong> from using these
          car simplified mileage rates. You normally claim actual costs (and follow HMRC guidance for your vehicle).
        </p>
      ) : null}

      <p className="mt-3 text-brand-muted">
        Simplified mileage is intended for ordinary <strong className="text-brand-black">cars</strong>,{" "}
        <strong className="text-brand-black">goods vehicles (for example vans)</strong>, and{" "}
        <strong className="text-brand-black">motorcycles</strong>, subject to the rules on GOV.UK.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-black/10 bg-white/80">
        <table className="w-full min-w-[280px] border-collapse text-left text-sm">
          <caption className="border-b border-black/10 px-3 py-2 text-left text-xs font-semibold text-brand-black">
            Flat rates per business mile (simplified expenses) — confirm each tax year on GOV.UK
          </caption>
          <thead>
            <tr className="border-b border-black/10 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-brand-muted">
              <th className="px-3 py-2">Vehicle</th>
              <th className="px-3 py-2">Rate</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr className="border-b border-black/5">
              <td className="px-3 py-2 font-medium text-brand-black">Cars and goods vehicles</td>
              <td className="px-3 py-2 text-brand-muted">
                <strong className="text-brand-black">45p</strong> for the first 10,000 miles, then{" "}
                <strong className="text-brand-black">25p</strong> per mile
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-brand-black">Motorcycles</td>
              <td className="px-3 py-2 text-brand-muted">
                <strong className="text-brand-black">24p</strong> per business mile
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-brand-muted">
        <strong className="text-brand-black">Example (car or van):</strong> 11,000 business miles in the year →
        (10,000 × 45p) + (1,000 × 25p) = <strong className="text-brand-black">£4,750</strong>. You can still claim{" "}
        <strong className="text-brand-black">other travel</strong> (for example train fares) and{" "}
        <strong className="text-brand-black">parking</strong> on top of your vehicle total, where allowable.
      </p>

      <p className="mt-3 text-xs text-brand-muted">
        This form asks for amounts in money terms for the period you are filing. If you use simplified mileage, your
        accountant or software will usually turn your mileage log into a figure; do not duplicate the same vehicle
        costs twice (mileage <em>or</em> fuel/repairs/insurance for the same vehicle, not both).
      </p>

      <p className="mt-3">
        <a
          href={GOV_UK_VEHICLES}
          className="font-semibold text-brand-green underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the full rules on GOV.UK (Simplified expenses: Vehicles) — opens in a new tab
        </a>
      </p>
    </aside>
  );
}
