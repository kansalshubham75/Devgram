const express = require('express');
const connection = require('./config/db');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const cors=require('cors');
const port = 5000;
const app = express();
app.use(cors());
// connection();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db=require('./config/keys').mongoURI;

mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// app.use((req,res,next)=>{
//     res.header('Access-Control-Allow-Origin','*');
// });
// app.get('/', (req, res) => {
//     res.send('API Running');
// });

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

app.listen(port, () => {
    console.log('Server Started');
})