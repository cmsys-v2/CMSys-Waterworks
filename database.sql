-- =============================================
-- NCW-PS Database Schema
-- Naval Civil Works Productivity Suite
-- Version 2.0.0
-- =============================================

CREATE DATABASE IF NOT EXISTS ncw_ps_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ncw_ps_db;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    official_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    rank VARCHAR(50),
    trade VARCHAR(50) COMMENT 'MA, CA, PA, PL, BB, RW, WE, AL, SW',
    category ENUM('Regular', 'VSS') NOT NULL DEFAULT 'Regular',
    zone_assigned VARCHAR(50),
    role ENUM('Command', 'OIC', 'Supervisor', 'Sailor') DEFAULT 'Sailor',
    contact_number VARCHAR(20),
    email VARCHAR(100),
    date_of_joining DATE,
    city VARCHAR(100) DEFAULT 'Trincomalee',
    special_skills TEXT COMMENT 'Comma-separated skills e.g. TIG Welding, Plumbing, Masonry',
    status ENUM('Active', 'Inactive', 'Transferred', 'Leave', 'Sick', 'TempDraft') DEFAULT 'Active',
    performance_score DECIMAL(3,2) DEFAULT 5.00,
    profile_image_url VARCHAR(500),
    firebase_uid VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_zone (zone_assigned),
    INDEX idx_trade (trade),
    INDEX idx_city (city),
    INDEX idx_status (status)
);

-- =============================================
-- LOCATIONS TABLE
-- =============================================
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zone_id VARCHAR(50) NOT NULL,
    building_name VARCHAR(200) NOT NULL,
    sub_location VARCHAR(200),
    description TEXT,
    gps_coordinates VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_zone (zone_id),
    INDEX idx_building (building_name)
);

-- =============================================
-- WORK ORDERS TABLE
-- =============================================
CREATE TABLE work_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zone_id VARCHAR(50) NOT NULL,
    type ENUM('PROJECT', 'JOB', 'TASK') NOT NULL,
    reference_no VARCHAR(100) COMMENT 'Minute Sheet / Job Card No / Signal No',
    reference_type ENUM('Minute Sheet', 'Signal', 'Letter', 'Verbal') DEFAULT 'Minute Sheet',
    description TEXT NOT NULL,
    status ENUM('Pending', 'Active', 'Hold', 'Completed', 'Cancelled') DEFAULT 'Pending',
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    estimated_duration INT COMMENT 'Duration in days',
    budget_allocation DECIMAL(12,2),
    authority_approval VARCHAR(200),
    incharge_id INT REFERENCES users(id),
    supervisor_id INT REFERENCES users(id),
    location_id INT REFERENCES locations(id),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_zone_status (zone_id, status),
    INDEX idx_type (type),
    INDEX idx_priority (priority)
);

-- =============================================
-- JOB CARDS TABLE
-- =============================================
CREATE TABLE job_cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_number VARCHAR(50) UNIQUE NOT NULL,
    work_order_id INT REFERENCES work_orders(id),
    zone_id VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200),
    location_id INT REFERENCES locations(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('Active', 'Completed', 'Cancelled', 'OnHold') DEFAULT 'Active',
    total_material_cost DECIMAL(12,2) DEFAULT 0,
    total_labor_hours DECIMAL(10,2) DEFAULT 0,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_job_number (job_number),
    INDEX idx_zone (zone_id),
    INDEX idx_status (status)
);

-- =============================================
-- JOB CARD MATERIALS (Material Log)
-- =============================================
CREATE TABLE job_card_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_card_id INT NOT NULL REFERENCES job_cards(id),
    material_id INT REFERENCES inventory(id),
    material_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    logged_by INT REFERENCES users(id),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    INDEX idx_job_card (job_card_id),
    INDEX idx_material (material_id)
);

-- =============================================
-- JOB CARD LABOR (Labor Log)
-- =============================================
CREATE TABLE job_card_labor (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_card_id INT NOT NULL REFERENCES job_cards(id),
    sailor_id INT NOT NULL REFERENCES users(id),
    work_date DATE NOT NULL,
    hours_worked DECIMAL(4,2) DEFAULT 8.00,
    role VARCHAR(100),
    task_description TEXT,
    logged_by INT REFERENCES users(id),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_job_card (job_card_id),
    INDEX idx_sailor (sailor_id),
    INDEX idx_date (work_date)
);

