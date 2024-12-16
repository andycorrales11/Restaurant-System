import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import reportWebVitals from './reportWebVitals';

import App from './App';
import NavWrapper from './management/NavWrapper';
import Home from './management/Home';
import ConsumerFront from './consumer/ConsumerFront';
import ConsumerItemType from './consumer/ConsumerItemType';
import ConsumerMeal from './consumer/ConsumerMeal';
import ConsumerItem from './consumer/ConsumerItem';
import ConsumerCart from './consumer/ConsumerCart';
import Checkout from './employee/Checkout';
import { AuthProvider } from './components/AuthContext'; 

import InventoryOrdering from './InventoryOrdering/InventoryOrdering';
import InventoryAdjustments from './InventoryOrdering/InventoryAdjustments';
import Reporting from './Reporting/Reporting';
import EmployeeManagement from "./editing/employeeManagement"
import MenuManagement from './editing/menuManagement';
import EmployeeForm from './editing/addEmployee';
import MenuItemForm from './editing/addMenuItem';
import KitchenScreen from './kitchen/KitchenScreen';
import ConsumerRewards from './consumer/ConsumerRewards';
import Login from './Login/Login';
import MenuBoard from './MenuBoard/MenuBoard';
import Analytics from './Reporting/Analytics';

import './css/index.css';
import './css/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import testData from "./test/item_type_api.json"

const userType = 'Manager';
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
    
      {/* Login screen */}
      <Route path="/" element={<Login />} />
      
      {/* Consumer-facing screens */}
      <Route path="consumer" element={<ConsumerFront />} />
      <Route path="consumer/itemtype" element={<ConsumerItemType />} />
        <Route path="consumer/itemtype/bowl" element={<ConsumerMeal title='Bowl' startingPrice={testData.bowl.price} />} />
        <Route path="consumer/itemtype/plate" element={<ConsumerMeal title='Plate' startingPrice={testData.plate.price} />} />
        <Route path="consumer/itemtype/biggerplate" element={<ConsumerMeal title='Bigger Plate' startingPrice={testData.bigger_plate.price} />} />
        <Route path="consumer/itemtype/alacarte" element={<ConsumerItem title='A La Carte' />} />
        <Route path="consumer/itemtype/appetizers" element={<ConsumerItem title='Appetizers' />} />
        <Route path="consumer/itemtype/drinks" element={<ConsumerItem title='Drinks' />} />
      <Route path="consumer/cart" element={<ConsumerCart />} />
      <Route path="consumer/rewards" element={<ConsumerRewards />} />

      {/* Manager-facing screens */}
      <Route path="/" element={<NavWrapper userType={userType} />}>
        <Route path="home" element={<Home userType={userType} />} />
        <Route path="inventory/ordering" element={<InventoryOrdering />} />
        <Route path="inventory/adjustments" element={<InventoryAdjustments />} />
        <Route path="management/employee" element={<EmployeeManagement />} />
        <Route path="management/employee/edit" element={<EmployeeForm />} />
        <Route path="management/employee/edit/:id" element={<EmployeeForm />} />
        
        <Route path="management/menu" element={<MenuManagement />} />
        <Route path="management/menu/edit" element={<MenuItemForm />} />
        <Route path="management/menu/edit/:id" element={<MenuItemForm />} />

        <Route path="reporting" element={<Reporting />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
        
      {/* Employee-facing screens */}
      <Route path="employee/checkout" element={<Checkout />} />
      <Route path="employee/kitchen" element={<KitchenScreen />} />


      {/* Menu Board */}
      <Route path="/menuboard" element={<MenuBoard />} />

    </Route>

    

  )
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
