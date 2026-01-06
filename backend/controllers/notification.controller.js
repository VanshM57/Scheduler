import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

// Get active notifications for students and teachers
const getActiveNotifications = asyncHandler(async(req,res)=>{
    const now = new Date();
    
    const notifications = await Notification.find({
        startDate: { $lte: now },
        endDate: { $gte: now }
    })
    .populate('createdBy', 'name email')
    .sort({ isImportant: -1, createdAt: -1 });
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            { notifications },
            "Active notifications fetched successfully"
        )
    )
})

export { getActiveNotifications };

