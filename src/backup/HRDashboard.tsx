import React, { useState, useEffect, useMemo } from 'react';
import { employeeAPI } from './services/api';
import type { Employee } from './services/api';

// Types
interface DepartmentCount {
  name: string;
  count: number;
}

interface StatusCount {
  name: string;
  count: number;
}

interface UpcomingBirthday extends Employee {
  nextBirthday: Date;
  daysUntil: number;
  birthMonth: string;
  birthDay: number;
}

const HRDashboard: React.FC = () => {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeAPI.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees. Please make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalEmployees: number = employees.length;
  const totalTrainingHours: number = employees.reduce((sum, emp) => sum + (emp.trainingHours || 0), 0);

  const handleAddEmployee = async () => {
    try {
      const nextId = await employeeAPI.getNextId();
      const newEmployee: Employee = {
        id: nextId,
        name: '',
        department: '',
        birthDate: '',
        age: 0,
        performanceRating: null,
        trainingHours: null,
        status: 'Permanent'
      };
      setEditingEmployee(newEmployee);
      setIsAddingNew(true);
      setShowEditor(true);
    } catch (err) {
      alert('Failed to generate new employee ID');
      console.error(err);
    }
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee({ ...emp });
    setIsAddingNew(false);
    setShowEditor(true);
  };

  const handleSaveEmployee = async () => {
    if (!editingEmployee) return;

    try {
      if (isAddingNew) {
        await employeeAPI.createEmployee(editingEmployee);
        alert('Employee created successfully!');
      } else {
        await employeeAPI.updateEmployee(editingEmployee);
        alert('Employee updated successfully!');
      }

      // Reload employees from database
      await loadEmployees();
      
      setShowEditor(false);
      setEditingEmployee(null);
      setIsAddingNew(false);
    } catch (err) {
      alert('Failed to save employee');
      console.error(err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.deleteEmployee(id);
        alert('Employee deleted successfully!');
        await loadEmployees();
      } catch (err) {
        alert('Failed to delete employee');
        console.error(err);
      }
    }
  };

  const updateEditingEmployee = (field: keyof Employee, value: any) => {
    if (!editingEmployee) return;

    const updated = { ...editingEmployee, [field]: value };

    // Auto-calculate age from birthDate
    if (field === 'birthDate' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      updated.age = age;
    }

    setEditingEmployee(updated);
  };

  const departmentCounts = useMemo((): DepartmentCount[] => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      // Extract department acronym
      const match = emp.department?.match(/\(([^)]+)\)/);
      const deptName = match ? match[1] : emp.department?.split(' ')[0] || 'Unknown';
      counts[deptName] = (counts[deptName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  const statusCounts = useMemo((): StatusCount[] => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      const status = emp.status || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [employees]);

  const topPerformers = useMemo((): Employee[] => {
    return employees
      .filter(emp => emp.performanceRating)
      .sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0))
      .slice(0, 3);
  }, [employees]);

  // Calculate upcoming birthdays (next 60 days)
  const upcomingBirthdays = useMemo((): UpcomingBirthday[] => {
    const today = new Date();

    return employees
      .filter(emp => emp.birthDate)
      .map(emp => {
        const birthDate = new Date(emp.birthDate);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...emp,
          nextBirthday: thisYearBirthday,
          daysUntil,
          birthMonth: birthDate.toLocaleDateString('en-US', { month: 'short' }),
          birthDay: birthDate.getDate()
        };
      })
      .filter(emp => emp.daysUntil >= 0 && emp.daysUntil <= 60)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [employees]);

  // Calculate max for department chart
  const maxDeptCount: number = Math.max(...departmentCounts.map(d => d.count), 1);

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: '"Courier New", monospace'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading...</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Connecting to database...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: '"Courier New", monospace'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 100, 100, 0.1)',
          border: '1px solid rgba(255, 100, 100, 0.3)',
          borderRadius: '8px',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '15px', color: '#ff6b6b' }}>⚠ Connection Error</div>
          <div style={{ fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>{error}</div>
          <button 
            onClick={loadEmployees}
            style={{
              background: 'linear-gradient(135deg, #64c8ff 0%, #4a9eff 100%)',
              border: 'none',
              color: '#0a0e27',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}
          >
            RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      padding: '40px 60px',
      fontFamily: '"Courier New", monospace',
      color: '#ffffff'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        paddingBottom: '30px',
        borderBottom: '1px dotted rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          fontSize: '42px',
          fontWeight: 'bold',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #64c8ff 0%, #90ee90 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '3px'
        }}>HR ANALYTICS DASHBOARD</div>
        <div style={{
          fontSize: '11px',
          letterSpacing: '3px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>EMPLOYEE MANAGEMENT SYSTEM • DATABASE CONNECTED</div>
      </div>

      {/* Add Employee Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '30px'
      }}>
        <button
          onClick={handleAddEmployee}
          className="edit-button"
          style={{
            background: 'linear-gradient(135deg, #64c8ff 0%, #4a9eff 100%)',
            color: '#0a0e27',
            fontWeight: 'bold'
          }}
        >
          + ADD EMPLOYEE
        </button>
      </div>

      {/* Main Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '25px',
        marginBottom: '40px'
      }}>
        {/* Total Employees */}
        <div className="stat-card" style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '30px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '15px'
          }}>TOTAL EMPLOYEES</div>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#64c8ff',
            fontFamily: 'Georgia, serif'
          }}>{totalEmployees}</div>
        </div>

        {/* Active Departments */}
        <div className="stat-card" style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '30px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '15px'
          }}>ACTIVE DEPARTMENTS</div>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#90ee90',
            fontFamily: 'Georgia, serif'
          }}>{departmentCounts.length}</div>
        </div>

        {/* Total Training Hours */}
        <div className="stat-card" style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '30px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '15px'
          }}>TOTAL TRAINING HOURS</div>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#ffa07a',
            fontFamily: 'Georgia, serif'
          }}>{totalTrainingHours.toLocaleString()}</div>
        </div>
      </div>

      {/* Department Distribution, Top Performers, Employee Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '25px',
        marginBottom: '40px'
      }}>
        {/* Department Distribution */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: '300px'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '25px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>DEPARTMENT DISTRIBUTION</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {departmentCounts.map((dept, index) => (
              <div key={index}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '11px'
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{dept.name}</span>
                  <span style={{ color: '#64c8ff', fontWeight: 'bold' }}>{dept.count}</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(dept.count / maxDeptCount) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #64c8ff 0%, #4a9eff 100%)',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: '300px'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '25px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>TOP PERFORMERS</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {topPerformers.map((emp, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: index < topPerformers.length - 1 ? '1px dotted rgba(255, 255, 255, 0.15)' : 'none',
                paddingBottom: index < topPerformers.length - 1 ? '15px' : '0'
              }}>
                <div style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: index === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                              index === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)' :
                              'linear-gradient(135deg, #cd7f32 0%, #b87333 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: index === 1 ? '#333' : '#fff',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{emp.name}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)' }}>
                    {emp.department?.match(/\(([^)]+)\)/)?.[1] || emp.department}
                  </div>
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#90ee90',
                  fontFamily: 'Georgia, serif'
                }}>{emp.performanceRating?.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Status */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: '300px'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>EMPLOYMENT STATUS</div>

          {/* Status Details */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            borderTop: '1px dotted rgba(255, 255, 255, 0.2)',
            paddingTop: '15px'
          }}>
            {statusCounts.map((status, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                fontSize: '12px',
                borderBottom: index < statusCounts.length - 1 ? '1px dotted rgba(255, 255, 255, 0.1)' : 'none',
                paddingBottom: index < statusCounts.length - 1 ? '10px' : '0'
              }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{status.name}</div>
                <div style={{
                  color: '#90ee90',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: 'Georgia, serif'
                }}>{status.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: '200px'
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>UPCOMING BIRTHDAYS</div>

          {upcomingBirthdays.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingBirthdays.map((emp, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr auto',
                  gap: '12px',
                  alignItems: 'center',
                  borderBottom: index < upcomingBirthdays.length - 1 ? '1px dotted rgba(255, 255, 255, 0.15)' : 'none',
                  paddingBottom: index < upcomingBirthdays.length - 1 ? '12px' : '0'
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)'
                  }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {emp.birthMonth}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                      {emp.birthDay}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '2px' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      {emp.department?.match(/\(([^)]+)\)/)?.[1] || emp.department}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#ff6b9d', fontWeight: 'bold' }}>
                      {emp.daysUntil === 0 ? 'Today!' : emp.daysUntil === 1 ? 'Tomorrow' : `${emp.daysUntil}d`}
                    </div>
                    <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      Age {emp.age + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '11px',
              padding: '40px 20px'
            }}>
              No upcoming birthdays
            </div>
          )}
        </div>
      </div>

      {/* Employee Editor Modal */}
      {showEditor && editingEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditor(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              fontSize: '18px',
              letterSpacing: '2px',
              marginBottom: '25px',
              color: '#64c8ff',
              textAlign: 'center'
            }}>
              {isAddingNew ? 'ADD NEW EMPLOYEE' : 'EDIT EMPLOYEE'}
            </h2>

            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                className="form-input"
                value={editingEmployee.id}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={editingEmployee.name}
                onChange={(e) => updateEditingEmployee('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value={editingEmployee.department}
                onChange={(e) => updateEditingEmployee('department', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Birth Date</label>
              <input
                type="date"
                className="form-input"
                value={editingEmployee.birthDate}
                onChange={(e) => updateEditingEmployee('birthDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-input"
                value={editingEmployee.age}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Performance Rating (0-5)</label>
              <input
                type="number"
                className="form-input"
                step="0.1"
                min="0"
                max="5"
                value={editingEmployee.performanceRating || ''}
                onChange={(e) => updateEditingEmployee('performanceRating', parseFloat(e.target.value) || null)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Training Hours</label>
              <input
                type="number"
                className="form-input"
                value={editingEmployee.trainingHours || ''}
                onChange={(e) => updateEditingEmployee('trainingHours', parseInt(e.target.value) || null)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employment Status</label>
              <select
                className="form-input"
                value={editingEmployee.status}
                onChange={(e) => updateEditingEmployee('status', e.target.value)}
              >
                <option value="Permanent">Permanent</option>
                <option value="Job Order">Job Order</option>
                <option value="Co-Term">Co-Term</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              marginTop: '30px'
            }}>
              <button
                className="btn btn-primary"
                onClick={handleSaveEmployee}
              >
                {isAddingNew ? 'ADD EMPLOYEE' : 'SAVE CHANGES'}
              </button>
              <button
                className="btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
                onClick={() => setShowEditor(false)}
              >
                CANCEL
              </button>
              {!isAddingNew && (
                <button
                  className="btn"
                  style={{
                    background: 'rgba(255, 100, 100, 0.3)',
                    color: '#ff6b6b'
                  }}
                  onClick={() => {
                    handleDeleteEmployee(editingEmployee.id);
                    setShowEditor(false);
                  }}
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
