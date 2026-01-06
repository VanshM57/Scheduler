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
        unique: true,
        validate: {
            validator: function(v) {
                return v.endsWith('@rtu.ac.in');
            },
            message: 'Email must be from @rtu.ac.in domain'
        }
    },
    password: {
        type: String,
        required: [true,'Password is required...']
    },
    rollno: {
        type: String,
        required: false,
        trim: true,
        index: true,
        lowercase: true
    },
    branch: {
        type: String,
        trim: true,
        required: false,
        index: true,
        lowercase: true
    },
    college: {
        type: String,
        trim: true,
        required: false,
        lowercase: true,
        index: true
    },
    sem:{
        type: Number,
        min: 1,
        max: 8,
        required: false
    },
    role: {
        type: String,
        enum: ['student', 'teacher'], // Only student and teacher roles
        default: 'student' // Default value
    },
    isAdmin: {
        type: Boolean,
        default: false,
        index: true
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