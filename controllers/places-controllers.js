const HttpError = require("../models/http-error");
const { v4: uuid } = require("uuid");
const fs = require('fs');
const getCoordsForAddress = require("../util/location");
const { validationResult } = require("express-validator");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");
// let DUMMY_PLACES = [
//     {
//       id: 'p1',
//       title: 'Empire State Building',
//       description: 'One of the most famous sky scrapers in the world!',
//       location: {
//         lat: 40.7484474,
//         lng: -73.9871516
//       },
//       address: '20 W 34th St, New York, NY 10001',
//       creator: 'u1'
//     }
//   ];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("something failed", 500);
    return next(err);
  }
  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id", 404)
    );
  }
  res.json({ place: place.toObject({ getters: true }) }); //which give and removes the _ in id
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError("Fetching places failed,please try agian", 500);
    return next(error);
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id"),
      404
    );
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;
  // const title = req.body.title;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  //without database
  // const createdPlace = {
  //   id: uuid(),
  //   title,
  //   description,
  //   location: coordinates,
  //   address,
  //   creator
  // };
  // DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

  //with database
  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    image:req.file.path,
    address,
    creator:req.userData.userId,
  });
  let user;
  try {
    user = await User.findById(creator);
    if (!user) {
      const error = new HttpError("Could not find user for provided id", 404);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      "Could not find user for provided id,please try again",
      500
    );
    return next(error);
  }
  try {
    //await createdPlace.save()
    // const sess=await mongoose.startSession()
    // sess.startTransaction()
    // await createdPlace.save({session:sess})
    // user.places.push(createdPlace)
    // await user.save({session:sess})
    // await sess.commitTransaction()
    //without sessions
    await createdPlace.save();
    // Add the place to the user's places array
    user.places.push(createdPlace);
    await user.save();
  } catch (err) {
    console.error("Database Error:", err); // Log the actual error for debugging
    return next(
      new HttpError(
        "Place cannot be added, try again. Error: " + err.message,
        500
      )
    );
  }

  res.status(201).json({ place: createdPlace });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  // DUMMY_PLACES=DUMMY_PLACES.filter(p=>{
  //     return p.id!==deletePlace
  // })
  let place;
 
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  const imagePath=place.image
  if(place.creator.id!==req.userData.userId){
    const error = new HttpError("You are not allowed to delete the place", 401);
    return next(error);
  }
  try {
    // await place.remove()
    //with sessions
    // const sess=await mongoose.startSession()
    // sess.startTransaction()
    // await place.remove({session:sess})
    // place.creator.places.pull(place)
    // await place.creator.save({session:sess})
    // await sess.commitTransaction()

    place.creator.places.pull(place);
    await place.creator.save();
    await place.deleteOne({ _id: placeId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong,could not delete a place",
      500
    );
    return next(err);
  }
  fs.unlink(imagePath,err=>{
    console.log(err)
  })
  res.status(201).json({ message: "Place Deleted" });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Some field is missing please check properly", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  //without database
  // const updatedPlace={...DUMMY_PLACES.find(p=>p.id===placeId)}
  // const placeIndex=DUMMY_PLACES.findIndex(p=>p.id===placeId)
  // updatedPlace.title=title
  // updatedPlace.description=description
  // DUMMY_PLACES[placeIndex]=updatedPlace

  //with database
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong , could not save the place",
      500
    );
    return next(error);
  }
  if(place.creator.toString()!==req.userData.userId){
    const error = new HttpError(
      "Something went wrong , could not save the place",
      500
    );
    return next(error);
  }
  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong , could not save the place",
      500
    );
    return next(error);
  }
  res.status(201).json({ place: place.toObject({ getters: true }) });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
