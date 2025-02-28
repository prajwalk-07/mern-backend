const express = require("express");
const router = express.Router();
const placesController = require("../controllers/places-controllers");
const { check } = require("express-validator");
const fileUpload =require('../middleware/file-upload')
const checkAuth=require('../middleware/check-auth')

router.get("/:pid", placesController.getPlaceById);
router.get("/user/:uid", placesController.getPlacesByUserId);
router.use(checkAuth)
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlace
);
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.createPlace
);
router.delete("/:pid", placesController.deletePlace);
module.exports = router;
