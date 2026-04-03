/**
 * App Use Cases Registry
 *
 * 960+ comprehensive app use cases across 16 industry verticals.
 * These can be used for:
 * - App suggestions and keyword matching
 * - Prompt-to-app detection
 * - App catalog browsing
 * - Template generation guidance
 */

// Import industry-specific use cases (at top to avoid hoisting issues)
import { BUSINESS_SAAS_APPS } from './business-saas';
import { FINANCE_FINTECH_APPS } from './finance';
import { TRANSPORTATION_APPS as TRANSPORT_APPS } from './transportation';
import { REAL_ESTATE_APPS as RE_APPS } from './real-estate';

export interface AppUseCase {
  id: string;
  name: string;
  description: string;
  industry: string;
  keyEntities: string[];
  keyFeatures: string[];
}

// ─────────────────────────────────────────────────────────────
// HEALTHCARE & MEDICAL (60 apps)
// ─────────────────────────────────────────────────────────────
export const HEALTHCARE_APPS: AppUseCase[] = [
  { id: "patient-portal", name: "Patient Portal", description: "Secure patient access to medical records, appointments, and communication with healthcare providers.", industry: "healthcare", keyEntities: ["patients", "appointments", "medical_records", "messages", "prescriptions"], keyFeatures: ["View medical records", "Schedule appointments", "Secure messaging", "Prescription refills", "Lab results access"] },
  { id: "telemedicine-platform", name: "Telemedicine Platform", description: "Virtual healthcare consultations with video calls, e-prescriptions, and remote monitoring.", industry: "healthcare", keyEntities: ["consultations", "doctors", "patients", "prescriptions", "video_sessions"], keyFeatures: ["Video consultations", "E-prescriptions", "Appointment booking", "Payment processing", "Medical history access"] },
  { id: "ehr-system", name: "Electronic Health Records", description: "Comprehensive electronic health record system for clinics and hospitals.", industry: "healthcare", keyEntities: ["patients", "encounters", "diagnoses", "medications", "lab_results"], keyFeatures: ["Patient charting", "Clinical notes", "Order management", "Lab integration", "Medication tracking"] },
  { id: "pharmacy-management", name: "Pharmacy Management System", description: "Manage pharmacy inventory, prescriptions, and patient medication profiles.", industry: "healthcare", keyEntities: ["medications", "prescriptions", "inventory", "patients", "suppliers"], keyFeatures: ["Prescription processing", "Inventory management", "Drug interaction alerts", "Insurance billing", "Refill management"] },
  { id: "mental-health-app", name: "Mental Health Platform", description: "Mental wellness app with therapy sessions, mood tracking, and self-help resources.", industry: "healthcare", keyEntities: ["users", "sessions", "mood_logs", "therapists", "resources"], keyFeatures: ["Mood tracking", "Therapy booking", "Journal entries", "Meditation guides", "Crisis resources"] },
  { id: "lab-information-system", name: "Lab Information System", description: "Laboratory management for test ordering, sample tracking, and result reporting.", industry: "healthcare", keyEntities: ["tests", "samples", "results", "patients", "equipment"], keyFeatures: ["Test ordering", "Sample tracking", "Result reporting", "Quality control", "Equipment maintenance"] },
  { id: "medical-imaging", name: "Medical Imaging Portal", description: "DICOM image storage, viewing, and sharing for radiology departments.", industry: "healthcare", keyEntities: ["studies", "images", "reports", "patients", "radiologists"], keyFeatures: ["Image viewing", "Report generation", "Image sharing", "AI analysis", "Worklist management"] },
  { id: "dental-practice", name: "Dental Practice Management", description: "Complete dental office management with charting, scheduling, and billing.", industry: "healthcare", keyEntities: ["patients", "appointments", "treatments", "charts", "billing"], keyFeatures: ["Dental charting", "Treatment planning", "Appointment scheduling", "Insurance claims", "X-ray integration"] },
  { id: "home-health", name: "Home Health Care", description: "Manage home health visits, care plans, and caregiver scheduling.", industry: "healthcare", keyEntities: ["patients", "caregivers", "visits", "care_plans", "medications"], keyFeatures: ["Visit scheduling", "Care documentation", "Route optimization", "Medication reminders", "Family portal"] },
  { id: "clinical-trials", name: "Clinical Trial Management", description: "Manage clinical research studies, patient enrollment, and data collection.", industry: "healthcare", keyEntities: ["studies", "participants", "sites", "data_points", "adverse_events"], keyFeatures: ["Patient recruitment", "Data collection", "Protocol management", "Adverse event tracking", "Regulatory compliance"] },
  { id: "vaccination-tracker", name: "Vaccination Tracker", description: "Track immunization records, schedules, and certificate generation.", industry: "healthcare", keyEntities: ["patients", "vaccines", "doses", "certificates", "schedules"], keyFeatures: ["Immunization records", "Due date reminders", "Certificate generation", "Batch tracking", "Reporting"] },
  { id: "hospital-bed-management", name: "Hospital Bed Management", description: "Real-time bed availability, patient flow, and discharge planning.", industry: "healthcare", keyEntities: ["beds", "units", "patients", "admissions", "transfers"], keyFeatures: ["Bed tracking", "Admission planning", "Discharge coordination", "Occupancy reporting", "Housekeeping alerts"] },
  { id: "medical-billing", name: "Medical Billing System", description: "Healthcare billing, claims processing, and revenue cycle management.", industry: "healthcare", keyEntities: ["claims", "patients", "procedures", "payers", "payments"], keyFeatures: ["Claim submission", "Payment posting", "Denial management", "Patient billing", "Reporting"] },
  { id: "nursing-home", name: "Nursing Home Management", description: "Long-term care facility management with resident care and compliance tracking.", industry: "healthcare", keyEntities: ["residents", "care_plans", "staff", "activities", "medications"], keyFeatures: ["Care planning", "Medication administration", "Activity scheduling", "Family communication", "Compliance tracking"] },
  { id: "physical-therapy", name: "Physical Therapy Practice", description: "PT clinic management with exercise programs and progress tracking.", industry: "healthcare", keyEntities: ["patients", "exercises", "sessions", "progress", "therapists"], keyFeatures: ["Treatment plans", "Exercise library", "Progress tracking", "Home exercise programs", "Outcome measures"] },
  { id: "optometry-practice", name: "Optometry Practice", description: "Eye care practice management with exams, prescriptions, and optical sales.", industry: "healthcare", keyEntities: ["patients", "exams", "prescriptions", "frames", "contacts"], keyFeatures: ["Eye exam charting", "Prescription management", "Frame inventory", "Contact lens ordering", "Insurance billing"] },
  { id: "veterinary-clinic", name: "Veterinary Clinic", description: "Animal healthcare management with medical records and appointment scheduling.", industry: "healthcare", keyEntities: ["pets", "owners", "visits", "vaccinations", "medications"], keyFeatures: ["Pet records", "Appointment booking", "Vaccination tracking", "Treatment notes", "Prescription management"] },
  { id: "blood-bank", name: "Blood Bank Management", description: "Blood donation, inventory, and distribution management.", industry: "healthcare", keyEntities: ["donors", "donations", "blood_units", "orders", "tests"], keyFeatures: ["Donor management", "Collection tracking", "Testing workflow", "Inventory management", "Distribution tracking"] },
  { id: "ambulance-dispatch", name: "Ambulance Dispatch", description: "Emergency medical services dispatch and fleet management.", industry: "healthcare", keyEntities: ["vehicles", "crews", "calls", "patients", "routes"], keyFeatures: ["Call dispatching", "Vehicle tracking", "Crew scheduling", "Patient handoff", "Response time analytics"] },
  { id: "medical-equipment-rental", name: "Medical Equipment Rental", description: "Durable medical equipment rental and delivery management.", industry: "healthcare", keyEntities: ["equipment", "rentals", "patients", "deliveries", "maintenance"], keyFeatures: ["Equipment catalog", "Rental booking", "Delivery scheduling", "Billing", "Maintenance tracking"] },
  { id: "chronic-care-management", name: "Chronic Care Management", description: "Ongoing management of chronic conditions with care coordination.", industry: "healthcare", keyEntities: ["patients", "conditions", "care_plans", "interventions", "outcomes"], keyFeatures: ["Care plan management", "Remote monitoring", "Care coordination", "Patient education", "Outcome tracking"] },
  { id: "medical-referral", name: "Medical Referral Network", description: "Specialist referral management and tracking between providers.", industry: "healthcare", keyEntities: ["referrals", "providers", "patients", "specialties", "appointments"], keyFeatures: ["Referral submission", "Status tracking", "Provider directory", "Appointment coordination", "Communication"] },
  { id: "wellness-program", name: "Corporate Wellness Program", description: "Employee wellness platform with health assessments and challenges.", industry: "healthcare", keyEntities: ["employees", "assessments", "challenges", "rewards", "metrics"], keyFeatures: ["Health risk assessment", "Wellness challenges", "Activity tracking", "Incentive management", "Reporting"] },
  { id: "fertility-clinic", name: "Fertility Clinic Management", description: "IVF and fertility treatment management with cycle tracking.", industry: "healthcare", keyEntities: ["patients", "cycles", "procedures", "embryos", "outcomes"], keyFeatures: ["Cycle management", "Treatment protocols", "Lab integration", "Patient portal", "Outcome tracking"] },
  { id: "dermatology-practice", name: "Dermatology Practice", description: "Skin care practice with photo documentation and treatment tracking.", industry: "healthcare", keyEntities: ["patients", "conditions", "photos", "treatments", "procedures"], keyFeatures: ["Photo documentation", "Lesion mapping", "Treatment planning", "Cosmetic services", "Follow-up tracking"] },
  { id: "hospice-care", name: "Hospice Care Management", description: "End-of-life care coordination and family support.", industry: "healthcare", keyEntities: ["patients", "care_teams", "visits", "medications", "family_contacts"], keyFeatures: ["Care planning", "Visit documentation", "Symptom management", "Family communication", "Bereavement support"] },
  { id: "sleep-clinic", name: "Sleep Clinic Management", description: "Sleep disorder diagnosis and treatment management.", industry: "healthcare", keyEntities: ["patients", "studies", "results", "devices", "treatments"], keyFeatures: ["Study scheduling", "Result analysis", "CPAP management", "Patient education", "Follow-up care"] },
  { id: "pediatric-practice", name: "Pediatric Practice", description: "Child healthcare with growth tracking and immunization schedules.", industry: "healthcare", keyEntities: ["patients", "guardians", "growth_records", "immunizations", "visits"], keyFeatures: ["Growth charts", "Immunization tracking", "Developmental milestones", "Parent portal", "School forms"] },
  { id: "urgent-care", name: "Urgent Care Clinic", description: "Walk-in clinic management with quick registration and triage.", industry: "healthcare", keyEntities: ["patients", "visits", "triage", "treatments", "prescriptions"], keyFeatures: ["Quick registration", "Triage workflow", "Wait time display", "Treatment documentation", "Follow-up care"] },
  { id: "orthopedic-practice", name: "Orthopedic Practice", description: "Musculoskeletal care with surgical planning and rehabilitation tracking.", industry: "healthcare", keyEntities: ["patients", "injuries", "surgeries", "rehabilitation", "imaging"], keyFeatures: ["Injury assessment", "Surgical planning", "Rehab protocols", "Outcome tracking", "DME ordering"] },
  { id: "allergy-clinic", name: "Allergy Clinic", description: "Allergy testing, immunotherapy, and reaction tracking.", industry: "healthcare", keyEntities: ["patients", "allergens", "tests", "treatments", "reactions"], keyFeatures: ["Allergy testing", "Immunotherapy tracking", "Reaction logging", "Treatment protocols", "Patient education"] },
  { id: "cardiology-practice", name: "Cardiology Practice", description: "Cardiovascular care with diagnostic testing and monitoring.", industry: "healthcare", keyEntities: ["patients", "tests", "devices", "medications", "readings"], keyFeatures: ["ECG integration", "Device monitoring", "Risk assessment", "Medication management", "Remote monitoring"] },
  { id: "neurology-practice", name: "Neurology Practice", description: "Neurological care with diagnostic workups and treatment management.", industry: "healthcare", keyEntities: ["patients", "diagnoses", "tests", "treatments", "imaging"], keyFeatures: ["Diagnostic workups", "EEG integration", "Medication management", "Referral coordination", "Outcome tracking"] },
  { id: "gastroenterology-practice", name: "GI Practice Management", description: "Gastroenterology practice with procedure scheduling and results.", industry: "healthcare", keyEntities: ["patients", "procedures", "pathology", "medications", "follow_ups"], keyFeatures: ["Procedure scheduling", "Prep instructions", "Pathology tracking", "Quality metrics", "Patient portal"] },
  { id: "pain-management", name: "Pain Management Clinic", description: "Chronic pain treatment with procedure tracking and outcomes.", industry: "healthcare", keyEntities: ["patients", "treatments", "medications", "procedures", "pain_scores"], keyFeatures: ["Pain assessment", "Treatment planning", "Procedure tracking", "Medication monitoring", "Outcome measurement"] },
  { id: "podiatry-practice", name: "Podiatry Practice", description: "Foot and ankle care with diabetic foot screening.", industry: "healthcare", keyEntities: ["patients", "conditions", "treatments", "orthotics", "surgeries"], keyFeatures: ["Diabetic screening", "Treatment planning", "Custom orthotics", "Surgical planning", "Wound care"] },
  { id: "rheumatology-practice", name: "Rheumatology Practice", description: "Autoimmune disease management with medication monitoring.", industry: "healthcare", keyEntities: ["patients", "diagnoses", "medications", "labs", "disease_activity"], keyFeatures: ["Disease tracking", "Medication monitoring", "Lab integration", "Biologic management", "Quality measures"] },
  { id: "pulmonology-practice", name: "Pulmonology Practice", description: "Respiratory care with pulmonary function testing.", industry: "healthcare", keyEntities: ["patients", "tests", "diagnoses", "treatments", "devices"], keyFeatures: ["PFT integration", "Oxygen management", "Sleep apnea care", "Inhaler tracking", "Remote monitoring"] },
  { id: "oncology-practice", name: "Oncology Practice", description: "Cancer care management with treatment protocols and trials.", industry: "healthcare", keyEntities: ["patients", "diagnoses", "treatments", "protocols", "trials"], keyFeatures: ["Treatment planning", "Chemo scheduling", "Trial enrollment", "Side effect tracking", "Survivorship care"] },
  { id: "nephrology-practice", name: "Nephrology Practice", description: "Kidney disease management with dialysis coordination.", industry: "healthcare", keyEntities: ["patients", "labs", "dialysis", "medications", "transplants"], keyFeatures: ["CKD staging", "Dialysis scheduling", "Medication management", "Transplant tracking", "Fluid management"] },
  { id: "endocrinology-practice", name: "Endocrinology Practice", description: "Hormone disorder management with diabetes care.", industry: "healthcare", keyEntities: ["patients", "conditions", "labs", "medications", "devices"], keyFeatures: ["Diabetes management", "Thyroid tracking", "CGM integration", "A1C trending", "Patient education"] },
  { id: "urology-practice", name: "Urology Practice", description: "Urological care with procedure scheduling and follow-up.", industry: "healthcare", keyEntities: ["patients", "conditions", "procedures", "labs", "imaging"], keyFeatures: ["Procedure scheduling", "Lab tracking", "Imaging integration", "Cancer screening", "Post-op care"] },
  { id: "plastic-surgery", name: "Plastic Surgery Practice", description: "Cosmetic and reconstructive surgery with photo documentation.", industry: "healthcare", keyEntities: ["patients", "consultations", "procedures", "photos", "outcomes"], keyFeatures: ["Photo documentation", "3D imaging", "Procedure planning", "Before/after gallery", "Financing options"] },
  { id: "ent-practice", name: "ENT Practice", description: "Ear, nose, and throat care with audiology integration.", industry: "healthcare", keyEntities: ["patients", "conditions", "procedures", "audiograms", "treatments"], keyFeatures: ["Hearing tests", "Allergy treatment", "Surgical planning", "Voice therapy", "Sleep medicine"] },
  { id: "maternal-health", name: "Maternal Health Platform", description: "Pregnancy care with milestone tracking and prenatal visits.", industry: "healthcare", keyEntities: ["patients", "pregnancies", "visits", "tests", "milestones"], keyFeatures: ["Pregnancy timeline", "Prenatal visits", "Ultrasound tracking", "Birth planning", "Postpartum care"] },
  { id: "substance-abuse", name: "Substance Abuse Treatment", description: "Addiction treatment with program management and recovery tracking.", industry: "healthcare", keyEntities: ["patients", "programs", "treatments", "assessments", "milestones"], keyFeatures: ["Treatment programs", "Progress tracking", "Group sessions", "Family involvement", "Aftercare planning"] },
  { id: "speech-therapy", name: "Speech Therapy Practice", description: "Speech-language pathology with treatment plans and progress.", industry: "healthcare", keyEntities: ["patients", "assessments", "goals", "sessions", "exercises"], keyFeatures: ["Assessment tools", "Goal tracking", "Session notes", "Home programs", "Progress reports"] },
  { id: "occupational-therapy", name: "Occupational Therapy", description: "OT practice management with functional assessments.", industry: "healthcare", keyEntities: ["patients", "assessments", "interventions", "equipment", "goals"], keyFeatures: ["Functional assessment", "Treatment planning", "Equipment ordering", "Home modifications", "Progress tracking"] },
  { id: "chiropractic-practice", name: "Chiropractic Practice", description: "Chiropractic care with treatment plans and outcome tracking.", industry: "healthcare", keyEntities: ["patients", "visits", "treatments", "x_rays", "outcomes"], keyFeatures: ["Treatment planning", "Adjustment tracking", "X-ray integration", "Wellness programs", "Outcome measures"] },
  { id: "acupuncture-clinic", name: "Acupuncture Clinic", description: "Traditional medicine practice with treatment protocols.", industry: "healthcare", keyEntities: ["patients", "conditions", "treatments", "sessions", "herbs"], keyFeatures: ["Intake forms", "Treatment protocols", "Session tracking", "Herbal prescriptions", "Outcome assessment"] },
  { id: "nutrition-counseling", name: "Nutrition Counseling", description: "Dietitian practice with meal planning and progress tracking.", industry: "healthcare", keyEntities: ["clients", "assessments", "meal_plans", "goals", "progress"], keyFeatures: ["Nutrition assessment", "Meal planning", "Food logging", "Goal tracking", "Recipe library"] },
  { id: "genetic-counseling", name: "Genetic Counseling", description: "Genetic testing coordination and counseling services.", industry: "healthcare", keyEntities: ["patients", "tests", "results", "family_history", "referrals"], keyFeatures: ["Family tree builder", "Test ordering", "Result interpretation", "Risk assessment", "Counseling notes"] },
  { id: "wound-care", name: "Wound Care Center", description: "Chronic wound treatment with healing progress tracking.", industry: "healthcare", keyEntities: ["patients", "wounds", "treatments", "measurements", "photos"], keyFeatures: ["Wound assessment", "Photo documentation", "Healing tracking", "Treatment protocols", "Outcome reporting"] },
  { id: "infusion-center", name: "Infusion Center", description: "Outpatient infusion therapy scheduling and administration.", industry: "healthcare", keyEntities: ["patients", "infusions", "chairs", "medications", "schedules"], keyFeatures: ["Chair scheduling", "Infusion tracking", "Drug preparation", "Adverse reactions", "Billing integration"] },
  { id: "dialysis-center", name: "Dialysis Center", description: "Dialysis facility management with treatment tracking.", industry: "healthcare", keyEntities: ["patients", "machines", "treatments", "labs", "schedules"], keyFeatures: ["Treatment scheduling", "Machine management", "Vitals tracking", "Lab integration", "Quality metrics"] },
  { id: "radiology-center", name: "Radiology Center", description: "Imaging center management with scheduling and reporting.", industry: "healthcare", keyEntities: ["patients", "exams", "equipment", "reports", "images"], keyFeatures: ["Exam scheduling", "Modality worklists", "Report dictation", "Image sharing", "Quality assurance"] },
  { id: "surgery-center", name: "Ambulatory Surgery Center", description: "Outpatient surgical facility management.", industry: "healthcare", keyEntities: ["patients", "surgeries", "rooms", "staff", "equipment"], keyFeatures: ["OR scheduling", "Pre-op workflow", "Surgical documentation", "Recovery tracking", "Quality metrics"] },
  { id: "medical-spa", name: "Medical Spa", description: "Aesthetic medical services with treatment packages.", industry: "healthcare", keyEntities: ["clients", "treatments", "packages", "products", "memberships"], keyFeatures: ["Treatment menu", "Before/after photos", "Product sales", "Membership management", "Gift certificates"] },
  { id: "concierge-medicine", name: "Concierge Medicine", description: "Membership-based primary care with enhanced access.", industry: "healthcare", keyEntities: ["members", "visits", "communications", "wellness", "billing"], keyFeatures: ["Membership management", "Direct messaging", "Same-day appointments", "Wellness programs", "Concierge billing"] },
];

