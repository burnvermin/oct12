const express = require("express");
const app = express();
const port = process.env.PORT || 3000

//Parse the request Parameters
app.use(express.json())

//Connect to the database
const MongoClient = require('mongodb').MongoClient;

let db;
MongoClient.connect('mongodb+srv://KoningDavid:dgycHDuZ2mDZxfQ@cluster0.rjw7g.mongodb.net/databaseOne?retryWrites=true&w=majority',(err, client) => {
   db = client.db('persons')
})

//GET the collection name
app.param('collectionName', (request, response, next, collectionName) => {
    request.collection = db.collection(collectionName)
    return next()
});

//Core issue
app.use(function(request, response, next){
    response.header("Access-Control-Allow-Origin", "*");
    next()
}) 

// Display a message to show the API is working 
app.get('/', (request, response, next) => {
    response.send('Select a collection, e.g. /collection/messages')

});

//Retrive all items in a collection
app.get('/collection/:collectionName', (request, response, next) => {
    request.collection.find({}).toArray((e,results) => {
        response.send(results)
    })
});

app.post('/collection/:collectionName', (request, response, next ) => {
    request.collection.insert(request.body, (e, results) => {
        if(e) return  next(e)
        response.send(results.ops)
    })
});

const ObjectId = require('mongodb').ObjectId
app.get('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.findOne({_id: new ObjectId(request.params.id)}, (e, result) => {
        response.send(result)
    })
});

app.put('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.updateOne(
        {
            _id: new ObjectId(request.params.id)
        },
        {$set: request.body},
        {safe: true, multi: false},

        (e, result) => {
            if (e) return next(e)
            response.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
        }
    )
}); 

app.delete('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.deleteOne(
        {
            _id:ObjectId(request.params.id)
        },
        (e, results) => {
            if (e) return next (e)
            response.send((results.result.n === 1) ? {msg : 'Success'} : {msg : 'error'})
        }
    )
});

app.listen(port);
console.log('server running on port');