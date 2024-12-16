import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/menu_management.css";

function MenuManagement() {
    const [menuItems, setMenuItems] = useState([]); // State to store menu items
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State to manage errors
    const navigate = useNavigate();

    const handleEdit = (id) => {
        navigate(`/management/menu/edit/${id}`);
    };

    // Fetch menu items when the component mounts
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_PROXY + "/api/menuitems/active");
                if (!response.ok) {
                    throw new Error("Failed to fetch menu items");
                }
                const data = await response.json();

                // Format the data based on your API response
                const formattedMenuItems = data.map((item) => ({
                    id: item[0],
                    name: item[1],
                    code: item[2],
                    premium: item[3],
                    side: item[4],
                    appetizer: item[5],
                    removed: item[6],
                }));

                setMenuItems(formattedMenuItems);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching menu items:", err);
                setError("Failed to load menu items");
                setLoading(false);
            }
        };

        fetchMenuItems();
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
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="w-100 h-100 p-4">
            <div className="card w-100 h-100 gap-3">
                <div className="d-flex flex-column align-items-start w-100">
                    <strong className="text-lg">Menu Management</strong>
                </div>

                <div className="d-flex flex-column justify-content-between h-100">
                    <div className="menu-grid-container">
                        {menuItems.map((item) => (
                            <div
                                className={`menu-grid-item ${item.removed ? "removed" : ""}`}
                                key={item.id}
                            >
                                <div className="menu-item-info">
                                    <div className="menu-item-name">{item.name}</div>
                                    <div className="product-code">Code: {item.code}</div>
                                </div>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEdit(item.id)}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>

                    <footer className="footer">
                        <Link to="/" className="negative-btn">Back to Home</Link>
                        <Link to="/management/menu/edit" className="positive-btn">Add Menu Item</Link>

                    </footer>

                </div>
            </div>
        </div>
    );
}

export default MenuManagement;
