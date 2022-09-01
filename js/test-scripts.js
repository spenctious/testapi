const URL_STATUSES = "https://localhost:7033/api/TrailStatuses";

const TIMEOUT_TOO_SHORT = 100;
const ANY = "*"; // wildcard value for when we don't care

const TIMEOUT_PAGE = "http://example.com:81"; // guaranteed not to return
// see https://stackoverflow.com/questions/100841/artificially-create-a-connection-timeout-error

const NON_EXISTENT_PAGE = localFile("does-not-exist.html");
const LIVE_STATUS_PAGE = "https://www.senderosdelapalma.es/en/footpaths/situation-of-the-footpaths/";


// add a test to the collection with the incrementing id
function addTestToCollection(test) {
  testCollection.set(testNumber++, test);
}


// convert local test file name to http link
function localFile(testFile) {
  return `http://${window.location.host}/test-data/${testFile}`;
}

var testNumber = 0; // auto-incremented with each test addition

//
// Populate the test collection
//
function populateTests() {
  // expected failures
  statusPageTimesOut_timeout();
  unableToOpenStatusPage_exception();
  trailNetworkClosed_dataError();

  // expected successes
  goodLinks_successTrails();
  badLinks_successAnomalies();
  locateCorrectTable_successCorrectTableId();
  validTrailIdFormats_successCorrectTrailIds();
  invalidTrailIdFormats_successAnomalies();
  trailStatuses_successTrailsAnomalies();
  detailPageTimesOut_successAnomaly();
  detailPageException_successAnomaly();

  // paired tests for cached results
  cachedResult_successDefineCacheValue();
  cachedResult_successGetCachedValue();

  // paired tests for link caching
  cachedLinks_successAdditionalLookups();
  cachedLinks_successNoAdditionalLookups();
}

// ***************************************************************
//
// The tests
//
// ***************************************************************


function statusPageTimesOut_timeout() {
  let test = new Test(
    "Failure - Status page timed out",
    TIMEOUT_PAGE,
    { statusPageTimeout: TIMEOUT_TOO_SHORT }
  );

  test.addCheck(new CheckResult(
    "Result is Timeout",
    {
      type: "Timeout",
      message: ANY,
      detail: ANY
    }
  ));

  addTestToCollection(test);
}

function unableToOpenStatusPage_exception() {
  let test = new Test(
    "Failure - Status page exception (404 error)",
    NON_EXISTENT_PAGE
  );

  test.addCheck(new CheckResult(
    "Result is Exception",
    {
      type: "Exception",
      message: ANY,
      detail: ANY
    }
  ));

  addTestToCollection(test);
}

function trailNetworkClosed_dataError() {
  let test = new Test(
    "Failure - Table not found",
    localFile("Table-Missing.html")
  );

  test.addCheck(new CheckResult(
    "Result is DataError",
    {
      type: "DataError",
      message: "Trail network probably closed",
      detail: "Missing table with id tablepress-14"
    }
  ));

  addTestToCollection(test);
}

function goodLinks_successTrails() {
  let test = new Test(
    "Success - Good link returns English link",
    localFile("Links-Good.html")
  );

  test.addCheck(new CheckResult(
    "Success - 0 anomalies",
    {
      type: "Success",
      message: ANY,
      detail: "0 anomalies found"
    }
  ));

  test.addCheck(new CheckTrail(
    "Valid link",
    {
      name: "GR 130 Etapa 1",
      status: ANY,
      url: "LinkToEnglishVersion.html"
    }
  ));

  addTestToCollection(test);
}

function badLinks_successAnomalies() {
  let test = new Test(
    "Success - Bad links reported as anomalies",
    localFile("Links-Anomalies.html")
  );

  test.addCheck(new CheckResult(
    "Success - 3 anomalies",
    {
      type: "Success",
      message: ANY,
      detail: "3 anomalies found"
    }
  ));

  test.addCheck(new CheckTrail(
    "Missing trail link - default link returned",
    {
      name: "PR LP 01",
      status: ANY,
      url: localFile("Links-Anomalies.html")
    }
  ));
  test.addCheck(new CheckTrail(
    "PDF link found - default link returned",
    {
      name: "PR LP 02",
      status: ANY,
      url: localFile("Links-Anomalies.html")
    }
  ));
  test.addCheck(new CheckTrail(
    "ZIP link found - default link returned",
    {
      name: "PR LP 03",
      status: ANY,
      url: localFile("Links-Anomalies.html")
    }
  ));

  test.addCheck(new CheckAnomaly(
    "Missing trail link",
    {
      type: "BadRouteLink",
      message: ANY,
      detail: "No link to route detail"
    }
  ));
  test.addCheck(new CheckAnomaly(
    "PDF link found",
    {
      type: "BadRouteLink",
      message: "PR LP 02",
      detail: "Dummy.pdf"
    }
  ));
  test.addCheck(new CheckAnomaly(
    "ZIP link found",
    {
      type: "BadRouteLink",
      message: "PR LP 03",
      detail: "Dummy.zip"
    }
  ));

  addTestToCollection(test);
}

