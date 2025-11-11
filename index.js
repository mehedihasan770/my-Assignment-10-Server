const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k3g2gk9.mongodb.net/?appName=Cluster0`
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const homeHeroService = client.db('homeHeroService')
    const services = homeHeroService.collection('services')
    const bookings = homeHeroService.collection('bookings')

    app.get('/services', async(req, res) => {
        const email = req.query.email;
        const query = {};
        if(email){
            query.provider_email = email;
        }
        const cursor = services.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await services.findOne(query);
      res.send(result)
    })

    app.post('/services', async(req, res) => {
        const newServices = req.body;
        const result = await services.insertOne(newServices)
        res.send(result)
    })

    app.put('/services/:id', async(req, res) => {
        const id = req.params.id;
        const putServices = req.body;
        const query = {_id: new ObjectId(id)};
        const update = {$set: putServices};
        const result = await services.updateOne(query, update);
        res.send(result)
    })

    app.put('/services/:id/review', async (req, res) => {
      const id = req.params.id;
      const review = req.body;
      const query = {_id: new ObjectId(id)}
      const pushReview = {
        $push: {reviews: review}
      }
      const result = await services.updateOne(query, pushReview)
      res.send(result)
    })

    app.get('/service/filter', async(req, res) => {
      const min = parseFloat(req.query.min);
      const max = parseFloat(req.query.max);
      const query = {};
      if(min && max){
        query.service_Price = {$gte: min, $lte: max}
      }
      const result = await services.find(query).toArray()
      res.send(result)
    })

    app.get('/average_top_rating', async (req, res) => {
      const query = services.aggregate([
        {$addFields: {avaregRating : {$avg:"$reviews.rating"}}},
        { $sort: { avaregRating: -1 } },
        { $limit: 6 }
      ])
      const result =await query.toArray()
      res.send(result);
    })

    app.delete('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await services.deleteOne(query);
        res.send(result)
    })

    app.get('/bookings', async(req, res) => {
      const email = req.query.email;
      const query = {};
      if(email){
        query.email = email;
      }
      const cursor = bookings.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/bookings', async(req, res) => {
      const newBooking = req.body;
      const result = await bookings.insertOne(newBooking);
      res.send(result);
    })

    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookings.deleteOne(query);
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally { }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('My Assignment 10 Server in running😎😎😎')
})

app.listen(port, () => {
    console.log('server running port', port)
})