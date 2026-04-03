/**
 * Tool Taxonomy - Categorizes ALL tools by PRIMARY FUNCTIONAL PURPOSE
 *
 * This taxonomy solves the "keyword collision" problem where tools like:
 * - "dental_chart" (health record) was matching "create chart" (data visualization)
 * - "seating_chart" (event planning) was matching "create chart" (data visualization)
 *
 * By categorizing tools by what they ACTUALLY DO (not keywords), we can:
 * 1. Route user requests to the correct category first
 * 2. Only search within that category
 * 3. Eliminate false positives from keyword matching
 */

// Import FunctionalCategory from the single source of truth
import { FunctionalCategory } from './intent-classification.service';

// Re-export for convenience
export { FunctionalCategory };

// ============================================
// Tool Taxonomy Entry
// ============================================

export interface ToolTaxonomyEntry {
  category: FunctionalCategory;
  description: string;
  keywords: string[];
  inputTypes: string[];
  outputTypes: string[];
  tools: string[];
}

// ============================================
// TOOL_TO_CATEGORY - Quick lookup for any tool
// Complete mapping of ALL 1000+ tools
// ============================================

export const TOOL_TO_CATEGORY: Record<string, FunctionalCategory> = {
  // ==========================================
  // DATA VISUALIZATION - Charts FROM data
  // ==========================================
  data_visualizer: FunctionalCategory.DATA_VISUALIZATION,
  chart_builder: FunctionalCategory.DATA_VISUALIZATION,
  csv_chart: FunctionalCategory.DATA_VISUALIZATION,
  excel_chart: FunctionalCategory.DATA_VISUALIZATION,
  spreadsheet_chart: FunctionalCategory.DATA_VISUALIZATION,

  // ==========================================
  // DATA ANALYSIS
  // ==========================================
  data_analyzer: FunctionalCategory.DATA_ANALYSIS,
  spreadsheet_tool: FunctionalCategory.DATA_ANALYSIS,

  // ==========================================
  // HEALTH TRACKING - Medical/growth RECORDS
  // (NOT data visualization!)
  // ==========================================
  dental_chart: FunctionalCategory.HEALTH_TRACKING,
  baby_growth_chart: FunctionalCategory.HEALTH_TRACKING,
  growth_chart: FunctionalCategory.HEALTH_TRACKING,
  vaccination_record: FunctionalCategory.HEALTH_TRACKING,
  vaccination_schedule: FunctionalCategory.HEALTH_TRACKING,
  medication_tracker: FunctionalCategory.HEALTH_TRACKING,
  medication_reminder: FunctionalCategory.HEALTH_TRACKING,
  medication_dosage_calculator: FunctionalCategory.HEALTH_TRACKING,
  blood_pressure_log: FunctionalCategory.HEALTH_TRACKING,
  blood_pressure_tracker: FunctionalCategory.HEALTH_TRACKING,
  blood_sugar_log: FunctionalCategory.HEALTH_TRACKING,
  blood_sugar_tracker: FunctionalCategory.HEALTH_TRACKING,
  blood_type_calculator: FunctionalCategory.HEALTH_TRACKING,
  symptom_tracker: FunctionalCategory.HEALTH_TRACKING,
  eye_chart: FunctionalCategory.HEALTH_TRACKING,
  hearing_test: FunctionalCategory.HEALTH_TRACKING,
  pregnancy_tracker: FunctionalCategory.HEALTH_TRACKING,
  pregnancy_calculator: FunctionalCategory.HEALTH_TRACKING,
  menstrual_tracker: FunctionalCategory.HEALTH_TRACKING,
  menstrual_cycle_tracker: FunctionalCategory.HEALTH_TRACKING,
  sleep_tracker: FunctionalCategory.HEALTH_TRACKING,
  sleep_calculator: FunctionalCategory.HEALTH_TRACKING,
  sleep_schedule_calculator: FunctionalCategory.HEALTH_TRACKING,
  health_journal: FunctionalCategory.HEALTH_TRACKING,
  ovulation_calculator: FunctionalCategory.HEALTH_TRACKING,
  conception_calculator: FunctionalCategory.HEALTH_TRACKING,
  due_date_calculator: FunctionalCategory.HEALTH_TRACKING,
  drug_dosage: FunctionalCategory.HEALTH_TRACKING,
  iv_drip_rate: FunctionalCategory.HEALTH_TRACKING,
  altitude_sickness: FunctionalCategory.HEALTH_TRACKING,
  life_expectancy: FunctionalCategory.HEALTH_TRACKING,
  health_insurance_compare: FunctionalCategory.HEALTH_TRACKING,
  life_insurance_estimate: FunctionalCategory.HEALTH_TRACKING,
  medicare_eligibility: FunctionalCategory.HEALTH_TRACKING,
  breastfeeding_tracker: FunctionalCategory.HEALTH_TRACKING,
  formula_mixing_calculator: FunctionalCategory.HEALTH_TRACKING,

  // ==========================================
  // EVENT PLANNING - Seating, schedules
  // (NOT data visualization!)
  // ==========================================
  seating_chart: FunctionalCategory.EVENT_PLANNING,
  seating_chart_generator: FunctionalCategory.EVENT_PLANNING,
  chore_chart: FunctionalCategory.EVENT_PLANNING,
  chore_wheel: FunctionalCategory.EVENT_PLANNING,
  organizational_chart: FunctionalCategory.EVENT_PLANNING,
  event_planner: FunctionalCategory.EVENT_PLANNING,
  party_planner: FunctionalCategory.EVENT_PLANNING,
  event_budget: FunctionalCategory.EVENT_PLANNING,
  guest_list: FunctionalCategory.EVENT_PLANNING,
  rsvp_tracker: FunctionalCategory.EVENT_PLANNING,
  event_timeline: FunctionalCategory.EVENT_PLANNING,
  event_checklist: FunctionalCategory.EVENT_PLANNING,
  event_countdown: FunctionalCategory.EVENT_PLANNING,
  birthday_countdown: FunctionalCategory.EVENT_PLANNING,
  birthday_party_budget: FunctionalCategory.EVENT_PLANNING,
  graduation_party_planner: FunctionalCategory.EVENT_PLANNING,
  super_bowl_party: FunctionalCategory.EVENT_PLANNING,

  // ==========================================
  // WEDDING PLANNING
  // ==========================================
  wedding_planner: FunctionalCategory.WEDDING_PLANNING,
  wedding_seating_chart: FunctionalCategory.WEDDING_PLANNING,
  wedding_budget_calculator: FunctionalCategory.WEDDING_PLANNING,
  wedding_guest_list: FunctionalCategory.WEDDING_PLANNING,
  wedding_timeline: FunctionalCategory.WEDDING_PLANNING,
  wedding_alcohol_calculator: FunctionalCategory.WEDDING_PLANNING,
  wedding_cake_size: FunctionalCategory.WEDDING_PLANNING,
  wedding_flower_budget: FunctionalCategory.WEDDING_PLANNING,
  wedding_food_calculator: FunctionalCategory.WEDDING_PLANNING,
  wedding_invitation_count: FunctionalCategory.WEDDING_PLANNING,
  wedding_photo_album: FunctionalCategory.WEDDING_PLANNING,
  wedding_vendor_tip: FunctionalCategory.WEDDING_PLANNING,
  honeymoon_budget: FunctionalCategory.WEDDING_PLANNING,

  // ==========================================
  // IMAGE EDITING
  // ==========================================
  image_resizer: FunctionalCategory.IMAGE_EDITING,
  image_cropper: FunctionalCategory.IMAGE_EDITING,
  image_rotate: FunctionalCategory.IMAGE_EDITING,
  background_remover: FunctionalCategory.IMAGE_EDITING,
  watermark: FunctionalCategory.IMAGE_EDITING,
  image_editor: FunctionalCategory.IMAGE_EDITING,
  photo_editor: FunctionalCategory.IMAGE_EDITING,
  color_picker: FunctionalCategory.IMAGE_EDITING,
  color_blender: FunctionalCategory.IMAGE_EDITING,

  // ==========================================
  // IMAGE CONVERSION
  // ==========================================
  image_converter: FunctionalCategory.IMAGE_CONVERSION,
  image_compressor: FunctionalCategory.IMAGE_CONVERSION,
  format_converter: FunctionalCategory.IMAGE_CONVERSION,
  png_to_jpg: FunctionalCategory.IMAGE_CONVERSION,
  jpg_to_png: FunctionalCategory.IMAGE_CONVERSION,
  webp_converter: FunctionalCategory.IMAGE_CONVERSION,
  gif_creator: FunctionalCategory.IMAGE_CONVERSION,

  // ==========================================
  // IMAGE ENHANCEMENT
  // ==========================================
  image_upscaler: FunctionalCategory.IMAGE_ENHANCEMENT,
  image_enhancer: FunctionalCategory.IMAGE_ENHANCEMENT,
  image_restoration: FunctionalCategory.IMAGE_ENHANCEMENT,
  photo_enhancer: FunctionalCategory.IMAGE_ENHANCEMENT,
  colorization: FunctionalCategory.IMAGE_ENHANCEMENT,
  denoise: FunctionalCategory.IMAGE_ENHANCEMENT,

  // ==========================================
  // IMAGE GENERATION
  // ==========================================
  ai_image_generator: FunctionalCategory.IMAGE_GENERATION,
  ai_logo_generator: FunctionalCategory.IMAGE_GENERATION,
  avatar_generator: FunctionalCategory.IMAGE_GENERATION,
  banner_generator: FunctionalCategory.IMAGE_GENERATION,
  poster_generator: FunctionalCategory.IMAGE_GENERATION,
  flyer_designer: FunctionalCategory.IMAGE_GENERATION,
  business_card: FunctionalCategory.IMAGE_GENERATION,
  social_media_image: FunctionalCategory.IMAGE_GENERATION,

  // ==========================================
  // DOCUMENT CONVERSION
  // ==========================================
  pdf_merger: FunctionalCategory.DOCUMENT_CONVERSION,
  pdf_splitter: FunctionalCategory.DOCUMENT_CONVERSION,
  pdf_converter: FunctionalCategory.DOCUMENT_CONVERSION,
  pdf_compressor: FunctionalCategory.DOCUMENT_CONVERSION,
  document_converter: FunctionalCategory.DOCUMENT_CONVERSION,
  word_to_pdf: FunctionalCategory.DOCUMENT_CONVERSION,
  pdf_to_word: FunctionalCategory.DOCUMENT_CONVERSION,
  image_to_pdf: FunctionalCategory.DOCUMENT_CONVERSION,

  // ==========================================
  // DOCUMENT GENERATION
  // ==========================================
  invoice_generator: FunctionalCategory.DOCUMENT_GENERATION,
  receipt_generator: FunctionalCategory.DOCUMENT_GENERATION,
  quote_generator: FunctionalCategory.DOCUMENT_GENERATION,
  estimate_generator: FunctionalCategory.DOCUMENT_GENERATION,
  proposal_generator: FunctionalCategory.DOCUMENT_GENERATION,
  contract_generator: FunctionalCategory.DOCUMENT_GENERATION,
  resume_builder: FunctionalCategory.DOCUMENT_GENERATION,
  cover_letter: FunctionalCategory.DOCUMENT_GENERATION,
  certificate_maker: FunctionalCategory.DOCUMENT_GENERATION,
  business_plan: FunctionalCategory.DOCUMENT_GENERATION,
  nda_generator: FunctionalCategory.DOCUMENT_GENERATION,

  // ==========================================
  // FITNESS CALCULATORS
  // ==========================================
  bmi_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  bmi_prime: FunctionalCategory.FITNESS_CALCULATOR,
  bmr_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  tdee_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  calorie_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  macro_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  body_fat_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  ideal_weight: FunctionalCategory.FITNESS_CALCULATOR,
  ideal_weight_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  protein_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  water_intake: FunctionalCategory.FITNESS_CALCULATOR,
  water_intake_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  pace_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  one_rep_max: FunctionalCategory.FITNESS_CALCULATOR,
  one_rep_max_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  heart_rate_zones: FunctionalCategory.FITNESS_CALCULATOR,
  heart_rate_zone_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  target_heart_rate: FunctionalCategory.FITNESS_CALCULATOR,
  vo2_max_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  lean_body_mass_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  army_body_fat_calculator: FunctionalCategory.FITNESS_CALCULATOR,
  waist_to_hip_ratio: FunctionalCategory.FITNESS_CALCULATOR,
  ponderal_index: FunctionalCategory.FITNESS_CALCULATOR,
  split_time_calculator: FunctionalCategory.FITNESS_CALCULATOR,

  // ==========================================
  // FINANCIAL CALCULATORS
  // ==========================================
  loan_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  mortgage_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  investment_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  compound_interest: FunctionalCategory.FINANCIAL_CALCULATOR,
  compound_interest_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  savings_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  savings_goal_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  retirement_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  tax_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  tip_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  discount_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  roi_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  profit_margin: FunctionalCategory.FINANCIAL_CALCULATOR,
  profit_margin_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  break_even: FunctionalCategory.FINANCIAL_CALCULATOR,
  break_even_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  currency_converter: FunctionalCategory.FINANCIAL_CALCULATOR,
  salary_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  hourly_to_salary: FunctionalCategory.FINANCIAL_CALCULATOR,
  salary_to_hourly: FunctionalCategory.FINANCIAL_CALCULATOR,
  inflation_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  fire_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  coast_fire_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  debt_payoff: FunctionalCategory.FINANCIAL_CALCULATOR,
  debt_payoff_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  amortization_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  amortization_schedule: FunctionalCategory.FINANCIAL_CALCULATOR,
  budget_planner: FunctionalCategory.FINANCIAL_CALCULATOR,
  expense_tracker: FunctionalCategory.FINANCIAL_CALCULATOR,
  net_worth: FunctionalCategory.FINANCIAL_CALCULATOR,
  net_worth_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  cagr_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  bond_yield_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  dividend_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  stock_average_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  future_value_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  present_value_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  npv_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  irr_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  payback_period: FunctionalCategory.FINANCIAL_CALCULATOR,
  depreciation_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  capital_gains: FunctionalCategory.FINANCIAL_CALCULATOR,
  capital_gains_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  estate_tax_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  inheritance_tax: FunctionalCategory.FINANCIAL_CALCULATOR,
  paycheck_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  payroll_tax_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  bonus_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  overtime_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  raise_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  severance_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  pto_accrual_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  pension_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  social_security_estimate: FunctionalCategory.FINANCIAL_CALCULATOR,
  emergency_fund: FunctionalCategory.FINANCIAL_CALCULATOR,
  emergency_fund_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  debt_consolidation: FunctionalCategory.FINANCIAL_CALCULATOR,
  debt_consolidation_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  college_savings_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  college_cost: FunctionalCategory.FINANCIAL_CALCULATOR,
  scholarship_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  self_employment_tax: FunctionalCategory.FINANCIAL_CALCULATOR,
  gst_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  vat_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  sales_tax: FunctionalCategory.FINANCIAL_CALCULATOR,
  sales_tax_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  income_tax_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  customs_duty_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  tithe_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  zakat_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  cash_flow_calculator: FunctionalCategory.FINANCIAL_CALCULATOR,
  rule_of_72: FunctionalCategory.FINANCIAL_CALCULATOR,

  // ==========================================
  // MATH CALCULATORS
  // ==========================================
  percentage_calculator: FunctionalCategory.MATH_CALCULATOR,
  fraction_calculator: FunctionalCategory.MATH_CALCULATOR,
  scientific_calculator: FunctionalCategory.MATH_CALCULATOR,
  equation_solver: FunctionalCategory.MATH_CALCULATOR,
  gcd_calculator: FunctionalCategory.MATH_CALCULATOR,
  gcd_lcm_calculator: FunctionalCategory.MATH_CALCULATOR,
  lcm_calculator: FunctionalCategory.MATH_CALCULATOR,
  prime_factorization: FunctionalCategory.MATH_CALCULATOR,
  prime_checker: FunctionalCategory.MATH_CALCULATOR,
  factorial_calculator: FunctionalCategory.MATH_CALCULATOR,
  logarithm_calculator: FunctionalCategory.MATH_CALCULATOR,
  quadratic_solver: FunctionalCategory.MATH_CALCULATOR,
  pythagorean: FunctionalCategory.MATH_CALCULATOR,
  pythagorean_calculator: FunctionalCategory.MATH_CALCULATOR,
  matrix_calculator: FunctionalCategory.MATH_CALCULATOR,
  combination: FunctionalCategory.MATH_CALCULATOR,
  combination_calculator: FunctionalCategory.MATH_CALCULATOR,
  permutation: FunctionalCategory.MATH_CALCULATOR,
  permutation_calculator: FunctionalCategory.MATH_CALCULATOR,
  binomial_calculator: FunctionalCategory.MATH_CALCULATOR,
  mean_calculator: FunctionalCategory.MATH_CALCULATOR,
  median_calculator: FunctionalCategory.MATH_CALCULATOR,
  mode_calculator: FunctionalCategory.MATH_CALCULATOR,
  standard_deviation: FunctionalCategory.MATH_CALCULATOR,
  standard_deviation_calculator: FunctionalCategory.MATH_CALCULATOR,
  variance_calculator: FunctionalCategory.MATH_CALCULATOR,
  probability_calculator: FunctionalCategory.MATH_CALCULATOR,
  percentile_calculator: FunctionalCategory.MATH_CALCULATOR,
  z_score_calculator: FunctionalCategory.MATH_CALCULATOR,
  confidence_interval: FunctionalCategory.MATH_CALCULATOR,
  correlation_calculator: FunctionalCategory.MATH_CALCULATOR,
  regression_calculator: FunctionalCategory.MATH_CALCULATOR,
  sample_size_calculator: FunctionalCategory.MATH_CALCULATOR,
  scientific_notation: FunctionalCategory.MATH_CALCULATOR,
  circle_calculator: FunctionalCategory.MATH_CALCULATOR,
  sphere_calculator: FunctionalCategory.MATH_CALCULATOR,
  cylinder_calculator: FunctionalCategory.MATH_CALCULATOR,
  cone_calculator: FunctionalCategory.MATH_CALCULATOR,
  triangle_calculator: FunctionalCategory.MATH_CALCULATOR,
  aspect_ratio_calculator: FunctionalCategory.MATH_CALCULATOR,

  // ==========================================
  // UNIT CONVERTERS
  // ==========================================
  length_converter: FunctionalCategory.UNIT_CONVERTER,
  weight_converter: FunctionalCategory.UNIT_CONVERTER,
  temperature_converter: FunctionalCategory.UNIT_CONVERTER,
  volume_converter: FunctionalCategory.UNIT_CONVERTER,
  area_converter: FunctionalCategory.UNIT_CONVERTER,
  speed_converter: FunctionalCategory.UNIT_CONVERTER,
  time_converter: FunctionalCategory.UNIT_CONVERTER,
  time_unit_converter: FunctionalCategory.UNIT_CONVERTER,
  data_storage_converter: FunctionalCategory.UNIT_CONVERTER,
  pressure_converter: FunctionalCategory.UNIT_CONVERTER,
  energy_converter: FunctionalCategory.UNIT_CONVERTER,
  angle_converter: FunctionalCategory.UNIT_CONVERTER,
  mass_converter: FunctionalCategory.UNIT_CONVERTER,
  power_converter: FunctionalCategory.UNIT_CONVERTER,
  force_converter: FunctionalCategory.UNIT_CONVERTER,
  torque_converter: FunctionalCategory.UNIT_CONVERTER,
  frequency_converter: FunctionalCategory.UNIT_CONVERTER,
  data_rate_converter: FunctionalCategory.UNIT_CONVERTER,
  storage_conversion: FunctionalCategory.UNIT_CONVERTER,
  light_year_converter: FunctionalCategory.UNIT_CONVERTER,
  roman_numeral: FunctionalCategory.UNIT_CONVERTER,
  roman_numeral_converter: FunctionalCategory.UNIT_CONVERTER,
  land_measurement: FunctionalCategory.UNIT_CONVERTER,

  // ==========================================
  // DATE/TIME CALCULATORS
  // ==========================================
  age_calculator: FunctionalCategory.DATE_TIME_CALCULATOR,
  date_calculator: FunctionalCategory.DATE_TIME_CALCULATOR,
  date_difference: FunctionalCategory.DATE_TIME_CALCULATOR,
  date_difference_calculator: FunctionalCategory.DATE_TIME_CALCULATOR,
  date_add_subtract: FunctionalCategory.DATE_TIME_CALCULATOR,
  days_between: FunctionalCategory.DATE_TIME_CALCULATOR,
  timezone_converter: FunctionalCategory.DATE_TIME_CALCULATOR,
  time_zone_converter: FunctionalCategory.DATE_TIME_CALCULATOR,
  countdown_timer: FunctionalCategory.DATE_TIME_CALCULATOR,
  stopwatch: FunctionalCategory.DATE_TIME_CALCULATOR,
  unix_timestamp: FunctionalCategory.DATE_TIME_CALCULATOR,
  work_days_calculator: FunctionalCategory.DATE_TIME_CALCULATOR,
  workday_calculator: FunctionalCategory.DATE_TIME_CALCULATOR,
  weekday_calculator: FunctionalCategory.DATE_TIME_CALCULATOR,
  easter_date_calculator: FunctionalCategory.DATE_TIME_CALCULATOR,
  hebrew_date_converter: FunctionalCategory.DATE_TIME_CALCULATOR,
  hijri_date_converter: FunctionalCategory.DATE_TIME_CALCULATOR,
  ramadan_calendar: FunctionalCategory.DATE_TIME_CALCULATOR,
  prayer_time_calculator: FunctionalCategory.DATE_TIME_CALCULATOR,

  // ==========================================
  // BUSINESS CALCULATORS
  // ==========================================
  markup_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  margin_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  cost_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  pricing_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  wholesale_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  wholesale_price: FunctionalCategory.BUSINESS_CALCULATOR,
  shipping_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  shipping_cost_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  shipping_threshold: FunctionalCategory.BUSINESS_CALCULATOR,
  inventory_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  inventory_turnover: FunctionalCategory.BUSINESS_CALCULATOR,
  sale_price: FunctionalCategory.BUSINESS_CALCULATOR,
  price_comparison: FunctionalCategory.BUSINESS_CALCULATOR,
  unit_price: FunctionalCategory.BUSINESS_CALCULATOR,
  unit_price_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  bundle_discount: FunctionalCategory.BUSINESS_CALCULATOR,
  cashback_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  coupon_stack: FunctionalCategory.BUSINESS_CALCULATOR,
  freight_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  dimensional_weight: FunctionalCategory.BUSINESS_CALCULATOR,
  cbm_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  container_load_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  pallet_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  truck_load_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  reorder_point_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  safety_stock_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  eoq_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  lead_time_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  cycle_time_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  takt_time_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  oee_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  capacity_utilization: FunctionalCategory.BUSINESS_CALCULATOR,
  production_rate_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  scrap_rate_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  machine_efficiency: FunctionalCategory.BUSINESS_CALCULATOR,
  freelance_timer: FunctionalCategory.BUSINESS_CALCULATOR,
  commission_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  gratuity_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  employee_cost_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  housekeeping_cost: FunctionalCategory.BUSINESS_CALCULATOR,
  care_cost_calculator: FunctionalCategory.BUSINESS_CALCULATOR,
  parking_cost: FunctionalCategory.BUSINESS_CALCULATOR,

  // ==========================================
  // CODE TOOLS
  // ==========================================
  json_formatter: FunctionalCategory.CODE_TOOLS,
  json_validator: FunctionalCategory.CODE_TOOLS,
  xml_formatter: FunctionalCategory.CODE_TOOLS,
  html_formatter: FunctionalCategory.CODE_TOOLS,
  css_formatter: FunctionalCategory.CODE_TOOLS,
  js_minifier: FunctionalCategory.CODE_TOOLS,
  css_minifier: FunctionalCategory.CODE_TOOLS,
  html_minifier: FunctionalCategory.CODE_TOOLS,
  regex_tester: FunctionalCategory.CODE_TOOLS,
  base64_encoder: FunctionalCategory.CODE_TOOLS,
  base64_decoder: FunctionalCategory.CODE_TOOLS,
  url_encoder: FunctionalCategory.CODE_TOOLS,
  url_decoder: FunctionalCategory.CODE_TOOLS,
  hash_generator: FunctionalCategory.CODE_TOOLS,
  diff_checker: FunctionalCategory.CODE_TOOLS,
  code_formatter: FunctionalCategory.CODE_TOOLS,
  sql_formatter: FunctionalCategory.CODE_TOOLS,
  markdown_editor: FunctionalCategory.CODE_TOOLS,
  markdown_preview: FunctionalCategory.CODE_TOOLS,
  color_converter: FunctionalCategory.CODE_TOOLS,
  css_gradient: FunctionalCategory.CODE_TOOLS,

  // ==========================================
  // DEV UTILITIES
  // ==========================================
  jwt_decoder: FunctionalCategory.DEV_UTILITIES,
  cron_expression: FunctionalCategory.DEV_UTILITIES,
  ascii_converter: FunctionalCategory.DEV_UTILITIES,
  hex_converter: FunctionalCategory.DEV_UTILITIES,
  hex_to_decimal: FunctionalCategory.DEV_UTILITIES,
  binary_converter: FunctionalCategory.DEV_UTILITIES,
  html_encoder: FunctionalCategory.DEV_UTILITIES,
  encryption_tool: FunctionalCategory.DEV_UTILITIES,
  uuid_generator: FunctionalCategory.DEV_UTILITIES,
  credit_card_validator: FunctionalCategory.DEV_UTILITIES,
  email_validator: FunctionalCategory.DEV_UTILITIES,
  phone_validator: FunctionalCategory.DEV_UTILITIES,
  iban_validator: FunctionalCategory.DEV_UTILITIES,
  isbn_validator: FunctionalCategory.DEV_UTILITIES,
  ssn_validator: FunctionalCategory.DEV_UTILITIES,
  color_palette_generator: FunctionalCategory.DEV_UTILITIES,
  contrast_checker: FunctionalCategory.DEV_UTILITIES,
  gradient_generator: FunctionalCategory.DEV_UTILITIES,
  bandwidth_calculator: FunctionalCategory.DEV_UTILITIES,
  data_transfer_time: FunctionalCategory.DEV_UTILITIES,
  latency_calculator: FunctionalCategory.DEV_UTILITIES,
  raid_calculator: FunctionalCategory.DEV_UTILITIES,
  vpn_speed: FunctionalCategory.DEV_UTILITIES,
  server_uptime: FunctionalCategory.DEV_UTILITIES,

  // ==========================================
  // TEXT TOOLS
  // ==========================================
  word_counter: FunctionalCategory.TEXT_TOOLS,
  word_count_calculator: FunctionalCategory.TEXT_TOOLS,
  character_counter: FunctionalCategory.TEXT_TOOLS,
  sentence_counter: FunctionalCategory.TEXT_TOOLS,
  paragraph_counter: FunctionalCategory.TEXT_TOOLS,
  text_case_converter: FunctionalCategory.TEXT_TOOLS,
  case_converter: FunctionalCategory.TEXT_TOOLS,
  text_diff: FunctionalCategory.TEXT_TOOLS,
  text_reverser: FunctionalCategory.TEXT_TOOLS,
  lorem_ipsum: FunctionalCategory.TEXT_TOOLS,
  lorem_ipsum_generator: FunctionalCategory.TEXT_TOOLS,
  invisible_text: FunctionalCategory.TEXT_TOOLS,
  text_to_speech: FunctionalCategory.TEXT_TOOLS,
  speech_to_text: FunctionalCategory.TEXT_TOOLS,
  translator: FunctionalCategory.TEXT_TOOLS,
  translation_tool: FunctionalCategory.TEXT_TOOLS,
  grammar_checker: FunctionalCategory.TEXT_TOOLS,
  spell_checker: FunctionalCategory.TEXT_TOOLS,
  plagiarism_checker: FunctionalCategory.TEXT_TOOLS,
  readability_score: FunctionalCategory.TEXT_TOOLS,
  text_summarizer: FunctionalCategory.TEXT_TOOLS,
  paraphraser: FunctionalCategory.TEXT_TOOLS,
  paraphrasing_tool: FunctionalCategory.TEXT_TOOLS,
  text_extractor: FunctionalCategory.TEXT_TOOLS,
  ocr: FunctionalCategory.TEXT_TOOLS,
  image_to_text: FunctionalCategory.TEXT_TOOLS,
  symbol_finder: FunctionalCategory.TEXT_TOOLS,
  palindrome_checker: FunctionalCategory.TEXT_TOOLS,

  // ==========================================
  // WRITING TOOLS
  // ==========================================
  email_writer: FunctionalCategory.WRITING_TOOLS,
  blog_writer: FunctionalCategory.WRITING_TOOLS,
  article_writer: FunctionalCategory.WRITING_TOOLS,
  social_media_writer: FunctionalCategory.WRITING_TOOLS,
  product_description: FunctionalCategory.WRITING_TOOLS,
  bio_generator: FunctionalCategory.WRITING_TOOLS,
  headline_generator: FunctionalCategory.WRITING_TOOLS,
  slogan_generator: FunctionalCategory.WRITING_TOOLS,
  story_generator: FunctionalCategory.WRITING_TOOLS,
  poem_generator: FunctionalCategory.WRITING_TOOLS,

  // ==========================================
  // QR/BARCODE GENERATORS
  // ==========================================
  qr_generator: FunctionalCategory.QR_BARCODE_GENERATOR,
  qr_code_generator: FunctionalCategory.QR_BARCODE_GENERATOR,
  barcode_generator: FunctionalCategory.QR_BARCODE_GENERATOR,
  qr_reader: FunctionalCategory.QR_BARCODE_GENERATOR,
  barcode_reader: FunctionalCategory.QR_BARCODE_GENERATOR,

  // ==========================================
  // PASSWORD/RANDOM GENERATORS
  // ==========================================
  password_generator: FunctionalCategory.PASSWORD_GENERATOR,
  password_strength: FunctionalCategory.PASSWORD_GENERATOR,
  random_number: FunctionalCategory.PASSWORD_GENERATOR,
  random_string: FunctionalCategory.PASSWORD_GENERATOR,

  // ==========================================
  // RANDOM GENERATORS
  // ==========================================
  name_generator: FunctionalCategory.RANDOM_GENERATOR,
  username_generator: FunctionalCategory.RANDOM_GENERATOR,
  hashtag_generator: FunctionalCategory.RANDOM_GENERATOR,
  acronym_generator: FunctionalCategory.RANDOM_GENERATOR,

  // ==========================================
  // AUDIO PROCESSING
  // ==========================================
  audio_converter: FunctionalCategory.AUDIO_PROCESSING,
  audio_compressor: FunctionalCategory.AUDIO_PROCESSING,
  audio_trimmer: FunctionalCategory.AUDIO_PROCESSING,
  audio_merger: FunctionalCategory.AUDIO_PROCESSING,
  mp3_converter: FunctionalCategory.AUDIO_PROCESSING,
  wav_converter: FunctionalCategory.AUDIO_PROCESSING,
  audio_extractor: FunctionalCategory.AUDIO_PROCESSING,
  voice_recorder: FunctionalCategory.AUDIO_PROCESSING,
  podcast_editor: FunctionalCategory.AUDIO_PROCESSING,
  audio_file_size: FunctionalCategory.AUDIO_PROCESSING,
  streaming_bitrate: FunctionalCategory.AUDIO_PROCESSING,

  // ==========================================
  // VIDEO PROCESSING
  // ==========================================
  video_converter: FunctionalCategory.VIDEO_PROCESSING,
  video_compressor: FunctionalCategory.VIDEO_PROCESSING,
  video_trimmer: FunctionalCategory.VIDEO_PROCESSING,
  video_merger: FunctionalCategory.VIDEO_PROCESSING,
  video_to_gif: FunctionalCategory.VIDEO_PROCESSING,
  gif_to_video: FunctionalCategory.VIDEO_PROCESSING,
  ai_video_generator: FunctionalCategory.VIDEO_PROCESSING,
  subtitle_generator: FunctionalCategory.VIDEO_PROCESSING,
  video_thumbnail: FunctionalCategory.VIDEO_PROCESSING,
  screen_recorder: FunctionalCategory.VIDEO_PROCESSING,
  video_bitrate: FunctionalCategory.VIDEO_PROCESSING,
  video_file_size: FunctionalCategory.VIDEO_PROCESSING,
  video_length: FunctionalCategory.VIDEO_PROCESSING,
  video_duration_from_size: FunctionalCategory.VIDEO_PROCESSING,
  frame_rate_converter: FunctionalCategory.VIDEO_PROCESSING,

  // ==========================================
  // MUSIC TOOLS
  // ==========================================
  bpm_calculator: FunctionalCategory.MUSIC_TOOLS,
  metronome: FunctionalCategory.MUSIC_TOOLS,
  metronome_converter: FunctionalCategory.MUSIC_TOOLS,
  chord_progression_generator: FunctionalCategory.MUSIC_TOOLS,
  chord_transposer: FunctionalCategory.MUSIC_TOOLS,
  key_signature_finder: FunctionalCategory.MUSIC_TOOLS,
  frequency_to_note: FunctionalCategory.MUSIC_TOOLS,
  guitar_tuner: FunctionalCategory.MUSIC_TOOLS,
  guitar_string_gauge: FunctionalCategory.MUSIC_TOOLS,
  delay_time_calculator: FunctionalCategory.MUSIC_TOOLS,
  reverb_time_calculator: FunctionalCategory.MUSIC_TOOLS,
  vinyl_weight_calculator: FunctionalCategory.MUSIC_TOOLS,

  // ==========================================
  // COOKING & RECIPE
  // ==========================================
  recipe_scaler: FunctionalCategory.COOKING_RECIPE,
  ingredient_converter: FunctionalCategory.COOKING_RECIPE,
  cooking_converter: FunctionalCategory.COOKING_RECIPE,
  cooking_conversion: FunctionalCategory.COOKING_RECIPE,
  cooking_timer: FunctionalCategory.COOKING_RECIPE,
  meal_planner: FunctionalCategory.COOKING_RECIPE,
  nutrition_calculator: FunctionalCategory.COOKING_RECIPE,
  baking_converter: FunctionalCategory.COOKING_RECIPE,
  baking_substitution: FunctionalCategory.COOKING_RECIPE,
  substitution_finder: FunctionalCategory.COOKING_RECIPE,
  oven_temperature_converter: FunctionalCategory.COOKING_RECIPE,
  grilling_timer: FunctionalCategory.COOKING_RECIPE,
  meat_thawing: FunctionalCategory.COOKING_RECIPE,
  steak_doneness: FunctionalCategory.COOKING_RECIPE,
  roast_calculator: FunctionalCategory.COOKING_RECIPE,
  turkey_cooking_time: FunctionalCategory.COOKING_RECIPE,
  bbq_calculator: FunctionalCategory.COOKING_RECIPE,
  pasta_portion_calculator: FunctionalCategory.COOKING_RECIPE,
  rice_water_ratio: FunctionalCategory.COOKING_RECIPE,
  coffee_ratio_calculator: FunctionalCategory.COOKING_RECIPE,
  bread_calculator: FunctionalCategory.COOKING_RECIPE,
  cake_pan_converter: FunctionalCategory.COOKING_RECIPE,
  party_food_calculator: FunctionalCategory.COOKING_RECIPE,
  party_drink_calculator: FunctionalCategory.COOKING_RECIPE,
  drink_calculator: FunctionalCategory.COOKING_RECIPE,
  potluck_planner: FunctionalCategory.COOKING_RECIPE,
  grocery_budget: FunctionalCategory.COOKING_RECIPE,
  fridge_inventory: FunctionalCategory.COOKING_RECIPE,
  pantry_organizer: FunctionalCategory.COOKING_RECIPE,
  expiration_tracker: FunctionalCategory.COOKING_RECIPE,

  // ==========================================
  // TRAVEL PLANNING
  // ==========================================
  trip_planner: FunctionalCategory.TRAVEL_PLANNING,
  packing_list: FunctionalCategory.TRAVEL_PLANNING,
  packing_list_generator: FunctionalCategory.TRAVEL_PLANNING,
  travel_budget: FunctionalCategory.TRAVEL_PLANNING,
  travel_budget_calculator: FunctionalCategory.TRAVEL_PLANNING,
  vacation_budget: FunctionalCategory.TRAVEL_PLANNING,
  flight_calculator: FunctionalCategory.TRAVEL_PLANNING,
  flight_time: FunctionalCategory.TRAVEL_PLANNING,
  flight_time_calculator: FunctionalCategory.TRAVEL_PLANNING,
  fuel_calculator: FunctionalCategory.TRAVEL_PLANNING,
  distance_calculator: FunctionalCategory.TRAVEL_PLANNING,
  driving_distance_calculator: FunctionalCategory.TRAVEL_PLANNING,
  road_trip_cost: FunctionalCategory.TRAVEL_PLANNING,
  jet_lag: FunctionalCategory.TRAVEL_PLANNING,
  jet_lag_calculator: FunctionalCategory.TRAVEL_PLANNING,
  luggage_weight: FunctionalCategory.TRAVEL_PLANNING,
  luggage_size: FunctionalCategory.TRAVEL_PLANNING,
  travel_insurance: FunctionalCategory.TRAVEL_PLANNING,
  travel_adapter: FunctionalCategory.TRAVEL_PLANNING,
  visa_checker: FunctionalCategory.TRAVEL_PLANNING,
  visa_fee_calculator: FunctionalCategory.TRAVEL_PLANNING,
  visa_requirement_checker: FunctionalCategory.TRAVEL_PLANNING,
  passport_renewal_cost: FunctionalCategory.TRAVEL_PLANNING,
  airport_wait: FunctionalCategory.TRAVEL_PLANNING,
  altitude_acclimatization: FunctionalCategory.TRAVEL_PLANNING,
  cruise_cost: FunctionalCategory.TRAVEL_PLANNING,
  hotel_cost: FunctionalCategory.TRAVEL_PLANNING,
  area_code_lookup: FunctionalCategory.TRAVEL_PLANNING,
  zip_code_lookup: FunctionalCategory.TRAVEL_PLANNING,
  world_clock: FunctionalCategory.TRAVEL_PLANNING,

  // ==========================================
  // HOME IMPROVEMENT
  // ==========================================
  paint_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  flooring_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  tile_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  wallpaper_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  carpet_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  concrete_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  mulch_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  gravel_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  fence_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  deck_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  decking_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  room_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  room_area_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  electricity_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  electricity_cost: FunctionalCategory.HOME_IMPROVEMENT,
  electricity_cost_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  btu_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  hvac_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  hvac_efficiency: FunctionalCategory.HOME_IMPROVEMENT,
  solar_panel_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  ac_size_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  water_heater_size: FunctionalCategory.HOME_IMPROVEMENT,
  generator_size: FunctionalCategory.HOME_IMPROVEMENT,
  insulation_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  window_glass_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  drywall_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  roofing_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  roof_pitch: FunctionalCategory.HOME_IMPROVEMENT,
  siding_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  gutter_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  stair_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  paver_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  brick_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  sand_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  lumber_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  rebar_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  beam_load_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  snow_load_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  foundation_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  plumbing_pipe_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  electrical_wire_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  led_savings_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  appliance_energy_cost: FunctionalCategory.HOME_IMPROVEMENT,
  gas_bill_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  water_bill_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  pool_volume: FunctionalCategory.HOME_IMPROVEMENT,
  pool_heating_cost: FunctionalCategory.HOME_IMPROVEMENT,
  closet_organizer: FunctionalCategory.HOME_IMPROVEMENT,
  storage_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  declutter_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  cleaning_time: FunctionalCategory.HOME_IMPROVEMENT,
  cleaning_schedule: FunctionalCategory.HOME_IMPROVEMENT,
  laundry_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  laundry_cost: FunctionalCategory.HOME_IMPROVEMENT,
  dishwasher_loading: FunctionalCategory.HOME_IMPROVEMENT,
  air_filter_reminder: FunctionalCategory.HOME_IMPROVEMENT,
  smoke_detector_check: FunctionalCategory.HOME_IMPROVEMENT,
  sod_calculator: FunctionalCategory.HOME_IMPROVEMENT,
  spring_cleaning: FunctionalCategory.HOME_IMPROVEMENT,
  detergent_calculator: FunctionalCategory.HOME_IMPROVEMENT,

  // ==========================================
  // GARDENING
  // ==========================================
  planting_calendar: FunctionalCategory.GARDENING,
  planting_date_calculator: FunctionalCategory.GARDENING,
  seed_calculator: FunctionalCategory.GARDENING,
  seed_spacing: FunctionalCategory.GARDENING,
  seed_spacing_calculator: FunctionalCategory.GARDENING,
  compost_calculator: FunctionalCategory.GARDENING,
  soil_calculator: FunctionalCategory.GARDENING,
  fertilizer_calculator: FunctionalCategory.GARDENING,
  lawn_fertilizer_calculator: FunctionalCategory.GARDENING,
  lawn_watering_calculator: FunctionalCategory.GARDENING,
  watering_schedule: FunctionalCategory.GARDENING,
  sprinkler_calculator: FunctionalCategory.GARDENING,
  irrigation_calculator: FunctionalCategory.GARDENING,
  rain_barrel_calculator: FunctionalCategory.GARDENING,
  raised_bed: FunctionalCategory.GARDENING,
  raised_bed_calculator: FunctionalCategory.GARDENING,
  greenhouse_calculator: FunctionalCategory.GARDENING,
  growing_zone_finder: FunctionalCategory.GARDENING,
  frost_date: FunctionalCategory.GARDENING,
  frost_date_calculator: FunctionalCategory.GARDENING,
  harvest_date_calculator: FunctionalCategory.GARDENING,
  harvest_estimator: FunctionalCategory.GARDENING,
  crop_yield_calculator: FunctionalCategory.GARDENING,
  pasture_rotation: FunctionalCategory.GARDENING,
  egg_production_calculator: FunctionalCategory.GARDENING,
  farm_profit_calculator: FunctionalCategory.GARDENING,

  // ==========================================
  // EDUCATION TOOLS
  // ==========================================
  gpa_calculator: FunctionalCategory.EDUCATION_TOOLS,
  grade_calculator: FunctionalCategory.EDUCATION_TOOLS,
  grade_converter: FunctionalCategory.EDUCATION_TOOLS,
  final_grade_calculator: FunctionalCategory.EDUCATION_TOOLS,
  weighted_grade: FunctionalCategory.EDUCATION_TOOLS,
  sat_to_act: FunctionalCategory.EDUCATION_TOOLS,
  flashcard_maker: FunctionalCategory.EDUCATION_TOOLS,
  flashcard_generator: FunctionalCategory.EDUCATION_TOOLS,
  quiz_maker: FunctionalCategory.EDUCATION_TOOLS,
  study_planner: FunctionalCategory.EDUCATION_TOOLS,
  study_time_calculator: FunctionalCategory.EDUCATION_TOOLS,
  citation_generator: FunctionalCategory.EDUCATION_TOOLS,
  bibliography_generator: FunctionalCategory.EDUCATION_TOOLS,
  essay_outline: FunctionalCategory.EDUCATION_TOOLS,
  reading_level: FunctionalCategory.EDUCATION_TOOLS,
  reading_level_calculator: FunctionalCategory.EDUCATION_TOOLS,
  page_to_word: FunctionalCategory.EDUCATION_TOOLS,
  manuscript_format: FunctionalCategory.EDUCATION_TOOLS,
  rhyme_finder: FunctionalCategory.EDUCATION_TOOLS,
  synonym_finder: FunctionalCategory.EDUCATION_TOOLS,
  antonym_finder: FunctionalCategory.EDUCATION_TOOLS,
  planetary_weight: FunctionalCategory.EDUCATION_TOOLS,
  spaced_repetition: FunctionalCategory.EDUCATION_TOOLS,

  // ==========================================
  // ASTROLOGY
  // ==========================================
  zodiac_calculator: FunctionalCategory.ASTROLOGY,
  horoscope: FunctionalCategory.ASTROLOGY,
  daily_horoscope: FunctionalCategory.ASTROLOGY,
  birth_chart: FunctionalCategory.ASTROLOGY,
  moon_phase: FunctionalCategory.ASTROLOGY,
  moon_phase_calculator: FunctionalCategory.ASTROLOGY,
  chinese_zodiac: FunctionalCategory.ASTROLOGY,
  numerology: FunctionalCategory.ASTROLOGY,
  tarot_reader: FunctionalCategory.ASTROLOGY,
  compatibility_calculator: FunctionalCategory.ASTROLOGY,
  compatibility_test: FunctionalCategory.ASTROLOGY,
  life_path_number: FunctionalCategory.ASTROLOGY,
  birthstone_finder: FunctionalCategory.ASTROLOGY,
  biorhythm: FunctionalCategory.ASTROLOGY,
  spirit_animal: FunctionalCategory.ASTROLOGY,
  dream_interpreter: FunctionalCategory.ASTROLOGY,
  lucky_number: FunctionalCategory.ASTROLOGY,

  // ==========================================
  // AI WRITING TOOLS
  // ==========================================
  ai_blog_writer: FunctionalCategory.AI_WRITING,
  ai_email_composer: FunctionalCategory.AI_WRITING,
  ai_cover_letter: FunctionalCategory.AI_WRITING,
  ai_resume_builder: FunctionalCategory.AI_WRITING,
  ai_product_description: FunctionalCategory.AI_WRITING,
  ai_slogan_generator: FunctionalCategory.AI_WRITING,
  ai_story_generator: FunctionalCategory.AI_WRITING,
  ai_poem_generator: FunctionalCategory.AI_WRITING,
  ai_social_caption: FunctionalCategory.AI_WRITING,
  ai_hashtag_generator: FunctionalCategory.AI_WRITING,
  ai_summarizer: FunctionalCategory.AI_WRITING,
  ai_paraphraser: FunctionalCategory.AI_WRITING,
  ai_grammar_checker: FunctionalCategory.AI_WRITING,
  ai_translator: FunctionalCategory.AI_WRITING,
  ai_speech_writer: FunctionalCategory.AI_WRITING,
  ai_meeting_notes: FunctionalCategory.AI_WRITING,
  ai_study_notes: FunctionalCategory.AI_WRITING,
  ai_business_name_generator: FunctionalCategory.AI_WRITING,
  ai_name_generator: FunctionalCategory.AI_WRITING,
  ai_joke_generator: FunctionalCategory.AI_WRITING,
  ai_contract_analyzer: FunctionalCategory.AI_WRITING,
  ai_ad_copy: FunctionalCategory.AI_WRITING,
  ai_apology_letter: FunctionalCategory.AI_WRITING,
  ai_bio_generator: FunctionalCategory.AI_WRITING,
  ai_book_summary: FunctionalCategory.AI_WRITING,
  ai_complaint_letter: FunctionalCategory.AI_WRITING,
  ai_essay_writer: FunctionalCategory.AI_WRITING,
  ai_faq_generator: FunctionalCategory.AI_WRITING,
  ai_flashcard_generator: FunctionalCategory.AI_WRITING,
  ai_haiku_generator: FunctionalCategory.AI_WRITING,
  ai_instagram_caption: FunctionalCategory.AI_WRITING,
  ai_interview_questions: FunctionalCategory.AI_WRITING,
  ai_job_posting: FunctionalCategory.AI_WRITING,
  ai_lesson_plan: FunctionalCategory.AI_WRITING,
  ai_linkedin_post: FunctionalCategory.AI_WRITING,
  ai_meta_description: FunctionalCategory.AI_WRITING,
  ai_newsletter: FunctionalCategory.AI_WRITING,
  ai_outline_generator: FunctionalCategory.AI_WRITING,
  ai_pickup_line: FunctionalCategory.AI_WRITING,
  ai_podcast_script: FunctionalCategory.AI_WRITING,
  ai_press_release: FunctionalCategory.AI_WRITING,
  ai_quiz_generator: FunctionalCategory.AI_WRITING,
  ai_rap_generator: FunctionalCategory.AI_WRITING,
  ai_recommendation_letter: FunctionalCategory.AI_WRITING,
  ai_riddle_generator: FunctionalCategory.AI_WRITING,
  ai_song_lyrics: FunctionalCategory.AI_WRITING,
  ai_study_guide: FunctionalCategory.AI_WRITING,
  ai_tagline_generator: FunctionalCategory.AI_WRITING,
  ai_thank_you_note: FunctionalCategory.AI_WRITING,
  ai_thesis_generator: FunctionalCategory.AI_WRITING,
  ai_tiktok_script: FunctionalCategory.AI_WRITING,
  ai_tongue_twister: FunctionalCategory.AI_WRITING,
  ai_trivia_generator: FunctionalCategory.AI_WRITING,
  ai_twitter_thread: FunctionalCategory.AI_WRITING,
  ai_video_script: FunctionalCategory.AI_WRITING,
  ai_youtube_description: FunctionalCategory.AI_WRITING,

  // ==========================================
  // NUTRITION CALCULATORS
  // ==========================================
  hydration_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  caffeine_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  alcohol_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  carb_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  fat_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  fiber_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  sodium_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  sugar_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  vitamin_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  nicotine_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  bac_calculator: FunctionalCategory.NUTRITION_CALCULATOR,
  blood_alcohol: FunctionalCategory.NUTRITION_CALCULATOR,

  // ==========================================
  // PET CARE
  // ==========================================
  pet_age_calculator: FunctionalCategory.PET_CARE,
  pet_food_calculator: FunctionalCategory.PET_CARE,
  pet_medication_dosage: FunctionalCategory.PET_CARE,
  dog_pregnancy_calculator: FunctionalCategory.PET_CARE,
  cat_pregnancy_calculator: FunctionalCategory.PET_CARE,
  aquarium_calculator: FunctionalCategory.PET_CARE,
  chicken_coop_size: FunctionalCategory.PET_CARE,
  livestock_feed_calculator: FunctionalCategory.PET_CARE,
  hay_bale_calculator: FunctionalCategory.PET_CARE,

  // ==========================================
  // SPORTS CALCULATORS
  // ==========================================
  baseball_stats_calculator: FunctionalCategory.SPORTS_CALCULATOR,
  baseball_era: FunctionalCategory.SPORTS_CALCULATOR,
  basketball_stats: FunctionalCategory.SPORTS_CALCULATOR,
  bowling_score: FunctionalCategory.SPORTS_CALCULATOR,
  bowling_score_calculator: FunctionalCategory.SPORTS_CALCULATOR,
  golf_handicap: FunctionalCategory.SPORTS_CALCULATOR,
  golf_handicap_calculator: FunctionalCategory.SPORTS_CALCULATOR,
  archery_score: FunctionalCategory.SPORTS_CALCULATOR,
  darts_checkout: FunctionalCategory.SPORTS_CALCULATOR,
  soccer_stats: FunctionalCategory.SPORTS_CALCULATOR,
  tennis_match_probability: FunctionalCategory.SPORTS_CALCULATOR,
  esports_prize_calculator: FunctionalCategory.SPORTS_CALCULATOR,
  marathon_pace: FunctionalCategory.SPORTS_CALCULATOR,
  running_calorie_calculator: FunctionalCategory.SPORTS_CALCULATOR,
  cycling_calorie_calculator: FunctionalCategory.SPORTS_CALCULATOR,
  cycling_power: FunctionalCategory.SPORTS_CALCULATOR,
  swimming_calorie_calculator: FunctionalCategory.SPORTS_CALCULATOR,
  swimming_pace: FunctionalCategory.SPORTS_CALCULATOR,
  hiking_calorie_burn: FunctionalCategory.SPORTS_CALCULATOR,
  hiking_calories: FunctionalCategory.SPORTS_CALCULATOR,
  walking_calorie_calculator: FunctionalCategory.SPORTS_CALCULATOR,
  steps_to_calories: FunctionalCategory.SPORTS_CALCULATOR,
  steps_to_distance: FunctionalCategory.SPORTS_CALCULATOR,
  steps_to_miles: FunctionalCategory.SPORTS_CALCULATOR,

  // ==========================================
  // OUTDOOR RECREATION
  // ==========================================
  ski_length: FunctionalCategory.OUTDOOR_RECREATION,
  ski_binding_din: FunctionalCategory.OUTDOOR_RECREATION,
  ski_resort: FunctionalCategory.OUTDOOR_RECREATION,
  snowboard_size: FunctionalCategory.OUTDOOR_RECREATION,
  surfboard_size: FunctionalCategory.OUTDOOR_RECREATION,
  kayak_size: FunctionalCategory.OUTDOOR_RECREATION,
  bike_frame_size: FunctionalCategory.OUTDOOR_RECREATION,
  tennis_racket_grip: FunctionalCategory.OUTDOOR_RECREATION,
  rock_climbing_grade: FunctionalCategory.OUTDOOR_RECREATION,
  trail_difficulty: FunctionalCategory.OUTDOOR_RECREATION,
  backpack_weight: FunctionalCategory.OUTDOOR_RECREATION,
  bear_canister_size: FunctionalCategory.OUTDOOR_RECREATION,
  campfire_wood: FunctionalCategory.OUTDOOR_RECREATION,
  camping_checklist: FunctionalCategory.OUTDOOR_RECREATION,
  campsite_capacity: FunctionalCategory.OUTDOOR_RECREATION,
  fishing_moon_phase: FunctionalCategory.OUTDOOR_RECREATION,
  pool_table_angle: FunctionalCategory.OUTDOOR_RECREATION,

  // ==========================================
  // PARENTING & FAMILY
  // ==========================================
  baby_age_calculator: FunctionalCategory.PARENTING_FAMILY,
  baby_feeding_calculator: FunctionalCategory.PARENTING_FAMILY,
  baby_milestone_tracker: FunctionalCategory.PARENTING_FAMILY,
  baby_name_generator: FunctionalCategory.PARENTING_FAMILY,
  baby_shower_budget: FunctionalCategory.PARENTING_FAMILY,
  child_allowance_calculator: FunctionalCategory.PARENTING_FAMILY,
  child_bmi_calculator: FunctionalCategory.PARENTING_FAMILY,
  child_education_cost: FunctionalCategory.PARENTING_FAMILY,
  child_height_predictor: FunctionalCategory.PARENTING_FAMILY,
  child_support_calculator: FunctionalCategory.PARENTING_FAMILY,
  daycare_cost_calculator: FunctionalCategory.PARENTING_FAMILY,
  diaper_calculator: FunctionalCategory.PARENTING_FAMILY,
  potty_training_readiness: FunctionalCategory.PARENTING_FAMILY,
  eye_color_predictor: FunctionalCategory.PARENTING_FAMILY,
  nanny_cost_calculator: FunctionalCategory.PARENTING_FAMILY,

  // ==========================================
  // AUTOMOTIVE
  // ==========================================
  car_loan: FunctionalCategory.AUTOMOTIVE,
  car_loan_calculator: FunctionalCategory.AUTOMOTIVE,
  car_lease: FunctionalCategory.AUTOMOTIVE,
  car_lease_calculator: FunctionalCategory.AUTOMOTIVE,
  car_depreciation: FunctionalCategory.AUTOMOTIVE,
  car_depreciation_calculator: FunctionalCategory.AUTOMOTIVE,
  car_insurance: FunctionalCategory.AUTOMOTIVE,
  car_insurance_estimate: FunctionalCategory.AUTOMOTIVE,
  car_wash_cost: FunctionalCategory.AUTOMOTIVE,
  engine_horsepower_calculator: FunctionalCategory.AUTOMOTIVE,
  fuel_cost_calculator: FunctionalCategory.AUTOMOTIVE,
  fuel_economy_converter: FunctionalCategory.AUTOMOTIVE,
  gas_mileage: FunctionalCategory.AUTOMOTIVE,
  mpg_calculator: FunctionalCategory.AUTOMOTIVE,
  motorcycle_mpg: FunctionalCategory.AUTOMOTIVE,
  tire_size: FunctionalCategory.AUTOMOTIVE,
  tire_size_calculator: FunctionalCategory.AUTOMOTIVE,
  oil_change: FunctionalCategory.AUTOMOTIVE,
  oil_change_tracker: FunctionalCategory.AUTOMOTIVE,
  speedometer_error: FunctionalCategory.AUTOMOTIVE,
  ev_charging: FunctionalCategory.AUTOMOTIVE,
  ev_charging_cost: FunctionalCategory.AUTOMOTIVE,
  ev_range: FunctionalCategory.AUTOMOTIVE,
  ev_savings: FunctionalCategory.AUTOMOTIVE,
  fleet_fuel_cost: FunctionalCategory.AUTOMOTIVE,

  // ==========================================
  // REAL ESTATE
  // ==========================================
  affordability_calculator: FunctionalCategory.REAL_ESTATE,
  rent_vs_buy: FunctionalCategory.REAL_ESTATE,
  rent_vs_buy_calculator: FunctionalCategory.REAL_ESTATE,
  rental_yield: FunctionalCategory.REAL_ESTATE,
  rental_yield_calculator: FunctionalCategory.REAL_ESTATE,
  rental_roi: FunctionalCategory.REAL_ESTATE,
  cap_rate_calculator: FunctionalCategory.REAL_ESTATE,
  closing_cost_calculator: FunctionalCategory.REAL_ESTATE,
  down_payment_calculator: FunctionalCategory.REAL_ESTATE,
  home_equity_calculator: FunctionalCategory.REAL_ESTATE,
  heloc_calculator: FunctionalCategory.REAL_ESTATE,
  pmi_calculator: FunctionalCategory.REAL_ESTATE,
  refinance_calculator: FunctionalCategory.REAL_ESTATE,
  property_tax_calculator: FunctionalCategory.REAL_ESTATE,
  home_insurance: FunctionalCategory.REAL_ESTATE,
  home_insurance_estimate: FunctionalCategory.REAL_ESTATE,
  lot_size_calculator: FunctionalCategory.REAL_ESTATE,
  price_per_sqft: FunctionalCategory.REAL_ESTATE,
  square_footage: FunctionalCategory.REAL_ESTATE,
  square_footage_calculator: FunctionalCategory.REAL_ESTATE,
  vacancy_rate: FunctionalCategory.REAL_ESTATE,
  moving_cost: FunctionalCategory.REAL_ESTATE,
  moving_cost_calculator: FunctionalCategory.REAL_ESTATE,
  moving_cost_estimator: FunctionalCategory.REAL_ESTATE,
  moving_box: FunctionalCategory.REAL_ESTATE,
  moving_box_calculator: FunctionalCategory.REAL_ESTATE,
  rent_increase: FunctionalCategory.REAL_ESTATE,
  security_deposit: FunctionalCategory.REAL_ESTATE,
  break_even_rent: FunctionalCategory.REAL_ESTATE,

  // ==========================================
  // GAMES & ENTERTAINMENT
  // ==========================================
  dice_roller: FunctionalCategory.GAMES_ENTERTAINMENT,
  coin_flip: FunctionalCategory.GAMES_ENTERTAINMENT,
  random_number_generator: FunctionalCategory.GAMES_ENTERTAINMENT,
  random_picker: FunctionalCategory.GAMES_ENTERTAINMENT,
  random_name_picker: FunctionalCategory.GAMES_ENTERTAINMENT,
  decision_wheel: FunctionalCategory.GAMES_ENTERTAINMENT,
  spin_wheel: FunctionalCategory.GAMES_ENTERTAINMENT,
  magic_8_ball: FunctionalCategory.GAMES_ENTERTAINMENT,
  fortune_cookie: FunctionalCategory.GAMES_ENTERTAINMENT,
  yes_no_generator: FunctionalCategory.GAMES_ENTERTAINMENT,
  lottery_picker: FunctionalCategory.GAMES_ENTERTAINMENT,
  lottery_number_picker: FunctionalCategory.GAMES_ENTERTAINMENT,
  bingo_caller: FunctionalCategory.GAMES_ENTERTAINMENT,
  bracket_generator: FunctionalCategory.GAMES_ENTERTAINMENT,
  team_generator: FunctionalCategory.GAMES_ENTERTAINMENT,
  secret_santa: FunctionalCategory.GAMES_ENTERTAINMENT,
  gift_exchange: FunctionalCategory.GAMES_ENTERTAINMENT,
  charades_generator: FunctionalCategory.GAMES_ENTERTAINMENT,
  truth_or_dare: FunctionalCategory.GAMES_ENTERTAINMENT,
  would_you_rather: FunctionalCategory.GAMES_ENTERTAINMENT,
  trivia_generator: FunctionalCategory.GAMES_ENTERTAINMENT,
  anagram_solver: FunctionalCategory.GAMES_ENTERTAINMENT,
  word_scrambler: FunctionalCategory.GAMES_ENTERTAINMENT,
  movie_picker: FunctionalCategory.GAMES_ENTERTAINMENT,
  movie_night_snacks: FunctionalCategory.GAMES_ENTERTAINMENT,
  restaurant_picker: FunctionalCategory.GAMES_ENTERTAINMENT,
  personality_quiz: FunctionalCategory.GAMES_ENTERTAINMENT,
  love_calculator: FunctionalCategory.GAMES_ENTERTAINMENT,
  name_meaning: FunctionalCategory.GAMES_ENTERTAINMENT,
  name_picker: FunctionalCategory.GAMES_ENTERTAINMENT,
  ascii_art: FunctionalCategory.GAMES_ENTERTAINMENT,
  fancy_text: FunctionalCategory.GAMES_ENTERTAINMENT,
  emoji_translator: FunctionalCategory.GAMES_ENTERTAINMENT,
  pig_latin: FunctionalCategory.GAMES_ENTERTAINMENT,
  morse_code: FunctionalCategory.GAMES_ENTERTAINMENT,
  binge_watch_calculator: FunctionalCategory.GAMES_ENTERTAINMENT,
  movie_runtime_calculator: FunctionalCategory.GAMES_ENTERTAINMENT,
  game_download_time: FunctionalCategory.GAMES_ENTERTAINMENT,
  game_trade_value: FunctionalCategory.GAMES_ENTERTAINMENT,
  gaming_chair_height: FunctionalCategory.GAMES_ENTERTAINMENT,
  gaming_electricity_cost: FunctionalCategory.GAMES_ENTERTAINMENT,
  gaming_pc_builder: FunctionalCategory.GAMES_ENTERTAINMENT,
  fps_calculator: FunctionalCategory.GAMES_ENTERTAINMENT,
  dps_calculator: FunctionalCategory.GAMES_ENTERTAINMENT,

  // ==========================================
  // WEATHER & ENVIRONMENT
  // ==========================================
  dew_point_calculator: FunctionalCategory.WEATHER_ENVIRONMENT,
  heat_index_calculator: FunctionalCategory.WEATHER_ENVIRONMENT,
  wind_chill_calculator: FunctionalCategory.WEATHER_ENVIRONMENT,
  sunrise_sunset: FunctionalCategory.WEATHER_ENVIRONMENT,
  sunrise_sunset_calculator: FunctionalCategory.WEATHER_ENVIRONMENT,
  sunset_golden_hour: FunctionalCategory.WEATHER_ENVIRONMENT,
  daylight_hours: FunctionalCategory.WEATHER_ENVIRONMENT,
  uv_index_exposure: FunctionalCategory.WEATHER_ENVIRONMENT,
  sunscreen_calculator: FunctionalCategory.WEATHER_ENVIRONMENT,
  rainfall_calculator: FunctionalCategory.WEATHER_ENVIRONMENT,
  tide_calculator: FunctionalCategory.WEATHER_ENVIRONMENT,
  meteor_shower_calendar: FunctionalCategory.WEATHER_ENVIRONMENT,
  star_visibility: FunctionalCategory.WEATHER_ENVIRONMENT,
  satellite_pass_predictor: FunctionalCategory.WEATHER_ENVIRONMENT,
  carbon_footprint: FunctionalCategory.WEATHER_ENVIRONMENT,
  carbon_footprint_calculator: FunctionalCategory.WEATHER_ENVIRONMENT,
  water_purification: FunctionalCategory.WEATHER_ENVIRONMENT,

  // ==========================================
  // CRYPTO TOOLS
  // ==========================================
  crypto_profit_calculator: FunctionalCategory.CRYPTO_TOOLS,
  crypto_mining_calculator: FunctionalCategory.CRYPTO_TOOLS,
  crypto_tax_calculator: FunctionalCategory.CRYPTO_TOOLS,
  gas_fee_calculator: FunctionalCategory.CRYPTO_TOOLS,
  staking_rewards: FunctionalCategory.CRYPTO_TOOLS,
  defi_yield_calculator: FunctionalCategory.CRYPTO_TOOLS,
  impermanent_loss: FunctionalCategory.CRYPTO_TOOLS,
  nft_rarity_calculator: FunctionalCategory.CRYPTO_TOOLS,
  bitcoin_halving_countdown: FunctionalCategory.CRYPTO_TOOLS,
  token_unlock_schedule: FunctionalCategory.CRYPTO_TOOLS,

  // ==========================================
  // BEAUTY & FASHION
  // ==========================================
  bra_size_calculator: FunctionalCategory.BEAUTY_FASHION,
  ring_size_converter: FunctionalCategory.BEAUTY_FASHION,
  shoe_size_converter: FunctionalCategory.BEAUTY_FASHION,
  dress_size_converter: FunctionalCategory.BEAUTY_FASHION,
  clothing_size_converter: FunctionalCategory.BEAUTY_FASHION,
  hat_size_calculator: FunctionalCategory.BEAUTY_FASHION,
  belt_size_calculator: FunctionalCategory.BEAUTY_FASHION,
  glove_size_calculator: FunctionalCategory.BEAUTY_FASHION,
  necklace_length: FunctionalCategory.BEAUTY_FASHION,
  watch_band_size: FunctionalCategory.BEAUTY_FASHION,
  hair_type_analyzer: FunctionalCategory.BEAUTY_FASHION,
  skin_type_analyzer: FunctionalCategory.BEAUTY_FASHION,
  skin_tone_analyzer: FunctionalCategory.BEAUTY_FASHION,
  skin_age_calculator: FunctionalCategory.BEAUTY_FASHION,
  color_blindness_simulator: FunctionalCategory.BEAUTY_FASHION,

  // ==========================================
  // LEGAL TOOLS
  // ==========================================
  alimony_calculator: FunctionalCategory.LEGAL_TOOLS,
  court_cost_calculator: FunctionalCategory.LEGAL_TOOLS,
  legal_fee_calculator: FunctionalCategory.LEGAL_TOOLS,
  legal_billing: FunctionalCategory.LEGAL_TOOLS,
  trademark_fee: FunctionalCategory.LEGAL_TOOLS,
  patent_cost: FunctionalCategory.LEGAL_TOOLS,
  llc_formation_cost: FunctionalCategory.LEGAL_TOOLS,
  contract_termination_cost: FunctionalCategory.LEGAL_TOOLS,
  gdpr_fine_calculator: FunctionalCategory.LEGAL_TOOLS,
  nonprofit_filing_fee: FunctionalCategory.LEGAL_TOOLS,

  // ==========================================
  // SEO & WEB TOOLS
  // ==========================================
  backlink_checker: FunctionalCategory.SEO_WEB_TOOLS,
  keyword_density: FunctionalCategory.SEO_WEB_TOOLS,
  meta_tag_analyzer: FunctionalCategory.SEO_WEB_TOOLS,
  page_speed: FunctionalCategory.SEO_WEB_TOOLS,
  seo_score: FunctionalCategory.SEO_WEB_TOOLS,
  domain_age: FunctionalCategory.SEO_WEB_TOOLS,
  website_status: FunctionalCategory.SEO_WEB_TOOLS,
  ssl_checker: FunctionalCategory.SEO_WEB_TOOLS,
  dns_lookup: FunctionalCategory.SEO_WEB_TOOLS,
  whois_lookup: FunctionalCategory.SEO_WEB_TOOLS,
  ip_lookup: FunctionalCategory.SEO_WEB_TOOLS,
  ip_subnet_calculator: FunctionalCategory.SEO_WEB_TOOLS,
  cidr_calculator: FunctionalCategory.SEO_WEB_TOOLS,
  data_breach_check: FunctionalCategory.SEO_WEB_TOOLS,
  privacy_score: FunctionalCategory.SEO_WEB_TOOLS,

  // ==========================================
  // PRODUCTIVITY TOOLS
  // ==========================================
  pomodoro_timer: FunctionalCategory.PRODUCTIVITY,
  timesheet_calculator: FunctionalCategory.PRODUCTIVITY,
  work_hours_calculator: FunctionalCategory.PRODUCTIVITY,
  meeting_time_finder: FunctionalCategory.PRODUCTIVITY,
  schedule_maker: FunctionalCategory.PRODUCTIVITY,
  task_assigner: FunctionalCategory.PRODUCTIVITY,
  content_calendar: FunctionalCategory.PRODUCTIVITY,
  post_scheduler: FunctionalCategory.PRODUCTIVITY,
  reading_time: FunctionalCategory.PRODUCTIVITY,
  speaking_time: FunctionalCategory.PRODUCTIVITY,
  typing_speed_test: FunctionalCategory.PRODUCTIVITY,

  // ==========================================
  // MARKETING TOOLS
  // ==========================================
  cpc_calculator: FunctionalCategory.MARKETING_TOOLS,
  cpm_calculator: FunctionalCategory.MARKETING_TOOLS,
  ctr_calculator: FunctionalCategory.MARKETING_TOOLS,
  roas_calculator: FunctionalCategory.MARKETING_TOOLS,
  conversion_rate: FunctionalCategory.MARKETING_TOOLS,
  ltv_calculator: FunctionalCategory.MARKETING_TOOLS,
  customer_acquisition_cost: FunctionalCategory.MARKETING_TOOLS,
  churn_rate_calculator: FunctionalCategory.MARKETING_TOOLS,
  mrr_calculator: FunctionalCategory.MARKETING_TOOLS,
  arr_calculator: FunctionalCategory.MARKETING_TOOLS,
  burn_rate_calculator: FunctionalCategory.MARKETING_TOOLS,
  runway_calculator: FunctionalCategory.MARKETING_TOOLS,
  equity_dilution: FunctionalCategory.MARKETING_TOOLS,
  cap_table_calculator: FunctionalCategory.MARKETING_TOOLS,
  startup_valuation: FunctionalCategory.MARKETING_TOOLS,
  saas_metrics: FunctionalCategory.MARKETING_TOOLS,
  email_open_rate: FunctionalCategory.MARKETING_TOOLS,
  social_engagement_rate: FunctionalCategory.MARKETING_TOOLS,
  social_roi: FunctionalCategory.MARKETING_TOOLS,
  influencer_rate: FunctionalCategory.MARKETING_TOOLS,
  influencer_rate_calculator: FunctionalCategory.MARKETING_TOOLS,
  instagram_engagement: FunctionalCategory.MARKETING_TOOLS,
  twitter_analytics: FunctionalCategory.MARKETING_TOOLS,
  youtube_earnings: FunctionalCategory.MARKETING_TOOLS,
  tiktok_earnings: FunctionalCategory.MARKETING_TOOLS,
  follower_growth: FunctionalCategory.MARKETING_TOOLS,
  ad_budget_allocator: FunctionalCategory.MARKETING_TOOLS,
  book_royalty_calculator: FunctionalCategory.MARKETING_TOOLS,
  photography_pricing: FunctionalCategory.MARKETING_TOOLS,
  printing_cost_calculator: FunctionalCategory.MARKETING_TOOLS,

  // ==========================================
  // CRAFTS & HOBBIES
  // ==========================================
  yarn_calculator: FunctionalCategory.OTHER,
  fabric_calculator: FunctionalCategory.OTHER,
  fabric_yardage: FunctionalCategory.OTHER,
  cross_stitch_calculator: FunctionalCategory.OTHER,
  book_spine_calculator: FunctionalCategory.OTHER,
  candle_wax_calculator: FunctionalCategory.OTHER,
  resin_calculator: FunctionalCategory.OTHER,

  // ==========================================
  // RELIGIOUS & SPIRITUAL TOOLS
  // ==========================================
  bible_verse_finder: FunctionalCategory.OTHER,
  quran_verse_finder: FunctionalCategory.OTHER,
  church_donation_tracker: FunctionalCategory.OTHER,

  // ==========================================
  // PHOTOGRAPHY TOOLS
  // ==========================================
  photo_megapixel: FunctionalCategory.OTHER,
  photo_print_size: FunctionalCategory.OTHER,
  depth_of_field: FunctionalCategory.OTHER,
  exposure_calculator: FunctionalCategory.OTHER,
  lens_equivalent: FunctionalCategory.OTHER,
  monitor_distance: FunctionalCategory.OTHER,
  telescope_magnification: FunctionalCategory.OTHER,

  // ==========================================
  // MISCELLANEOUS TOOLS
  // ==========================================
  smoking_cost_calculator: FunctionalCategory.OTHER,
  unemployment_benefit: FunctionalCategory.OTHER,
  required_minimum_distribution: FunctionalCategory.OTHER,
  hra_calculator: FunctionalCategory.OTHER,
  ppf_calculator: FunctionalCategory.OTHER,
  fd_calculator: FunctionalCategory.OTHER,
  rd_calculator: FunctionalCategory.OTHER,
  sip_calculator: FunctionalCategory.OTHER,
  lumpsum_calculator: FunctionalCategory.OTHER,
  tds_calculator: FunctionalCategory.OTHER,
  retirement_age: FunctionalCategory.OTHER,
  bill_splitter: FunctionalCategory.OTHER,
  split_bill_calculator: FunctionalCategory.OTHER,
  tip_etiquette_guide: FunctionalCategory.OTHER,
  break_even_price: FunctionalCategory.OTHER,
  delivery_time_estimator: FunctionalCategory.OTHER,
  christmas_budget: FunctionalCategory.OTHER,
  thanksgiving_calculator: FunctionalCategory.OTHER,
  halloween_candy: FunctionalCategory.OTHER,
};

