-- ============================================================
-- HR Dashboard Database
-- Complete SQL file for phpMyAdmin
-- Includes: Database creation, tables, data, and CRUD procedures
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS `hr_dashboard` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hr_dashboard`;

-- ============================================================
-- TABLE: employees
-- ============================================================
DROP TABLE IF EXISTS `employees`;

CREATE TABLE `employees` (
  `id` VARCHAR(10) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL,
  `birth_date` DATE NOT NULL,
  `age` INT NOT NULL,
  `performance_rating` DECIMAL(3,1) NULL,
  `training_hours` INT NULL,
  `status` ENUM('Permanent', 'Job Order', 'Co-Term') NOT NULL DEFAULT 'Permanent',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT INITIAL EMPLOYEE DATA
-- ============================================================

INSERT INTO `employees` (`id`, `name`, `department`, `birth_date`, `age`, `performance_rating`, `training_hours`, `status`) VALUES
('ID-001', 'MAMACLAY, JESSICA A.', 'Administrative Division (ADMIN)', '1991-08-02', 33, 4.5, 120, 'Permanent'),
('ID-002', 'Atienza, Joshua Kit, T.', 'Special Sectors, Livelihood and Community Development Division (SSLCDD)', '1995-07-21', 29, 4.8, 95, 'Permanent'),
('ID-003', 'SANTIAGO, ROWENA, P', 'Crisis Intervention Unit (CIU)', '1987-04-01', 37, 4.2, 110, 'Permanent'),
('ID-004', 'pablo, apostol, corpuz', 'Child and Youth Development Division (CYDD)', '1998-07-23', 26, 3.9, 75, 'Job Order'),
('ID-005', 'BINUYA, BRYAN DE JESUS', 'Bahay Pag-Asa Residential Care Center (BPARCC)', '1989-02-22', 35, 4.1, 88, 'Job Order'),
('ID-006', 'Marcelo, Mary Jane V.', 'Bahay Pag-Asa Residential Care Center (BPARCC)', '1981-12-04', 43, 4.6, 130, 'Permanent'),
('ID-007', 'SIMPLINA, ELLYZEUS, F.', 'Child and Youth Development Division (CYDD)', '1994-05-26', 30, 4.3, 102, 'Permanent'),
('ID-008', 'De Guzman Ron Jacob Nario', 'Bahay Pag-Asa Residential Care Center (BPARCC)', '2000-05-15', 24, 3.7, 60, 'Job Order'),
('ID-009', 'CUEVO, REGINA, BAUTISTA', 'Child and Youth Development Division (CYDD)', '1975-07-10', 49, 4.7, 145, 'Permanent'),
('ID-010', 'GAJO, BENEDICT T.', 'Administrative Division (ADMIN)', '1995-12-15', 29, 4.0, 85, 'Permanent'),
('ID-011', 'RODRIGUEZ, MARIA S.', 'Crisis Intervention Unit (CIU)', '1988-03-12', 36, 4.4, 115, 'Permanent'),
('ID-012', 'SANTOS, CARLOS M.', 'Administrative Division (ADMIN)', '1992-11-30', 32, 3.8, 78, 'Co-Term'),
('ID-013', 'FERNANDEZ, ANNA L.', 'Special Sectors, Livelihood and Community Development Division (SSLCDD)', '1990-09-18', 34, 4.5, 125, 'Permanent'),
('ID-014', 'CRUZ, DANIEL P.', 'Child and Youth Development Division (CYDD)', '1997-02-14', 27, 4.1, 92, 'Job Order'),
('ID-015', 'REYES, ELENA G.', 'Bahay Pag-Asa Residential Care Center (BPARCC)', '1985-06-25', 39, 4.6, 135, 'Permanent'),
('ID-016', 'LOPEZ, MICHAEL A.', 'Crisis Intervention Unit (CIU)', '1993-01-08', 31, 3.9, 82, 'Permanent'),
('ID-017', 'GARCIA, SOFIA R.', 'Administrative Division (ADMIN)', '1989-10-22', 35, 4.3, 108, 'Permanent'),
('ID-018', 'MENDOZA, RAFAEL B.', 'Special Sectors, Livelihood and Community Development Division (SSLCDD)', '1996-04-05', 28, 4.0, 88, 'Co-Term'),
('ID-019', 'TORRES, ISABEL V.', 'Child and Youth Development Division (CYDD)', '1991-12-20', 33, 4.7, 140, 'Permanent'),
('ID-020', 'RAMIREZ, ANTONIO J.', 'Bahay Pag-Asa Residential Care Center (BPARCC)', '1987-08-16', 37, 4.2, 105, 'Permanent');

-- ============================================================
-- STORED PROCEDURES FOR CRUD OPERATIONS
-- ============================================================

DELIMITER $$

-- ============================================================
-- CREATE: Add new employee
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_create_employee`$$

