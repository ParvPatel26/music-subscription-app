const express = require('express');

require('dotenv').config();

const cors = require('cors');

const bodyParser = require('body-parser');

const { errorHandler } =
    require('./MiddeleWare/errorMiddeleware');

const app = express();

const port = process.env.PORT || 3000;

app.use(cors({

    origin: "*",

    methods: ["GET", "POST", "DELETE"],

    allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

app.use(express.json());

app.use(express.urlencoded({
    extended: false
}));

app.get('/health', (req, res) => {

    res.status(200).json({
        status: "OK"
    });
});

app.use('/auth',
    require('./routes/authRoutes'));

app.use('/songs',
    require('./routes/songRoutes'));

app.use('/subscriptions',
    require('./routes/subscriptionRoutes'));

app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {

    console.log(
        `Server started on port ${port}`
    );
});