-- =============================================
-- INVENTORY TABLE (Materials & Tools)
-- =============================================
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category ENUM('BMS', 'Plumbing', 'Metal', 'General', 'Aluminium', 'Paint', 'Electrical', 'Tools') NOT NULL DEFAULT 'General',
    description VARCHAR(300) NOT NULL,
    deno VARCHAR(50) NOT NULL COMMENT 'Unit type: nos, Ltr, meters, kg, etc',
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    cost_per_unit DECIMAL(12,2) NOT NULL COMMENT 'Rs Inclusive VAT',
    requirement VARCHAR(200) COMMENT 'Project name or General',
    location VARCHAR(200) DEFAULT 'Zone Store' COMMENT 'Respective Zone, project, or store location',
    book_no VARCHAR(100) COMMENT 'Stock Book number / reference',
    on_charge_ref VARCHAR(100) COMMENT 'Nav 254, Nav 255 references',
    off_charge_ref VARCHAR(100) COMMENT 'Job card number, Nav 254',
    min_stock_level DECIMAL(10,2) DEFAULT 0,
    date_added DATE NOT NULL,
    last_restocked DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_description (description),
    INDEX idx_location (location),
    INDEX idx_book_no (book_no)
);

-- =============================================
-- INVENTORY ON-CHARGE RECORDS
-- =============================================
CREATE TABLE inventory_on_charge (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL REFERENCES inventory(id),
    on_charge_ref VARCHAR(100) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    date_received DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inventory (inventory_id)
);

-- =============================================
-- USER FEEDBACK TABLE
-- =============================================
CREATE TABLE user_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_number VARCHAR(50) NOT NULL,
    job_card_id INT REFERENCES job_cards(id),
    productivity_score INT NOT NULL CHECK (productivity_score >= 1 AND productivity_score <= 5),
    workmanship_score INT NOT NULL CHECK (workmanship_score >= 1 AND workmanship_score <= 5),
    communication_score INT NOT NULL CHECK (communication_score >= 1 AND communication_score <= 5),
    professionalism_score INT NOT NULL CHECK (professionalism_score >= 1 AND professionalism_score <= 5),
    satisfaction_score INT NOT NULL CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    overall_score DECIMAL(3,2),
    comments TEXT,
    submitted_by VARCHAR(200),
    contact_info VARCHAR(200),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_job_number (job_number),
    INDEX idx_overall_score (overall_score)
);

-- =============================================
-- FEEDBACK TOKENS TABLE
-- =============================================
CREATE TABLE feedback_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_number VARCHAR(50) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token)
);

-- =============================================
-- ESTIMATES TABLE
-- =============================================
CREATE TABLE estimates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estimate_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    reference_doc VARCHAR(200),
    total_cost DECIMAL(12,2) DEFAULT 0,
    status ENUM('Pending', 'Approved', 'Rejected', 'Revised') DEFAULT 'Pending',
    created_by INT REFERENCES users(id),
    approved_by INT REFERENCES users(id),
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

-- =============================================
-- ESTIMATE ITEMS TABLE
-- =============================================
CREATE TABLE estimate_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estimate_id INT NOT NULL REFERENCES estimates(id),
    material_id INT REFERENCES inventory(id),
    description VARCHAR(300) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    availability ENUM('Zone Store', 'Ready Use Store', 'Balance Store', 'To Purchase', 'Unknown') DEFAULT 'Unknown',
    INDEX idx_estimate (estimate_id)
);

-- =============================================
-- MAINTENANCE RECORDS TABLE
-- =============================================
CREATE TABLE maintenance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT NOT NULL REFERENCES locations(id),
    job_card_id INT REFERENCES job_cards(id),
    maintenance_type ENUM('Repair', 'Preventive', 'Emergency', 'Routine', 'Upgrade') NOT NULL,
    description TEXT NOT NULL,
    maintenance_date DATE NOT NULL,
    performed_by INT REFERENCES users(id),
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (location_id),
    INDEX idx_date (maintenance_date)
);

