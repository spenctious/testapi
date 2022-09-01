//
// Class packaging API parameters, the call to the API, the returned results,
// and the checks to be ferformed on the results
//
class Test {
  constructor(
    testName, 
    testFile, 
    { 
      statusPageTimeout = 5000, 
      detailPageTimeout = 5000,
      useCache = false,
      clearLookups = false
    } = {} ) {

    // URL parameters
    this.testFile = testFile;
    this.statusPageTimeout = statusPageTimeout;
    this.detailPageTimeout = detailPageTimeout;
    this.useCache = useCache;
    this.clearLookups = clearLookups;

    this.testName = testName;
    this.checks = new Array();
    this.targetUrl = encodeURIComponent(this.testFile);
    this.fullUrl = URL_STATUSES + this.urlParams;

    // status
    this.result = "No data returned";
    this.testStatus = "NOT RUN";

    // response values
    this.httpResponse = 0;
    this.jsonResponse = {};
  }


  //
  // add a check to the check list
  //
  addCheck(check) {
    this.checks.push(check);
  }


  //
  // runs through all the checks and marks the overall status as
  // PASSED if all tests succeed, FAILED otherwise
  //
  checkResult() {
    this.testStatus = "PASSED";
    this.checks.forEach(check => {
      check.performCheck(this);
      if (!check.passed) this.testStatus = "FAILED";
    });
  }


  //
  // returns a suitable icon according to the HTTP response value
  //
  get httpResponseIcon() {
    if (this.httpResponse == 200) return `<i class="bi bi-check-circle-fill text-success"></i>`;
    if (this.httpResponse == 500) return `<i class="bi bi-x-circle-fill text-danger"></i>`;
    return `<i class="bi bi-circle-fill text-muted"></i>`;
  }


  //
  // returns a class that colours a test result row according to the test status
  //
  get rowClass() {
    if (this.status == "PASSED") return "table-success";
    if (this.status == "FAILED") return "table-warning";
    return "bg-white";
  }


  get name() {
    return this.testName;
  }


  get status() {
    return this.testStatus;
  }


  //
  // returns a suitable icon based on the test status
  //
  get resultIcon() {
    if (this.status == "PASSED") return `<i class="bi bi-check-circle-fill text-success"></i>`;
    if (this.status == "FAILED") return `<i class="bi bi-x-circle-fill text-danger"></i>`;
    return `<i class="bi bi-circle-fill text-muted"></i>`;
  }


  //
  // builds the parameter list from the various options
  //
  get urlParams() {
    let params = `?statusPage=${this.targetUrl}`;
    params += `&statusPageTimeout=${this.statusPageTimeout}`;
    params += `&detailPageTimeout=${this.detailPageTimeout}`;
    params += `&useCache=${this.useCache}`;
    params += `&clearLookups=${this.clearLookups}`;
    return params;
  }


  //
  // runs the test, records the result and checks it against the expected values
  //
  async run() {
    try {
      // set default values
      this.httpResponse = 0;
      this.jsonResponse = "-";

      // call the API and convert the response to JSON
      let result = await this.#fetchWithTimeout(this.fullUrl, { timeout: 5000 })
        .then(response => {
          this.httpResponse = response.status;
          return response.json();
        });

      // assign the result and check it
      this.jsonResponse = result;
      this.result = "Success";
      this.checkResult();
    }
    catch (error) {
      this.result = "Failed";
      console.log("Call failed: " + error);
      console.log("Stack: " + error.stack);
    }
  }


  //
  // fetches a resource with an overridable timeout of 4s
  //
  async #fetchWithTimeout(resource, options = {}) {
    const { timeout = 4000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  }
}