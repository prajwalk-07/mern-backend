const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const userController = require("../controllers/users-controller");
const fileUpload=require('../middleware/file-upload')
router.get("/", userController.getUsers);
router.post("/login", userController.login);
router.post(
  "/signup",
  fileUpload.single("image"), 
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userController.signup
);

module.exports = router;
