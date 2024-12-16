import React, { useEffect, useState } from "react";

import "../css/reporting.css";

function XZReport() {
  const [isXReport, setIsXReport] = useState(true);
  const [reportingApi, setReportingApi] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        //get data from endpoint, map it to table in html code
        const response = await fetch(process.env.REACT_APP_PROXY+'/api/reporting/xreport'+(!isXReport ? '?zreport=true' : ''));
        if (response.ok) {
          const data = await response.json();
          setReportingApi(data);
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
  }, [isXReport]);

  let salesByCategoryList = [];
  let salesByTypeList = [];

  if(reportingApi) {
    for(const [category, menuItems] of Object.entries(reportingApi.salesByCategory)) {
      let total = 0;
      salesByCategoryList.push(
        <div className="d-flex flex-row justify-content-between text-md">
          <strong>{category}</strong>
          <strong>Quantity</strong>
        </div>
      );
      for(const [key, val] of Object.entries(menuItems)) {
        salesByCategoryList.push(
          <div className="d-flex flex-row justify-content-between text-sm">
            <div>{key}</div>
            <div>{val.toLocaleString()}</div>
          </div>
        );
        total+=val;
      }
      salesByCategoryList.push(<hr className="total mt-2 mb-1" />);
      salesByCategoryList.push(
        <div className="d-flex flex-row justify-content-between text-md pb-4">
          <strong>Total</strong>
          <strong className="border-total">{total.toLocaleString()}</strong>
        </div>
      );
    }

    for(const [category, itemTypes] of Object.entries(reportingApi.salesByType)) {
      let totalQuant = 0;
      let totalSales = 0;

      category==="Other" ?
      salesByTypeList.push(
        <div className="d-flex flex-row justify-content-between text-md">
          <strong className="flex-fill">{category}</strong>
          <strong className="d-flex flex-row justify-content-center col-sm-2">W. Avg</strong>
          <strong className="d-flex flex-row justify-content-center col-sm-2">Quantity</strong>
          <strong className="d-flex flex-row-reverse col-sm-3">Sales</strong>
        </div>
      ) :
      salesByTypeList.push(
        <div className="d-flex flex-row justify-content-between text-md">
          <strong className="flex-fill">{category}</strong>
          <strong className="d-flex flex-row justify-content-center col-sm-2">Quantity</strong>
          <strong className="d-flex flex-row-reverse col-sm-3">Sales</strong>
        </div>
      );

      for(const [key, val] of Object.entries(itemTypes)) {
        category==="Other" ?
        salesByTypeList.push(
          <div className="d-flex flex-row justify-content-between text-sm">
          <div className="flex-fill">{key}</div>
          <div className="d-flex flex-row justify-content-center col-sm-2">${val.weightAvg ? val.weightedAvg.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
          <div className="d-flex flex-row justify-content-center col-sm-2">{val.quantity ? val.quantity.toLocaleString() : '0'}</div>
          <div className="d-flex flex-row-reverse col-sm-3">${val.total ? val.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
          </div>
        ) :
        salesByTypeList.push(
          <div className="d-flex flex-row justify-content-between text-sm">
            <div className="flex-fill">{key}</div>
            <div className="d-flex flex-row justify-content-center col-sm-2">{val.quantity ? val.quantity.toLocaleString() : '0'}</div>
            <div className="d-flex flex-row-reverse col-sm-3">${val.total ? val.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
          </div>
        );
        totalQuant+=val.quantity;
        totalSales+=val.total;
      }
      salesByTypeList.push(<hr className="total mt-2 mb-1" />);
      salesByTypeList.push(
        <div className="d-flex flex-row justify-content-between text-md pb-4">
          <strong className="flex-fill">Total</strong>
          <strong className="border-total d-flex flex-row justify-content-center col-sm-2">{totalQuant}</strong>
          <strong className="border-total d-flex flex-row-reverse col-sm-3">${totalSales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
        </div>
      );
    }

    return (
      <section className="card d-flex flex-column w-100 h-100 gap-4 px-0">
        <div className="d-flex flex-row justify-content-between align-items-start w-100 px-card">
          <strong className="text-lg">{isXReport ? "X" : "Z"}-Report</strong>
          <div className="d-flex flex-column align-items-end">
            <strong className="text-md">From {(new Date(Date.parse(reportingApi.zReportTimestamp)+new Date(Date.now()).getTimezoneOffset()*60000)).toLocaleString()}</strong>
            {isXReport && <div className="text-sm">To {(new Date(Date.parse(reportingApi.generatedTimestamp)+new Date(Date.now()).getTimezoneOffset()*60000)).toLocaleString()}</div>}
          </div>
        </div>
        <div className="report-content d-flex flex-column gap-4 overflow-y-scroll px-card">
          <div className="d-flex flex-column">
            <strong className="text-lg">Merchandise</strong>
            <div className="d-flex flex-row justify-content-between text-sm">
              <div>Net Sales</div>
              <div>${reportingApi.merchandise.netSales ? reportingApi.merchandise.netSales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
            </div>
            <div className="d-flex flex-row justify-content-between text-sm">
              <div>Returns</div>
              <div>(${reportingApi.merchandise.returns ? reportingApi.merchandise.returns.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'})</div>
            </div>
            <hr className="total mt-2 mb-1" />
            <div className="d-flex flex-row justify-content-between text-md">
              <strong>Total</strong>
              <strong className="border-total">${reportingApi.merchandise.total ? reportingApi.merchandise.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</strong>
            </div>
          </div>
          <div className="d-flex flex-column">
            <strong className="text-lg">Non-Merchandise</strong>
            <div className="d-flex flex-row justify-content-between text-sm">
              <div>Tax (8.25%)</div>
              <div>${reportingApi.nonmerchandise.tax ? reportingApi.nonmerchandise.tax.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
            </div>
            <div className="d-flex flex-row justify-content-between text-sm">
              <div>Pay-ins</div>
              <div>${reportingApi.nonmerchandise.payIns ? reportingApi.nonmerchandise.payIns.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
            </div>
            <div className="d-flex flex-row justify-content-between text-sm">
              <div>Pay-outs</div>
              <div>(${reportingApi.nonmerchandise.payOuts ? reportingApi.nonmerchandise.payOuts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'})</div>
            </div>
            <div className="d-flex flex-row justify-content-between text-sm">
              <div>Pay-on-accts</div>
              <div>${reportingApi.nonmerchandise.payOnAccounts ? reportingApi.nonmerchandise.payOnAccounts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
            </div>
            <hr className="total mt-2 mb-1" />
            <div className="d-flex flex-row justify-content-between text-md">
              <strong>Total</strong>
              <strong className="border-total">${reportingApi.nonmerchandise.total ? reportingApi.nonmerchandise.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</strong>
            </div>
          </div>
          <div className="pt-4">
            <strong className="text-lg">Sales by Category</strong>
            {salesByCategoryList}
          </div>
          <div>
            <strong className="text-lg">Sales by Type</strong>
            {salesByTypeList}
          </div>
        </div>
        <div className="px-card">
          <button className="btn btn-secondary w-100 text-md fw-medium" onClick={() => setIsXReport(!isXReport)}>{isXReport ? 'Generate Z-Report' : 'Return to X-Report'}</button>
        </div>
      </section>
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

export default XZReport;
