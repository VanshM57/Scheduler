import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { OriginalPeriod } from "../models/originalPeriod.model.js";
import { TodayPeriod } from "../models/todayPeriod.model.js";
import { SpecialEvent } from "../models/specialEvent.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from 'bcrypt';

// ============ USER MANAGEMENT ============

// Get all users
const getAllUsers = asyncHandler(async(req,res)=>{
    const { role, branch, sem } = req.query;
    let query = {};
    
    if(role) query.role = role;
    if(branch) query.branch = branch.toLowerCase();
    if(sem) query.sem = parseInt(sem);
    
    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { users },
            "Users fetched successfully"
        )
    )
})

// Create new user (student or teacher)
const createUser = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const { name, email, password, role, branch, sem, rollno, isAdmin } = req.body;
    
    if(!name || !email || !password || !role){
        throw new ApiError(400, "Name, email, password, and role are required");
    }

    if(!email.endsWith('@rtu.ac.in')){
        throw new ApiError(400, "Email must be from @rtu.ac.in domain");
    }

    if(!['student', 'teacher'].includes(role)){
        throw new ApiError(400, "Invalid role. Must be student or teacher");
    }

    const existingUser = await User.findOne({ email });
    if(existingUser){
        throw new ApiError(409, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        branch: branch || undefined,
        sem: sem || undefined,
        rollno: rollno || undefined,
        isAdmin: isAdmin || false
    });

    const createdUser = await User.findById(user._id).select("-password");

    return res.status(201)
    .json(
        new ApiResponse(
            201,
            { user: createdUser },
            "User created successfully"
        )
    )
})

// Update user
const updateUser = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const { id, name, email, role, branch, sem, rollno, password, isAdmin } = req.body;
    
    if(!id){
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findById(id);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const updateData = {};
    if(name) updateData.name = name;
    if(email) {
        if(!email.endsWith('@rtu.ac.in')){
            throw new ApiError(400, "Email must be from @rtu.ac.in domain");
        }
        updateData.email = email;
    }
    if(role) {
        if(!['student', 'teacher'].includes(role)){
            throw new ApiError(400, "Invalid role. Must be student or teacher");
        }
        updateData.role = role;
    }
    if(isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if(branch !== undefined) updateData.branch = branch;
    if(sem !== undefined) updateData.sem = sem;
    if(rollno !== undefined) updateData.rollno = rollno;
    if(password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {new: true}).select("-password");

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { user: updatedUser },
            "User updated successfully"
        )
    )
})

// Delete user
const deleteUser = asyncHandler(async(req,res)=>{
    const { id } = req.body;
    
    if(!id){
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findById(id);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // Prevent deleting yourself
    if(user._id.toString() === req.user._id.toString()){
        throw new ApiError(400, "You cannot delete your own account");
    }

    await User.findByIdAndDelete(id);

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "User deleted successfully"
        )
    )
})

// ============ PERIOD MANAGEMENT ============

// Get all original periods
const getAllOriginalPeriods = asyncHandler(async(req,res)=>{
    const { day, branch, sem } = req.query;
    let query = {};
    
    if(day) query.day = day;
    if(branch) query.branch = branch.toLowerCase();
    if(sem) query.sem = parseInt(sem);
    
    const periods = await OriginalPeriod.find(query)
        .populate('teacher', 'name email')
        .sort({ day: 1, startTime: 1 });
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { periods },
            "Periods fetched successfully"
        )
    )
})

// Get all today periods
const getAllTodayPeriods = asyncHandler(async(req,res)=>{
    const { branch, sem } = req.query;
    let query = {};
    
    if(branch) query.branch = branch.toLowerCase();
    if(sem) query.sem = parseInt(sem);
    
    const periods = await TodayPeriod.find(query).sort({ startTime: 1 });
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { periods },
            "Today periods fetched successfully"
        )
    )
})

