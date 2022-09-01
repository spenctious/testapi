# testapi
A tool for grey box testing the LaPalmaStatusesAPI

## Dev only
The tool works by using the optional parameters in the LaPalmaStatusesAPI interface to point the scraper at specially configured test files. The live service is not able to access these files so both API and the tests should be run locally.
Fully qualified URLs in the test data need to be passed to the API so a global search/replace on the test files may be needed to make them point to the same port as the test site before tests will work.

## Grey box testing
The test files contain content that reflects that which may be encountered in the live files (samples included in the project for reference) but which is controllable and therefore testable in a consistent way. The content forces the API through the majority of code paths with timeout and bad data accounting for the remainder. Given the simple nature of the code under test, particularly in the controller, a HTTP 500 return cannot be provoked with test data.