CREATE PROCEDURE `sp_create_employee`(
    IN p_id VARCHAR(10),
    IN p_name VARCHAR(255),
    IN p_department VARCHAR(255),
    IN p_birth_date DATE,
    IN p_performance_rating DECIMAL(3,1),
    IN p_training_hours INT,
    IN p_status VARCHAR(20)
)
BEGIN
    DECLARE v_age INT;
    
    -- Calculate age from birth date
    SET v_age = TIMESTAMPDIFF(YEAR, p_birth_date, CURDATE());
    
    -- Insert new employee
    INSERT INTO employees (
        id, 
        name, 
        department, 
        birth_date, 
        age, 
        performance_rating, 
        training_hours, 
        status
    ) VALUES (
        p_id,
        p_name,
        p_department,
        p_birth_date,
        v_age,
        p_performance_rating,
        p_training_hours,
        p_status
    );
    
    -- Return the created employee
    SELECT * FROM employees WHERE id = p_id;
END$$

-- ============================================================
-- READ: Get all employees
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_get_all_employees`$$

CREATE PROCEDURE `sp_get_all_employees`()
BEGIN
    SELECT 
        id,
        name,
        department,
        birth_date,
        age,
        performance_rating,
        training_hours,
        status,
        created_at,
        updated_at
    FROM employees
    ORDER BY id;
END$$

-- ============================================================
-- READ: Get employee by ID
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_get_employee_by_id`$$

CREATE PROCEDURE `sp_get_employee_by_id`(
    IN p_id VARCHAR(10)
)
BEGIN
    SELECT 
        id,
        name,
        department,
        birth_date,
        age,
        performance_rating,
        training_hours,
        status,
        created_at,
        updated_at
    FROM employees
    WHERE id = p_id;
END$$

-- ============================================================
-- READ: Get employees by department
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_get_employees_by_department`$$

CREATE PROCEDURE `sp_get_employees_by_department`(
    IN p_department VARCHAR(255)
)
BEGIN
    SELECT 
        id,
        name,
        department,
        birth_date,
        age,
        performance_rating,
        training_hours,
        status,
        created_at,
        updated_at
    FROM employees
    WHERE department LIKE CONCAT('%', p_department, '%')
    ORDER BY name;
END$$

-- ============================================================
-- READ: Get employees by status
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_get_employees_by_status`$$

CREATE PROCEDURE `sp_get_employees_by_status`(
    IN p_status VARCHAR(20)
)
BEGIN
    SELECT 
        id,
        name,
        department,
        birth_date,
        age,
        performance_rating,
        training_hours,
        status,
        created_at,
        updated_at
    FROM employees
    WHERE status = p_status
    ORDER BY name;
END$$

-- ============================================================
-- UPDATE: Update employee details
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_update_employee`$$

CREATE PROCEDURE `sp_update_employee`(
    IN p_id VARCHAR(10),
    IN p_name VARCHAR(255),
    IN p_department VARCHAR(255),
    IN p_birth_date DATE,
    IN p_performance_rating DECIMAL(3,1),
    IN p_training_hours INT,
    IN p_status VARCHAR(20)
)
BEGIN
    DECLARE v_age INT;
    
    -- Calculate age from birth date
    SET v_age = TIMESTAMPDIFF(YEAR, p_birth_date, CURDATE());
    
    -- Update employee
    UPDATE employees
    SET 
        name = p_name,
        department = p_department,
        birth_date = p_birth_date,
        age = v_age,
        performance_rating = p_performance_rating,
        training_hours = p_training_hours,
        status = p_status
    WHERE id = p_id;
    
    -- Return updated employee
    SELECT * FROM employees WHERE id = p_id;
END$$

-- ============================================================
-- DELETE: Delete employee by ID
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_delete_employee`$$

CREATE PROCEDURE `sp_delete_employee`(
    IN p_id VARCHAR(10)
)
BEGIN
    DELETE FROM employees WHERE id = p_id;
    
    -- Return success message
    SELECT CONCAT('Employee ', p_id, ' deleted successfully') AS message;
END$$

-- ============================================================
-- ANALYTICS: Get dashboard statistics
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_get_dashboard_stats`$$

CREATE PROCEDURE `sp_get_dashboard_stats`()
BEGIN
    -- Total employees
    SELECT COUNT(*) AS total_employees FROM employees;
    
    -- Total training hours
    SELECT SUM(training_hours) AS total_training_hours FROM employees;
    
    -- Department distribution
    SELECT 
        department,
        COUNT(*) AS count
    FROM employees
    GROUP BY department
    ORDER BY count DESC;
    
    -- Status distribution
    SELECT 
        status,
        COUNT(*) AS count
    FROM employees
    GROUP BY status;
    
    -- Top performers
    SELECT 
        id,
        name,
        department,
        performance_rating
    FROM employees
    WHERE performance_rating IS NOT NULL
    ORDER BY performance_rating DESC
    LIMIT 3;
END$$

-- ============================================================
-- ANALYTICS: Get upcoming birthdays (next 60 days)
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_get_upcoming_birthdays`$$