// ============================================
// TOOL TAXONOMY - Detailed category info
// ============================================

export const TOOL_TAXONOMY: Partial<Record<FunctionalCategory, ToolTaxonomyEntry>> = {
  [FunctionalCategory.DATA_VISUALIZATION]: {
    category: FunctionalCategory.DATA_VISUALIZATION,
    description: 'Create charts and graphs from spreadsheet or CSV data (bar, line, pie, scatter)',
    keywords: ['chart', 'graph', 'plot', 'visualize', 'visualization', 'data'],
    inputTypes: ['csv', 'xlsx', 'spreadsheet', 'json'],
    outputTypes: ['chart_image', 'interactive_chart'],
    tools: ['data_visualizer', 'chart_builder'],
  },

  [FunctionalCategory.HEALTH_TRACKING]: {
    category: FunctionalCategory.HEALTH_TRACKING,
    description: 'Track health metrics, medical records, growth charts',
    keywords: ['health', 'medical', 'dental', 'growth', 'vaccination', 'symptom'],
    inputTypes: ['personal_data', 'measurements'],
    outputTypes: ['record', 'chart', 'report'],
    tools: [
      'dental_chart', 'baby_growth_chart', 'growth_chart', 'vaccination_record',
      'medication_tracker', 'blood_pressure_log', 'symptom_tracker', 'eye_chart',
    ],
  },

  [FunctionalCategory.EVENT_PLANNING]: {
    category: FunctionalCategory.EVENT_PLANNING,
    description: 'Plan events, create seating arrangements, manage schedules',
    keywords: ['seating', 'event', 'wedding', 'party', 'schedule', 'chore', 'guest'],
    inputTypes: ['guest_list', 'numbers'],
    outputTypes: ['chart', 'schedule', 'checklist'],
    tools: [
      'seating_chart', 'seating_chart_generator', 'wedding_seating_chart',
      'chore_chart', 'chore_wheel', 'event_planner', 'guest_list',
    ],
  },

  [FunctionalCategory.IMAGE_EDITING]: {
    category: FunctionalCategory.IMAGE_EDITING,
    description: 'Edit images: resize, crop, rotate, remove background',
    keywords: ['resize', 'crop', 'rotate', 'background', 'edit', 'photo'],
    inputTypes: ['image'],
    outputTypes: ['image'],
    tools: [
      'image_resizer', 'image_cropper', 'background_remover', 'watermark',
      'image_editor', 'photo_editor', 'color_picker',
    ],
  },

  [FunctionalCategory.IMAGE_CONVERSION]: {
    category: FunctionalCategory.IMAGE_CONVERSION,
    description: 'Convert image formats, compress images',
    keywords: ['convert', 'compress', 'format', 'png', 'jpg', 'webp'],
    inputTypes: ['image'],
    outputTypes: ['image'],
    tools: [
      'image_converter', 'image_compressor', 'format_converter',
      'png_to_jpg', 'jpg_to_png', 'gif_creator',
    ],
  },

  [FunctionalCategory.IMAGE_ENHANCEMENT]: {
    category: FunctionalCategory.IMAGE_ENHANCEMENT,
    description: 'Enhance images: upscale, restore, denoise',
    keywords: ['upscale', 'enhance', 'restore', 'improve', 'quality'],
    inputTypes: ['image'],
    outputTypes: ['image'],
    tools: ['image_upscaler', 'image_enhancer', 'image_restoration', 'colorization'],
  },

  [FunctionalCategory.IMAGE_GENERATION]: {
    category: FunctionalCategory.IMAGE_GENERATION,
    description: 'Generate images using AI',
    keywords: ['generate', 'create', 'ai', 'logo', 'avatar', 'banner'],
    inputTypes: ['text', 'prompt'],
    outputTypes: ['image'],
    tools: [
      'ai_image_generator', 'ai_logo_generator', 'avatar_generator',
      'banner_generator', 'poster_generator',
    ],
  },

  [FunctionalCategory.DOCUMENT_CONVERSION]: {
    category: FunctionalCategory.DOCUMENT_CONVERSION,
    description: 'Convert, merge, split PDF and documents',
    keywords: ['pdf', 'merge', 'split', 'convert', 'compress', 'document'],
    inputTypes: ['pdf', 'document'],
    outputTypes: ['pdf', 'document'],
    tools: [
      'pdf_merger', 'pdf_splitter', 'pdf_converter', 'pdf_compressor',
      'word_to_pdf', 'pdf_to_word',
    ],
  },

  [FunctionalCategory.DOCUMENT_GENERATION]: {
    category: FunctionalCategory.DOCUMENT_GENERATION,
    description: 'Generate invoices, receipts, contracts, resumes',
    keywords: ['invoice', 'receipt', 'quote', 'contract', 'resume', 'certificate'],
    inputTypes: ['form_data'],
    outputTypes: ['document', 'pdf'],
    tools: [
      'invoice_generator', 'receipt_generator', 'quote_generator',
      'contract_generator', 'resume_builder', 'certificate_maker',
    ],
  },

  [FunctionalCategory.FITNESS_CALCULATOR]: {
    category: FunctionalCategory.FITNESS_CALCULATOR,
    description: 'Calculate BMI, calories, macros, body metrics',
    keywords: ['bmi', 'calorie', 'macro', 'protein', 'body fat', 'weight'],
    inputTypes: ['numbers', 'measurements'],
    outputTypes: ['calculation'],
    tools: [
      'bmi_calculator', 'bmr_calculator', 'tdee_calculator',
      'calorie_calculator', 'macro_calculator', 'body_fat_calculator',
    ],
  },

  [FunctionalCategory.FINANCIAL_CALCULATOR]: {
    category: FunctionalCategory.FINANCIAL_CALCULATOR,
    description: 'Calculate loans, investments, taxes, savings',
    keywords: ['loan', 'mortgage', 'investment', 'tax', 'savings', 'retirement'],
    inputTypes: ['numbers'],
    outputTypes: ['calculation'],
    tools: [
      'loan_calculator', 'mortgage_calculator', 'investment_calculator',
      'compound_interest', 'tax_calculator', 'retirement_calculator',
    ],
  },

  [FunctionalCategory.BUSINESS_CALCULATOR]: {
    category: FunctionalCategory.BUSINESS_CALCULATOR,
    description: 'Business calculations: markup, margin, pricing',
    keywords: ['markup', 'margin', 'profit', 'cost', 'pricing'],
    inputTypes: ['numbers'],
    outputTypes: ['calculation'],
    tools: [
      'markup_calculator', 'margin_calculator', 'profit_margin',
      'break_even', 'roi_calculator',
    ],
  },

  [FunctionalCategory.BUSINESS_DOCUMENT]: {
    category: FunctionalCategory.BUSINESS_DOCUMENT,
    description: 'Create business proposals, quotes, estimates',
    keywords: ['proposal', 'quote', 'estimate', 'business plan'],
    inputTypes: ['form_data'],
    outputTypes: ['document'],
    tools: ['proposal_generator', 'business_plan', 'nda_generator'],
  },

  [FunctionalCategory.CODE_TOOLS]: {
    category: FunctionalCategory.CODE_TOOLS,
    description: 'Code formatting, validation, encoding/decoding',
    keywords: ['json', 'format', 'minify', 'encode', 'decode', 'regex', 'code'],
    inputTypes: ['code', 'text'],
    outputTypes: ['code', 'text'],
    tools: [
      'json_formatter', 'json_validator', 'code_formatter',
      'regex_tester', 'base64_encoder', 'hash_generator',
    ],
  },

  [FunctionalCategory.TEXT_TOOLS]: {
    category: FunctionalCategory.TEXT_TOOLS,
    description: 'Text manipulation: count, translate, grammar',
    keywords: ['word', 'count', 'translate', 'grammar', 'spell', 'summarize'],
    inputTypes: ['text'],
    outputTypes: ['text', 'analysis'],
    tools: [
      'word_counter', 'translator', 'grammar_checker',
      'text_summarizer', 'ocr', 'image_to_text',
    ],
  },

  [FunctionalCategory.WRITING_TOOLS]: {
    category: FunctionalCategory.WRITING_TOOLS,
    description: 'Writing assistance: emails, blogs, social media',
    keywords: ['email', 'blog', 'article', 'social media', 'write'],
    inputTypes: ['text', 'prompt'],
    outputTypes: ['text'],
    tools: [
      'email_writer', 'blog_writer', 'article_writer',
      'social_media_writer', 'headline_generator',
    ],
  },

  [FunctionalCategory.QR_BARCODE_GENERATOR]: {
    category: FunctionalCategory.QR_BARCODE_GENERATOR,
    description: 'Generate or read QR codes and barcodes',
    keywords: ['qr', 'barcode', 'scan', 'code'],
    inputTypes: ['text', 'url', 'image'],
    outputTypes: ['image', 'text'],
    tools: ['qr_generator', 'qr_code_generator', 'barcode_generator', 'qr_reader'],
  },

  [FunctionalCategory.PASSWORD_GENERATOR]: {
    category: FunctionalCategory.PASSWORD_GENERATOR,
    description: 'Generate passwords, UUIDs, random strings',
    keywords: ['password', 'uuid', 'random', 'generate'],
    inputTypes: ['options'],
    outputTypes: ['text'],
    tools: ['password_generator', 'uuid_generator', 'random_string'],
  },

  [FunctionalCategory.AUDIO_PROCESSING]: {
    category: FunctionalCategory.AUDIO_PROCESSING,
    description: 'Convert, trim, merge audio files',
    keywords: ['audio', 'mp3', 'wav', 'convert', 'trim', 'merge'],
    inputTypes: ['audio'],
    outputTypes: ['audio'],
    tools: [
      'audio_converter', 'audio_trimmer', 'audio_merger',
      'mp3_converter', 'voice_recorder',
    ],
  },

  [FunctionalCategory.VIDEO_PROCESSING]: {
    category: FunctionalCategory.VIDEO_PROCESSING,
    description: 'Convert, trim, compress video files',
    keywords: ['video', 'mp4', 'convert', 'trim', 'compress', 'gif'],
    inputTypes: ['video'],
    outputTypes: ['video', 'gif'],
    tools: [
      'video_converter', 'video_compressor', 'video_trimmer',
      'video_to_gif', 'subtitle_generator',
    ],
  },

  [FunctionalCategory.COOKING_RECIPE]: {
    category: FunctionalCategory.COOKING_RECIPE,
    description: 'Recipe scaling, ingredient conversion, meal planning',
    keywords: ['recipe', 'ingredient', 'cooking', 'meal', 'nutrition'],
    inputTypes: ['recipe', 'numbers'],
    outputTypes: ['recipe', 'calculation'],
    tools: [
      'recipe_scaler', 'ingredient_converter', 'meal_planner',
      'nutrition_calculator',
    ],
  },

  [FunctionalCategory.TRAVEL_PLANNING]: {
    category: FunctionalCategory.TRAVEL_PLANNING,
    description: 'Trip planning, packing lists, travel budgets',
    keywords: ['trip', 'travel', 'packing', 'flight', 'distance'],
    inputTypes: ['locations', 'dates'],
    outputTypes: ['itinerary', 'list', 'calculation'],
    tools: [
      'trip_planner', 'packing_list', 'travel_budget',
      'fuel_calculator', 'distance_calculator',
    ],
  },

  [FunctionalCategory.HOME_IMPROVEMENT]: {
    category: FunctionalCategory.HOME_IMPROVEMENT,
    description: 'Home project calculators: paint, flooring, etc.',
    keywords: ['paint', 'flooring', 'tile', 'concrete', 'fence', 'room'],
    inputTypes: ['measurements'],
    outputTypes: ['calculation'],
    tools: [
      'paint_calculator', 'flooring_calculator', 'tile_calculator',
      'concrete_calculator', 'fence_calculator',
    ],
  },

  [FunctionalCategory.EDUCATION_TOOLS]: {
    category: FunctionalCategory.EDUCATION_TOOLS,
    description: 'Educational tools: GPA, grades, study aids',
    keywords: ['gpa', 'grade', 'flashcard', 'quiz', 'study', 'citation'],
    inputTypes: ['grades', 'text'],
    outputTypes: ['calculation', 'content'],
    tools: [
      'gpa_calculator', 'grade_calculator', 'flashcard_maker',
      'citation_generator',
    ],
  },

  [FunctionalCategory.ASTROLOGY]: {
    category: FunctionalCategory.ASTROLOGY,
    description: 'Astrology and spirituality tools',
    keywords: ['zodiac', 'horoscope', 'birth chart', 'moon', 'numerology'],
    inputTypes: ['date', 'birth_data'],
    outputTypes: ['reading', 'chart'],
    tools: [
      'zodiac_calculator', 'horoscope', 'birth_chart',
      'moon_phase', 'numerology',
    ],
  },

  [FunctionalCategory.OTHER]: {
    category: FunctionalCategory.OTHER,
    description: 'Other tools that do not fit above categories',
    keywords: [],
    inputTypes: ['any'],
    outputTypes: ['any'],
    tools: [],
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get category for a tool ID
 */
export function getCategoryForTool(toolId: string): FunctionalCategory {
  const normalizedId = toolId.replace(/-/g, '_').toLowerCase();
  return TOOL_TO_CATEGORY[normalizedId] || FunctionalCategory.OTHER;
}

/**
 * Get all tools in a category
 */
export function getToolsInCategory(category: FunctionalCategory): string[] {
  return Object.entries(TOOL_TO_CATEGORY)
    .filter(([, cat]) => cat === category)
    .map(([toolId]) => toolId);
}

/**
 * Check if a tool belongs to a category
 */
export function isToolInCategory(toolId: string, category: FunctionalCategory): boolean {
  return getCategoryForTool(toolId) === category;
}
