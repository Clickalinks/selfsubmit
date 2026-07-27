import { adminExpenses, defineForm, line } from "@/data/professionForms/shared";
import type { TradeFormTemplate } from "@/data/professionForms/types";

export const CREATIVE_FORMS: Record<string, TradeFormTemplate> = {
  "Graphic Designer (Freelance)": defineForm(
    "graphic_designer_freelance",
    "Graphic Designer",
    [
      line("income_projects", "Project & design fees"),
      line("income_retainer", "Retainers", "0 if none"),
      line("income_licensing", "Licence / usage fees", "0 if none"),
      line("income_other", "Other design income"),
    ],
    [
      line("equipment", "Computer & design equipment"),
      line("software", "Design software (Adobe, Figma, etc.)"),
      line("stock_assets", "Fonts, stock images & templates"),
      line("cloud_hosting", "Cloud storage & backups"),
      line("home_office", "Home office costs"),
      line("training", "Training & CPD", "0 if not applicable"),
      ...adminExpenses({ insuranceLabel: "Professional indemnity insurance" }),
    ],
  ),

  "Web Developer (Freelance)": defineForm(
    "web_developer_freelance",
    "Web Developer",
    [
      line("income_projects", "Development & build fees"),
      line("income_retainer", "Retainers & support contracts"),
      line("income_hosting_domain_resale", "Hosting / domain resale to clients", "0 if none"),
      line("income_maintenance_support", "Maintenance & emergency work"),
      line("income_other", "Other development income"),
    ],
    [
      line("equipment", "Computer & development kit"),
      line("software", "IDEs, tools & software"),
      line("api_dev_tools", "API & developer subscriptions"),
      line("cloud_hosting", "Hosting, cloud & backups"),
      line("home_office", "Home office costs"),
      line("training", "Training & CPD", "0 if not applicable"),
      ...adminExpenses({ insuranceLabel: "Professional indemnity insurance" }),
    ],
  ),

  "Cybersecurity Consultant": defineForm(
    "cybersecurity_consultant",
    "Cybersecurity Consultant",
    [
      line("income_projects", "Project & day rates"),
      line("income_retainer", "Retainers & retained advice"),
      line("income_maintenance_support", "Incident / support work", "0 if none"),
      line("income_other", "Other consulting income"),
    ],
    [
      line("equipment", "Laptop & security kit"),
      line("software", "Security tools & software"),
      line("training", "Certifications & CPD"),
      line("professional_bodies", "Professional body fees", "0 if none"),
      line("home_office", "Home office costs"),
      line("travel", "Travel to clients", "0 if remote only"),
      ...adminExpenses({ insuranceLabel: "Professional indemnity insurance" }),
    ],
  ),

  "Social Media Manager": defineForm(
    "social_media_manager",
    "Social Media Manager",
    [
      line("income_retainer", "Monthly retainers"),
      line("income_content_ads_social", "Content, ads & strategy fees"),
      line("income_projects", "One-off campaigns", "0 if none"),
      line("income_other", "Other social income"),
    ],
    [
      line("equipment", "Phone / computer for content", "Business use only"),
      line("software", "Scheduling & social tools"),
      line("scheduling_marketing_tools", "Email / ads tools", "0 if none"),
      line("stock_assets", "Stock photos & templates", "0 if none"),
      line("home_office", "Home office costs"),
      line("training", "Training & CPD", "0 if not applicable"),
      ...adminExpenses({ insuranceLabel: "Professional indemnity insurance" }),
    ],
  ),

  "Photographer (Freelance)": defineForm(
    "photographer_freelance",
    "Photographer",
    [
      line("income_projects", "Shoot & session fees"),
      line("income_photo_video_extras", "Editing, prints & second-shooter fees"),
      line("income_licensing", "Image licensing & usage fees"),
      line("income_other", "Other photography income"),
    ],
    [
      line("equipment", "Camera, lenses & lighting"),
      line("editing_storage_media", "Cards, drives, batteries & delivery media"),
      line("software", "Editing software"),
      line("studio_props", "Studio rent, backdrops & props", "0 if none"),
      line("equipment_insurance", "Equipment insurance"),
      line("travel", "Travel to shoots"),
      line("marketing", "Portfolio site & advertising", "0 if none"),
      ...adminExpenses({ includeMarketing: false, insuranceLabel: "Public liability insurance" }),
    ],
  ),

  Videographer: defineForm(
    "videographer",
    "Videographer",
    [
      line("income_projects", "Filming & production fees"),
      line("income_photo_video_extras", "Editing, drones & extras"),
      line("income_licensing", "Licensing & usage fees", "0 if none"),
      line("income_other", "Other video income"),
    ],
    [
      line("equipment", "Camera, audio & video kit"),
      line("editing_storage_media", "Drives, cards & media"),
      line("software", "Editing software"),
      line("drone_registration", "Drone registration & insurance", "0 if no drone"),
      line("equipment_insurance", "Equipment insurance"),
      line("travel", "Travel to jobs"),
      ...adminExpenses({ insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "Wedding Photographer": defineForm(
    "wedding_photographer",
    "Wedding Photographer",
    [
      line("income_projects", "Wedding package fees"),
      line("income_photo_video_extras", "Albums, prints & second shooter"),
      line("income_licensing", "Extra usage / commercial licence", "0 if none"),
      line("income_other", "Other wedding income"),
    ],
    [
      line("equipment", "Camera, lenses & lighting"),
      line("editing_storage_media", "Cards, drives & albums supplies"),
      line("software", "Editing software"),
      line("equipment_insurance", "Equipment insurance"),
      line("travel", "Travel to weddings"),
      line("marketing", "Advertising & wedding fairs"),
      ...adminExpenses({ includeMarketing: false, insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "IT Consultant": defineForm(
    "it_consultant",
    "IT Consultant",
    [
      line("income_projects", "Day rates & project fees"),
      line("income_retainer", "Retainers", "0 if none"),
      line("income_maintenance_support", "Support & ad-hoc work"),
      line("income_other", "Other IT income"),
    ],
    [
      line("equipment", "Laptop & IT kit"),
      line("software", "Software & licences"),
      line("training", "Training & certifications"),
      line("home_office", "Home office costs"),
      line("travel", "Travel to clients", "0 if remote only"),
      ...adminExpenses({ insuranceLabel: "Professional indemnity insurance" }),
    ],
  ),

  "Management Consultant": defineForm(
    "management_consultant",
    "Management Consultant",
    [
      line("income_projects", "Day rates & project fees"),
      line("income_retainer", "Retainers", "0 if none"),
      line("income_other", "Other consulting income"),
    ],
    [
      line("equipment", "Laptop (business use)"),
      line("software", "Software & research tools"),
      line("travel", "Travel & client meetings"),
      line("training", "CPD & training"),
      line("home_office", "Home office costs"),
      line("professional_bodies", "Professional body fees", "0 if none"),
      ...adminExpenses({ insuranceLabel: "Professional indemnity insurance" }),
    ],
  ),

  "Freelance Consultant": defineForm(
    "freelance_consultant",
    "Freelance Consultant",
    [
      line("income_projects", "Fees & day rates"),
      line("income_retainer", "Retainers", "0 if none"),
      line("income_other", "Other consulting income"),
    ],
    [
      line("equipment", "Laptop / phone (business use)"),
      line("software", "Software & tools"),
      line("travel", "Travel to clients", "0 if remote only"),
      line("home_office", "Home office costs"),
      line("training", "CPD & training", "0 if not applicable"),
      ...adminExpenses({ insuranceLabel: "Professional indemnity insurance" }),
    ],
  ),

  Bookkeeper: defineForm(
    "bookkeeper",
    "Bookkeeper",
    [
      line("income_retainer", "Monthly bookkeeping fees"),
      line("income_projects", "One-off catch-up / project fees"),
      line("income_maintenance_support", "Payroll / extras", "0 if none"),
      line("income_other", "Other bookkeeping income"),
    ],
    [
      line("equipment", "Computer (business use)"),
      line("software", "Bookkeeping & payroll software"),
      line("professional_bodies", "ICB / professional body fees"),
      line("training", "CPD & training"),
      line("home_office", "Home office costs"),
      ...adminExpenses({ insuranceLabel: "Professional indemnity insurance" }),
    ],
  ),

  "Freelance Content Creator": defineForm(
    "freelance_content_creator",
    "Content Creator",
    [
      line("income_content_ads_social", "Brand deals, content & ads fees"),
      line("income_projects", "One-off content projects"),
      line("income_licensing", "Licensing / usage fees", "0 if none"),
      line("income_other", "Other creator income"),
    ],
    [
      line("equipment", "Camera / phone / lights (business use)"),
      line("software", "Editing & creator tools"),
      line("stock_assets", "Music, fonts & stock", "0 if none"),
      line("home_office", "Home office / studio corner"),
      line("training", "Training", "0 if not applicable"),
      ...adminExpenses({ insuranceLabel: "Public liability / professional indemnity" }),
    ],
  ),

  Influencer: defineForm(
    "influencer",
    "Influencer",
    [
      line("income_content_ads_social", "Brand partnerships & sponsored posts"),
      line("income_affiliate", "Affiliate & referral income", "0 if none"),
      line("income_other", "Other influencer income"),
    ],
    [
      line("equipment", "Phone, camera & content kit"),
      line("software", "Editing & scheduling tools"),
      line("travel", "Travel for brand work", "0 if none"),
      line("home_office", "Home office / content space"),
      ...adminExpenses({ insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "Freelancer (General)": defineForm(
    "freelancer_general",
    "Freelancer (General)",
    [
      line("income_projects", "Project fees & invoices"),
      line("income_retainer", "Retainers", "0 if none"),
      line("income_other", "Other freelance income"),
    ],
    [
      line("equipment", "Equipment needed for your work"),
      line("software", "Software & subscriptions", "0 if none"),
      line("travel", "Travel to clients", "0 if none"),
      line("home_office", "Home office costs"),
      ...adminExpenses({ insuranceLabel: "Public liability / professional indemnity" }),
    ],
  ),

  "Small Sole Trader": defineForm(
    "small_sole_trader",
    "Small Sole Trader",
    [
      line("income_projects", "Sales / fees / invoices"),
      line("income_other", "Other business income"),
    ],
    [
      line("materials", "Stock or materials", "0 if none"),
      line("equipment", "Equipment", "0 if none"),
      line("travel", "Business travel", "0 if none"),
      line("home_office", "Home office costs", "0 if none"),
      ...adminExpenses(),
    ],
  ),

  "Side-hustle Business": defineForm(
    "side_hustle_business",
    "Side-hustle Business",
    [
      line("income_projects", "Side-hustle income"),
      line("income_other", "Other income from this hustle"),
    ],
    [
      line("materials", "Stock or materials", "0 if none"),
      line("equipment", "Equipment", "0 if none"),
      line("software", "Apps & tools", "0 if none"),
      line("travel", "Business travel", "0 if none"),
      line("home_office", "Home costs (business %)", "0 if none"),
      ...adminExpenses(),
    ],
  ),
};
