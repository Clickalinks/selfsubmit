import { adminExpenses, defineForm, line } from "@/data/professionForms/shared";
import type { TradeFormTemplate } from "@/data/professionForms/types";

export const TEACHING_FORMS: Record<string, TradeFormTemplate> = {
  "Driving Instructor": defineForm(
    "driving_instructor",
    "Driving Instructor",
    [
      line("income_lessons", "Lesson fees"),
      line("income_blocks", "Block bookings & packages"),
      line("income_tests", "Test day / accompanying fees"),
      line("income_motorway_intensive", "Motorway & intensive courses", "0 if none"),
      line("income_other", "Other instructor income"),
    ],
    [
      line("car_lease", "Dual-control car lease / finance / purchase"),
      line("vehicle_costs", "Fuel, insurance, tax, MOT, repairs & cleaning"),
      line("dual_controls", "Dual controls & adaptations", "0 if already fitted"),
      line("adi_registration", "ADI badge & registration renewals"),
      line("franchise_fees", "Driving school franchise fees", "0 if independent"),
      line("learner_insurance", "Extra learner insurance", "0 if included above"),
      line("dbs", "DBS checks"),
      line("materials", "Lesson materials & books", "0 if none"),
      ...adminExpenses({ phoneId: "phone", insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "Private Tutor": defineForm(
    "private_tutor",
    "Private Tutor",
    [
      line("income_lessons", "Lesson fees"),
      line("income_blocks", "Block bookings & courses"),
      line("income_tutor_exam_online", "Exam prep & online lessons"),
      line("income_group", "Group sessions", "0 if none"),
      line("income_resource_fees", "Materials / admin fees charged", "0 if none"),
      line("income_other", "Other tutoring income"),
    ],
    [
      line("materials", "Books, worksheets & materials"),
      line("laptop_tablet", "Laptop / tablet (business use)"),
      line("home_office", "Home office costs (simplified or actual %)"),
      line("online_platforms", "Online lesson tools (Zoom, etc.)"),
      line("dbs", "DBS & safeguarding checks"),
      line("travel", "Travel to pupils", "0 if online / at home only"),
      ...adminExpenses({ phoneId: "phone", insuranceLabel: "Public liability / professional indemnity" }),
    ],
  ),

  "Personal Trainer": defineForm(
    "personal_trainer",
    "Personal Trainer",
    [
      line("income_lessons", "1:1 session fees"),
      line("income_blocks", "Packages & block bookings"),
      line("income_group", "Group classes & boot camps"),
      line("income_pt_online_nutrition", "Online coaching & plans", "0 if none"),
      line("income_gym_studio_pass_through", "Studio hire recharged to clients", "0 if none"),
      line("income_other", "Other PT income"),
    ],
    [
      line("gym_studio_rent", "Gym / studio hire"),
      line("equipment_pt", "Training equipment (mats, weights, bands)"),
      line("travel", "Travel to clients", "0 if gym-only"),
      line("first_aid", "First aid certification"),
      line("dbs", "DBS checks", "0 if not required"),
      line("uniform", "Kit / branded wear", "0 if not applicable"),
      line("software", "Booking & coaching apps", "0 if not applicable"),
      ...adminExpenses({ phoneId: "phone", insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "Gym Coach": defineForm(
    "gym_coach",
    "Gym Coach",
    [
      line("income_lessons", "Coaching / class fees"),
      line("income_group", "Group classes"),
      line("income_blocks", "Packages & memberships", "0 if none"),
      line("income_other", "Other coaching income"),
    ],
    [
      line("gym_studio_rent", "Gym / studio hire", "0 if employed space provided"),
      line("equipment_pt", "Coaching equipment", "0 if gym provides"),
      line("first_aid", "First aid certification"),
      line("uniform", "Kit / branded wear", "0 if not applicable"),
      line("software", "Booking apps", "0 if not applicable"),
      ...adminExpenses({ phoneId: "phone", insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "Fitness Instructor": defineForm(
    "fitness_instructor",
    "Fitness Instructor",
    [
      line("income_group", "Class fees"),
      line("income_lessons", "1:1 or small group fees", "0 if classes only"),
      line("income_blocks", "Courses & packages", "0 if none"),
      line("income_other", "Other fitness income"),
    ],
    [
      line("gym_studio_rent", "Studio / hall hire"),
      line("equipment_pt", "Class equipment", "0 if venue provides"),
      line("travel", "Travel between venues", "0 if one venue"),
      line("first_aid", "First aid certification"),
      line("music_instruments", "Class music licences", "0 if not applicable"),
      line("uniform", "Kit / branded wear", "0 if not applicable"),
      ...adminExpenses({ phoneId: "phone", insuranceLabel: "Public liability insurance" }),
    ],
  ),

  "Music Teacher": defineForm(
    "music_teacher",
    "Music Teacher",
    [
      line("income_lessons", "Lesson fees"),
      line("income_blocks", "Term / block packages"),
      line("income_group", "Group lessons", "0 if none"),
      line("income_resource_fees", "Sheet music / exam fees charged", "0 if none"),
      line("income_other", "Other music teaching income"),
    ],
    [
      line("music_instruments", "Instruments, sheet music & teaching aids"),
      line("home_office", "Home studio / teaching room costs"),
      line("travel", "Travel to pupils", "0 if at your home only"),
      line("dbs", "DBS checks"),
      line("online_platforms", "Online lesson tools", "0 if in-person only"),
      ...adminExpenses({ phoneId: "phone", insuranceLabel: "Public liability / professional indemnity" }),
    ],
  ),

  Childminder: defineForm(
    "childminder",
    "Childminder",
    [
      line("income_lessons", "Childcare fees"),
      line("income_blocks", "Retainer / deposit income (taxable portion)", "0 if none"),
      line("income_resource_fees", "Meals / activities charged separately", "0 if included"),
      line("income_other", "Other childcare income"),
    ],
    [
      line("childcare_registration", "Ofsted / registration & renewals"),
      line("materials", "Toys, activities, crafts & learning materials"),
      line("food_ingredients", "Food & snacks for children"),
      line("home_office", "Home costs for childcare rooms (business %)"),
      line("dbs", "DBS & household checks"),
      line("first_aid", "Paediatric first aid"),
      line("insurance", "Public liability / childminding insurance"),
      line("training", "Safeguarding & CPD"),
      ...adminExpenses({
        phoneId: "phone",
        includeInsurance: false,
        includeMarketing: true,
      }),
    ],
  ),
};