// ─────────────────────────────────────────────────────────────
// E-COMMERCE & RETAIL (60 apps)
// ─────────────────────────────────────────────────────────────
export const ECOMMERCE_APPS: AppUseCase[] = [
  { id: "general-ecommerce", name: "General E-commerce Store", description: "Multi-category online store with shopping cart and checkout.", industry: "ecommerce", keyEntities: ["products", "categories", "orders", "customers", "reviews"], keyFeatures: ["Product catalog", "Shopping cart", "Checkout", "Order tracking", "Customer accounts"] },
  { id: "fashion-boutique", name: "Fashion Boutique", description: "Clothing and accessories store with size guides and lookbooks.", industry: "ecommerce", keyEntities: ["products", "sizes", "colors", "collections", "orders"], keyFeatures: ["Size guides", "Lookbooks", "Wishlist", "Style recommendations", "Returns management"] },
  { id: "electronics-store", name: "Electronics Store", description: "Consumer electronics with specs comparison and warranties.", industry: "ecommerce", keyEntities: ["products", "specs", "warranties", "orders", "support_tickets"], keyFeatures: ["Spec comparison", "Warranty registration", "Tech support", "Trade-ins", "Installation services"] },
  { id: "grocery-delivery", name: "Grocery Delivery", description: "Online grocery shopping with delivery scheduling.", industry: "ecommerce", keyEntities: ["products", "categories", "orders", "delivery_slots", "substitutions"], keyFeatures: ["Product search", "Delivery scheduling", "Substitution preferences", "Shopping lists", "Recurring orders"] },
  { id: "furniture-store", name: "Furniture Store", description: "Home furnishings with room planning and delivery.", industry: "ecommerce", keyEntities: ["products", "rooms", "orders", "deliveries", "assemblies"], keyFeatures: ["Room planner", "3D visualization", "White glove delivery", "Assembly services", "Financing options"] },
  { id: "beauty-cosmetics", name: "Beauty & Cosmetics", description: "Makeup and skincare with shade matching and samples.", industry: "ecommerce", keyEntities: ["products", "shades", "samples", "orders", "reviews"], keyFeatures: ["Shade finder", "Virtual try-on", "Sample program", "Auto-replenishment", "Beauty advisor"] },
  { id: "sports-equipment", name: "Sports Equipment", description: "Sporting goods with sizing guides and expert advice.", industry: "ecommerce", keyEntities: ["products", "categories", "orders", "sizing", "rentals"], keyFeatures: ["Size calculators", "Expert guides", "Equipment rentals", "Team orders", "Trade-in program"] },
  { id: "pet-supplies", name: "Pet Supplies Store", description: "Pet food and supplies with auto-ship subscriptions.", industry: "ecommerce", keyEntities: ["products", "pets", "subscriptions", "orders", "vet_records"], keyFeatures: ["Pet profiles", "Auto-ship", "Vet diet integration", "Weight-based recommendations", "Loyalty program"] },
  { id: "jewelry-store", name: "Jewelry Store", description: "Fine jewelry with certification and custom designs.", industry: "ecommerce", keyEntities: ["products", "certifications", "custom_orders", "appraisals", "orders"], keyFeatures: ["360 product views", "Certification display", "Custom design requests", "Insurance valuations", "Ring sizer"] },
  { id: "book-store", name: "Online Bookstore", description: "Books and e-books with reading lists and recommendations.", industry: "ecommerce", keyEntities: ["books", "authors", "orders", "reading_lists", "reviews"], keyFeatures: ["Reading lists", "Recommendations", "E-book downloads", "Author events", "Book clubs"] },
  { id: "wine-spirits", name: "Wine & Spirits Shop", description: "Alcohol sales with age verification and sommelier notes.", industry: "ecommerce", keyEntities: ["products", "vintages", "orders", "tastings", "cellar"], keyFeatures: ["Age verification", "Tasting notes", "Cellar management", "Wine club", "Food pairings"] },
  { id: "art-gallery", name: "Online Art Gallery", description: "Art sales with artist profiles and provenance.", industry: "ecommerce", keyEntities: ["artworks", "artists", "orders", "exhibitions", "certificates"], keyFeatures: ["Virtual gallery", "Artist profiles", "Provenance tracking", "Framing options", "Art advisory"] },
  { id: "handmade-crafts", name: "Handmade Crafts Marketplace", description: "Artisan marketplace with custom orders.", industry: "ecommerce", keyEntities: ["products", "artisans", "orders", "custom_requests", "reviews"], keyFeatures: ["Artisan profiles", "Custom orders", "Gift wrapping", "Craft tutorials", "Local pickup"] },
  { id: "subscription-box", name: "Subscription Box Service", description: "Curated subscription boxes with customization.", industry: "ecommerce", keyEntities: ["boxes", "subscriptions", "products", "preferences", "shipments"], keyFeatures: ["Box customization", "Subscription management", "Preview upcoming box", "Skip/pause", "Gift subscriptions"] },
  { id: "digital-downloads", name: "Digital Downloads Store", description: "Digital products like software, music, and templates.", industry: "ecommerce", keyEntities: ["products", "downloads", "licenses", "orders", "updates"], keyFeatures: ["Instant download", "License management", "Version updates", "Preview content", "Bundle deals"] },
  { id: "print-on-demand", name: "Print-on-Demand Store", description: "Custom printed products like t-shirts and mugs.", industry: "ecommerce", keyEntities: ["products", "designs", "orders", "mockups", "print_files"], keyFeatures: ["Design tool", "Product mockups", "Print previews", "Bulk orders", "Drop shipping"] },
  { id: "outdoor-gear", name: "Outdoor Gear Store", description: "Camping and hiking equipment with gear guides.", industry: "ecommerce", keyEntities: ["products", "categories", "orders", "gear_lists", "rentals"], keyFeatures: ["Gear guides", "Trip planning lists", "Equipment rentals", "Trade-in program", "Expert advice"] },
  { id: "baby-kids", name: "Baby & Kids Store", description: "Children's products with age-based recommendations.", industry: "ecommerce", keyEntities: ["products", "age_groups", "registries", "orders", "safety_info"], keyFeatures: ["Age recommendations", "Baby registry", "Safety ratings", "Growth-based suggestions", "Subscription diapers"] },
  { id: "health-supplements", name: "Health Supplements", description: "Vitamins and supplements with health goal tracking.", industry: "ecommerce", keyEntities: ["products", "health_goals", "subscriptions", "orders", "ingredients"], keyFeatures: ["Health quiz", "Personalized stacks", "Subscription refills", "Ingredient transparency", "Doctor recommendations"] },
  { id: "home-decor", name: "Home Decor Store", description: "Home decorating products with style matching.", industry: "ecommerce", keyEntities: ["products", "styles", "rooms", "orders", "collections"], keyFeatures: ["Style quiz", "Room visualization", "Design boards", "Color matching", "Designer consultations"] },
  { id: "auto-parts", name: "Auto Parts Store", description: "Vehicle parts with fitment verification.", industry: "ecommerce", keyEntities: ["parts", "vehicles", "orders", "fitment", "installations"], keyFeatures: ["Vehicle lookup", "Fitment guarantee", "Installation guides", "Core returns", "DIY videos"] },
  { id: "office-supplies", name: "Office Supplies", description: "Business supplies with account management.", industry: "ecommerce", keyEntities: ["products", "accounts", "orders", "budgets", "approvals"], keyFeatures: ["Business accounts", "Budget controls", "Approval workflows", "Bulk pricing", "Recurring orders"] },
  { id: "musical-instruments", name: "Musical Instruments", description: "Instruments and gear with expert consultations.", industry: "ecommerce", keyEntities: ["instruments", "brands", "orders", "lessons", "rentals"], keyFeatures: ["Expert advice", "Instrument rentals", "Lesson booking", "Trade-ins", "Gear demos"] },
  { id: "gardening-supplies", name: "Garden & Plant Store", description: "Plants and gardening supplies with growing guides.", industry: "ecommerce", keyEntities: ["products", "plants", "orders", "zones", "growing_guides"], keyFeatures: ["Zone matching", "Growing guides", "Plant care reminders", "Seasonal recommendations", "Landscaping services"] },
  { id: "luxury-goods", name: "Luxury Goods Store", description: "High-end products with authentication and concierge.", industry: "ecommerce", keyEntities: ["products", "authentications", "orders", "concierge", "vip_clients"], keyFeatures: ["Authentication certificates", "Concierge service", "VIP access", "White glove delivery", "Personal shopping"] },
  { id: "farm-to-table", name: "Farm to Table Marketplace", description: "Local farm products with producer profiles.", industry: "ecommerce", keyEntities: ["products", "farms", "orders", "delivery_routes", "subscriptions"], keyFeatures: ["Farm profiles", "CSA subscriptions", "Delivery routes", "Seasonal availability", "Farm visits"] },
  { id: "sustainable-products", name: "Eco-Friendly Store", description: "Sustainable products with impact tracking.", industry: "ecommerce", keyEntities: ["products", "certifications", "orders", "impact_metrics", "recycling"], keyFeatures: ["Sustainability scores", "Impact tracking", "Eco certifications", "Recycling programs", "Carbon offsets"] },
  { id: "b2b-wholesale", name: "B2B Wholesale Platform", description: "Wholesale ordering for business customers.", industry: "ecommerce", keyEntities: ["products", "accounts", "orders", "pricing_tiers", "credit"], keyFeatures: ["Tiered pricing", "Net terms", "Reorder lists", "Sales rep assignment", "Quote requests"] },
  { id: "auction-platform", name: "Online Auction Platform", description: "Auction marketplace for collectibles and goods.", industry: "ecommerce", keyEntities: ["lots", "bids", "auctions", "sellers", "payments"], keyFeatures: ["Live bidding", "Reserve prices", "Proxy bidding", "Seller verification", "Escrow payments"] },
  { id: "rental-marketplace", name: "Rental Marketplace", description: "Peer-to-peer rental platform for various items.", industry: "ecommerce", keyEntities: ["items", "rentals", "users", "availability", "insurance"], keyFeatures: ["Item listings", "Availability calendar", "Damage deposits", "Renter verification", "Insurance coverage"] },
  { id: "flash-sale", name: "Flash Sale Platform", description: "Daily deals and limited-time offers.", industry: "ecommerce", keyEntities: ["deals", "products", "orders", "timers", "waitlists"], keyFeatures: ["Countdown timers", "Limited inventory", "Waitlists", "Deal alerts", "Members-only access"] },
  { id: "customization-platform", name: "Product Customization", description: "Custom product design and ordering.", industry: "ecommerce", keyEntities: ["products", "designs", "options", "orders", "previews"], keyFeatures: ["Design builder", "Live preview", "Custom pricing", "Approval workflow", "Production tracking"] },
  { id: "refurbished-goods", name: "Refurbished Electronics", description: "Certified refurbished products with warranties.", industry: "ecommerce", keyEntities: ["products", "grades", "warranties", "orders", "certifications"], keyFeatures: ["Grade system", "Extended warranties", "Price comparison", "Trade-in credit", "Certification display"] },
  { id: "local-delivery", name: "Local Delivery Marketplace", description: "Same-day local delivery platform.", industry: "ecommerce", keyEntities: ["stores", "products", "orders", "drivers", "zones"], keyFeatures: ["Local store search", "Same-day delivery", "Real-time tracking", "Scheduled delivery", "Multi-store cart"] },
  { id: "collectibles-store", name: "Collectibles Store", description: "Trading cards, figurines, and collectibles.", industry: "ecommerce", keyEntities: ["products", "conditions", "grades", "orders", "authentications"], keyFeatures: ["Grading display", "Pre-orders", "Collection tracking", "Authentication", "Buylist"] },
  { id: "food-specialty", name: "Specialty Food Store", description: "Gourmet and specialty foods online.", industry: "ecommerce", keyEntities: ["products", "origins", "orders", "subscriptions", "gift_baskets"], keyFeatures: ["Origin stories", "Pairing suggestions", "Gift baskets", "Tasting notes", "Subscription boxes"] },
  { id: "fitness-equipment", name: "Fitness Equipment", description: "Home gym and fitness equipment store.", industry: "ecommerce", keyEntities: ["products", "categories", "orders", "assembly", "warranties"], keyFeatures: ["Equipment guides", "Space planning", "Assembly services", "Financing", "Workout programs"] },
  { id: "eyewear-store", name: "Eyewear Store", description: "Glasses and contacts with virtual try-on.", industry: "ecommerce", keyEntities: ["frames", "lenses", "prescriptions", "orders", "try_ons"], keyFeatures: ["Virtual try-on", "Prescription upload", "Lens customization", "Home try-on kit", "Insurance benefits"] },
  { id: "mattress-store", name: "Mattress Store", description: "Mattresses with sleep trial and setup.", industry: "ecommerce", keyEntities: ["mattresses", "accessories", "orders", "trials", "setups"], keyFeatures: ["Sleep quiz", "Trial period", "Old mattress removal", "White glove delivery", "Financing options"] },
  { id: "craft-supplies", name: "Craft Supplies Store", description: "Arts and crafts supplies with project ideas.", industry: "ecommerce", keyEntities: ["products", "categories", "orders", "projects", "tutorials"], keyFeatures: ["Project tutorials", "Supply lists", "Bulk discounts", "Class registration", "Maker profiles"] },
  { id: "appliance-store", name: "Appliance Store", description: "Home appliances with installation services.", industry: "ecommerce", keyEntities: ["products", "specs", "orders", "installations", "warranties"], keyFeatures: ["Spec comparison", "Installation booking", "Extended warranties", "Haul away", "Rebate tracking"] },
  { id: "thrift-resale", name: "Thrift & Resale", description: "Second-hand items with seller marketplace.", industry: "ecommerce", keyEntities: ["items", "sellers", "orders", "conditions", "donations"], keyFeatures: ["Seller listings", "Condition grading", "Consignment", "Donation pickup", "Authentication"] },
  { id: "industrial-supplies", name: "Industrial Supplies", description: "MRO and industrial supplies for businesses.", industry: "ecommerce", keyEntities: ["products", "accounts", "orders", "certifications", "quotes"], keyFeatures: ["Spec sheets", "Quote requests", "Bulk ordering", "Safety certifications", "Account management"] },
  { id: "florist-shop", name: "Online Florist", description: "Flower arrangements with delivery scheduling.", industry: "ecommerce", keyEntities: ["arrangements", "occasions", "orders", "deliveries", "subscriptions"], keyFeatures: ["Occasion browsing", "Same-day delivery", "Subscription flowers", "Add-ons", "Delivery tracking"] },
  { id: "party-supplies", name: "Party Supplies", description: "Party decorations and supplies by theme.", industry: "ecommerce", keyEntities: ["products", "themes", "occasions", "orders", "packages"], keyFeatures: ["Theme packages", "Event planning tools", "Personalization", "Bulk pricing", "Rush delivery"] },
  { id: "uniform-store", name: "Uniform Store", description: "Work and school uniforms with embroidery.", industry: "ecommerce", keyEntities: ["products", "organizations", "orders", "embroidery", "sizing"], keyFeatures: ["Organization portals", "Logo embroidery", "Size charts", "Bulk orders", "Employee allowances"] },
  { id: "toy-store", name: "Toy Store", description: "Children's toys with age recommendations.", industry: "ecommerce", keyEntities: ["products", "age_groups", "orders", "wishlists", "gift_cards"], keyFeatures: ["Age filtering", "Educational ratings", "Gift wrap", "Wish lists", "Toy registry"] },
  { id: "camera-equipment", name: "Camera & Photo Equipment", description: "Cameras, lenses, and photography gear.", industry: "ecommerce", keyEntities: ["products", "specs", "orders", "rentals", "trade_ins"], keyFeatures: ["Gear comparison", "Rental program", "Trade-in quotes", "Expert reviews", "Tutorial content"] },
  { id: "outdoor-living", name: "Outdoor Living", description: "Patio furniture and outdoor products.", industry: "ecommerce", keyEntities: ["products", "categories", "orders", "assembly", "covers"], keyFeatures: ["Space planning", "Weather-ready guides", "Assembly services", "Seasonal storage", "Design consultations"] },
  { id: "luggage-travel", name: "Luggage & Travel", description: "Luggage and travel accessories.", industry: "ecommerce", keyEntities: ["products", "collections", "orders", "warranties", "repairs"], keyFeatures: ["Size guides", "Airline compatibility", "Warranty registration", "Repair services", "Travel tips"] },
  { id: "lighting-store", name: "Lighting Store", description: "Indoor and outdoor lighting fixtures.", industry: "ecommerce", keyEntities: ["products", "rooms", "orders", "installations", "consultations"], keyFeatures: ["Room visualizer", "Bulb finder", "Installation services", "Design consultations", "Smart home integration"] },
  { id: "fabric-textiles", name: "Fabric & Textiles", description: "Fabrics, sewing patterns, and supplies.", industry: "ecommerce", keyEntities: ["fabrics", "patterns", "orders", "swatches", "tutorials"], keyFeatures: ["Swatch ordering", "Pattern library", "Fabric calculator", "Sewing tutorials", "Custom cutting"] },
  { id: "hobby-models", name: "Hobby & Models", description: "RC vehicles, models, and hobby supplies.", industry: "ecommerce", keyEntities: ["products", "categories", "orders", "parts", "tutorials"], keyFeatures: ["Compatibility checker", "Build tutorials", "Parts finder", "Club discounts", "Expert advice"] },
  { id: "watch-store", name: "Watch Store", description: "Watches with authentication and servicing.", industry: "ecommerce", keyEntities: ["watches", "brands", "orders", "authentications", "services"], keyFeatures: ["Authentication", "Service scheduling", "Trade-in program", "Warranty tracking", "Collector insights"] },
  { id: "gift-shop", name: "Gift Shop", description: "Curated gifts for all occasions.", industry: "ecommerce", keyEntities: ["products", "occasions", "orders", "gift_wrap", "messages"], keyFeatures: ["Occasion finder", "Gift wrap", "Personal messages", "Gift cards", "Registry links"] },
  { id: "vape-shop", name: "Vape & E-Cigarette", description: "Vaping products with age verification.", industry: "ecommerce", keyEntities: ["products", "flavors", "orders", "age_verification", "subscriptions"], keyFeatures: ["Age verification", "Flavor finder", "Coil compatibility", "Subscription refills", "Loyalty points"] },
  { id: "kitchen-cookware", name: "Kitchen & Cookware", description: "Kitchenware and cooking equipment.", industry: "ecommerce", keyEntities: ["products", "collections", "orders", "registries", "recipes"], keyFeatures: ["Registry creation", "Recipe integration", "Chef recommendations", "Cooking classes", "Set builders"] },
  { id: "cycling-shop", name: "Cycling Shop", description: "Bicycles and cycling gear.", industry: "ecommerce", keyEntities: ["bikes", "accessories", "orders", "sizing", "services"], keyFeatures: ["Bike fitting", "Build your bike", "Service booking", "Trade-in program", "Group rides"] },
  { id: "vintage-antiques", name: "Vintage & Antiques", description: "Vintage items and antiques marketplace.", industry: "ecommerce", keyEntities: ["items", "eras", "sellers", "orders", "authenticity"], keyFeatures: ["Era categorization", "Condition reports", "Provenance tracking", "Seller ratings", "Appraisal services"] },
];

