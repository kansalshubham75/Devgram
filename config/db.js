const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connection = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify : false
        });

        console.log('Connected to Database');
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}



module.exports = connection;