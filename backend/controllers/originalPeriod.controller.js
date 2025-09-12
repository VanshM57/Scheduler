import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { OriginalPeriod } from "../models/originalPeriod.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addPeriod = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {periodName, teacherName, roomNo,startTime, endTime, branch, batch, sem, day} = req.body;
    if(!periodName || !teacherName || !roomNo || !startTime || !endTime || !branch || !sem || !day){
        throw new ApiError(400, "All fields are required");
    }
    const period = await OriginalPeriod.create({
        periodName: periodName,
        teacherName: teacherName,
        roomNo: roomNo,
        startTime: startTime,
        endTime: endTime,
        branch: branch,
        batch: batch,
        sem: sem,
        day: day
    })
    const createdPeriod = await OriginalPeriod.findById(period._id);
    if(!createdPeriod){
        throw new ApiError(500, "Something went wrong while adding the period");
    }
    return res.status(201)
    .json(
        new ApiResponse(
            201,
            {
                period: createdPeriod
            },
            "Period added successfully"
        )
    )

})

const updateOriginalPeriod = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {id, periodName, teacherName, roomNo,startTime, endTime, branch, batch, sem, day} = req.body;
    if(!id || !periodName || !teacherName || !roomNo || !startTime || !endTime || !branch || !sem || !day){
        throw new ApiError(400, "All fields are required");
    }
    const updatePeriod = await OriginalPeriod.findByIdAndUpdate(id,{
        periodName: periodName,
        teacherName: teacherName,
        roomNo: roomNo,
        startTime: startTime,
        endTime: endTime,
        branch: branch,
        batch: batch,
        sem: sem,
        day: day
    },{new: true});
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

const deleteOriginalPeriod = asyncHandler(async(req,res)=>{
    const { id } = req.body;
    if(!id){
        return new ApiError(400, "Id is required");
    }
    const deletePeriod = await OriginalPeriod.findByIdAndDelete(id);
    if(!deletePeriod){
        throw new ApiError(404, "Period not found");
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                period: deletePeriod
            },
            "Period deleted successfully"
        )
    )
})

export {addPeriod,updateOriginalPeriod,deleteOriginalPeriod}