-- =============================================
-- ZONE TEAMS TABLE
-- =============================================
CREATE TABLE zone_teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zone_id VARCHAR(50) NOT NULL,
    sailor_id INT NOT NULL REFERENCES users(id),
    assigned_by INT REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Active', 'Inactive', 'TempDraft') DEFAULT 'Active',
    UNIQUE KEY unique_zone_sailor (zone_id, sailor_id),
    INDEX idx_zone (zone_id),
    INDEX idx_status (status)
);

-- =============================================
-- DAILY ALLOCATIONS TABLE
-- =============================================
CREATE TABLE daily_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    sailor_id INT NOT NULL REFERENCES users(id),
    work_order_id INT NOT NULL REFERENCES work_orders(id),
    role_today VARCHAR(100),
    assigned_by INT REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Active', 'Completed', 'Reassigned', 'Absent') DEFAULT 'Active',
    is_continuation BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_daily_assignment (date, sailor_id),
    INDEX idx_date (date),
    INDEX idx_work_order (work_order_id)
);

-- =============================================
-- DAILY EVALUATIONS TABLE (Extended 1-10 Scale)
-- =============================================
CREATE TABLE daily_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    sailor_id INT NOT NULL REFERENCES users(id),
    supervisor_id INT NOT NULL REFERENCES users(id),
    work_order_id INT REFERENCES work_orders(id),
    job_card_id INT REFERENCES job_cards(id),
    quality_score INT NOT NULL CHECK (quality_score >= 1 AND quality_score <= 10),
    efficiency_score INT NOT NULL CHECK (efficiency_score >= 1 AND efficiency_score <= 10),
    discipline_score INT NOT NULL CHECK (discipline_score >= 1 AND discipline_score <= 10),
    material_score INT NOT NULL CHECK (material_score >= 1 AND material_score <= 10),
    attitude_score INT NOT NULL CHECK (attitude_score >= 1 AND attitude_score <= 10),
    skill_score INT NOT NULL CHECK (skill_score >= 1 AND skill_score <= 10),
    comment TEXT,
    score_1_reason TEXT COMMENT 'Required for score 1',
    score_2_reason TEXT COMMENT 'Required for score 2',
    score_10_reason TEXT COMMENT 'Required for score 10',
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_eval (date, sailor_id, work_order_id),
    INDEX idx_sailor (sailor_id),
    INDEX idx_date (date)
);

-- =============================================
-- ATTENDANCE LOG TABLE
-- =============================================
CREATE TABLE attendance_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    sailor_id INT NOT NULL REFERENCES users(id),
    status ENUM('Present', 'Leave', 'Sick', 'TempDraft', 'Duty', 'Training') NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    remarks TEXT,
    logged_by INT REFERENCES users(id),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_attendance (date, sailor_id),
    INDEX idx_date_status (date, status)
);

-- =============================================
-- AUDIT LOG TABLE
-- =============================================
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id INT REFERENCES users(id),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_user (user_id)
);

