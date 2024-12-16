import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Root DOM, I would recommend not touching this
 * @returns Root layout DOM
 */
function App() {
  return (
    <div className="App">
      <Outlet />
    </div>
  );
}

export default App;