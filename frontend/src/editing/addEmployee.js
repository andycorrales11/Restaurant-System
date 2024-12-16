import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import "../css/employee_edit.css";

function EmployeeForm() {
    var { id } = useParams(); // Check if the form is in edit mode
    const [isManager, setIsManager] = useState(false);
    const [isKiosk, setIsKiosk] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(!!id); // Show loading only for edit mode
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch existing employee data in edit mode
        if (id) {
            const fetchEmployee = async () => {
                try {
                    const response = await fetch(process.env.REACT_APP_PROXY + `/api/employees/${id}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch employee data");
                    }
                    const employee = await response.json();
                    setFirstName(employee._name.split(" ")[0] || "");
                    setLastName(employee._name.split(" ")[1] || "");
                    setEmail(employee._email || "");
                    setIsManager(employee._manager || false);
                    setIsKiosk(employee._kiosk || false);
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching employee:", err);
                    setError("Failed to load employee data");
                    setLoading(false);
                }
            };

            fetchEmployee();
        }
    }, [id]);

    const getNextAvailableId = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY + `/api/employees/`);
            if (!response.ok) {
                throw new Error("Failed to fetch employees to determine next ID");
            }
            const employees = await response.json();
            console.log("employees : " , employees);
            const femployees = employees.rows.map((row) => row[0]);
            console.log("femployees " , femployees);
            const maxId = Math.max(...femployees);
            console.log("Max ID is " + (maxId));
            return maxId + 1;
        } catch (err) {
            console.error("Error determining next available ID:", err);
            setError("Failed to determine next available ID");
            throw err; // Re-throw the error to handle it in the submit logic
        }
    };

    const handleManagerChange = (e) => setIsManager(e.target.checked);
    const handleKioskChange = (e) => setIsKiosk(e.target.checked);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newId = id || (await getNextAvailableId());
            const payload = {
                _id: newId,
                _name: `${firstName} ${lastName}`,
                _email: email,
                _manager: isManager,
                _terminated: false,
                _kiosk: isKiosk,
            };

            console.log(payload);
            if (!id) {
                id = "";
            }
            const response = await fetch(
                process.env.REACT_APP_PROXY + `/api/employees/${id}`, // id or nothing
                {
                    method: id ? "PUT" : "POST", // Use PUT for edit and POST for add
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            console.log(response);       
            if (!response.ok) {
                throw new Error(`Failed to ${id ? "update" : "add"} employee`);
            }

            navigate("/management/employee"); // Redirect after successful operation
        } catch (err) {
            console.error("Error saving employee:", err);
            setError(`Failed to ${id ? "update" : "add"} employee`);
        }
    };

    const handleTerminate = async () => {
        if (!id) return; // Terminate only applies in edit mode

        try {
            const response = await fetch(process.env.REACT_APP_PROXY + `/api/employees/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to terminate employee");
            }

            alert("Employee terminated successfully");
            navigate("/management/employee");
        } catch (err) {
            console.error("Error terminating employee:", err);
            setError("Failed to terminate employee");
        }
    };

    if (loading) {
        return (
            <div className="w-100 h-100 p-4">
                <div className="card menu-form-card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-3">
                    <div class="bg-panda-red spinner-grow" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="w-100 h-100 p-4">
            <div className="card w-100 h-100 gap-3">
                <div className="d-flex flex-column align-items-start w-100">
                    <strong className="text-lg">{id ? "Edit Employee" : "Add Employee"}</strong>
                </div>

                <form className="employee-form-grid" onSubmit={handleSubmit}>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">First Name*</label>
                            <span className="employee-sub-label">Employee first name</span>
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            id="firstnameTextField"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Last Name*</label>
                            <span className="employee-sub-label">Employee last name</span>
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            id="lastnameTextField"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Email*</label>
                            <span className="employee-sub-label">Change email</span>
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            id="emailTextField"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Manager</label>
                            <span className="employee-sub-label">Select if employee is manager</span>
                        </div>
                        <input
                            type="checkbox"
                            className="checkbox"
                            id="managerCheckBox"
                            checked={isManager}
                            onChange={handleManagerChange}
                        />
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Kiosk</label>
                            <span className="employee-sub-label">Select if employee is a kiosk</span>
                        </div>
                        <input
                            type="checkbox"
                            className="checkbox"
                            id="kioskCheckBox"
                            checked={isKiosk}
                            onChange={handleKioskChange}
                        />
                    </div>

                    {id && (
                        <div className="employee-form-row">
                            <div className="employee-label-group">
                                <label className="employee-main-label">Terminate</label>
                                <span className="employee-sub-label">Flag employee as terminated</span>
                            </div>
                            <button
                                type="button"
                                className="button negative-btn"
                                id="terminateButton"
                                onClick={handleTerminate}
                            >
                                Terminate
                            </button>
                        </div>
                    )}

                    <div className="action-buttons">
                        <Link to="/management/employee" className="negative-btn">
                            Cancel
                        </Link>
                        <button className="button positive-btn" type="submit">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EmployeeForm;
