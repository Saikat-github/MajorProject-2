const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router.route("/")
   .get(wrapAsync (listingController.index))
   .post( 
    isLoggedIn, 
    upload.array('listing[image]', 3),
    validateListing, 
    wrapAsync (listingController.createListing));
  
  //New Route
  router.get("/new", isLoggedIn, listingController.getNewForm);
  router.get("/search", listingController.searchListing);

  router.route("/:id")
  .get(wrapAsync (listingController.showListing))
  .put(
   isLoggedIn,
   isOwner, 
   upload.array('listing[image]', 3),
   validateListing, 
   wrapAsync (listingController.updateListing))
  .delete(
    isLoggedIn, 
    isOwner,
    wrapAsync (listingController.destroyListing))

  //Edit route
  router.get("/:id/edit",
    isLoggedIn, 
    isOwner,
    wrapAsync (listingController.getEditForm));
  

  module.exports = router;