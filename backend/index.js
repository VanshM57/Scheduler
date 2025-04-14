import './corn.js'
import express from 'express';
import connectDB from "./db/index.js"
import userRouter from './route/user.route.js'
import todayPeriodRouter from './route/todayPeriod.route.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import originalPeriodRouter from './route/orginalPeriod.route.js'
dotenv.config({
    path: './.env'
})
const app = express();
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser());
app.use(cors());

const port = 3000;
app.use("/api/v1/user",userRouter);
app.use("/api/v1/todayPeriod",todayPeriodRouter);
app.use("/api/v1/originalPeriod",originalPeriodRouter);

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server is listening at port: ${port}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection is failed "+err);
})
