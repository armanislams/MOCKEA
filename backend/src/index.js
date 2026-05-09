import express from "express"
import "dotenv/config"
import cors from "cors"
import userRouter from "./routes/user.route.js";
import { connectDb } from "./lib/connectDB.js";
import noteRouter from "./routes/note.route.js";
import readingRouter from "./routes/reading.route.js";
import qRouter from "./routes/questions.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import errorHandler from "./middlewares/errorHandler.js";
const Port = process.env.PORT || 3000;


const app = express();


app.use(cors());

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api/note", noteRouter);
app.use("/api/reading", readingRouter);
app.use("/api/questions", qRouter);
app.use("/api/analytics", analyticsRouter);

app.get("/", (req, res) => {
    res.send("Eco Stream Server is running");
})

// Error handling middleware (must be last)
app.use(errorHandler);

const startServer = async ()=>{
    try {
        await connectDb();
        app.listen(Port, () => {
            console.log(`Eco Stream Server is running on port ${Port}`);
        })
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

startServer()