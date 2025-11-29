## Iteration 3

  ### Question 2

  -  This line fetches the authenticated user from the database and stores their ID on the request object so the protected routes know which user is making the request.

## Iteration 5

  ### Question 1

  -  No, We did not need to make any changes to the tour-related controller functions.
  The test failures were caused by an authentication issue (generateToken was undefined), which resulted in the tests receiving an invalid or missing JWT token.
  Because every request was rejected by the requireAuth middleware with a 401 status, the tour controllers were never reached.
  After fixing the token generation in the authentication controller, the tour endpoints worked correctly without modifying the tour controller itself.