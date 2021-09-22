const jwt = require('jsonwebtoken')
const express = require('express');
var dal = require('./dal.js')
var bodyParser = require("body-parser")
const cors = require('cors');
const app = express();
var jsonParser = bodyParser.json()


let port = process.env.PORT || 9002;


const accessSecret = process.env.JWT_ACCESS_KEY;
const refreshSecret = process.env.JWT_REFRESH_KEY;

const refreshTokens = [];

const allowedOrigins = ['http://localhost:3000','https://ipfs.io', 'https://samantics.tez.page'];

const options = {
  origin: allowedOrigins
};

// Then pass these options to cors:
app.use(cors(options));

app.use(express.json());

app.post('/login', jsonParser, async (req, res) => {
    // read username and password from request body
    const { username, password } = req.body;
    //filter user from the users array by username and password
    const user = await dal.getOneForAuth(username,password)
    console.log("user in dal:",user)

    if (user.exists === true) {
        // generate an access token
        const accessToken = jwt.sign({ username: user.username, role: user.role, googleAuth: false }, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: user.username, role: user.role, googleAuth: false }, refreshSecret);

        refreshTokens.push(refreshToken);

        res.json({
            accessToken,
            refreshToken
        });
    } else {
        res.send('Username or password incorrect');
    }
});

app.post('/loginGoogle', jsonParser, async (req, res) => {
    // read username and password from request body
    const { email } = req.body;
    //verify google token

    //then
    //filter user from the users array by username and password
    const user = await dal.getOneForGoogleAuth(email)
    console.log("user in dal:",user)

    if (user.exists === true) {
        // generate an access token
        const accessToken = jwt.sign({ username: user.username, role: user.role, googleAuth: true }, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: user.username, role: user.role, googleAuth: true }, refreshSecret);

        refreshTokens.push(refreshToken);

        res.json({
            accessToken,
            refreshToken
        });
    } else {
        res.send('Username or password incorrect');
    }
});

app.post('/loginemp', jsonParser, async (req, res) => {
    // read username and password from request body
    const { username, password } = req.body;
    //filter user from the users array by username and password
    const user = await dal.getOneForAuthEmp(username,password)

    if (user.exists === true) {
        // generate an access token
        const accessToken = jwt.sign({ username: user.username, role: user.role, googleAuth: false }, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: user.username, role: user.role, googleAuth: false }, refreshSecret);

        refreshTokens.push(refreshToken);

        res.json({
            accessToken,
            refreshToken
        });
    } else {
        res.send('Username or password incorrect');
    }
});

app.post('/loginatm', jsonParser, async (req, res) => {
    // read username and password from request body
    const { username, pin } = req.body;
    console.log("variables:",username, pin)
    //filter user from the users array by username and password
    const user = await dal.getOneForAuthATM(username,pin)

    if (user.exists === true) {
        // generate an access token
        const accessToken = jwt.sign({ username: user.username, role: user.role, googleAuth: false }, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: user.username, role: user.role, googleAuth: false }, refreshSecret);

        refreshTokens.push(refreshToken);

        res.json({
            accessToken,
            refreshToken
        });
    } else {
        res.send('Username or pin incorrect');
    }
});

app.post('/createuser', jsonParser, async (req, res) => {
    // read username and password from request body
    const { input } = req.body;
    console.log("input",input)
    //filter user from the users array by username and password
    let account = await dal.create(
        input.id,
        input.dateTime,
        input.routing,
        input.name,
        input.username,
        input.email,
        input.password,
        input.chkAcctNumber,
        input.savAcctNumber
        )
    if (account) {
        // generate an access token
        const accessToken = jwt.sign({ username: input.username, role: "" }, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: input.username, role: "" }, refreshSecret);
    
        refreshTokens.push(refreshToken);
    
        res.json({
                accessToken,
                refreshToken
            });
    } else {
            res.send('Could not create account');
    }
});

app.post('/createemp', jsonParser, async (req, res) => {
    // read username and password from request body
    const { input } = req.body;
    console.log("input",input)
    //filter user from the users array by username and password
    let employee = await dal.createEmp(
        input.id,
        input.dateTime,
        input.role,
        input.name,
        input.username,
        input.email,
        input.password
        )
    if (employee) {
        // generate an access token
        const accessToken = jwt.sign({ username: input.username, role: "" }, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: input.username, role: "" }, refreshSecret);
    
        refreshTokens.push(refreshToken);
    
        res.json({
                accessToken,
                refreshToken
            });
    } else {
            res.send('Could not create account');
    }
});

app.post('/token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }

    jwt.verify(token, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret, { expiresIn: '15m' });

        res.json({
            accessToken
        });
    });
});

app.post('/number', jsonParser, async(req,res)=>{
    let number = await dal.getNumber(req.body.id)
    console.log("number",number)
    res.send(number)
});

app.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(token => t !== token);

    res.send("Logout successful");
});

app.listen(port, function () {
    console.log(`Running on port ${port}`);
});