function locateCorrectTable_successCorrectTableId() {
  let test = new Test(
    "Success - Only correct table matched",
    localFile("Table-Correct.html")
  );

  test.addCheck(new CheckResult(
    "Success - no anomalies",
    {
      type: "Success",
      message: ANY,
      detail: "0 anomalies found"
    }
  ));

  test.addCheck(new CheckTrailName("Correct trail id", "PR LP 03"));

  addTestToCollection(test);
}

function validTrailIdFormats_successCorrectTrailIds() {
  let test = new Test(
    "Success - Correct trail ID formats recognised",
    localFile("Trails-Correct.html")
  );

  test.addCheck(new CheckResult(
    "Success - no anomalies",
    {
      type: "Success",
      message: ANY,
      detail: "0 anomalies found"
    }
  ));

  test.addCheck(new CheckTrailName("Recognise GR 130 stages", "GR 130 Etapa 1"));
  test.addCheck(new CheckTrailName("Recognise GR 131 stages", "GR 131 Etapa 1"));
  test.addCheck(new CheckTrailName("Recognise PR trails", "PR LP 01"));
  test.addCheck(new CheckTrailName("Recognise SL trails", "SL BV 01"));
  test.addCheck(new CheckTrailName("Recognise 3 digit trail numbers", "SL BV 200"));
  test.addCheck(new CheckTrailName("Recognise decimal trail numbers", "PR LP 02.1"));
  test.addCheck(new CheckTrailName("Correct for extra digit ", "PR LP 03.1"));

  addTestToCollection(test);
}

function invalidTrailIdFormats_successAnomalies() {
  let test = new Test(
    "Success - Bad trail IDs reported as anomalies",
    localFile("Trails-Anomalies.html")
  );

  test.addCheck(new CheckResult(
    "Success - 8 anomalies",
    {
      type: "Success",
      message: ANY,
      detail: "5 anomalies found"
    }
  ));

  test.addCheck(new CheckAnomaly(
    "Stage on non-GR trail name",
    {
      type: "UnrecognisedTrailId",
      message: ANY,
      detail: "PR 130 Etapa 1"
    }
  ));
  test.addCheck(new CheckAnomaly(
    "GR must be 130 or 131",
    {
      type: "UnrecognisedTrailId",
      message: ANY,
      detail: "GR 120 Etapa 1"
    }
  ));
  test.addCheck(new CheckAnomaly(
    "GR wrong format",
    {
      type: "UnrecognisedTrailId",
      message: ANY,
      detail: "GR 130.1"
    }
  ));
  test.addCheck(new CheckAnomaly(
    "Not PR or SL",
    {
      type: "UnrecognisedTrailId",
      message: ANY, detail:
        "PL LP 12"
    }
  ));
  test.addCheck(new CheckAnomaly(
    "PR/SL less than 2 digits",
    {
      type: "UnrecognisedTrailId",
      message: ANY,
      detail: "PR LP 1"
    }
  ));
  test.addCheck(new CheckTrailsCount(
    "No entries recognised as legitimate",
    0
  ));

  addTestToCollection(test);
}

function trailStatuses_successTrailsAnomalies() {
  let test = new Test(
    "Success - Trail statuses",
    localFile("Status-Correct.html")
  );

  test.addCheck(new CheckResult(
    "Success - 2 anomalies",
    {
      type: "Success",
      message: ANY,
      detail: "2 anomalies found"
    }
  ));
  test.addCheck(new CheckTrail(
    "Trail completely open - no line break",
    {
      name: "PR LP 01",
      status: "Open",
      url: "LinkToEnglishVersion.html"
    }
  ));
  test.addCheck(new CheckTrail(
    "Trail completely open - with line break",
    {
      name: "PR LP 02",
      status: "Open",
      url: "LinkToEnglishVersion.html"
    }
  ));
  test.addCheck(new CheckTrail(
    "Trail partly open - open with additional content",
    {
      name: "PR LP 03",
      status: "Part open",
      url: localFile("Status-Correct.html")
    }
  ));
  test.addCheck(new CheckTrail(
    "Trail Closed",
    {
      name: "PR LP 04",
      status: "Closed",
      url: "LinkToEnglishVersion.html"
    }
  ));
  test.addCheck(new CheckTrail(
    "Trail status not recognised",
    {
      name: "PR LP 05",
      status: "Unknown",
      url: "LinkToEnglishVersion.html"
    }
  ));
  test.addCheck(new CheckTrail(
    "Trail status in Spanish only",
    {
      name: "PR LP 06",
      status: "Unknown",
      url: "LinkToEnglishVersion.html"
    }
  ));

  test.addCheck(new CheckAnomaly(
    "Missing trail link",
    {
      type: "UnreadableStatus",
      message: "PR LP 05",
      detail: "Blah blah blah"
    }
  ));
  test.addCheck(new CheckAnomaly(
    "Missing trail link",
    {
      type: "UnreadableStatus",
      message: "PR LP 06",
      detail: "Cerrado"
    }
  ));

  addTestToCollection(test);
}

