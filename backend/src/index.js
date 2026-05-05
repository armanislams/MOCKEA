import express from "express"
import "dotenv/config"
import cors from "cors"
import userRouter from "./routes/user.route.js";
import { connectDb } from "./lib/connectDB.js";
const Port = process.env.PORT || 3000;


const app = express();


app.use(cors());

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);

app.get("/", (req, res) => {
    res.send("Eco Stream Server is running");
})



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