const express = require('express');
const connection = require('./config/db');
const port = process.env.PORT || 3000;
const app = express();
connection();
app.use(express.json({ extended: false }));
app.get('/', (req, res) => {
    res.send('API Running');
});

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

app.listen(port, () => {
    console.log('Server Started');
})