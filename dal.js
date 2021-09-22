

const { MongoClient } = require('mongodb');
let db = null
async function connect(){
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    try {
        await client.connect()
        listDatabases(client)
        db = client.db("atm")
    } catch (e) {
        console.error(e)
    } 
}
connect()

async function listDatabases(client){
    const databaseList = await client.db().admin().listDatabases();
}


function create(id,dateTime,routing,name,username,email,password,chkAcctNumber,savAcctNumber){
    return new Promise((resolve,reject)=>{
        let collection = db.collection('accounts')
        const doc = {
            id,
            role: 'customer',
            routing,
            name,
            username,
            email,
            password,
            pin: "",
            contact: {},
            balances:{
                checking:[{
                    acctName: "Main",
                    acctNumber: chkAcctNumber,
                    acctType: "basic",
                    balance:0
                }],
                savings:[{
                    acctName: "Main",
                    acctNumber: savAcctNumber,
                    acctType: "basic",
                    balance:0,
                    interestRate:0.1
                }],
                cards:[],
                coinWallets:[
                    {walletName: "React Crypto Wallet", walletType: "hot", coins:[]}
                ],
                investments:[]           
        },
            accountHistory:[
                {transID : `${id}opencheck`, username: username, dateTime:dateTime, info : {acctType: "checking",acctNumber: chkAcctNumber, type:'deposit',amount:0, newBalance: 0}},
                {transID : `${id}opensave`, username: username, dateTime:dateTime, info : {acctType: "savings",acctNumber: savAcctNumber, type:'deposit',amount:0, newBalance: 0}}
            ]
        }
        collection.insertOne(doc, {w:1}, function(err,result){
            err ? reject(err) : resolve(doc)
        })

    })
}

function getOneForAuth(username, password){
    return new Promise((resolve,reject)=>{
        console.log('getOneForAuth running', username)
        const accounts = db
                .collection('accounts')
                .findOne({username : {$eq:username},password : {$eq:password}},function(err,doc){
                    if(doc){
                        let newDoc = {exists:true, username:username, role: doc.role }
                        doc = newDoc
                        err ? reject(err) : resolve(doc)
                    }else{
                        let newDoc = {exists:false, username:null, role: null }
                        doc = newDoc
                        err ? reject(err) : resolve(doc)
                    }  
                })  
    })
}
function getOneForGoogleAuth(email){
    return new Promise((resolve,reject)=>{
        console.log('getOneForGoogleAuth running', email)
        const accounts = db
                .collection('accounts')
                .findOne({email : {$eq:email}},function(err,doc){
                    if(doc){
                        let newDoc = {exists:true, username:doc.username, role: doc.role }
                        doc = newDoc
                        err ? reject(err) : resolve(doc)
                    }else{
                        let newDoc = {exists:false, username:null, role: null }
                        doc = newDoc
                        err ? reject(err) : resolve(doc)
                    }  
                })  
    })
}

function getOneForAuthEmp(username, password){
    return new Promise((resolve,reject)=>{
        console.log('getOneForAuth running', username)
        const accounts = db
                .collection('employees')
                .findOne({username : {$eq:username},password : {$eq:password}},function(err,doc){
                    if(doc){
                        let newDoc = {exists:true, username:username, role: doc.role }
                        doc = newDoc
                        err ? reject(err) : resolve(doc)
                    }else{
                        let newDoc = {exists:false, username:null, role: null }
                        doc = newDoc
                        err ? reject(err) : resolve(doc)
                    }  
                })  
    })
}

function getOneForAuthATM(username, pin){
    return new Promise((resolve,reject)=>{
        console.log('getOneForAuthATM running', username)
        const accounts = db
                .collection('accounts')
                .findOne({username : {$eq:username},pin : {$eq:pin}},function(err,doc){
                    if(doc){
                        let newDoc = {exists:true, username:username, role: doc.role }
                        doc = newDoc
                        err ? reject(err) : resolve(doc)
                    }else{
                        let newDoc = {exists:false, username:null, role: null }
                        doc = newDoc
                        err ? reject(err) : resolve(doc)
                    }  
                })  
    })
}

function createEmp(id,dateTime,role,name,username,email,password){
    return new Promise((resolve,reject)=>{
        let collection = db.collection('employees')
        let currentDate = new Date()
        const doc = {id,clockedStatus: false,role,name,username,email,password,workHistory:[{id:"accountCreated", type:"accountCreate", dateTime: dateTime}]}
        collection.insertOne(doc, {w:1}, function(err,result){
            err ? reject(err) : resolve(doc)
        })

    })
}

function getNumber(id){
    return new Promise((resolve,reject)=>{
        const accounts = db
                .collection('internal')
                .findOne({id : {$eq:id}}, function(err,doc){
                    console.log("doc",doc)
                    err ? reject(err) : resolve(doc)
                })

    })
}

module.exports = {create, getOneForAuth, getOneForGoogleAuth, getOneForAuthATM, getOneForAuthEmp, createEmp, getNumber}
