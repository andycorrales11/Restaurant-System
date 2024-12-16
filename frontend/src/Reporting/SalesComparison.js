import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { BarChart, BarSeries } from "reaviz";

import "../css/reporting.css";

function SalesComparison() {
  const [selectedTab, setSelectedTab] = useState("Chart");
  const [salesCompApi, setSalesCompApi] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log("fetching");
      try {
        //get data from endpoint, map it to table in html code
        const response = await fetch(process.env.REACT_APP_PROXY+'/api/reporting/hourlydata');
        if (response.ok) {
          const data = await response.json();
          setSalesCompApi(data);
        }
        else {
          console.log("response not ok");
        }
      }
      catch (error) {
        console.error('Network error:', error);
      }
    }
    fetchData();
  }, []);

  if(salesCompApi) {
    let contentElement;
    if(selectedTab==="Graph") {
      contentElement = [
        <h3>Quantity</h3>,
        <BarChart
          data={salesCompApi.map((data, index) => ({key: `${index.toString().padStart(2, '0')}:00`, data: data.quantity}))}
          series={<BarSeries colorScheme={'#2563eb'} />}
        />,
        <h3 className="pt-4">Sales</h3>,
        <BarChart
          data={salesCompApi.map((data, index) => ({key: `${index.toString().padStart(2, '0')}:00`, data: data.sales}))}
          series={<BarSeries colorScheme={'#10b981'} />}
        />
      ];
    }
    else {
      contentElement = (
        <table>
          <thead>
            <tr>
              <th>Hour</th>
              <th>Quantity</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {salesCompApi.map((data, index) => (
              <tr key={index}>
                <td>{index.toString().padStart(2, '0')}:00</td>
                <td>{data.quantity}</td>
                <td>${data.sales.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <section className="card w-100 gap-3 px-0">
        <div className="d-flex flex-column px-card gap-2">
          <div className="d-flex flex-row justify-content-between align-items-start w-100">
              <strong className="text-lg">Sales Comparison</strong>
              <div className="d-flex flex-column align-items-end">
                <strong className="text-md">{(new Date(Date.now())).toLocaleDateString()}</strong>
              </div>
          </div>
          <div className="d-flex flex-row gap-2">
            <div role="button" className={clsx("d-flex flex-row align-items-center p-2 gap-3 rounded-2 link-no-underline transition-all text-sm fw-medium", (selectedTab==="Chart" ? "nav-btn-selected" : "text-black"))} onClick={() => setSelectedTab("Chart")}>
              Chart
            </div>
            <div role="button" className={clsx("d-flex flex-row align-items-center p-2 gap-3 rounded-2 link-no-underline transition-all text-sm fw-medium", (selectedTab==="Graph" ? "nav-btn-selected" : "text-black"))} onClick={() => setSelectedTab("Graph")}>
              Graph
            </div>
          </div>
        </div>
        <div className="d-flex flex-column justify-content-between w-100 h-100 px-card overflow-y-scroll">
          {contentElement}
        </div>
      </section>
    );
  }
  else {
    return (
      <section className="card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
        <div class="spinner-grow bg-panda-red" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </section>
    );
  }
};

export default SalesComparison;