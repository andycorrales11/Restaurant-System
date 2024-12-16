import React from "react";

import SalesComparison from "./SalesComparison";
import XZReport from "./XZReport";

import "../css/reporting.css";

function Reporting() {
    return (
        <div className="d-flex flex-row p-4 gap-4 w-100 overflow-hidden">
          <SalesComparison />
          <XZReport />
        </div>
    );
};

export default Reporting;