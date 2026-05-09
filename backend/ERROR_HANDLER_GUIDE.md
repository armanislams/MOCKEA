# Error Handler Middleware Guide

## Overview
The error handler middleware catches all errors from your routes and sends appropriate responses with proper HTTP status codes and error messages.

## Location
`src/middlewares/errorHandler.js`

## How to Use

### 1. Import the middleware in your main server file (`src/index.js`)

```javascript
import errorHandler from "./middlewares/errorHandler.js";
```

### 2. Register the middleware as the LAST middleware (after all routes)

```javascript
// All routes should be defined BEFORE the error handler
app.use("/api/user", userRouter);
app.use("/api/note", noteRouter);
app.use("/api/reading", readingRouter);
app.use("/api/questions", qRouter);

// Error handler must be at the end
app.use(errorHandler);
```

### 3. Use async/await with try-catch in your routes or controllers

```javascript
const handler = async (req, res, next) => {
  try {
    // Your code here
    const result = await someOperation();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // Pass error to error handler
    next(error);
  }
};
```

## Error Types Handled

| Error Type | Status Code | Description |
|-----------|------------|-------------|
| ValidationError | 400 | Input validation fails |
| CastError | 400 | Invalid MongoDB ID format |
| MongoServerError (11000) | 409 | Duplicate field value |
| JsonWebTokenError | 401 | Invalid JWT token |
| TokenExpiredError | 401 | Expired JWT token |
| Firebase Auth Error | 401 | Firebase authentication issues |
| Default | 500 | Internal Server Error |

## Creating Custom Errors

You can throw errors with custom status codes:

```javascript
const error = new Error("User not found");
error.status = 404;
throw error;
```

## Error Response Format

Success case:
```json
{
  "success": true,
  "data": { }
}
```

Error case:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation Error: Email is required",
  "error": { } // Only in development mode
}
```

## Best Practices

1. ✅ Always use `try-catch` blocks in async functions
2. ✅ Call `next(error)` to pass errors to the middleware
3. ✅ Set custom status codes when needed
4. ✅ Never send multiple responses (no `res.send()` after error)
5. ✅ Log sensitive data only in development mode