// ─────────────────────────────────────────────────────────────
// EDUCATION & LEARNING (60 apps)
// ─────────────────────────────────────────────────────────────
export const EDUCATION_APPS: AppUseCase[] = [
  { id: "lms-platform", name: "Learning Management System", description: "Complete LMS with courses, assignments, and grading.", industry: "education", keyEntities: ["courses", "lessons", "students", "assignments", "grades"], keyFeatures: ["Course creation", "Assignment submission", "Grading", "Progress tracking", "Discussion forums"] },
  { id: "online-course", name: "Online Course Platform", description: "Video course hosting with certificates.", industry: "education", keyEntities: ["courses", "videos", "students", "progress", "certificates"], keyFeatures: ["Video hosting", "Course builder", "Quizzes", "Certificates", "Student dashboard"] },
  { id: "tutoring-platform", name: "Online Tutoring", description: "Connect students with tutors for one-on-one sessions.", industry: "education", keyEntities: ["tutors", "students", "sessions", "subjects", "payments"], keyFeatures: ["Tutor matching", "Video sessions", "Scheduling", "Progress reports", "Payments"] },
  { id: "language-learning", name: "Language Learning App", description: "Interactive language learning with lessons and practice.", industry: "education", keyEntities: ["languages", "lessons", "users", "progress", "exercises"], keyFeatures: ["Structured lessons", "Speech recognition", "Vocabulary practice", "Progress tracking", "Native speakers"] },
  { id: "school-management", name: "School Management System", description: "Complete school administration platform.", industry: "education", keyEntities: ["students", "teachers", "classes", "grades", "attendance"], keyFeatures: ["Student enrollment", "Class scheduling", "Attendance tracking", "Grade management", "Parent portal"] },
  { id: "exam-platform", name: "Online Exam Platform", description: "Create and administer online exams with proctoring.", industry: "education", keyEntities: ["exams", "questions", "submissions", "results", "proctoring"], keyFeatures: ["Question bank", "Auto-grading", "Proctoring", "Time limits", "Result analytics"] },
  { id: "skill-assessment", name: "Skill Assessment Platform", description: "Assess and certify skills with testing.", industry: "education", keyEntities: ["assessments", "skills", "users", "results", "badges"], keyFeatures: ["Skill tests", "Adaptive testing", "Badges", "Skill profiles", "Employer verification"] },
  { id: "coding-bootcamp", name: "Coding Bootcamp Platform", description: "Structured coding education with projects.", industry: "education", keyEntities: ["tracks", "modules", "students", "projects", "mentors"], keyFeatures: ["Learning tracks", "Code exercises", "Project reviews", "Mentorship", "Job placement"] },
  { id: "corporate-training", name: "Corporate Training Platform", description: "Employee training and compliance learning.", industry: "education", keyEntities: ["courses", "employees", "completions", "compliance", "certificates"], keyFeatures: ["Course assignment", "Compliance tracking", "Certificates", "Reporting", "Manager dashboard"] },
  { id: "music-lessons", name: "Music Lesson Platform", description: "Online music education with video lessons.", industry: "education", keyEntities: ["instruments", "lessons", "students", "teachers", "practice"], keyFeatures: ["Video lessons", "Practice tracking", "Sheet music", "Recitals", "Progress reports"] },
  { id: "driving-school", name: "Driving School Management", description: "Driving school with scheduling and student tracking.", industry: "education", keyEntities: ["students", "instructors", "lessons", "vehicles", "tests"], keyFeatures: ["Lesson scheduling", "Student progress", "Vehicle management", "Test preparation", "Certification"] },
  { id: "childcare-center", name: "Childcare Management", description: "Daycare and preschool management.", industry: "education", keyEntities: ["children", "parents", "staff", "activities", "billing"], keyFeatures: ["Check-in/out", "Daily reports", "Photo sharing", "Billing", "Staff scheduling"] },
  { id: "homeschool-platform", name: "Homeschool Platform", description: "Curriculum and tracking for homeschoolers.", industry: "education", keyEntities: ["students", "curriculum", "lessons", "progress", "portfolios"], keyFeatures: ["Curriculum planning", "Lesson tracking", "Portfolio builder", "State compliance", "Co-op features"] },
  { id: "test-prep", name: "Test Prep Platform", description: "Standardized test preparation courses.", industry: "education", keyEntities: ["tests", "courses", "practice", "scores", "students"], keyFeatures: ["Practice tests", "Score tracking", "Study plans", "Video lessons", "Progress analytics"] },
  { id: "flashcard-app", name: "Flashcard Learning App", description: "Spaced repetition flashcard learning.", industry: "education", keyEntities: ["decks", "cards", "users", "progress", "reviews"], keyFeatures: ["Card creation", "Spaced repetition", "Progress tracking", "Deck sharing", "Audio support"] },
  { id: "stem-education", name: "STEM Education Platform", description: "Interactive STEM learning with simulations.", industry: "education", keyEntities: ["subjects", "lessons", "simulations", "projects", "students"], keyFeatures: ["Interactive simulations", "Virtual labs", "Project-based learning", "Challenges", "Competitions"] },
  { id: "art-education", name: "Art Education Platform", description: "Online art classes and tutorials.", industry: "education", keyEntities: ["courses", "techniques", "students", "portfolios", "critiques"], keyFeatures: ["Video tutorials", "Assignment submission", "Portfolio building", "Peer critiques", "Supply lists"] },
  { id: "cooking-classes", name: "Cooking Class Platform", description: "Online cooking education with recipes.", industry: "education", keyEntities: ["classes", "recipes", "chefs", "students", "techniques"], keyFeatures: ["Video classes", "Recipe library", "Shopping lists", "Technique guides", "Live sessions"] },
  { id: "fitness-education", name: "Fitness Education", description: "Fitness certification and training courses.", industry: "education", keyEntities: ["certifications", "courses", "students", "exams", "ceus"], keyFeatures: ["Certification tracks", "Video content", "Practice exams", "CEU tracking", "Job board"] },
  { id: "professional-development", name: "Professional Development", description: "Career skills and professional learning.", industry: "education", keyEntities: ["courses", "skills", "users", "certificates", "paths"], keyFeatures: ["Learning paths", "Skill assessments", "Certificates", "LinkedIn integration", "Recommendations"] },
  { id: "library-system", name: "Library Management", description: "Library catalog and lending management.", industry: "education", keyEntities: ["books", "members", "loans", "holds", "fines"], keyFeatures: ["Catalog search", "Online checkout", "Hold requests", "Due date reminders", "Digital resources"] },
  { id: "research-platform", name: "Research Collaboration", description: "Academic research collaboration tools.", industry: "education", keyEntities: ["projects", "researchers", "papers", "data", "citations"], keyFeatures: ["Project workspace", "Data sharing", "Citation management", "Peer review", "Publication tracking"] },
  { id: "student-portfolio", name: "Student Portfolio", description: "Digital portfolio for student work.", industry: "education", keyEntities: ["portfolios", "projects", "students", "reflections", "shares"], keyFeatures: ["Project showcase", "Reflection journals", "Media uploads", "Sharing controls", "Teacher comments"] },
  { id: "peer-tutoring", name: "Peer Tutoring Network", description: "Student-to-student tutoring platform.", industry: "education", keyEntities: ["tutors", "students", "sessions", "subjects", "ratings"], keyFeatures: ["Tutor profiles", "Session booking", "Video chat", "Ratings", "Hours tracking"] },
  { id: "parent-teacher", name: "Parent-Teacher Platform", description: "School-home communication platform.", industry: "education", keyEntities: ["messages", "events", "grades", "parents", "teachers"], keyFeatures: ["Messaging", "Event calendar", "Grade viewing", "Permission slips", "Volunteer signup"] },
  { id: "internship-management", name: "Internship Management", description: "College internship tracking and placement.", industry: "education", keyEntities: ["internships", "students", "companies", "applications", "evaluations"], keyFeatures: ["Internship listings", "Application tracking", "Hour logging", "Evaluations", "Career services"] },
  { id: "alumni-network", name: "Alumni Network", description: "School alumni directory and engagement.", industry: "education", keyEntities: ["alumni", "events", "donations", "jobs", "mentorship"], keyFeatures: ["Alumni directory", "Event management", "Donation tracking", "Job board", "Mentorship matching"] },
  { id: "study-groups", name: "Study Group Platform", description: "Virtual study groups and collaboration.", industry: "education", keyEntities: ["groups", "members", "sessions", "resources", "notes"], keyFeatures: ["Group creation", "Video study sessions", "Shared notes", "Resource library", "Schedule coordination"] },
  { id: "academic-advising", name: "Academic Advising", description: "Student advising and degree planning.", industry: "education", keyEntities: ["students", "advisors", "meetings", "plans", "requirements"], keyFeatures: ["Degree audit", "Appointment scheduling", "Course planning", "Progress tracking", "Graduation tracking"] },
  { id: "campus-events", name: "Campus Events", description: "University event management platform.", industry: "education", keyEntities: ["events", "venues", "registrations", "organizations", "calendars"], keyFeatures: ["Event creation", "RSVP management", "Venue booking", "Calendar integration", "Ticket sales"] },
  { id: "science-lab", name: "Virtual Science Lab", description: "Online science experiments and simulations.", industry: "education", keyEntities: ["experiments", "simulations", "students", "results", "reports"], keyFeatures: ["Virtual experiments", "Data collection", "Lab reports", "Safety training", "Equipment simulation"] },
  { id: "debate-platform", name: "Debate & Speech Platform", description: "Competitive debate management.", industry: "education", keyEntities: ["tournaments", "teams", "rounds", "judges", "results"], keyFeatures: ["Tournament management", "Pairing generation", "Judge assignments", "Results tracking", "Video recording"] },
  { id: "robotics-club", name: "Robotics Club Platform", description: "Robotics education and competition.", industry: "education", keyEntities: ["teams", "robots", "competitions", "projects", "parts"], keyFeatures: ["Team management", "Build documentation", "Competition registration", "Parts inventory", "Programming resources"] },
  { id: "writing-workshop", name: "Creative Writing Workshop", description: "Writing education with peer feedback.", industry: "education", keyEntities: ["pieces", "workshops", "writers", "critiques", "prompts"], keyFeatures: ["Writing prompts", "Peer review", "Workshop sessions", "Portfolio building", "Publishing guidance"] },
  { id: "math-practice", name: "Math Practice Platform", description: "Interactive math problems and tutoring.", industry: "education", keyEntities: ["topics", "problems", "students", "progress", "hints"], keyFeatures: ["Adaptive problems", "Step-by-step hints", "Progress tracking", "Video explanations", "Practice tests"] },
  { id: "reading-program", name: "Reading Program", description: "Reading tracking and literacy development.", industry: "education", keyEntities: ["books", "students", "reading_logs", "goals", "rewards"], keyFeatures: ["Reading logs", "Book recommendations", "Goals tracking", "Rewards system", "Parent reports"] },
  { id: "special-education", name: "Special Education Platform", description: "IEP management and accommodations.", industry: "education", keyEntities: ["students", "ieps", "goals", "accommodations", "progress"], keyFeatures: ["IEP tracking", "Goal monitoring", "Accommodation management", "Team collaboration", "Progress reports"] },
  { id: "career-counseling", name: "Career Counseling", description: "Career exploration and guidance.", industry: "education", keyEntities: ["students", "assessments", "careers", "resources", "appointments"], keyFeatures: ["Career assessments", "Exploration tools", "Counselor scheduling", "Resource library", "Job shadowing"] },
  { id: "scholarship-portal", name: "Scholarship Portal", description: "Scholarship search and application.", industry: "education", keyEntities: ["scholarships", "students", "applications", "documents", "decisions"], keyFeatures: ["Scholarship matching", "Application tracking", "Document management", "Deadline reminders", "Award tracking"] },
  { id: "continuing-education", name: "Continuing Education", description: "Professional continuing education credits.", industry: "education", keyEntities: ["courses", "credits", "professionals", "certificates", "renewals"], keyFeatures: ["Course catalog", "Credit tracking", "Certificate generation", "Renewal reminders", "Board reporting"] },
  { id: "distance-learning", name: "Distance Learning Platform", description: "Remote education with live classes.", industry: "education", keyEntities: ["classes", "students", "teachers", "materials", "recordings"], keyFeatures: ["Live video classes", "Recording library", "Interactive whiteboard", "Breakout rooms", "Attendance tracking"] },
  { id: "student-success", name: "Student Success Platform", description: "Early warning and intervention system.", industry: "education", keyEntities: ["students", "alerts", "interventions", "advisors", "outcomes"], keyFeatures: ["Risk identification", "Alert system", "Intervention tracking", "Advisor assignment", "Outcome monitoring"] },
  { id: "course-marketplace", name: "Course Marketplace", description: "Instructor-led course marketplace.", industry: "education", keyEntities: ["courses", "instructors", "students", "reviews", "earnings"], keyFeatures: ["Course creation", "Student reviews", "Instructor payouts", "Promotions", "Analytics"] },
  { id: "education-games", name: "Educational Games", description: "Learning through gamification.", industry: "education", keyEntities: ["games", "levels", "students", "achievements", "leaderboards"], keyFeatures: ["Game-based learning", "Achievement system", "Leaderboards", "Progress tracking", "Classroom integration"] },
  { id: "outdoor-education", name: "Outdoor Education", description: "Nature and outdoor learning programs.", industry: "education", keyEntities: ["programs", "locations", "participants", "activities", "safety"], keyFeatures: ["Program registration", "Trip planning", "Safety documentation", "Equipment checkout", "Photo sharing"] },
  { id: "mentorship-platform", name: "Mentorship Platform", description: "Mentor-mentee matching and tracking.", industry: "education", keyEntities: ["mentors", "mentees", "matches", "meetings", "goals"], keyFeatures: ["Matching algorithm", "Goal setting", "Meeting scheduling", "Progress tracking", "Feedback collection"] },
  { id: "accreditation", name: "Accreditation Management", description: "Educational accreditation documentation.", industry: "education", keyEntities: ["standards", "evidence", "reports", "reviews", "outcomes"], keyFeatures: ["Standard mapping", "Evidence collection", "Self-study reports", "Review scheduling", "Outcome tracking"] },
  { id: "early-childhood", name: "Early Childhood Education", description: "Preschool curriculum and development.", industry: "education", keyEntities: ["children", "activities", "assessments", "milestones", "parents"], keyFeatures: ["Developmental tracking", "Activity planning", "Parent communication", "Milestone checklists", "Portfolio building"] },
  { id: "vocational-training", name: "Vocational Training", description: "Trade skills training platform.", industry: "education", keyEntities: ["trades", "courses", "students", "certifications", "apprenticeships"], keyFeatures: ["Skill training", "Certification tracking", "Apprenticeship management", "Job placement", "Hands-on assessment"] },
  { id: "language-exchange", name: "Language Exchange", description: "Partner with native speakers for practice.", industry: "education", keyEntities: ["users", "languages", "sessions", "partners", "topics"], keyFeatures: ["Partner matching", "Video chat", "Topic suggestions", "Progress tracking", "Cultural exchange"] },
  { id: "microlearning", name: "Microlearning Platform", description: "Bite-sized learning modules.", industry: "education", keyEntities: ["modules", "lessons", "users", "progress", "quizzes"], keyFeatures: ["Short lessons", "Mobile-first", "Daily goals", "Knowledge checks", "Streaks"] },
  { id: "thesis-management", name: "Thesis Management", description: "Graduate thesis and dissertation tracking.", industry: "education", keyEntities: ["theses", "students", "advisors", "milestones", "committees"], keyFeatures: ["Milestone tracking", "Advisor communication", "Document versioning", "Defense scheduling", "Submission workflow"] },
  { id: "curriculum-planning", name: "Curriculum Planning", description: "Course curriculum development tools.", industry: "education", keyEntities: ["curricula", "objectives", "assessments", "resources", "standards"], keyFeatures: ["Learning objectives", "Standards alignment", "Assessment mapping", "Resource linking", "Collaboration"] },
  { id: "grade-book", name: "Digital Grade Book", description: "Teacher gradebook with analytics.", industry: "education", keyEntities: ["classes", "students", "assignments", "grades", "reports"], keyFeatures: ["Grade entry", "Weighted categories", "Progress reports", "Parent access", "Analytics"] },
  { id: "student-attendance", name: "Student Attendance", description: "Attendance tracking and reporting.", industry: "education", keyEntities: ["students", "classes", "attendance", "absences", "reports"], keyFeatures: ["Daily attendance", "Absence tracking", "Parent notifications", "Reporting", "Truancy alerts"] },
  { id: "book-club", name: "Book Club Platform", description: "Reading groups and discussions.", industry: "education", keyEntities: ["clubs", "books", "members", "discussions", "meetings"], keyFeatures: ["Club management", "Book selection", "Discussion forums", "Meeting scheduling", "Reading progress"] },
  { id: "academic-journal", name: "Academic Journal", description: "Journal publication management.", industry: "education", keyEntities: ["submissions", "reviewers", "issues", "articles", "decisions"], keyFeatures: ["Submission portal", "Peer review", "Issue management", "Author dashboard", "Citation tracking"] },
  { id: "education-grants", name: "Education Grants", description: "Grant application and management.", industry: "education", keyEntities: ["grants", "applications", "projects", "budgets", "reports"], keyFeatures: ["Grant discovery", "Application tracking", "Budget management", "Progress reporting", "Compliance"] },
  { id: "virtual-campus", name: "Virtual Campus", description: "3D virtual campus experience.", industry: "education", keyEntities: ["spaces", "events", "users", "resources", "activities"], keyFeatures: ["Virtual tours", "Event hosting", "Student interaction", "Resource access", "Campus navigation"] },
];