// Admin can create original period
const createOriginalPeriod = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const { periodName, teacherId, teacherName, roomNo, startTime, endTime, branch, batch, sem, day } = req.body;
    
    if(!periodName || !teacherName || !roomNo || !startTime || !endTime || !branch || !sem || !day){
        throw new ApiError(400, "All required fields must be provided");
    }

    // Find teacher if teacherId provided
    let teacher = null;
    if(teacherId){
        teacher = await User.findById(teacherId);
        if(!teacher || teacher.role !== 'teacher'){
            throw new ApiError(404, "Teacher not found");
        }
    } else {
        // Try to find teacher by name
        teacher = await User.findOne({ name: teacherName.toLowerCase(), role: 'teacher' });
    }

    const period = await OriginalPeriod.create({
        periodName,
        teacher: teacher?._id || null,
        teacherName,
        roomNo,
        startTime,
        endTime,
        branch,
        batch: batch || "",
        sem,
        day
    });

    const createdPeriod = await OriginalPeriod.findById(period._id).populate('teacher', 'name email');

    return res.status(201)
    .json(
        new ApiResponse(
            201,
            { period: createdPeriod },
            "Period created successfully"
        )
    )
})

// Admin can update any period
const updateOriginalPeriodAdmin = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const { id, periodName, teacherId, teacherName, roomNo, startTime, endTime, branch, batch, sem, day } = req.body;
    
    if(!id){
        throw new ApiError(400, "Period ID is required");
    }

    const period = await OriginalPeriod.findById(id);
    if(!period){
        throw new ApiError(404, "Period not found");
    }

    const updateData = {};
    if(periodName) updateData.periodName = periodName;
    if(teacherName) updateData.teacherName = teacherName;
    if(roomNo) updateData.roomNo = roomNo;
    if(startTime) updateData.startTime = startTime;
    if(endTime) updateData.endTime = endTime;
    if(branch) updateData.branch = branch;
    if(batch !== undefined) updateData.batch = batch;
    if(sem) updateData.sem = sem;
    if(day) updateData.day = day;

    if(teacherId){
        const teacher = await User.findById(teacherId);
        if(teacher && teacher.role === 'teacher'){
            updateData.teacher = teacher._id;
        }
    }

    const updatedPeriod = await OriginalPeriod.findByIdAndUpdate(id, updateData, {new: true})
        .populate('teacher', 'name email');

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { period: updatedPeriod },
            "Period updated successfully"
        )
    )
})

// Admin can delete any period
const deleteOriginalPeriodAdmin = asyncHandler(async(req,res)=>{
    const { id } = req.body;
    
    if(!id){
        throw new ApiError(400, "Period ID is required");
    }

    const period = await OriginalPeriod.findByIdAndDelete(id);
    if(!period){
        throw new ApiError(404, "Period not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { period },
            "Period deleted successfully"
        )
    )
})

// ============ SPECIAL EVENT MANAGEMENT ============

// Get all special events
const getAllSpecialEvents = asyncHandler(async(req,res)=>{
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

    const events = await SpecialEvent.find(query)
        .populate('teacher', 'name email')
        .sort({ date: 1, startTime: 1 });

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { events },
            "Special events fetched successfully"
        )
    )
})

// Admin can create special event
const createSpecialEventAdmin = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const { eventName, description, date, startTime, endTime, roomNo, branch, sem, isForAll, teacherId } = req.body;
    
    if(!eventName || !date || !startTime || !endTime){
        throw new ApiError(400, "Event name, date, start time, and end time are required");
    }

    let teacher = req.user;
    let teacherName = req.user.name;

    if(teacherId){
        const foundTeacher = await User.findById(teacherId);
        if(foundTeacher && foundTeacher.role === 'teacher'){
            teacher = foundTeacher;
            teacherName = foundTeacher.name;
        }
    }

    const eventData = {
        eventName,
        description: description || "",
        teacher: teacher._id,
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
        eventData.branch = branch && Array.isArray(branch) ? branch : (branch ? [branch] : ["all"]);
        eventData.sem = sem && Array.isArray(sem) ? sem : (sem ? [sem] : []);
    }

    const newEvent = await SpecialEvent.create(eventData);

    return res.status(201)
    .json(
        new ApiResponse(
            201,
            { event: newEvent },
            "Special event created successfully"
        )
    )
})

// Admin can update any event
const updateSpecialEventAdmin = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const { id, eventName, description, date, startTime, endTime, roomNo, branch, sem, isForAll, teacherId } = req.body;
    
    if(!id){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await SpecialEvent.findById(id);
    if(!event){
        throw new ApiError(404, "Event not found");
    }

    const updateData = {};
    if(eventName) updateData.eventName = eventName;
    if(description !== undefined) updateData.description = description;
    if(date) updateData.date = new Date(date);
    if(startTime) updateData.startTime = startTime;
    if(endTime) updateData.endTime = endTime;
    if(roomNo !== undefined) updateData.roomNo = roomNo;
    if(isForAll !== undefined) updateData.isForAll = isForAll;

    if(teacherId){
        const teacher = await User.findById(teacherId);
        if(teacher && teacher.role === 'teacher'){
            updateData.teacher = teacher._id;
            updateData.teacherName = teacher.name;
        }
    }

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

    const updatedEvent = await SpecialEvent.findByIdAndUpdate(id, updateData, {new: true})
        .populate('teacher', 'name email');

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { event: updatedEvent },
            "Event updated successfully"
        )
    )
})

