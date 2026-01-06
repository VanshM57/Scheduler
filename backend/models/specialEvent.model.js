import mongoose, { Schema } from "mongoose";

const specialEventSchema = new Schema({
    eventName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacherName: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    startTime: {
        type: String,
        required: true,
        trim: true,
    },
    endTime: {
        type: String,
        required: true,
        trim: true,
    },
    roomNo: {
        type: String,
        trim: true,
        default: ""
    },
    branch: {
        type: [String], // Array to support multiple branches or "all"
        default: ["all"]
    },
    sem: {
        type: [Number], // Array to support multiple semesters or "all"
        default: [] // Empty means all semesters
    },
    isForAll: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

export const SpecialEvent = mongoose.model('SpecialEvent', specialEventSchema);

