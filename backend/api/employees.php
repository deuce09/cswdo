<?php
/**
 * HR Dashboard API
 * RESTful API for employee management
 * Connects to MySQL database with stored procedures
 */

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'hr_dashboard');

class Database {
    private $conn;

    public function __construct() {
        try {
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
            
            $this->conn->set_charset("utf8mb4");
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }

    public function getConnection() {
        return $this->conn;
    }

    public function __destruct() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}

class EmployeeAPI {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get all employees
     */
    public function getAllEmployees() {
        $result = $this->conn->query("CALL sp_get_all_employees()");
        
        if (!$result) {
            throw new Exception("Error fetching employees: " . $this->conn->error);
        }

        $employees = [];
        while ($row = $result->fetch_assoc()) {
            $employees[] = $this->formatEmployee($row);
        }

        $result->free();
        $this->conn->next_result(); // Clear stored procedure result
        
        return $employees;
    }

    /**
     * Get employee by ID
     */
    public function getEmployeeById($id) {
        $stmt = $this->conn->prepare("CALL sp_get_employee_by_id(?)");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $employee = $result->fetch_assoc();
        
        $result->free();
        $stmt->close();
        $this->conn->next_result();
        
        if (!$employee) {
            throw new Exception("Employee not found");
        }
        
        return $this->formatEmployee($employee);
    }

