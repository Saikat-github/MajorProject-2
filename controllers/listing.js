const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});
const ExpressError = require("../utils/ExpressError.js")


module.exports.index = async (req, res) => {
    let allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings});
};


module.exports.getNewForm = (req, res) => { 
    res.render("listings/new.ejs");
};


module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id)
    .populate({
      path: "reviews", 
      populate: {
        path: "author",
      }
    })
    .populate("owner");
    if(!listing) {
      req.flash("error", "Listing does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};


module.exports.getEditForm = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing) {
      req.flash("error", "Listing does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
};



module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
      })
      .send()

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.geometry = response.body.features[0].geometry

    if(req.files.length == 3) {
      for(file of req.files) {
        let url = file.path;
        let filename = file.filename;
        newListing.image.push({url, filename});
      }
    } else {
      req.flash("error","You have to upload all 3 images");
      return res.redirect("/listings/new");
    }
    
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};



module.exports.updateListing = async (req, res) => {
    if(!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    };
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing})
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
      })
      .send()
    listing.geometry = response.body.features[0].geometry

    if(req.files.length != 0) {
      if(req.files.length == 3) {
        listing.image.splice(0)
        for(file of req.files) {
          let url = file.path;
          let filename = file.filename;
          listing.image.push({url, filename});
        }
      } else {
        req.flash("error","You have to upload all 3 images");
        return res.redirect(`/listings/${id}/edit`);
      }
    }

    let editListing = await listing.save();
    console.log(editListing);
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
};



module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};


module.exports.searchListing = async (req, res) => {
  let {country} = req.query;
  let listings = await Listing.find({country: country});
  res.render("listings/search.ejs", {listings})
};