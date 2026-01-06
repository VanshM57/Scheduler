import mongoose, { Schema } from "mongoose";

const originalPeriodSchema = new Schema({
    periodName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacherName: {
        type: String, 
        required: true,
        lowercase: true,
        trim: true,
    },
    roomNo: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    startTime: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    endTime: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    branch: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    batch: {
        type: String,
        lowercase: true,
        trim: true,
    },
    sem: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    day: { 
        type: String, 
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], 
        required: true 
    },
})

export const OriginalPeriod = mongoose.model("OriginalPeriod", originalPeriodSchema);