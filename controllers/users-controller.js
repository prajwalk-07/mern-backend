const { v4: uuid } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const DUMMY_USERS = [
//   {
//     id: "u1",
//     name: "Prajwal",
//     email: "prajwal@gmail.com",
//     password: "prajwal",
//   },
// ];

const getUsers = async (req, res, next) => {
  // res.status(201).json({ users:DUMMY_USERS });
  // if (!users) {
  //   throw new HttpError("Could not find any users", 404);
  // }
  let users;
  try {
    users = await User.find({}, "email name places image"); //or  -password
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed , please try again",
      422
    );
    return next(error);
  }
  res
    .status(201)
    .json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  // const user = DUMMY_USERS.find((u) => {
  //   return u.email === email && u.password === password;
  // });
  // if (!user) {
  //   throw new HttpError("Could not find user for this email amd password", 404);
  // }
  let exisitngUser;
  try {
    exisitngUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signup failed ,please try again", 500);
    return next(error);
  }
  if (!exisitngUser) {
    const error = new HttpError("Invalid credentials,please login", 401);
    return next(error);
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, exisitngUser.password);
  } catch (err) {
    const error = new HttpError("Invalid credentials,please login", 500);
    return next(error);
  }
  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials,please login", 401);
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      {
        userId: exisitngUser.id,
        email: exisitngUser.email,
      },
      process.env.JWT_KEY,//should be same for signup and login
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("could not signup,please try again", 500);
    return next(error);
  }
  res.status(201).json({ userId:exisitngUser.id,email:exisitngUser.email,token:token });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Some field is missing please check properly", 422)
    );
  }
  const { email, password, name } = req.body;
  // const createUser = {
  //   id:uuid(),
  //   email,
  //   password,
  //   name,
  // };
  // DUMMY_USERS.push(createUser);
  // res.status(201).json({ message: "user created" });
  let exisitngUser;
  try {
    exisitngUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signup failed ,please try again", 500);
    return next(error);
  }
  if (exisitngUser) {
    const error = new HttpError("User already exisit,please login", 422);
    return next(error);
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Something went wrong ,please try again", 500);
    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    places: [],
    image: req.file.path,
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("could not signup,please try again", 500);
    return next(err);
  }
  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
      },
      process.env.JWT_KEY,//private key should be same for signup and login
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("could not signup,please try again", 500);
    return next(error);
  }
  res.status(201).json({ userId:createdUser.id,email:createdUser.email,token:token });
};
exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;
