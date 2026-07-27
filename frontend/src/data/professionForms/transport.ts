import { adminExpenses, defineForm, line } from "@/data/professionForms/shared";
import type { TradeFormTemplate } from "@/data/professionForms/types";

const vehicleCore = [
  line("lease_finance", "Vehicle finance / lease / PCP", "0 if you own outright"),
  line("fuel", "Fuel & electric charging", "Business journeys only"),
  line("vehicle_insurance", "Vehicle insurance (hire & reward if needed)"),
  line("vehicle_tax_mot", "Road tax (VED) & MOT"),
  line("vehicle_repair", "Repairs & servicing"),
  line("congestion_ulez", "Congestion, ULEZ, clean-air & toll charges", "0 if none"),
  line("parking", "Parking", "0 if none"),
  line("breakdown_cover", "Breakdown cover", "0 if not applicable"),
];

export const TRANSPORT_FORMS: Record<string, TradeFormTemplate> = {
  "Taxi Driver": defineForm(
    "taxi_driver",
    "Taxi Driver",
    [
      line("income_meter_card", "Meter & card fare takings"),
      line("income_cash", "Cash fares"),
      line("income_booking_fees", "Radio / circuit booking fees paid to you"),
      line("income_waiting", "Waiting time & standing charges", "0 if none"),
      line("income_airport_caz", "Airport, CAZ & toll supplements (passenger-paid)"),
      line("income_tips", "Tips (declared amount)"),
      line("income_other", "Other taxi income"),
    ],
    [
      ...vehicleCore,
      line("cleaning", "Vehicle cleaning / valeting"),
      line("radio_dispatch", "Radio or dispatch circuit fees", "0 if not applicable"),
      line("licence_fees", "Taxi badge, licence & permit renewals"),
      line("dbs_checks", "DBS & background checks", "0 if not applicable"),
      line("uniform_required", "Uniform or operator kit", "0 if not applicable"),
      ...adminExpenses({ phoneId: "phone_data", bankId: "bank", includeInsurance: false }),
    ],
  ),

  "Uber Driver": defineForm(
    "uber_driver",
    "Uber / private hire driver",
    [
      line("income_app", "App ride payments (Uber, Bolt, etc.)"),
      line("income_surge_peak", "Surge, peak & platform bonuses"),
      line("income_cancellation", "Cancellation & no-show fees"),
      line("income_tips", "Tips (declared amount)"),
      line("income_other", "Other private hire income"),
    ],
    [
      ...vehicleCore,
      line("cleaning", "Vehicle cleaning / valeting"),
      line("app_commission", "App / platform commission (if shown separately)"),
      line("licence_fees", "PHV / PCO licence & badge renewals"),
      line("dbs_checks", "DBS & background checks", "0 if not applicable"),
      ...adminExpenses({ phoneId: "phone_data", bankId: "bank", includeInsurance: false }),
    ],
  ),

  "Delivery Driver": defineForm(
    "delivery_driver",
    "Delivery Driver",
    [
      line("income_delivery_fees", "Delivery fees & drop pay"),
      line("income_app", "App / platform payments"),
      line("income_surge_peak", "Peak, quest & platform bonuses"),
      line("income_tips", "Tips (declared amount)"),
      line("income_other", "Other delivery income"),
    ],
    [
      ...vehicleCore,
      line("app_commission", "App / platform fees (if shown separately)"),
      line("courier_kit", "Delivery bags, insulated boxes & kit"),
      line("uniform_required", "Uniform or branded kit", "0 if not applicable"),
      ...adminExpenses({ phoneId: "phone_data", bankId: "bank", includeInsurance: false }),
    ],
  ),

  "Courier / Van Driver": defineForm(
    "courier_van_driver",
    "Courier / Van Driver",
    [
      line("income_delivery_fees", "Job / route / drop fees"),
      line("income_courier_extras", "Overnight, express, pallet & oversize premiums"),
      line("income_app", "App or platform payments", "0 if contract only"),
      line("income_other", "Other courier income"),
    ],
    [
      ...vehicleCore,
      line("passenger_goods_insurance", "Goods-in-transit insurance", "0 if included in main policy"),
      line("courier_kit", "Straps, trolley, parcels kit"),
      line("parcel_app_fees", "Courier software & parcel protection", "0 if not applicable"),
      ...adminExpenses({ phoneId: "phone_data", bankId: "bank", includeInsurance: false }),
    ],
  ),

  "HGV / Lorry Driver": defineForm(
    "hgv_lorry_driver",
    "HGV / Lorry Driver",
    [
      line("income_delivery_fees", "Haulage / contract / day rates"),
      line("income_courier_extras", "Overnight, waiting & detention pay", "0 if none"),
      line("income_other", "Other HGV income"),
    ],
    [
      ...vehicleCore,
      line("licence_fees", "HGV licence, CPC & medical renewals"),
      line("training_cpd", "Driver CPC & training"),
      line("uniform_required", "PPE / workwear", "0 if not applicable"),
      ...adminExpenses({ phoneId: "phone_data", bankId: "bank", includeInsurance: false }),
    ],
  ),
};
