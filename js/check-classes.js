//
// Base check class
//
class Check {
  constructor(checkName, expectedValue) {
    // the check name is the generic check type + specifics
    this.name = this.constructor.name + ":<br/>" + checkName;
    this.expectedValue = expectedValue;

    this.actualValue = null;
    this.checkPassed = false;
    this.checkRun = false;
  }

  // converts JSON data to preformatted code style string
  jsonCode(value) {
    return `<pre><code>${JSON.stringify(value, null, 2)}</code></pre>`;
  }

  get expected() {
    return this.expectedValue;
  }

  get actual() {
    return this.actualValue;
  }

  get passed() {
    return this.checkPassed;
  }

  // returns class for colouring the check table according to check status
  get tableClass() {
    if (!this.checkRun) return "table-light";
    if (this.checkPassed) return "table-success";
    return "table-warning";
  }

  // actually performs the check
  // overriden by more spohisticated checks in derived classes
  performCheck(actual) {
    this.checkRun = true;
    this.actualValue = actual;
    this.checkPassed = this.expectedValue == this.actualValue;
  }

  // returns test result with appropriate icon
  get result() {
    let icon = `<i class="bi bi-circle-fill text-muted"></i> Not checked`;
    if (this.checkRun) {
      if (this.checkPassed) {
        icon = `<i class="bi bi-check-circle-fill text-success"></i> PASSED`;
      } else {
        icon = `<i class="bi bi-x-circle-fill text-danger"></i> FAILED`;
      }
    }
    return icon;
  }
}


//
// Checks the return status code is as expected
//
class CheckHttpStatusCodeEquals extends Check {
  constructor(test) {
    super(test, 200);
  }

  performCheck(test) {
    this.actualValue = test.httpResponse;
    this.checkPassed = this.expectedValue == this.actualValue;
    this.checkRun = true;
  }
}


//
// Checks for the presence for the specified trail status
// All fields must match or correspond to a wildcard expected value
//
class CheckTrail extends Check {
  constructor(test, anomaly) {
    super(test, anomaly)
  }

  performCheck(test) {
    let match = test.jsonResponse.trails.find(t =>
      (this.expectedValue.name == "*" || this.expectedValue.name == t.name) &&
      (this.expectedValue.status == "*" || this.expectedValue.status == t.status) &&
      (this.expectedValue.url == "*" || this.expectedValue.url == t.url));
    this.checkPassed = match != undefined;
    this.actualValue = match;
    this.checkRun = true;
  }

  get expected() {
    return this.jsonCode(this.expectedValue);
  }

  get actual() {
    return this.jsonCode(this.actualValue);
  }
}


//
// Short form of trail status check that just looks at the trail id
// Assumes the id is unique in the test data
//
class CheckTrailName extends Check {
  constructor(test, trailName) {
    super(test, trailName)
  }

  performCheck(test) {
    let match = test.jsonResponse.trails.find(t => this.expectedValue == t.name);
    this.checkPassed = match != undefined;
    this.actualValue = match != undefined ? match.name : "Not found";
    this.checkRun = true;
  }
}


//
// Checks for the presence for the specified anomaly
// All fields must match or correspond to a wildcard expected value
//
class CheckAnomaly extends Check {
  constructor(test, anomaly) {
    super(test, anomaly)
  }

  performCheck(test) {
    let match = test.jsonResponse.anomalies.find(a =>
      (a.type == this.expectedValue.type) &&
      (this.expectedValue.message == "*" || this.expectedValue.message == a.message) &&
      (this.expectedValue.detail == "*" || this.expectedValue.detail == a.detail));
    if (match == undefined) {
      this.checkPassed = false;
      this.actualValue = {};
    } else {
      this.checkPassed = true;
      this.actualValue = match;
    }
    this.checkRun = true;
  }

  get expected() {
    return this.jsonCode(this.expectedValue);
  }

  get actual() {
    return this.jsonCode(this.actualValue);
  }
}


//
// Checks the result node
//
class CheckResult extends Check {
  constructor(test, result) {
    super(test, result)
  }

  performCheck(test) {
    this.actualValue = test.jsonResponse.result;
    this.checkPassed =
      (this.expectedValue.type == this.actualValue.type) &&
      (this.expectedValue.message == "*" || this.expectedValue.message == this.actualValue.message) &&
      (this.expectedValue.detail == "*" || this.expectedValue.detail == this.actualValue.detail);
    this.checkRun = true;
  }

  get expected() {
    return this.jsonCode(this.expectedValue);
  }

  get actual() {
    return this.jsonCode(this.actualValue);
  }
}


//
// Ensure we get exactly as many anomalies entries as we expect
//
class CheckAnomalyCount extends Check {
  constructor(test, count) {
    super(test, count)
  }

  performCheck(test) {
    this.actualValue = test.jsonResponse.anomalies.length;
    this.checkPassed = this.actualValue == this.expectedValue;
    this.checkRun = true;
  }
}


//
// Ensure we get exactly as many trail status entries as we expect
//
class CheckTrailsCount extends Check {
  constructor(test, count) {
    super(test, count)
  }

  performCheck(test) {
    this.actualValue = test.jsonResponse.trails.length;
    this.checkPassed = this.actualValue == this.expectedValue;
    this.checkRun = true;
  }
}