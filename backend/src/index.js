import express from "express"
import "dotenv/config"
import cors from "cors"
import userRouter from "./routes/user.route.js";
import { connectDb } from "./lib/connectDB.js";
import qRouter from "./routes/questions.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import errorLogRouter from "./routes/errorLog.route.js";
import errorHandler from "./middlewares/errorHandler.js";
import mockTestRouter from "./routes/mockTest.route.js";
import publicMockTestRouter from "./routes/publicMockTest.route.js";
import sRouter from "./routes/submissions.route.js";
import pricingRouter from "./routes/pricing.route.js";
import resourceRouter from "./routes/resource.route.js";
import trainersRouter from "./routes/trainer.route.js";
import apiRateLimiter from "./middlewares/apiRateLimiter.js";
import chatbotRouter from "./routes/chatbot.route.js";
import { sanitizeMiddleware } from "./middlewares/sanitize.js";

const Port = process.env.PORT || 3000;


const app = express();


const allowedOrigins = [
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS policy"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 200
  })
);

app.use(express.json());
app.use(sanitizeMiddleware);
// app.use(express.urlencoded({ extended: true }));

// Apply global rate limiting to all public and private API routes (60 requests per minute per IP)
app.use("/api", apiRateLimiter(60, 60 * 1000));


app.use("/api/user", userRouter);
app.use("/api/questions", qRouter);
app.use('/api/mock-tests', mockTestRouter);
app.use('/api/public-mock-tests', publicMockTestRouter);
app.use('/api/submissions', sRouter);
app.use('/api/error-logs', errorLogRouter);

app.use("/api/analytics", analyticsRouter);
app.use("/api/settings/logs", errorLogRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/trainers", trainersRouter);
app.use("/api/chatbot", chatbotRouter);


app.get("/", (req, res) => {
    res.send("MOCKEA Server is running");
})

// Error handling middleware (must be last)
app.use(errorHandler);

const startServer = async ()=>{
    try {
        await connectDb();
        app.listen(Port, () => {
            console.log(`MOCKEA Server is running on port ${Port}`);
        })
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

startServer()