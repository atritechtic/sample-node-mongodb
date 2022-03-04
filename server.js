const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// Connect Database
connectDB();

// Init Middleware
//app.use(express.json({ extended: false }));
app.use(express.json());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/bookings', require('./routes/api/bookings'));
app.use('/api/company', require('./routes/api/company'));
app.use('/api/messages', require('./routes/api/messages'));
app.use('/api/services', require('./routes/api/services'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/reviews', require('./routes/api/reviews'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
	// Set static folder
	app.use(express.static('client/build'));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
