
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

import "../css/menu_edit.css";

function MenuItemForm() {
    const { id } = useParams(); // Check if the form is in edit mode
    const [itemName, setItemName] = useState("");
    const [productCode, setProductCode] = useState("");
    const [isPremium, setIsPremium] = useState(false);
    const [isAppetizer, setIsAppetizer] = useState(false);
    const [isSide, setIsSide] = useState(false);

    const [isDrink, setIsDrink] = useState(false);
    const [loading, setLoading] = useState(!!id); // Show loading only in edit mode
    const [error, setError] = useState(null);
    
    const [inventoryList, setInventoryList] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            // Fetch existing menu item data if in edit mode
            const fetchMenuItem = async () => {
                try {
                    const response = await fetch(process.env.REACT_APP_PROXY + `/api/menuitems/${id}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch menu item data");
                    }
                    const item = await response.json();
                    console.log(item);
                    setItemName(item._name || "");
                    setProductCode(item._productCode || "");
                    setIsPremium(item._premium || false);
                    setIsAppetizer(item._appetizer || false);
                    setIsSide(item._side || false);
                    setIsDrink(item._drink || false);
                    setIngredients(item._ingredients.map((e) => e[0]) || []);
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching menu item:", err);
                    setError("Failed to load menu item data");
                    setLoading(false);
                }
            };
            // Fetch existing inventory for ingredients
            async function fetchInventory() {
                try {
                    const response = await fetch(process.env.REACT_APP_PROXY+'/api/inventory/table');
                    if (response.ok) {
                        const data = await response.json();
                        setInventoryList(data.map((e) => [e.itemCode, e.description]));
                    }
                    else {
                        console.log("response not ok");
                    }
                }
                catch (error) {
                    console.error('Network error:', error);
                }
            }

            fetchMenuItem();
            fetchInventory();
        }
    }, [id]);

    const getNextAvailableMenuId = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY + `/api/menuitems/all`);
            if (!response.ok) {
                throw new Error("Failed to fetch menu items to determine next ID");
            }
            const menitems = await response.json();
            // console.log("menu items: ", menitems);
    
            // Assuming menitems is an array of arrays where the first element is the ID
            const fmenitems = menitems.map(item => item[0]); // Ensure we're getting the IDs correctly
            // console.log("fmenitems: ", fmenitems);
    
            // Calculate the max ID
            const maxId = Math.max(...fmenitems);
            // console.log("Max ID is: " + maxId);
    
            return maxId + 1; // Return the next available ID
        } catch (err) {
            console.error("Error determining next available ID:", err);
            setError("Failed to determine next available ID");
            throw err; // Re-throw the error to handle it in the submit logic
        }
    };    

    const handleAppetizerChange = (e) => setIsAppetizer(e.target.checked);
    const handlePremiumChange = (e) => setIsPremium(e.target.checked);
    const handleSideChange = (e) => setIsSide(e.target.checked);
    const handleDrinkChange = (e) => setIsDrink(e.target.checked);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newId = id || (await getNextAvailableMenuId());
            const payload = {
                _id: newId,
                _name: itemName,
                _productCode: productCode,
                _premium: isPremium,
                _side: isSide,
                _appetizer: isAppetizer,
                _drink: isDrink,
                _ingredients: ingredients
            };

            console.log(payload);

            const response = await fetch(process.env.REACT_APP_PROXY + `/api/menuitems/${id || ""}`, {
                method: id ? "PUT" : "POST", // Use PUT for editing and POST for adding
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${id ? "update" : "add"} menu item`);
            }

            navigate("/management/menu"); // Redirect after successful operation
        } catch (err) {
            console.error("Error saving menu item:", err);
            setError(`Failed to ${id ? "update" : "add"} menu item`);
        }
    };

    const handleRemove = async () => {
        if (!id) return; // Terminate only applies in edit mode

        try {
            // console.log("goes into handleremove");
            const response = await fetch(process.env.REACT_APP_PROXY + `/api/menuitems/${id}`, {
                method: "DELETE",
            });

            console.log(response);

            if (!response.ok) {
                throw new Error("Failed to remove menu item");
            }

            alert("Item removed successfully");
            navigate("/management/menu");
        } catch (err) {
            console.error("Error removing item:", err);
            setError("Failed to remove menu item");
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
            <div className="card menu-form-card w-100 h-100 gap-3 overflow-y-scroll">
                <div className="d-flex flex-column align-items-start w-100">
                    <strong className="text-lg">{id ? "Edit Menu Item" : "Add Menu Item"}</strong>
                </div>

                <form className="employee-form-grid" onSubmit={handleSubmit}>
                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Menu Item Name*</label>
                            <span className="employee-sub-label">Enter Item Name</span>
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            id="itemName"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Product Code*</label>
                            <span className="employee-sub-label">Enter Product Code (e.g., A1)</span>

                        </div>
                        <input
                            type="text"
                            className="input-field"
                            id="productCode"
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group-left">
                        <div className="left-labels">
                            <label className="productCode">Ingredients*</label>
                            <span className="menu-sub-label">Select Ingredients</span>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                            <FormControl sx={{ width: '500px' }}>
                                <Select
                                    value={ingredients}
                                    onChange={(e) => setIngredients(typeof e.target.value==='string' ? e.target.value.split(',') : e.target.value)}
                                    multiple
                                    renderValue={(selected) => (
                                        <div className="d-flex flex-wrap gap-2">
                                            {selected.map((value) => (
                                                <Chip key={value} label={inventoryList.filter((e) => e[0]===value)[0][1]} />
                                            ))}
                                        </div>
                                    )}
                                >
                                    {inventoryList.map((e) => <MenuItem value={e[0]}>{e[1]}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </div>
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Premium Item</label>
                            <span className="employee-sub-label">Select if Item is Premium</span>
                        </div>
                        <input
                            type="checkbox"
                            className="checkbox"
                            id="premiumCheckBox"
                            checked={isPremium}
                            onChange={handlePremiumChange}
                        />
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Appetizer</label>
                            <span className="employee-sub-label">Select if Item is an Appetizer</span>
                        </div>
                        <input
                            type="checkbox"
                            className="checkbox"
                            id="appetizerCheckBox"
                            checked={isAppetizer}
                            onChange={handleAppetizerChange}
                        />
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Side</label>
                            <span className="employee-sub-label">Select if Item is a Side</span>
                        </div>
                        <input
                            type="checkbox"
                            className="checkbox"
                            id="sideCheckBox"
                            checked={isSide}
                            onChange={handleSideChange}
                        />
                    </div>

                    <div className="employee-form-row">
                        <div className="employee-label-group">
                            <label className="employee-main-label">Drink</label>
                            <span className="employee-sub-label">Select if Item is a Drink</span>
                        </div>
                        <input
                            type="checkbox"
                            className="checkbox"
                            id="drinkCheckBox"
                            checked={isDrink}
                            onChange={handleDrinkChange}
                        />
                    </div>

                    {id && (
                        <div className="employee-form-row">
                            <div className="employee-label-group">
                                <label className="employee-main-label">Remove</label>
                                <span className="employee-sub-label">Remove Item from Menu</span>
                            </div>
                            <button
                                type="button"
                                className="button negative-btn"
                                id="removeButton"
                                onClick={handleRemove}
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    <div className="action-buttons">
                        <Link to="/management/menu" className="negative-btn">
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

export default MenuItemForm;
