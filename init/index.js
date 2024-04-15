const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust2";

async function main() {
    await mongoose.connect(MONGO_URL);
};
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
   await Listing.deleteMany({});
   initData.data = initData.data.map((obj) => ({...obj, owner: '65fc08ee1426da36e9ae2203',geometry :{
    type: "Point",
    coordinates: [77.1025, 28.7041]
   }}));
   await Listing.insertMany(initData.data);
   console.log("data was initialized")
};

initDB();