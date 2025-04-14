import mongoose from 'mongoose';

const Schema = mongoose.Schema;
 
const blacklistTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours in seconds
    }
});

const BlacklistTokenModel = mongoose.model('BlacklistToken', blacklistTokenSchema);

export default BlacklistTokenModel