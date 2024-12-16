import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { Popover } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TvIcon from '@mui/icons-material/Tv';
import LogoutIcon from '@mui/icons-material/Logout';

import pxLogo from "../resources/images/px_logo.png";

function NavWrapper() {
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [popupAnchor, setPopupAnchor] = useState(null);
    const [userInfo, setUserInfo] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();
    const [userType, setUserType] = useState('Loading...');
    
    // Reset language
    if(document.cookie.split("; ").filter((e) => e.includes("googtrans")).length!==0&&document.cookie.split("; ").filter((e) => e.includes("googtrans"))[0].split("/")[2]!=='en') {
        document.cookie = `googtrans=/en/en`;
        window.location.reload();
    }

    // Navigation context
    const iconSize = 30
    const navLinks = {
        "Manager": {
            "Home": {
                "Home": {"path": "/home", "icon": <HomeIcon sx={{ fontSize: iconSize }} /> }
            },
            "Inventory": {
                "Inventory Ordering": {"path": "/inventory/ordering", "icon": <LocalShippingIcon sx={{ fontSize: iconSize }} /> },
                "Inventory Adjustments": {"path": "/inventory/adjustments", "icon": <InventoryIcon sx={{ fontSize: iconSize }} /> }
            },
            "Management": {
                "Employee Management": {"path": "/management/employee", "icon": <GroupIcon sx={{ fontSize: iconSize }} /> },
                "Menu Management": {"path": "/management/menu", "icon": <MenuBookIcon sx={{ fontSize: iconSize }} /> }
            },
            "Reporting": {
                "Reporting": {"path": "/reporting", "icon": <RequestPageIcon sx={{ fontSize: iconSize }} /> },
                "Analytics": {"path": "/analytics", "icon": <AnalyticsIcon sx={{ fontSize: iconSize }} />}
            },
            "Sales": {
                "Checkout": {"path": "/employee/checkout", "icon": <ShoppingCartIcon sx={{ fontSize: iconSize }} /> },
                "Kitchen": {"path": "/employee/kitchen", "icon": <ReceiptLongIcon sx={{ fontSize: iconSize }} /> }
            }
        },
        "Employee": {
            "Home": {
                "Home": {"path": "/home", "icon": <HomeIcon sx={{ fontSize: iconSize }} /> }
            },
            "Sales": {
                "Checkout": {"path": "/employee/checkout", "icon": <ShoppingCartIcon sx={{ fontSize: iconSize }} /> },
                "Kitchen": {"path": "/employee/kitchen", "icon": <ReceiptLongIcon sx={{ fontSize: iconSize }} /> }
            }
        },
        "Kiosk": {
            "Home": {
                "Home": {"path": "/home", "icon": <HomeIcon sx={{ fontSize: iconSize }} /> }
            },
            "Sales": {
                "Consumer": {"path": "/consumer", "icon": <ShoppingCartIcon sx={{ fontSize: iconSize }} /> },
                "Menu Board": {"path": "/menuboard", "icon": <TvIcon sx={{ fontSize: iconSize }} /> }
            }
        },
        "Loading...": {}
    }
    const flattenedNavList = window.location.pathname==="/home" ? {} : Object.fromEntries(Object.entries(navLinks[userType]).map((e) => Object.entries(e[1]).map((i) => [i[1].path, i[0]])).flat());

    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [header, setHeader] = useState(flattenedNavList[Object.keys(flattenedNavList).findLast((e) => window.location.pathname.includes(e))]);

    // Using received access token to access user info
    let navigate = useNavigate();
    useEffect(() => {
        async function fetchData() {
            try {
                // Userinfo from Google
                let accessToken;
                if(searchParams.has('access_token')) {
                    accessToken = searchParams.get('access_token');
                    document.cookie = 'access_token='+accessToken+'; secure'
                }
                else {
                    accessToken = document.cookie.split("; ").filter((e) => e.includes("access_token"))[0].split('=')[1];
                }
                let response = await fetch('https://accounts.google.com/.well-known/openid-configuration');
                if (response.ok) {
                    const data = await response.json();
                    response = await fetch(`${data.userinfo_endpoint}?access_token=${accessToken}`);
                    if (response.ok) {
                        const data = await response.json();
                        setUserInfo(data);
                    }
                    else {
                        console.log("userinfo response not ok");
                        navigate("/");
                    }
                }
                else {
                    console.log("response not ok");
                }

                // Authorization level from DB
                response = await fetch(process.env.REACT_APP_PROXY+`/api/auth/level?access_token=${accessToken}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserType(data);
                }
                else {
                    console.log("response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
                navigate("/");
            }
        }
        fetchData();
    }, []);

    if(userType) {
        const isPopupOpen = Boolean(popupAnchor);

        document.documentElement.style.setProperty("--base-font-size", "0.9rem");

        let navList = [];

        for(const [navCategory, navCategoryList] of Object.entries(navLinks[userType])) {
            let navCat = [];
            navCat.push(<strong className={clsx(isNavOpen ? "text-sm text-secondary" : "d-none")}>{navCategory}</strong>);
            for(const [key, val] of Object.entries(navCategoryList)) {
                navCat.push(
                    <Link 
                        to={val.path}
                        className={clsx("d-flex flex-row align-items-center p-2 gap-3 rounded-2 link-no-underline transition-all", (key==="Home" ? currentPath==="/home" : currentPath.includes(val.path)) ? "nav-btn-selected" : "text-black")}
                        onClick={() => {
                            setCurrentPath(val.path);
                            setHeader(key==="Home" ? "" : key);
                        }
                    }>
                        {val.icon}
                        <div className={clsx("text-nowrap", isNavOpen ? "text-md fw-medium" : "d-none")}>{key}</div>
                    </Link>
                );
            }
            navList.push(<div className="d-flex flex-column gap-1">{navCat}</div>);
        }

        return (
            <div className="d-flex flex-row vw-100 vh-100 overflow-hidden">
                <div className={clsx("vh-100 p-4 overflow-hidden transition-all", isNavOpen ? "sidebar-container" : "min-w-0")}>
                    <div className={clsx("card d-flex flex-column justify-content-between w-100 h-100 overflow-x-hidden overflow-y-scroll", !isNavOpen && "pl-3 pr-2 pt-0 pb-3")}>
                        <div className="d-flex flex-column align-items-center gap-4">
                            <div className={clsx("d-flex flex-column align-items-start align-self-center w-100 pt-4", isNavOpen ? "justify-content-between" : "justify-content-center")}>
                                <div 
                                    aria-describedby={isPopupOpen ? 'account-popup' : undefined} 
                                    className={clsx("d-flex flex-row justify-content-center align-items-center", isNavOpen && "gap-3")}
                                    onClick={(e) => setPopupAnchor(e.currentTarget)}
                                >
                                    <img alt="Profile" src={userInfo.picture} className="img-h-sm rounded-circle" />
                                    <div className="d-flex flex-column">
                                        <div className={clsx(isNavOpen ? "text-lg" : "d-none")} translate="no">{userInfo.name}</div>
                                        <div className={clsx(isNavOpen ? "subtext text-sm fw-medium" : "d-none")}>{userType}</div>
                                    </div>
                                </div>
                                <Popover 
                                    id={isPopupOpen ? 'account-popup' : undefined} 
                                    open={isPopupOpen} 
                                    anchorEl={popupAnchor} 
                                    onClose={() => setPopupAnchor(null)}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                    className="mt-2"
                                >
                                    <div className="d-flex flex-column p-2">
                                        <h2 className="text-sm text-secondary p-2">{userInfo.email}</h2>
                                        <hr className="m-0" />
                                        <button 
                                            className="btn btn-primary d-flex flex-row align-items-center mt-2 p-2 gap-3 rounded-2 link-no-underline transition-all text-black shadow-none"
                                            onClick={() => {
                                                const accessToken = document.cookie.split("; ").filter((e) => e.includes("access_token"))[0].split('=')[1];
                                                fetch(process.env.REACT_APP_PROXY+`/api/auth/logout?access_token=${accessToken}`);
                                                window.location.reload();
                                            }}
                                        >
                                            <LogoutIcon sx={{ fontSize: iconSize }} />
                                            <div className="text-nowrap text-md fw-medium">Logout</div>
                                        </button>
                                    </div>
                                </Popover>
                            </div>
                            <div className={clsx("d-flex flex-column gap-4 w-100 pt-1 pb-4", !isNavOpen && "align-items-center")}>
                                {navList}
                            </div>
                        </div>
                        <div className={clsx("d-flex flex-column w-100 pb-2", isNavOpen ? "align-items-end" : "align-items-center")}>
                            <ViewSidebarIcon sx={{ fontSize: 32 }} onClick={() => setIsNavOpen(!isNavOpen)} />
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-column w-100 h-100">
                    <div className="d-flex flex-row justify-content-between align-content-center w-100 pl-5 pr-6 pt-5">
                        <div className="d-flex flex-row align-items-center text-lg fw-medium">{header ? header : <span>Welcome Back, <strong>{userInfo.given_name}</strong></span>}</div>
                        <div className="d-flex flex-row align-items-center divide-x gap-2">
                            <img alt="Panda Express Logo" src={pxLogo} className="img-h-sm"></img>
                            <strong className="text-lg pl-2 border-3">Management</strong>
                        </div>
                    </div>
                    <Outlet />
                </div>
            </div>
        );
    }
    else {
        return (
            <section className="card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
                <div class="bg-panda-red spinner-grow" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </section>
        );
    }
}

export default NavWrapper;