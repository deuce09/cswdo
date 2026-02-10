import React, { useState, useEffect, useMemo } from 'react';
import { employeeAPI } from './services/api';
import type { Employee } from './services/api';

// Types
interface DepartmentCount {
  name: string;
  count: number;
}

function deptFullName(deptName: string) {
  switch (deptName) {
    case "CYDD":
      return "(CYDD) Child and Youth Development Division";
    case "ADMIN":
      return "(ADMIN) Administrative Division";
    case "SSLCDD":
      return "(SSLCDD) Special Sectors, Livelihood and Community Development Division";
    case "CIU":
      return "(CIU) Crisis Intervention Unit";
    case "PSIU":
      return "(PSIU) Psycho Social Intervention Unit";
    case "BPARCC":
      return "(BPARCC) Bahay Pag-Asa Residential Care Center";
    case "TMC":
      return "(TMC) Tahanan ni Maria Center";
    case "4Ps":
      return "(4Ps) Pantawid Pamilyang Pilipino Program";
    case "FDC":
      return "(FDC) Funeraria de Cabanatuan";
    case "CABALAI":
      return "Cabalai ni Apong";
  }
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

  const cardBackground = "rgba(255, 255, 255, 0.73)";
  const headerFont = "DM Sans";
  const mainFont = "Comfortaa";
  const buttonFont = "Roboto";

  const cardHeader_fontSize = "1rem";
  const cardContent_fontSize = "0.9rem";
  const cardHeader_TextColor = "black";
  const cardContent_textColor = "black";

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
        fontFamily: headerFont
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading...</div>
          <div style={{ fontSize: '12px', color: cardHeader_TextColor }}>
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
        fontFamily: headerFont
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
              fontFamily: headerFont,
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
      // background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      background: 'radial-gradient(ellipse farthest-corner at center center, #FCDCB5 0%, #EAAFDC 50%, #D6B1F6 100%)',
      // backgroundAttachment: 'fixed',
      padding: '40px 60px',
      fontFamily: headerFont,
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
          // background: 'linear-gradient(135deg, #64c8ff 0%, #90ee90 100%)',
          // WebkitBackgroundClip: 'text',
          // WebkitTextFillColor: 'transparent',
          color: 'black',
          letterSpacing: '3px'
        }}>HR ANALYTICS DASHBOARD</div>
        <div style={{
          fontSize: cardContent_fontSize,
          letterSpacing: '3px',
          // color: cardContent_textColor
          color: 'black',
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
            // background: 'linear-gradient(135deg, #64c8ff 0%, #4a9eff 100%)',
            color: '#0a0e27',
            fontFamily: buttonFont,
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
          background: cardBackground,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '30px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: cardHeader_fontSize,
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: cardHeader_TextColor,
            marginBottom: '15px'
          }}>TOTAL EMPLOYEES</div>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#64c8ff',
            fontFamily: mainFont
          }}>{totalEmployees}</div>
        </div>

        {/* Active Departments */}
        <div className="stat-card" style={{
          background: cardBackground,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '30px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: cardHeader_fontSize,
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: cardHeader_TextColor,
            marginBottom: '15px'
          }}>ACTIVE DEPARTMENTS</div>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#90ee90',
            fontFamily: mainFont
          }}>{departmentCounts.length}</div>
        </div>

        {/* Total Training Hours */}
        <div className="stat-card" style={{
          background: cardBackground,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '30px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: cardHeader_fontSize,
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: cardHeader_TextColor,
            marginBottom: '15px'
          }}>TOTAL TRAINING HOURS</div>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#ffa07a',
            fontFamily: mainFont
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
          background: cardBackground,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: '300px'
        }}>
          <div style={{
            fontSize: cardHeader_fontSize,
            letterSpacing: '2px',
            color: cardHeader_TextColor,
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
                  fontSize: cardContent_fontSize
                }}>


                  <span style={{ color: cardContent_textColor }}>{deptFullName(dept.name)}</span>
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
          background: cardBackground,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: '300px'
        }}>
          <div style={{
            fontSize: cardHeader_fontSize,
            letterSpacing: '2px',
            color: cardHeader_TextColor,
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
                    fontSize: cardContent_fontSize,
                    color: cardContent_textColor,
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{emp.name}</div>
                  <div style={{ fontSize: '9px', color: cardContent_textColor }}>
                    {emp.department?.match(/\(([^)]+)\)/)?.[1] || emp.department}
                  </div>
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#90ee90',
                  fontFamily: mainFont
                }}>{emp.performanceRating?.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Status */}
        <div style={{
          background: cardBackground,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: '300px'
        }}>
          <div style={{
            fontSize: cardHeader_fontSize,
            letterSpacing: '2px',
            color: cardHeader_TextColor,
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
                fontSize: cardContent_fontSize,
                borderBottom: index < statusCounts.length - 1 ? '1px dotted rgba(255, 255, 255, 0.1)' : 'none',
                paddingBottom: index < statusCounts.length - 1 ? '10px' : '0'
              }}>
                <div style={{ color: cardContent_textColor }}>{status.name}</div>
                <div style={{
                  color: '#90ee90',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: mainFont
                }}>{status.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div style={{
          background: cardBackground,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: '200px'
        }}>
          <div style={{
            fontSize: cardHeader_fontSize,
            letterSpacing: '2px',
            color: cardHeader_TextColor,
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
                    <div style={{ fontSize: '9px', color: cardContent_textColor }}>
                      {emp.birthMonth}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                      {emp.birthDay}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: cardContent_fontSize, color: cardContent_textColor, marginBottom: '2px' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '9px', color: cardContent_textColor }}>
                      {emp.department?.match(/\(([^)]+)\)/)?.[1] || emp.department}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: cardContent_fontSize, color: '#ff6b9d', fontWeight: 'bold' }}>
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
              fontSize: cardContent_fontSize,
              padding: '40px 20px'
            }}>
              No upcoming birthdays
            </div>
          )}
        </div>
      </div>

      {/* Employee List Table */}
      <div className='employeeDirectoryTbl' style={{
        background: cardBackground,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        marginTop: '40px'
      }}>

        <div style={{
          fontSize: cardHeader_fontSize,
          letterSpacing: '2px',
          color: cardHeader_TextColor,
          marginBottom: '25px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>EMPLOYEE DIRECTORY</div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: cardContent_fontSize
          }}>
            <thead>
              <tr style={{
                borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>ID</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>Name</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>Department</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>Age</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>Years of Service</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>Rating</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>Training</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: cardContent_textColor, fontWeight: 'bold' }}>Attendance</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: cardContent_textColor, fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.4)'
                  }}>
                    No employees found. Click "Add Employee" to get started.
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr key={emp.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    transition: 'background 0.2s ease'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 200, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'}
                  >
                    <td style={{ padding: '12px 15px', color: cardHeader_TextColor }}>{emp.id}</td>
                    <td style={{ padding: '12px 15px', color: cardContent_textColor }}>{emp.name}</td>
                    <td style={{ padding: '12px 15px', color: cardContent_textColor }}>
                      {emp.department?.match(/\(([^)]+)\)/)?.[1] || emp.department}
                    </td>
                    <td style={{ padding: '12px 15px', color: cardContent_textColor }}>{emp.age}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: cardHeader_fontSize,
                        background: emp.status === 'Permanent' ? 'rgba(144, 238, 144, 0.2)' :
                          emp.status === 'Job Order' ? 'rgba(255, 160, 122, 0.2)' :
                            'rgba(100, 200, 255, 0.2)',
                        color: emp.status === 'Permanent' ? '#2ac92a' :
                          emp.status === 'Job Order' ? '#ffa07a' :
                            '#35b8ff',
                        border: `1px solid ${emp.status === 'Permanent' ? '#90ee90' :
                          emp.status === 'Job Order' ? '#ffa07a' :
                            '#64c8ff'}`
                      }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', color: cardContent_textColor }}>
                      {/* YEARS OF SERVICE HERE */}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#90ee90', fontWeight: 'bold' }}>
                      {emp.performanceRating?.toFixed(1) || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 15px', color: cardContent_textColor }}>
                      {emp.trainingHours ? `${emp.trainingHours}h` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 15px', color: cardContent_textColor }}>
                      {/* ATTENDANCE HERE */}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditEmployee(emp)}
                          className="edit-button"
                          style={{
                            border: 'none',
                            color: '#0a0e27',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontFamily: buttonFont,
                            fontSize: cardHeader_fontSize,
                            fontWeight: 'bold',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 200, 255, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <span className="material-symbols-outlined">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="delete-button"
                          style={{
                            background: 'rgba(255, 100, 100, 0.2)',
                            border: '1px solid rgba(255, 100, 100, 0.5)',
                            color: '#ff5959',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontFamily: buttonFont,
                            fontSize: cardHeader_fontSize,
                            fontWeight: 'bold',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 100, 100, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 100, 100, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 100, 100, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
              <label className="form-label">Full Name (LAST NAME, FIRST NAME, MIDDLE INITIAL)</label>
              <input
                type="text"
                className="form-input"
                value={editingEmployee.name}
                onChange={(e) => updateEditingEmployee('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select name="dept" id="dept" className='form-input' value={editingEmployee.department}
                onChange={(e) => updateEditingEmployee('department', e.target.value)}>
                <option value="ADMIN">ADMIN</option>
                <option value="SSLCDD">SSLCDD</option>
                <option value="CYDD">CYDD</option>
                <option value="CIU">CIU</option>
                <option value="PSIU">PSIU</option>
                <option value="BPARCC">BPARCC</option>
                <option value="TMC">TMC</option>
                <option value="4Ps">4Ps</option>
                <option value="FDC">FDC</option>
                <option value="CABALAI NI APONG">CABALAI NI APONG</option>


              </select>

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
                  color: cardContent_textColor
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