    /**
     * Create new employee
     */
    public function createEmployee($data) {
        $stmt = $this->conn->prepare("CALL sp_create_employee(?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param(
            "ssssdis",
            $data['id'],
            $data['name'],
            $data['department'],
            $data['birthDate'],
            $data['performanceRating'],
            $data['trainingHours'],
            $data['status']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error creating employee: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $employee = $result->fetch_assoc();
        
        $result->free();
        $stmt->close();
        $this->conn->next_result();
        
        return [
            'message' => 'Employee created successfully',
            'id' => $data['id'],
            'employee' => $this->formatEmployee($employee)
        ];
    }

    /**
     * Update employee
     */
    public function updateEmployee($data) {
        $stmt = $this->conn->prepare("CALL sp_update_employee(?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param(
            "ssssdis",
            $data['id'],
            $data['name'],
            $data['department'],
            $data['birthDate'],
            $data['performanceRating'],
            $data['trainingHours'],
            $data['status']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error updating employee: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $employee = $result->fetch_assoc();
        
        $result->free();
        $stmt->close();
        $this->conn->next_result();
        
        return [
            'message' => 'Employee updated successfully',
            'employee' => $this->formatEmployee($employee)
        ];
    }

    /**
     * Delete employee
     */
    public function deleteEmployee($id) {
        $stmt = $this->conn->prepare("CALL sp_delete_employee(?)");
        $stmt->bind_param("s", $id);
        
        if (!$stmt->execute()) {
            throw new Exception("Error deleting employee: " . $stmt->error);
        }
        
        $stmt->close();
        $this->conn->next_result();
        
        return ['message' => 'Employee deleted successfully'];
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats() {
        // We need to call this multiple times to get all result sets
        $this->conn->multi_query("CALL sp_get_dashboard_stats()");
        
        // Total employees
        $result = $this->conn->store_result();
        $totalEmployees = $result->fetch_assoc()['total_employees'];
        $result->free();
        $this->conn->next_result();
        
        // Total training hours
        $result = $this->conn->store_result();
        $totalTrainingHours = $result->fetch_assoc()['total_training_hours'];
        $result->free();
        $this->conn->next_result();
        
        // Department distribution
        $result = $this->conn->store_result();
        $departments = [];
        while ($row = $result->fetch_assoc()) {
            // Extract acronym from department name
            preg_match('/\(([^)]+)\)/', $row['department'], $matches);
            $departments[] = [
                'name' => isset($matches[1]) ? $matches[1] : explode(' ', $row['department'])[0],
                'count' => (int)$row['count']
            ];
        }
        $result->free();
        $this->conn->next_result();
        
        // Status distribution
        $result = $this->conn->store_result();
        $statuses = [];
        while ($row = $result->fetch_assoc()) {
            $statuses[] = [
                'name' => $row['status'],
                'count' => (int)$row['count']
            ];
        }
        $result->free();
        $this->conn->next_result();
        
        // Top performers
        $result = $this->conn->store_result();
        $topPerformers = [];
        while ($row = $result->fetch_assoc()) {
            preg_match('/\(([^)]+)\)/', $row['department'], $matches);
            $topPerformers[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'department' => isset($matches[1]) ? $matches[1] : $row['department'],
                'performanceRating' => (float)$row['performance_rating']
            ];
        }
        $result->free();
        
        return [
            'totalEmployees' => (int)$totalEmployees,
            'totalTrainingHours' => (int)$totalTrainingHours,
            'departments' => $departments,
            'statuses' => $statuses,
            'topPerformers' => $topPerformers
        ];
    }

    /**
     * Get upcoming birthdays
     */
    public function getUpcomingBirthdays() {
        $result = $this->conn->query("CALL sp_get_upcoming_birthdays()");
        
        if (!$result) {
            throw new Exception("Error fetching birthdays: " . $this->conn->error);
        }

        $birthdays = [];
        while ($row = $result->fetch_assoc()) {
            preg_match('/\(([^)]+)\)/', $row['department'], $matches);
            $birthdays[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'department' => isset($matches[1]) ? $matches[1] : $row['department'],
                'birthDate' => $row['birth_date'],
                'age' => (int)$row['age'],
                'birthDay' => (int)$row['birth_day'],
                'birthMonth' => substr($row['birth_month'], 0, 3), // Short month name
                'daysUntil' => (int)$row['days_until']
            ];
        }

        $result->free();
        $this->conn->next_result();
        
        return $birthdays;
    }

    /**
     * Get next employee ID
     */
    public function getNextId() {
        $result = $this->conn->query("CALL sp_generate_next_id()");
        
        if (!$result) {
            throw new Exception("Error generating next ID: " . $this->conn->error);
        }

        $row = $result->fetch_assoc();
        $nextId = $row['next_id'];
        
        $result->free();
        $this->conn->next_result();
        
        return ['nextId' => $nextId];
    }

    /**
     * Get employees by department
     */
    public function getEmployeesByDepartment($department) {
        $stmt = $this->conn->prepare("CALL sp_get_employees_by_department(?)");
        $stmt->bind_param("s", $department);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $employees = [];
        
        while ($row = $result->fetch_assoc()) {
            $employees[] = $this->formatEmployee($row);
        }
        
        $result->free();
        $stmt->close();
        $this->conn->next_result();
        
        return $employees;
    }

    /**
     * Get employees by status
     */
    public function getEmployeesByStatus($status) {
        $stmt = $this->conn->prepare("CALL sp_get_employees_by_status(?)");
        $stmt->bind_param("s", $status);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $employees = [];
        
        while ($row = $result->fetch_assoc()) {
            $employees[] = $this->formatEmployee($row);
        }
        
        $result->free();
        $stmt->close();
        $this->conn->next_result();
        
        return $employees;
    }

    /**
     * Format employee data for JSON response
     */
    private function formatEmployee($row) {
        return [
            'id' => $row['id'],
            'name' => $row['name'],
            'department' => $row['department'],
            'birthDate' => $row['birth_date'],
            'age' => (int)$row['age'],
            'performanceRating' => $row['performance_rating'] ? (float)$row['performance_rating'] : null,
            'trainingHours' => $row['training_hours'] ? (int)$row['training_hours'] : null,
            'status' => $row['status']
        ];
    }
}

// Main request handler
try {
    $api = new EmployeeAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    switch ($method) {
        case 'GET':
            if ($action === 'all') {
                echo json_encode($api->getAllEmployees());
            } elseif ($action === 'employee' && isset($_GET['id'])) {
                echo json_encode($api->getEmployeeById($_GET['id']));
            } elseif ($action === 'stats') {
                echo json_encode($api->getDashboardStats());
            } elseif ($action === 'birthdays') {
                echo json_encode($api->getUpcomingBirthdays());
            } elseif ($action === 'next-id') {
                echo json_encode($api->getNextId());
            } elseif ($action === 'department' && isset($_GET['dept'])) {
                echo json_encode($api->getEmployeesByDepartment($_GET['dept']));
            } elseif ($action === 'status' && isset($_GET['status'])) {
                echo json_encode($api->getEmployeesByStatus($_GET['status']));
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
            }
            break;

        case 'POST':
            if ($action === 'create') {
                $data = json_decode(file_get_contents('php://input'), true);
                echo json_encode($api->createEmployee($data));
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($api->updateEmployee($data));
            break;

        case 'DELETE':
            if (isset($_GET['id'])) {
                echo json_encode($api->deleteEmployee($_GET['id']));
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Employee ID required']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