function detailPageTimesOut_successAnomaly() {
  let test = new Test(
    "Success - Detail page timed out",
    localFile("Links-Timeout.html"),
    { detailPageTimeout: TIMEOUT_TOO_SHORT }
  );

  test.addCheck(new CheckResult(
    "Success - 1 anomaly",
    {
      type: "Success",
      message: ANY,
      detail: ANY
    }
  ));

  test.addCheck(new CheckTrail(
    "Trail found - default link",
    {
      name: "GR 130 Etapa 1",
      status: ANY,
      url: localFile("Links-Timeout.html")
    }
  ));

  test.addCheck(new CheckAnomaly(
    "Timeout on detail page",
    {
      type: "Timeout",
      message: ANY,
      detail: TIMEOUT_PAGE
    }
  ));

  addTestToCollection(test);
}

function detailPageException_successAnomaly() {
  let test = new Test(
    "Success - Detail page exception (404 error)",
    localFile("Links-Exception.html")
  );

  test.addCheck(new CheckResult(
    "Success - 1 anomaly",
    {
      type: "Success",
      message: ANY,
      detail: ANY
    }
  ));

  test.addCheck(new CheckTrail(
    "Trail found - default link",
    {
      name: "GR 130 Etapa 1",
      status: ANY,
      url: localFile("Links-Exception.html")
    }
  ));
  test.addCheck(new CheckAnomaly(
    "Execption reading detail page",
    {
      type: "Exception",
      message: ANY,
      detail: NON_EXISTENT_PAGE
    }
  ));

  addTestToCollection(test);
}

function cachedResult_successDefineCacheValue() {
  let test = new Test(
    "Success - Cache check pt. 1 - Set A",
    localFile("Links-Good.html"));

  test.addCheck(new CheckResult(
    "Success - 0 anomalies",
    {
      type: "Success",
      message: ANY,
      detail: "0 anomalies found"
    }
  ));

  test.addCheck(new CheckTrail(
    "Valid link",
    {
      name: "GR 130 Etapa 1",
      status: ANY,
      url: "LinkToEnglishVersion.html"
    }
  ));
  test.addCheck(new CheckTrailsCount("Exactly 1 trail", 1));

  addTestToCollection(test);
}

function cachedResult_successGetCachedValue() {
  let test = new Test(
    "Success - Cache check pt.2 - Ask for B get A",
    localFile("Trails-Correct.html"),
    { useCache: true });

  test.addCheck(new CheckResult(
    "Success - 0 anomalies",
    {
      type: "Success",
      message: ANY,
      detail: "0 anomalies found"
    }
  ));

  test.addCheck(new CheckTrail(
    "Valid link",
    {
      name: "GR 130 Etapa 1",
      status: ANY,
      url: "LinkToEnglishVersion.html"
    }
  ));
  test.addCheck(new CheckTrailsCount("Exactly 1 trail", 1));

  addTestToCollection(test);
}

function cachedLinks_successAdditionalLookups() {
  let test = new Test(
    "Success - Lookups pt. 1 - Get and cache link",
    localFile("Links-Good.html"),
    { clearLookups: true }
  );

  test.addCheck(new CheckResult(
    "Success - 1 lookup and no anomalies",
    {
      type: "Success",
      message: "1 additional page lookups",
      detail: "0 anomalies found"
    }
  ));

  test.addCheck(new CheckTrail(
    "Valid link",
    {
      name: "GR 130 Etapa 1",
      status: ANY,
      url: "LinkToEnglishVersion.html"
    }
  ));

  addTestToCollection(test);
}

function cachedLinks_successNoAdditionalLookups() {
  let test = new Test(
    "Success - Lookups pt. 2 - Use cached link",
    localFile("Links-Good.html")
  );

  test.addCheck(new CheckResult(
    "Success - 1 lookup and no anomalies",
    {
      type: "Success",
      message: "0 additional page lookups",
      detail: "0 anomalies found"
    }
  ));

  test.addCheck(new CheckTrail(
    "Valid link",
    {
      name: "GR 130 Etapa 1",
      status: ANY,
      url: "LinkToEnglishVersion.html"
    }
  ));

  addTestToCollection(test);
}
