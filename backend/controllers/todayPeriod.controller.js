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
    const user = req.user;
    
    if(!id || !periodName || !teacherName || !startTime || !endTime || !roomNo || !sem || !branch || !batch || !updatedBy){
        throw new ApiError(400, "Id and updateData are required");
    }

    // Check if period exists and teacher can edit it
    const period = await TodayPeriod.findById(id);
    if(!period){
        throw new ApiError(404, "Period not found");
    }

    // ONLY teachers can edit today periods, and they can only edit their own periods
    if(user.role !== 'teacher'){
        throw new ApiError(403, "Only teachers can edit today periods");
    }
    
    // Teachers can only edit their own periods
    // Check by teacher ObjectId if available, otherwise fallback to name
    const isOwner = (period.teacher && period.teacher.toString() === user._id.toString()) ||
                   (period.teacherName && period.teacherName.toLowerCase() === user.name.toLowerCase());
    if(!isOwner){
        throw new ApiError(403, "You can only edit your own periods");
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
        teacher: user.role === 'teacher' ? user._id : period.teacher, // Preserve teacher reference
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
    const user = req.user;
    
    if(!id){
        throw new ApiError(400, "Id is required");
    }

    // Check if period exists and teacher can cancel it
    const period = await TodayPeriod.findById(id);
    if(!period){
        throw new ApiError(404, "Period not found");
    }

    // ONLY teachers can cancel today periods, and they can only cancel their own periods
    if(user.role !== 'teacher'){
        throw new ApiError(403, "Only teachers can cancel today periods");
    }
    
    // Teachers can only cancel their own periods
    // Check by teacher ObjectId if available, otherwise fallback to name
    const isOwner = (period.teacher && period.teacher.toString() === user._id.toString()) ||
                   (period.teacherName && period.teacherName.toLowerCase() === user.name.toLowerCase());
    if(!isOwner){
        throw new ApiError(403, "You can only cancel your own periods");
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
    
    // ONLY teachers can add today periods
    if(req.user.role !== 'teacher'){
        throw new ApiError(403, "Only teachers can add today periods");
    }
    
    const { periodName, teacherName, roomNo, branch, batch, startTime, endTime, sem } = req.body;
    if(!periodName || !teacherName || !roomNo || !branch || !batch || !startTime || !endTime || !sem){
        throw new ApiError(400, "All fields are required");
    }
    
    // Check for overlapping periods
    const overlappingPeriod = await TodayPeriod.findOne({
        sem,
        branch,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    });
    if(overlappingPeriod){
        throw new ApiError(400, "Period time overlaps with another period");
    }
    
    const periodData = {
        ...req.body,
        teacher: req.user._id // Add teacher reference from authenticated user
    };
    const newPeriod = await TodayPeriod.create(periodData);
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
    const { branch, sem, date } = req.query;
    const user = req.user; // From middleware
    
    let query = {};
    
    // If user is a teacher, show only their periods
    if(user && user.role === 'teacher'){
        // Use teacher ObjectId if available, otherwise fallback to name
        query.$or = [
            { teacher: user._id },
            { teacherName: user.name.toLowerCase() }
        ];
    }
    
    // Filter by branch and sem if provided
    if(branch){
        query.branch = branch.toLowerCase();
    }
    if(sem){
        query.sem = parseInt(sem);
    }
    
    // If date is provided, we need to check if it's today or a past/future date
    // For today, use TodayPeriod, for past use PastPeriod, for future we might need to calculate from OriginalPeriod
    let periods;
    if(date){
        const targetDate = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);
        targetDate.setHours(0,0,0,0);
        
        if(targetDate.getTime() === today.getTime()){
            // Today - use TodayPeriod
            periods = await TodayPeriod.find(query).populate('teacher', 'name email');
        } else if(targetDate < today){
            // Past date - use PastPeriod
            const { PastPeriod } = await import('../models/pastPeriod.model.js');
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0,0,0,0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23,59,59,999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
            periods = await PastPeriod.find(query).populate('teacher', 'name email');
        } else {
            // Future date - calculate from OriginalPeriod based on day
            const dayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
            const { OriginalPeriod } = await import('../models/originalPeriod.model.js');
            let originalQuery = { day: dayName };
            if(branch) originalQuery.branch = branch.toLowerCase();
            if(sem) originalQuery.sem = parseInt(sem);
            if(user && user.role === 'teacher'){
                originalQuery.$or = [
                    { teacher: user._id },
                    { teacherName: user.name.toLowerCase() }
                ];
            }
            const originalPeriods = await OriginalPeriod.find(originalQuery);
            // Transform to match TodayPeriod structure
            periods = originalPeriods.map(p => ({
                periodName: p.periodName,
                teacherName: p.teacherName,
                roomNo: p.roomNo,
                sem: p.sem,
                branch: p.branch,
                batch: p.batch || "",
                startTime: p.startTime,
                endTime: p.endTime,
                isClassCancelled: false,
                updatedBy: ""
            }));
        }
    } else {
        // No date provided, default to today
        periods = await TodayPeriod.find(query).populate('teacher', 'name email');
    }
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                periods: periods
            },
            "Periods fetched successfully"
        )
    )
});
export {updatePeriod, cancelPeriod,getTodayPeriod, addTodayPeriod}