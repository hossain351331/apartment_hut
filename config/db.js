const mongoose = require('mongoose');
const config = require('config')
const db = config.get('mongoURI')
const connectDB = async()=>{
    try{
        await mongoose.connect(db,{
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndexes: true,
            useFindAndModify: false
        })
        console.log("Connected mongodb")
    }catch(err){
        console.log(err.message)
        process.exit(1)
    }
}
module.exports = connectDB;