const jwt = require('jsonwebtoken')
const express = require('express');
var dal = require('./dal.js')
var bodyParser = require("body-parser")
const cors = require('cors');
const app = express();
var jsonParser = bodyParser.json()
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express')

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'Full Stack Auth Server',
        version: '1.0.0',
      },
    },
    apis: ['authlocal.js'], // files containing annotations as above
  };
  
  const swaggerDocs = swaggerJsdoc(swaggerOptions);


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

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

/**
 * @swagger
 * /login:
 *  post:
 *      summary: Verify username and password as existing customers
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: login
 *          description: The user's username and password
 *          schema:
 *              type: object
 *              required:   
 *                  - username
 *                  - password
 *              properties:
 *                  username:
 *                      type: string
 *                  password:
 *                      type: string
 *      responses:
 *          200:
 *              description: Will return JWT auth token and refresh token if user found/ return "Username or password does not exist" otherwise
 */

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

/**
 * @swagger
 * /loginGoogle:
 *  post:
 *      summary: Verify returned email address from Google OAuth
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: loginGoogle
 *          description: The user's email return from Google OAuth
 *          schema:
 *              type: object
 *              required:   
 *                  - email
 *              properties:
 *                  email:
 *                      type: string
 *      responses:
 *          200:
 *              description: Will return JWT auth token and refresh token if user found/ return "make account" otherwise
 */

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
        res.send('make account');
    }
});

/**
 * @swagger
 * /loginemp:
 *  post:
 *      summary: Verify username and password as existing employees
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: loginemp
 *          description: The employee's username and password
 *          schema:
 *              type: object
 *              required:   
 *                  - username
 *                  - password
 *              properties:
 *                  username:
 *                      type: string
 *                  password:
 *                      type: string
 *      responses:
 *          200:
 *              description: Will return JWT auth token and refresh token if user found/ return "Username or password does not exist" otherwise
 */

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

/**
 * @swagger
 * /loginatm:
 *  post:
 *      summary: Verify username and pin as existing customers
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: loginatm
 *          description: The user's username and pin
 *          schema:
 *              type: object
 *              required:   
 *                  - username
 *                  - pin
 *              properties:
 *                  username:
 *                      type: string
 *                  pin:
 *                      type: string
 *      responses:
 *          200:
 *              description: Will return JWT auth token and refresh token if user found/ return "Username or password does not exist" otherwise
 */

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

/**
 * @swagger
 * /createuser:
 *  post:
 *      summary: Creates new customer object and sends to database, creates temporary JWT with username but no role
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: createuser
 *          description: The user's info for account you are creating
 *          schema:
 *              type: object
 *              required:   
 *                  - id
 *                  - dateTime
 *                  - routing
 *                  - name
 *                  - username
 *                  - email
 *                  - password
 *                  - chkAcctNumber
 *                  - savAcctNumber
 *              properties:
 *                  id:
 *                      type: string
 *                  dateTime:
 *                      type: string
 *                  routing:
 *                      type: integer
 *                  name:
 *                      type: string
 *                  username:
 *                      type: string
 *                  email:
 *                      type: string
 *                  password:
 *                      type: string
 *                  chkAcctNumber:
 *                      type: number
 *                  savAcctNumber:
 *                      type: number
 *      responses:
 *          200:
 *              description: Will return temp JWT auth token and refresh token when user created
 */

app.post('/createuser', jsonParser, async (req, res) => {
    // read username and password from request body
    const { input, google } = req.body;
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
        let accessToken, refreshToken;
        if(google === false){
            accessToken = jwt.sign({ username: input.username, role: "",  googleAuth: false }, accessSecret, { expiresIn: '15m' });
            refreshToken = jwt.sign({ username: input.username, role: "",  googleAuth: false }, refreshSecret);
        }else{
            accessToken = jwt.sign({ username: input.username, role: "",  googleAuth: true }, accessSecret, { expiresIn: '15m' });
            refreshToken = jwt.sign({ username: input.username, role: "",  googleAuth: true }, refreshSecret);
        }
        refreshTokens.push(refreshToken);
    
        res.json({
                accessToken,
                refreshToken
            });
    } else {
            res.send('Could not create account');
    }
});

/**
 * @swagger
 * /createemp:
 *  post:
 *      summary: Creates new employee object and sends to database, creates temporary JWT with username but no role
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: createemp
 *          description: The employee's info for account you are creating
 *          schema:
 *              type: object
 *              required:   
 *                  - id
 *                  - dateTime
 *                  - role
 *                  - name
 *                  - username
 *                  - email
 *                  - password
 *              properties:
 *                  id:
 *                      type: string
 *                  dateTime:
 *                      type: string
 *                  role:
 *                      type: string
 *                  name:
 *                      type: string
 *                  username:
 *                      type: string
 *                  email:
 *                      type: string
 *                  password:
 *                      type: string
 *      responses:
 *          200:
 *              description: Will return temp JWT auth token and refresh token when user created
 */

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

/**
 * @swagger
 * /token:
 *  post:
 *      summary: refreshes JWT
 *      responses:
 *          200:
 *              description: Sucess
 */

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

/**
 * @swagger
 * /number:
 *  post:
 *      summary: get next issued number from database collection
 *      consumes:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: number
 *          description: Id of collection you want number from
 *          schema:
 *              type: object
 *              required:   
 *                  - id
 *              properties:
 *                  id:
 *                      type: string
 *      responses:
 *          200:
 *              description: Will return object containing number and equation to gen next number
 */

app.post('/number', jsonParser, async(req,res)=>{
    let number = await dal.getNumber(req.body.id)
    console.log("number",number)
    res.send(number)
});

/**
 * @swagger
 * /logout:
 *  post:
 *      summary: logout and erase all active refresh tokens
 *      responses:
 *          200:
 *              description: Sucess
 */

app.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(token => t !== token);

    res.send("Logout successful");
});

app.listen(port, function () {
    console.log(`Running on port ${port}`);
});