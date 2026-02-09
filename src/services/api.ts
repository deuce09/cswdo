/**
 * API Service for HR Dashboard
 * Handles all API calls to the PHP backend
 */

// Update this URL to match your local server setup
const API_BASE_URL = 'http://localhost/hr_dashboard/backend/api/employees.php';

// Type definitions (using 'type' instead of 'interface' for better compatibility)
export type Employee = {
  id: string;
  name: string;
  department: string;
  birthDate: string;
  age: number;
  performanceRating: number | null;
  trainingHours: number | null;
  status: 'Permanent' | 'Job Order' | 'Co-Term';
};

export type DashboardStats = {
  totalEmployees: number;
  totalTrainingHours: number;
  departments: Array<{ name: string; count: number }>;
  statuses: Array<{ name: string; count: number }>;
  topPerformers: Array<{
    id: string;
    name: string;
    department: string;
    performanceRating: number;
  }>;
};

export type Birthday = {
  id: string;
  name: string;
  department: string;
  birthDate: string;
  age: number;
  birthDay: number;
  birthMonth: string;
  daysUntil: number;
};

class EmployeeAPI {
  /**
   * Get all employees
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=all`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=employee&id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(employee: Omit<Employee, 'age'>): Promise<{ message: string; id: string; employee: Employee }> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(employee: Employee): Promise<{ message: string; employee: Employee }> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get upcoming birthdays
   */
  async getUpcomingBirthdays(): Promise<Birthday[]> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=birthdays`);
      if (!response.ok) {
        throw new Error('Failed to fetch birthdays');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      throw error;
    }
  }

  /**
   * Get next employee ID
   */
  async getNextId(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=next-id`);
      if (!response.ok) {
        throw new Error('Failed to fetch next ID');
      }
      const data = await response.json();
      return data.nextId;
    } catch (error) {
      console.error('Error fetching next ID:', error);
      throw error;
    }
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=department&dept=${encodeURIComponent(department)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees by department');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employees by department:', error);
      throw error;
    }
  }

  /**
   * Get employees by status
   */
  async getEmployeesByStatus(status: string): Promise<Employee[]> {
    try {
      const response = await fetch(`${API_BASE_URL}?action=status&status=${encodeURIComponent(status)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees by status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employees by status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const employeeAPI = new EmployeeAPI();

// Also export the class if needed
export { EmployeeAPI };
