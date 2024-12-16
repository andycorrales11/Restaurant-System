import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import "../css/employee_management.css";

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]); // State to store employee data
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State to manage errors
    const navigate = useNavigate();

    const handleEdit = (id) => {
        navigate(`/management/employee/edit/${id}`);
    };

    // Fetch employee data when the component mounts
    useEffect(() => {
        const fetchEmployeeIds = async () => {
            try {
                // Fetch the list of employee IDs
                const response = await fetch(process.env.REACT_APP_PROXY + "/api/employees/");
                if (!response.ok) {
                    throw new Error("Failed to fetch employee IDs");
                }
                const employeeIds = await response.json(); // Assuming it returns an array of IDs
                // console.log("Employee IDs:", employeeIds);

                const femployeeIds = employeeIds.rows.map((row) => row[0]);
                // console.log("Formatted Employee IDs:", femployeeIds);

                // Fetch employee details for each ID
                const fetchedEmployees = await Promise.all(
                    femployeeIds.map(async (id) => {
                        const empResponse = await fetch(process.env.REACT_APP_PROXY + `/api/employees/${id}`);
                        if (!empResponse.ok) {
                            throw new Error("Failed to fetch employee data");
                        }
                        const employeeData = await empResponse.json();
                        return employeeData;
                    })
                );
                console.log("Fetched Employees:", fetchedEmployees);
                setEmployees(fetchedEmployees);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching employees:", err);
                setError("Failed to load employees");
                setLoading(false);
            }
        };

        fetchEmployeeIds();
    }, []);

    if (loading) {
        return (
            <div className="w-100 h-100 p-4">
                <div className="card menu-form-card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-3">
                    <div class="bg-panda-red spinner-grow" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        ); // Display loading state while fetching data
    }

    if (error) {
        return <div>{error}</div>; // Display error message if something goes wrong
    }

    return (
        <div className="w-100 h-100 p-4">
            <div className="card w-100 h-100 gap-3">
                <div className="d-flex flex-column align-items-start w-100">
                    <strong className="text-lg">Employee Management</strong>
                </div>

                <div className="d-flex flex-column justify-content-between h-100">
                    <div className="employee-grid-container">
                        {employees.map((employee) => (
                            // Check if the employee has been terminated
                            <div
                                className={`employee-grid-item ${employee._terminated ? "terminated" : ""}`}
                                key={employee.uniqueid}
                            >
                                <div className="employee-info">
                                    <div className="employee-name">{employee._name}</div>
                                    <div className="employee-type">{employee._manager ? "Manager" : "Employee"}</div>
                                </div>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEdit(employee._id)}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>

                    <footer className="footer">
                        <Link to="/" className="negative-btn">Back to Home</Link>
                        <Link to="/management/employee/edit" className="positive-btn">Add Employee</Link>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default EmployeeManagement;
