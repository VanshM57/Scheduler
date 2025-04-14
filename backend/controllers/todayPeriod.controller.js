import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { TodayPeriod } from "../models/todayPeriod.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const updatePeriod = asyncHandler(async(req,res)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {id, periodName, teacherName, startTime, endTime, roomNo, sem, branch,batch, updatedBy, isClassCancelled } = req.body;
    if(!id || !periodName || !teacherName || !startTime || !endTime || !roomNo || !sem || !branch || !batch || !updatedBy){
        throw new ApiError(400, "Id and updateData are required");
    }
    const overlappingPeriod = await TodayPeriod.findOne({
        _id: { $ne: id }, // Exclude the current period being updated
        sem,         // Must be the same semester
        branch,           // Must be the same branch
        startTime: { $lt: endTime },   // Existing start < new end
        endTime: { $gt: startTime }    // Existing end > new start
    });
    if(overlappingPeriod){
        throw new ApiError(400, "Period time overlaps with another period");
    }
    const updateData = {
        periodName: periodName,
        teacherName: teacherName,
        startTime: startTime,
        endTime: endTime,
        roomNo: roomNo,
        batch: batch,
        updatedBy: updatedBy,
        isClassCancelled: isClassCancelled
    }
    const updatePeriod = await TodayPeriod.findByIdAndUpdate(id,updateData,{new: true});
    if(!updatePeriod){
        throw new ApiError(404, "Period not found");
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                period: updatePeriod
            },
            "Period updated successfully"
        )
    )
})

const cancelPeriod = asyncHandler(async(req,res)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {id, updatedBy} = req.body;
    if(!id){
        throw new ApiError(400, "Id is required");
    }
    const updatePeriod = await TodayPeriod.findByIdAndUpdate(id,{isClassCancelled: true, updatedBy: updatedBy},{new: true});
    if(!updatePeriod){
        throw new ApiError(404, "Period not found");
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                period: updatePeriod
            },
            "Period cancelled successfully"
        )
    )
})

const addTodayPeriod = asyncHandler(async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const { periodName, teacherName, roomNo, branch, batch, startTime, endTime, sem } = req.body;
    if(!periodName || !teacherName || !roomNo || !branch || !batch || !startTime || !endTime || !sem){
        throw new ApiError(400, "All fields are required");
    }
    const newPeriod = await TodayPeriod.create(req.body);
    if(!newPeriod){
        throw new ApiError(500, "Period not created");
    }
    return res.status(201)
    .json(
        new ApiResponse(
            201,
            {
                period: newPeriod
            },
            "Period added successfully"
        )
    )
})

const getTodayPeriod = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const { branch, sem } = req.body;
    const todayPeriods = await TodayPeriod.find({branch, sem});
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                periods: todayPeriods
            },
            "Today's period fetched successfully"
        )
    )
});
export {updatePeriod, cancelPeriod,getTodayPeriod, addTodayPeriod}