var testCollection = new Map();
var currentlySelectedRowId = 0;

//
// Initial setup
//
window.onload = function () {
  populateTests(); // test-scripts.js
  addTestsToTable();

  // add event listeners
  document.getElementById("runAll").addEventListener("click", runAllClickHandler);
  document.getElementById("testResults").addEventListener("click", testResultClickHandler);
};


// ***************************************************************
//
// Click handlers
//
// ***************************************************************

//
// Run all tests synchronously in order to ensure multi-part tests are
// performed in sequence and not interfered with by other tests
//
async function runAllClickHandler(event) {
  for (i=0; i < testCollection.size; i++) {
    let t = testCollection.get(i);
    await t.run();
    updateResultsTable(t, i);
  }
  // select first result
  let firstRow = document.querySelector("#testResults tr:first-child");
  updateSelected(0, firstRow);
}


//
// Runs the test (asynchronously) if Run clicked
// Selects the row and updates the other tables accordingly
//
function testResultClickHandler(event) {
  let selectedButton = event.target.closest("button");
  let selectedRow = event.target.closest("tr");
  let elementId = selectedRow.id;
  let testId = parseInt(elementId.replace("test", ""));

  // run clicked
  if (selectedButton != null) {
    runAndUpdate(testId, selectedRow); // asynchronous
    return;
  }

  // clicked elsewhere on the row - select the test
  if (isNaN(testId)) {
    console.log("Couldn't identify test Id from: " + testId);
  } else {
    updateSelected(testId, selectedRow);
  }
}


//
// Runs the test then updates with the results
//
async function runAndUpdate(testId, selectedRow) {
  let t = testCollection.get(testId);
  await t.run();
  updateResultsTable(t, testId);
  updateSelected(testId, selectedRow);
}



// ***************************************************************
//
// Populate and update functions
//
// ***************************************************************


//
// Populates the test results table
//
function addTestsToTable() {
  let tableBody = "";
  for (i = 0; i < testCollection.size; i++) {
    let t = testCollection.get(i);
    tableBody += `
      <tr id="test${i}" class="${t.rowClass}">
      <td>
        <button type="button" class="btn btn-primary btn-sm">
          <i class="bi bi-play-fill"></i>
        </button>
      </td>
      <td>${i}</td>
      <td>${t.name}</td>
      <td id="test-result${i}">${t.resultIcon} ${t.status}</td>
      </tr>
      `;
  }

  document.getElementById("testResults").innerHTML = tableBody;
}


//
// Updates the test results row with the test results
//
function updateResultsTable(test, testId) {
  document.getElementById("test" + testId).className = test.rowClass;
  document.getElementById("test-result" + testId).innerHTML = `${test.resultIcon} ${test.status}`;
}


//
// Highlights the selected row in the results table and populates the detail
// and call values from the selected test
//
function updateSelected(testId, selectedRow) {
  let t = testCollection.get(testId);

  // update test results table highlighting
  let currentlySelectedRow = document.getElementById("test" + currentlySelectedRowId);
  currentlySelectedRow.classList.remove("table-active");
  selectedRow.classList.add("table-active");
  currentlySelectedRowId = testId;

  // update detail: name
  document.getElementById("testName").innerHTML = `<strong>${t.name}</strong>`;

  // update checks
  let checksHtml = "";
  t.checks.forEach(c => {
    // replaces the wildcard value with more relevant and visible content
    let expected = c.expected;
    if (typeof c.expected === 'string') {
      expected = c.expected.replace(`"*"`, `<span class="any-value">ANY</span>`);
    }

    checksHtml += `
      <table id="table-fixed" class="table ${c.tableClass}">
        <thead>
          <tr>
            <th colspan="2">${c.name}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="2">${c.result}</td>
          </tr>
          <tr>
            <th style="width: 120px;">Expected</th>
            <td>${expected}</td>
          </tr>
          <tr>
            <th>Actual</th>
            <td>${c.actual}</td>
          </tr>
        </tbody>
      </table>
    `;
  })
  document.getElementById("testChecks").innerHTML = checksHtml;

  // update call values
  document.getElementById("fullUrl").innerHTML = t.fullUrl;
  document.getElementById("statusPage").innerHTML = `<a href="test-data/${t.testFile}">${t.testFile}</a>`;
  document.getElementById("statusPageTimeout").innerHTML = t.statusPageTimeout;
  document.getElementById("detailPageTimeout").innerHTML = t.detailPageTimeout;
  document.getElementById("useCache").innerHTML = t.useCache;
  document.getElementById("clearLookups").innerHTML = t.clearLookups;
  document.getElementById("httpResponse").innerHTML = t.httpResponseIcon + " " + t.httpResponse;
  document.getElementById("jsonResponse").innerHTML = JSON.stringify(t.jsonResponse, null, 2);
}