CREATE PROCEDURE `sp_get_upcoming_birthdays`()
BEGIN
    SELECT 
        id,
        name,
        department,
        birth_date,
        age,
        DAY(birth_date) AS birth_day,
        MONTHNAME(birth_date) AS birth_month,
        CASE 
            WHEN DAYOFYEAR(DATE_ADD(birth_date, 
                INTERVAL (YEAR(CURDATE()) - YEAR(birth_date)) YEAR)) >= DAYOFYEAR(CURDATE())
            THEN DAYOFYEAR(DATE_ADD(birth_date, 
                INTERVAL (YEAR(CURDATE()) - YEAR(birth_date)) YEAR)) - DAYOFYEAR(CURDATE())
            ELSE DAYOFYEAR(DATE_ADD(birth_date, 
                INTERVAL (YEAR(CURDATE()) - YEAR(birth_date) + 1) YEAR)) - DAYOFYEAR(CURDATE())
        END AS days_until
    FROM employees
    HAVING days_until >= 0 AND days_until <= 60
    ORDER BY days_until ASC
    LIMIT 5;
END$$

-- ============================================================
-- UTILITY: Generate next employee ID
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_generate_next_id`$$

CREATE PROCEDURE `sp_generate_next_id`()
BEGIN
    DECLARE v_max_id INT;
    DECLARE v_next_id VARCHAR(10);
    
    -- Get the maximum numeric part of existing IDs
    SELECT COALESCE(MAX(CAST(SUBSTRING(id, 4) AS UNSIGNED)), 0) INTO v_max_id
    FROM employees;
    
    -- Generate next ID
    SET v_next_id = CONCAT('ID-', LPAD(v_max_id + 1, 3, '0'));
    
    SELECT v_next_id AS next_id;
END$$

-- ============================================================
-- UTILITY: Update all employee ages
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_update_all_ages`$$

CREATE PROCEDURE `sp_update_all_ages`()
BEGIN
    UPDATE employees
    SET age = TIMESTAMPDIFF(YEAR, birth_date, CURDATE());
    
    SELECT 'All employee ages updated successfully' AS message;
END$$

DELIMITER ;

-- ============================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================

-- View: Employee summary with department acronyms
DROP VIEW IF EXISTS `v_employee_summary`;

CREATE VIEW `v_employee_summary` AS
SELECT 
    e.id,
    e.name,
    e.department,
    SUBSTRING_INDEX(SUBSTRING_INDEX(e.department, '(', -1), ')', 1) AS department_acronym,
    e.birth_date,
    e.age,
    e.performance_rating,
    e.training_hours,
    e.status
FROM employees e;

-- View: Top performers
DROP VIEW IF EXISTS `v_top_performers`;

CREATE VIEW `v_top_performers` AS
SELECT 
    id,
    name,
    department,
    performance_rating,
    training_hours,
    status
FROM employees
WHERE performance_rating IS NOT NULL
ORDER BY performance_rating DESC;

-- View: Department statistics
DROP VIEW IF EXISTS `v_department_stats`;

CREATE VIEW `v_department_stats` AS
SELECT 
    department,
    COUNT(*) AS employee_count,
    AVG(performance_rating) AS avg_performance,
    SUM(training_hours) AS total_training_hours,
    AVG(age) AS avg_age
FROM employees
GROUP BY department;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_department ON employees(department);
CREATE INDEX idx_status ON employees(status);
CREATE INDEX idx_performance_rating ON employees(performance_rating DESC);
CREATE INDEX idx_birth_date ON employees(birth_date);

-- ============================================================
-- SAMPLE USAGE EXAMPLES (COMMENTED OUT)
-- ============================================================

/*
-- CREATE: Add a new employee
CALL sp_create_employee(
    'ID-021', 
    'DELA CRUZ, JUAN P.', 
    'Administrative Division (ADMIN)', 
    '1990-05-15', 
    4.2, 
    95, 
    'Permanent'
);

-- READ: Get all employees
CALL sp_get_all_employees();

-- READ: Get employee by ID
CALL sp_get_employee_by_id('ID-001');

-- READ: Get employees by department
CALL sp_get_employees_by_department('ADMIN');

-- READ: Get employees by status
CALL sp_get_employees_by_status('Permanent');

-- UPDATE: Update employee
CALL sp_update_employee(
    'ID-021',
    'DELA CRUZ, JUAN PEDRO',
    'Crisis Intervention Unit (CIU)',
    '1990-05-15',
    4.5,
    100,
    'Permanent'
);

-- DELETE: Delete employee
CALL sp_delete_employee('ID-021');

-- ANALYTICS: Get dashboard stats
CALL sp_get_dashboard_stats();

-- ANALYTICS: Get upcoming birthdays
CALL sp_get_upcoming_birthdays();

-- UTILITY: Generate next ID
CALL sp_generate_next_id();

-- UTILITY: Update all ages
CALL sp_update_all_ages();

-- QUERY VIEWS
SELECT * FROM v_employee_summary;
SELECT * FROM v_top_performers LIMIT 5;
SELECT * FROM v_department_stats;
*/

-- ============================================================
-- END OF SQL FILE
-- ============================================================