-- =============================================
-- APPROVED PENDING JOBS TABLE (For Dropdown)
-- =============================================
CREATE TABLE approved_pending_jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference_no VARCHAR(100) NOT NULL,
    reference_type ENUM('Minute Sheet', 'Signal', 'Letter') NOT NULL,
    description TEXT NOT NULL,
    authority VARCHAR(200),
    estimated_cost DECIMAL(12,2),
    approved_date DATE,
    status ENUM('Pending', 'InProgress', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

-- =============================================
-- SAMPLE DATA INSERT
-- =============================================

-- Insert sample users
INSERT INTO users (official_number, name, rank, trade, category, zone_assigned, role, performance_score) VALUES
('MA/1234', 'AB Kamal Perera', 'AB', 'MA', 'Regular', 'A-Zone', 'Sailor', 7.50),
('CA/2345', 'LS Nimal Silva', 'LS', 'CA', 'Regular', 'A-Zone', 'Sailor', 8.20),
('PA/3456', 'AB Sunil Fernando', 'AB', 'PA', 'VSS', 'A-Zone', 'Sailor', 6.80),
('PL/4567', 'PO2 Chamara Bandara', 'PO2', 'PL', 'Regular', 'A-Zone', 'Supervisor', 8.50),
('WE/5678', 'AB Ruwan Jayasena', 'AB', 'WE', 'Regular', 'BC-Zone', 'Sailor', 7.20),
('MA/6789', 'LS Pradeep Kumara', 'LS', 'MA', 'VSS', 'BC-Zone', 'Sailor', 7.80),
('CA/7890', 'AB Lasith Malinga', 'AB', 'CA', 'Regular', 'A-Zone', 'Sailor', 8.00),
('RW/8901', 'PO1 Dinesh Priyantha', 'PO1', 'RW', 'Regular', 'A-Zone', 'Supervisor', 9.10),
('PA/9012', 'AB Sampath Kumara', 'AB', 'PA', 'Regular', 'Carpentry-Shop', 'Sailor', 7.40),
('MA/0123', 'LS Gayan Wickrama', 'LS', 'MA', 'Regular', 'Welding-Shop', 'Sailor', 6.90);

-- Insert sample locations
INSERT INTO locations (zone_id, building_name, sub_location, description) VALUES
('A-Zone', 'Wardroom Building', 'Ground Floor', 'Officers Wardroom'),
('A-Zone', 'Wardroom Building', 'First Floor', 'Officers Quarters'),
('A-Zone', 'Jetty B', 'Main Pier', 'Main jetty structure'),
('A-Zone', 'Workshop A', 'Main Hall', 'Main workshop area'),
('BC-Zone', 'Quarters Block C', 'All Floors', 'Sailors quarters'),
('BC-Zone', 'Store Building', 'Ground Floor', 'Main stores'),
('Carpentry-Shop', 'Carpentry Workshop', 'Main Area', 'Woodworking shop'),
('Welding-Shop', 'Welding Workshop', 'Bay 1', 'Metal fabrication');

-- Insert sample inventory
INSERT INTO inventory (type, description, deno, quantity, cost_per_unit, requirement, location, on_charge_ref) VALUES
('material', 'Portland Cement 50kg', 'bags', 150, 1850.00, 'both', 'Zone Store', 'Nav254/2024/001'),
('material', 'River Sand', 'cubic meters', 25, 12500.00, 'both', 'Zone Store', 'Nav254/2024/002'),
('material', '2x4 Timber Treated', 'meters', 200, 450.00, 'project', 'Ready Use Store', 'Nav254/2024/003'),
('material', 'Ready Mix Concrete', 'cubic meters', 10, 18500.00, 'project', 'Zone Store', 'Nav254/2024/004'),
('material', 'PVC Pipe 4 inch', 'meters', 100, 850.00, 'maintenance', 'Ready Use Store', 'Nav254/2024/005'),
('material', 'Electrical Cable 2.5mm', 'meters', 500, 125.00, 'both', 'Zone Store', 'Nav254/2024/006'),
('tool', 'Drill Machine Bosch', 'nos', 5, 45000.00, 'both', 'Workshop', 'Nav255/2024/001'),
('tool', 'Angle Grinder', 'nos', 3, 28000.00, 'both', 'Workshop', 'Nav255/2024/002'),
('tool', 'Welding Machine 400A', 'nos', 2, 125000.00, 'both', 'Workshop', 'Nav255/2024/003');

-- Insert approved pending jobs
INSERT INTO approved_pending_jobs (reference_no, reference_type, description, authority, estimated_cost, approved_date) VALUES
('MS/NCW/2024/001', 'Minute Sheet', 'Wardroom Construction Phase 2', 'CCED(E)', 2500000.00, '2024-01-15'),
('MS/NCW/2024/002', 'Minute Sheet', 'Workshop Building Foundation', 'CCEO(E)', 1800000.00, '2024-01-20'),
('SIG/NCW/2024/015', 'Signal', 'Emergency Jetty Repair', 'CO NHQ', 500000.00, '2024-02-01'),
('MS/NCW/2024/005', 'Minute Sheet', 'Quarters Block Renovation', 'CCED(E)', 3200000.00, '2024-02-10');


-- ========================================================
-- WATER DISTRIBUTION MONITORING HUB - CMSys-Waterworks
-- Database Extensions for Storage Tanks, Hydrology & WTP
-- ========================================================

-- 1. Detailed Storage Tanks Matrix
CREATE TABLE IF NOT EXISTS `storage_tanks` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `classification` ENUM('MAIN_PUMP_HOUSE', 'OVERHEAD_TOWER', 'VITAL_COMMAND_CHALET', 'VITAL_WARDROOM', 'VITAL_BASE_HOSPITAL', 'PLASTIC_SHELL_SINTEC', 'PLASTIC_SHELL_POLY') NOT NULL,
  `water_type` ENUM('RO', 'STANDARD', 'RAW_SURFACE') NOT NULL,
  `form_factor` ENUM('CYLINDRICAL_VERTICAL', 'CYLINDRICAL_HORIZONTAL', 'RECTANGULAR_SUMP') NOT NULL,
  `length_m` DECIMAL(8,3) NULL,
  `width_m` DECIMAL(8,3) NULL,
  `diameter_m` DECIMAL(8,3) NULL,
  `total_height_m` DECIMAL(8,3) NOT NULL,
  `usable_height_m` DECIMAL(8,3) NOT NULL,
  `dead_storage_l` DECIMAL(12,2) DEFAULT 0,
  `capacity_liters` DECIMAL(12,2) NOT NULL,
  `current_level_m` DECIMAL(8,3) NOT NULL DEFAULT 0,
  `current_volume_l` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `low_alarm_pct` INT DEFAULT 25,
  `location_area` VARCHAR(150) NOT NULL,
  `poc_contact` VARCHAR(150) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Reservoir & Inflow Wells
CREATE TABLE IF NOT EXISTS `reservoir_wells` (
  `well_id` VARCHAR(50) PRIMARY KEY,
  `well_name` VARCHAR(100) NOT NULL,
  `invert_level_m` DECIMAL(8,3) NOT NULL,
  `current_water_column_m` DECIMAL(8,3) NOT NULL,
  `gate_open_pct` INT DEFAULT 100,
  `discharge_lps` DECIMAL(10,2) NOT NULL,
  `status` ENUM('ACTIVE', 'ISOLATED', 'SILTED') DEFAULT 'ACTIVE',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `rainfall_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `recorded_date` DATE UNIQUE NOT NULL,
  `rainfall_mm` DECIMAL(8,2) NOT NULL,
  `runoff_estimate_l` DECIMAL(14,2) NOT NULL,
  `recorded_by` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Chemical Inventory & ND Anandamkulam WTP
CREATE TABLE IF NOT EXISTS `wtp_chemical_inventory` (
  `chemical_id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `form` ENUM('LIQUID_LITERS', 'DRY_KG', 'CYLINDERS') NOT NULL,
  `current_stock` DECIMAL(10,2) NOT NULL,
  `min_threshold` DECIMAL(10,2) NOT NULL,
  `daily_burn_rate` DECIMAL(10,2) NOT NULL,
  `last_restocked_date` DATE NULL
);

CREATE TABLE IF NOT EXISTS `wtp_daily_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_date` DATE UNIQUE NOT NULL,
  `raw_inflow_l` DECIMAL(14,2) NOT NULL,
  `treated_outflow_l` DECIMAL(14,2) NOT NULL,
  `raw_turbidity_ntu` DECIMAL(6,2) NOT NULL,
  `treated_turbidity_ntu` DECIMAL(6,2) NOT NULL,
  `raw_ph` DECIMAL(4,2) NOT NULL,
  `treated_ph` DECIMAL(4,2) NOT NULL,
  `residual_chlorine_ppm` DECIMAL(4,2) NOT NULL,
  `tds_ppm` DECIMAL(8,2) NOT NULL,
  `pac_added_kg` DECIMAL(8,2) NOT NULL,
  `chlorine_added_kg` DECIMAL(8,2) NOT NULL,
  `coliform_status` ENUM('SAFE_ZERO', 'DETECTED_FAILED', 'PENDING') DEFAULT 'SAFE_ZERO',
  `jar_test_data` JSON NULL,
  `duty_roster` JSON NULL,
  `ai_insights` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================================
-- HUB A: WELL WATER TREATMENT & PUMP CONDITION TELEMETRY
-- HUB B: COMMERCIAL & NON-NAVAL CONSUMER BILLING (NWSDB 2023)
-- ========================================================

-- 1. Well Water Treatment & Electromechanical Logs
CREATE TABLE IF NOT EXISTS `well_water_treatment_logs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `recorded_date` DATE NOT NULL,
  `raw_water_inflow_l` DECIMAL(14,2) NOT NULL,
  `treated_water_yield_l` DECIMAL(14,2) NOT NULL,
  `backwash_loss_l` DECIMAL(12,2) DEFAULT 0,
  `turbidity_ntu` DECIMAL(5,2) NOT NULL,
  `ph_value` DECIMAL(4,2) NOT NULL,
  `iron_content_mgl` DECIMAL(5,2) NOT NULL,
  `hardness_mgl` DECIMAL(6,2) NOT NULL,
  `residual_chlorine_ppm` DECIMAL(4,2) NOT NULL,
  `ecoli_status` ENUM('PASS_NIL', 'FAIL_DETECTED') DEFAULT 'PASS_NIL',
  `chemicals_consumed` JSON NULL,
  `operator_badge` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `pump_health_telemetry` (
  `pump_id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `rated_capacity_lph` DECIMAL(10,2) NOT NULL,
  `motor_rating_kw` DECIMAL(6,2) NOT NULL,
  `operational_status` ENUM('RUNNING', 'STANDBY', 'TRIPPED', 'MAINTENANCE') DEFAULT 'STANDBY',
  `current_amps` DECIMAL(5,2) NOT NULL,
  `vibration_mms` DECIMAL(5,2) NOT NULL,
  `temp_celsius` DECIMAL(5,2) NOT NULL,
  `total_run_hours` DECIMAL(10,2) NOT NULL,
  `next_service_hours` DECIMAL(10,2) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Non-Naval Commercial Clients & Accounts
CREATE TABLE IF NOT EXISTS `non_naval_consumers` (
  `account_number` VARCHAR(50) PRIMARY KEY,
  `consumer_name` VARCHAR(150) NOT NULL,
  `company_name` VARCHAR(150) NOT NULL,
  `category` ENUM('COMMERCIAL_PRIVATE', 'PORT_AUTHORITY_SLPA', 'CONTRACTOR_AGENCY', 'SHIPPING_VESSEL_CIVILIAN', 'INSTITUTIONAL') NOT NULL,
  `contact_person` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) NULL,
  `connection_point` VARCHAR(150) NOT NULL,
  `meter_serial` VARCHAR(100) UNIQUE NOT NULL,
  `status` ENUM('ACTIVE', 'DISCONNECTED', 'UNDER_MAINTENANCE') DEFAULT 'ACTIVE',
  `current_arrears_lkr` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Invoices & Billing Register
CREATE TABLE IF NOT EXISTS `commercial_bills` (
  `bill_number` VARCHAR(50) PRIMARY KEY,
  `account_number` VARCHAR(50) NOT NULL,
  `billing_period` VARCHAR(7) NOT NULL, -- e.g., '2024-10'
  `bill_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `prev_reading_units` DECIMAL(10,2) NOT NULL,
  `curr_reading_units` DECIMAL(10,2) NOT NULL,
  `consumed_units` DECIMAL(10,2) NOT NULL,
  `volumetric_charge_lkr` DECIMAL(12,2) NOT NULL,
  `fixed_charge_lkr` DECIMAL(10,2) NOT NULL,
  `arrears_brought_forward_lkr` DECIMAL(12,2) DEFAULT 0.00,
  `total_payable_lkr` DECIMAL(12,2) NOT NULL,
  `payment_status` ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE') DEFAULT 'UNPAID',
  `amount_paid_lkr` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`account_number`) REFERENCES `non_naval_consumers`(`account_number`) ON DELETE CASCADE
);

-- 4. Payment Receipts & Ledger
CREATE TABLE IF NOT EXISTS `commercial_payment_receipts` (
  `receipt_id` VARCHAR(50) PRIMARY KEY,
  `bill_number` VARCHAR(50) NOT NULL,
  `account_number` VARCHAR(50) NOT NULL,
  `payment_date` DATE NOT NULL,
  `amount_received_lkr` DECIMAL(12,2) NOT NULL,
  `payment_method` ENUM('CASH', 'CHEQUE', 'BANK_TRANSFER', 'GOV_VOUCHER') NOT NULL,
  `ref_number` VARCHAR(100) NOT NULL,
  `received_by` VARCHAR(100) NOT NULL,
  `remaining_arrears_lkr` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`bill_number`) REFERENCES `commercial_bills`(`bill_number`)
);
