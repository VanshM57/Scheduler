import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true,
        index: true
    },
    endDate: {
        type: Date,
        required: true,
        index: true
    },
    isImportant: {
        type: Boolean,
        default: false,
        index: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdByName: {
        type: String,
        required: true,
        trim: true
    }
},{
    timestamps: true
})

export const Notification = mongoose.model('Notification', notificationSchema);

