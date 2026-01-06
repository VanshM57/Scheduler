import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SpecialEvent } from "../models/specialEvent.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createSpecialEvent = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const { eventName, description, date, startTime, endTime, roomNo, branch, sem, isForAll } = req.body;
    const teacher = req.user._id;
    const teacherName = req.user.name;

    if(!eventName || !date || !startTime || !endTime){
        throw new ApiError(400, "Event name, date, start time, and end time are required");
    }

    const eventData = {
        eventName,
        description: description || "",
        teacher,
        teacherName,
        date: new Date(date),
        startTime,
        endTime,
        roomNo: roomNo || "",
        isForAll: isForAll || false
    };

    if(isForAll){
        eventData.branch = ["all"];
        eventData.sem = [];
    } else {
        if(branch && Array.isArray(branch)){
            eventData.branch = branch;
        } else if(branch){
            eventData.branch = [branch];
        } else {
            eventData.branch = ["all"];
        }

        if(sem && Array.isArray(sem)){
            eventData.sem = sem;
        } else if(sem){
            eventData.sem = [sem];
        } else {
            eventData.sem = [];
        }
    }

    const newEvent = await SpecialEvent.create(eventData);
    if(!newEvent){
        throw new ApiError(500, "Event not created");
    }
    return res.status(201)
    .json(
        new ApiResponse(
            201,
            {
                event: newEvent
            },
            "Special event created successfully"
        )
    )
})

const getSpecialEvents = asyncHandler(async(req,res)=>{
    const { date, branch, sem } = req.query;
    
    let query = {};
    
    if(date){
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23,59,59,999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // If branch and sem are provided, find events that match
    if(branch && sem){
        query.$or = [
            { isForAll: true },
            { branch: { $in: ["all", branch] } },
            { $and: [
                { branch: { $in: ["all", branch] } },
                { $or: [{ sem: { $size: 0 } }, { sem: parseInt(sem) }] }
            ]}
        ];
    } else if(branch){
        query.$or = [
            { isForAll: true },
            { branch: { $in: ["all", branch] } }
        ];
    } else if(sem){
        query.$or = [
            { isForAll: true },
            { sem: { $size: 0 } },
            { sem: parseInt(sem) }
        ];
    }

    const events = await SpecialEvent.find(query)
        .populate('teacher', 'name email')
        .sort({ date: 1, startTime: 1 });

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                events
            },
            "Special events fetched successfully"
        )
    )
})

const updateSpecialEvent = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const { id, eventName, description, date, startTime, endTime, roomNo, branch, sem, isForAll } = req.body;
    
    if(!id){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await SpecialEvent.findById(id);
    if(!event){
        throw new ApiError(404, "Event not found");
    }

    // Check if the user is the creator of the event
    if(event.teacher.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You can only update your own events");
    }

    const updateData = {};
    if(eventName) updateData.eventName = eventName;
    if(description !== undefined) updateData.description = description;
    if(date) updateData.date = new Date(date);
    if(startTime) updateData.startTime = startTime;
    if(endTime) updateData.endTime = endTime;
    if(roomNo !== undefined) updateData.roomNo = roomNo;
    if(isForAll !== undefined) updateData.isForAll = isForAll;

    if(isForAll){
        updateData.branch = ["all"];
        updateData.sem = [];
    } else {
        if(branch){
            updateData.branch = Array.isArray(branch) ? branch : [branch];
        }
        if(sem){
            updateData.sem = Array.isArray(sem) ? sem : [sem];
        }
    }

    const updatedEvent = await SpecialEvent.findByIdAndUpdate(id, updateData, {new: true});
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                event: updatedEvent
            },
            "Event updated successfully"
        )
    )
})

const deleteSpecialEvent = asyncHandler(async(req,res)=>{
    const { id } = req.body;
    
    if(!id){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await SpecialEvent.findById(id);
    if(!event){
        throw new ApiError(404, "Event not found");
    }

    // Check if the user is the creator of the event
    if(event.teacher.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You can only delete your own events");
    }

    const deletedEvent = await SpecialEvent.findByIdAndDelete(id);
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                event: deletedEvent
            },
            "Event deleted successfully"
        )
    )
})

export {createSpecialEvent, getSpecialEvents, updateSpecialEvent, deleteSpecialEvent}