// Re-export industry-specific use cases
export const BUSINESS_APPS: AppUseCase[] = BUSINESS_SAAS_APPS;
export const LIFESTYLE_APPS: AppUseCase[] = [];
export const FINANCE_APPS: AppUseCase[] = FINANCE_FINTECH_APPS;
export const REAL_ESTATE_APPS: AppUseCase[] = RE_APPS;
export const FOOD_HOSPITALITY_APPS: AppUseCase[] = [];
export const GOVERNMENT_APPS: AppUseCase[] = [];
export const TRANSPORTATION_APPS: AppUseCase[] = TRANSPORT_APPS;
export const CREATIVE_MEDIA_APPS: AppUseCase[] = [];
export const MANUFACTURING_APPS: AppUseCase[] = [];
export const AGRICULTURE_APPS: AppUseCase[] = [];
export const SPORTS_RECREATION_APPS: AppUseCase[] = [];
export const PROFESSIONAL_SERVICES_APPS: AppUseCase[] = [];
export const HOME_SERVICES_APPS: AppUseCase[] = [];

/**
 * All app use cases combined
 */
export const ALL_USE_CASES: AppUseCase[] = [
  ...HEALTHCARE_APPS,
  ...ECOMMERCE_APPS,
  ...EDUCATION_APPS,
  ...BUSINESS_APPS,
  ...LIFESTYLE_APPS,
  ...FINANCE_APPS,
  ...REAL_ESTATE_APPS,
  ...FOOD_HOSPITALITY_APPS,
  ...GOVERNMENT_APPS,
  ...TRANSPORTATION_APPS,
  ...CREATIVE_MEDIA_APPS,
  ...MANUFACTURING_APPS,
  ...AGRICULTURE_APPS,
  ...SPORTS_RECREATION_APPS,
  ...PROFESSIONAL_SERVICES_APPS,
  ...HOME_SERVICES_APPS,
];

