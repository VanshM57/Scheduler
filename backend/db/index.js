import mongoose from 'mongoose'

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    }catch{
        console.log("Mongo Connection failed",error);
        process.exit(1);
    }
}

export default connectDB;