// Admin can delete any event
const deleteSpecialEventAdmin = asyncHandler(async(req,res)=>{
    const { id } = req.body;
    
    if(!id){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await SpecialEvent.findByIdAndDelete(id);
    if(!event){
        throw new ApiError(404, "Event not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { event },
            "Event deleted successfully"
        )
    )
})

// ============ NOTIFICATION MANAGEMENT ============

// Get all notifications
const getAllNotifications = asyncHandler(async(req,res)=>{
    const { active } = req.query;
    let query = {};
    
    if(active === 'true'){
        const now = new Date();
        query.startDate = { $lte: now };
        query.endDate = { $gte: now };
    }
    
    const notifications = await Notification.find(query)
        .populate('createdBy', 'name email')
        .sort({ isImportant: -1, createdAt: -1 });
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { notifications },
            "Notifications fetched successfully"
        )
    )
})

// Create notification
const createNotification = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const { title, description, startDate, endDate, isImportant } = req.body;
    
    if(!title || !description || !startDate || !endDate){
        throw new ApiError(400, "Title, description, start date, and end date are required");
    }

    const notification = await Notification.create({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isImportant: isImportant || false,
        createdBy: req.user._id,
        createdByName: req.user.name
    });

    const createdNotification = await Notification.findById(notification._id)
        .populate('createdBy', 'name email');

    return res.status(201)
    .json(
        new ApiResponse(
            201,
            { notification: createdNotification },
            "Notification created successfully"
        )
    )
})

// Update notification
const updateNotification = asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const { id, title, description, startDate, endDate, isImportant } = req.body;
    
    if(!id){
        throw new ApiError(400, "Notification ID is required");
    }

    const notification = await Notification.findById(id);
    if(!notification){
        throw new ApiError(404, "Notification not found");
    }

    const updateData = {};
    if(title) updateData.title = title;
    if(description) updateData.description = description;
    if(startDate) updateData.startDate = new Date(startDate);
    if(endDate) updateData.endDate = new Date(endDate);
    if(isImportant !== undefined) updateData.isImportant = isImportant;

    const updatedNotification = await Notification.findByIdAndUpdate(id, updateData, {new: true})
        .populate('createdBy', 'name email');

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { notification: updatedNotification },
            "Notification updated successfully"
        )
    )
})

// Delete notification
const deleteNotification = asyncHandler(async(req,res)=>{
    const { id } = req.body;
    
    if(!id){
        throw new ApiError(400, "Notification ID is required");
    }

    const notification = await Notification.findByIdAndDelete(id);
    if(!notification){
        throw new ApiError(404, "Notification not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { notification },
            "Notification deleted successfully"
        )
    )
})

// ============ DASHBOARD STATS ============

// Get dashboard statistics
const getDashboardStats = asyncHandler(async(req,res)=>{
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const totalOriginalPeriods = await OriginalPeriod.countDocuments();
    const totalTodayPeriods = await TodayPeriod.countDocuments();
    const totalSpecialEvents = await SpecialEvent.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    
    const activeNotifications = await Notification.countDocuments({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
    });

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                stats: {
                    totalUsers,
                    totalStudents,
                    totalTeachers,
                    totalAdmins,
                    totalOriginalPeriods,
                    totalTodayPeriods,
                    totalSpecialEvents,
                    totalNotifications,
                    activeNotifications
                }
            },
            "Dashboard stats fetched successfully"
        )
    )
})

export {
    // User Management
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    // Period Management
    getAllOriginalPeriods,
    getAllTodayPeriods,
    createOriginalPeriod,
    updateOriginalPeriodAdmin,
    deleteOriginalPeriodAdmin,
    // Event Management
    getAllSpecialEvents,
    createSpecialEventAdmin,
    updateSpecialEventAdmin,
    deleteSpecialEventAdmin,
    // Notification Management
    getAllNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    // Dashboard
    getDashboardStats
}

