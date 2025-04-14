import mongoose, { Schema } from "mongoose";

const todayPeriodScheme = new Schema({
    periodName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
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
    isClassCancelled: {
        type: Boolean,
        default: false
    },
    updatedBy: {
        type: String,
        lowercase: true,
        trim: true,
        default: ""
    }
},{
    timestamps: true
})

export const TodayPeriod = mongoose.model('TodayPeriod', todayPeriodScheme);