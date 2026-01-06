import './corn.js'
import express from 'express';
import connectDB from "./db/index.js"
import userRouter from './route/user.route.js'
import todayPeriodRouter from './route/todayPeriod.route.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import originalPeriodRouter from './route/orginalPeriod.route.js'
import specialEventRouter from './route/specialEvent.route.js'
import adminRouter from './route/admin.route.js'
import notificationRouter from './route/notification.route.js'
dotenv.config({
    path: './.env'
})

// Check required environment variables
if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error('❌ ERROR: ACCESS_TOKEN_SECRET is not set in .env file!');
    console.error('Please create a .env file in the backend directory with:');
    console.error('ACCESS_TOKEN_SECRET=your_secret_key_here');
    console.error('DB_CONNECTION_STRING=your_mongodb_connection_string');
    process.exit(1);
}

if (!process.env.DB_CONNECTION_STRING) {
    console.error('❌ ERROR: DB_CONNECTION_STRING is not set in .env file!');
    process.exit(1);
}

const app = express();
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",  // your frontend origin
  credentials: true,                // allow cookies
}));

const port = 3000;
app.use("/api/v1/user",userRouter);
app.use("/api/v1/todayPeriod",todayPeriodRouter);
app.use("/api/v1/originalPeriod",originalPeriodRouter);
app.use("/api/v1/specialEvent",specialEventRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/notification",notificationRouter);

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server is listening at port: ${port}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection is failed "+err);
})
