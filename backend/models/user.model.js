import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: [true,'Password is required...']
    },
    rollno: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true
    },
    branch: {
        type: String,
        trim: true,
        required: true,
        index: true,
        lowercase: true
    },
    college: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        index: true
    },
    sem:{
        type: Number,
        min: 1,
        max: 8,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'], // Allowed values
        default: 'student' // Default value
    },
},{
    timestamps: true
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    next()
});

userSchema.methods.generateAccessToken = function(){
    const payload = {
        _id: this._id,
        email: this.email,
        name: this.name,
        rollno: this.rollno
    }
    const token = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "1d"
        }
    );
    return token;
}


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

export const User = mongoose.model("User",userSchema)