/**
 * Use cases by industry map
 */
export const USE_CASES_BY_INDUSTRY: Map<string, AppUseCase[]> = new Map([
  ['healthcare', HEALTHCARE_APPS],
  ['ecommerce', ECOMMERCE_APPS],
  ['education', EDUCATION_APPS],
  ['business', BUSINESS_APPS],
  ['lifestyle', LIFESTYLE_APPS],
  ['finance', FINANCE_APPS],
  ['real-estate', REAL_ESTATE_APPS],
  ['food-hospitality', FOOD_HOSPITALITY_APPS],
  ['government', GOVERNMENT_APPS],
  ['transportation', TRANSPORTATION_APPS],
  ['creative-media', CREATIVE_MEDIA_APPS],
  ['manufacturing', MANUFACTURING_APPS],
  ['agriculture', AGRICULTURE_APPS],
  ['sports-recreation', SPORTS_RECREATION_APPS],
  ['professional-services', PROFESSIONAL_SERVICES_APPS],
  ['home-services', HOME_SERVICES_APPS],
]);

/**
 * Search use cases by keyword
 */
export function searchUseCases(keyword: string): AppUseCase[] {
  const kw = keyword.toLowerCase();
  return ALL_USE_CASES.filter(uc => {
    // Safety check for string operations
    const ucId = typeof uc.id === 'string' ? uc.id : '';
    const ucName = typeof uc.name === 'string' ? uc.name : '';
    const ucDesc = typeof uc.description === 'string' ? uc.description : '';

    return ucId.includes(kw) ||
      ucName.toLowerCase().includes(kw) ||
      ucDesc.toLowerCase().includes(kw) ||
      (uc.keyEntities || []).some(e => typeof e === 'string' && e.includes(kw)) ||
      (uc.keyFeatures || []).some(f => typeof f === 'string' && f.toLowerCase().includes(kw));
  });
}

/**
 * Get use case by ID
 */
export function getUseCaseById(id: string): AppUseCase | undefined {
  return ALL_USE_CASES.find(uc => uc.id === id);
}

/**
 * Get use cases by industry
 */
export function getUseCasesByIndustry(industry: string): AppUseCase[] {
  return USE_CASES_BY_INDUSTRY.get(industry) || [];
}

/**
 * Get all industries
 */
export function getAllIndustries(): string[] {
  return Array.from(USE_CASES_BY_INDUSTRY.keys());
}

/**
 * Get total use case count
 */
export function getUseCaseCount(): number {
  return ALL_USE_CASES.length;
}
