const router = require("express").Router();
const controller = require("./controller");
const { tryCatch } = require("../../../utils/tryCatch");

// GET

router.get("/:id", tryCatch(controller.getById));
router.get("/date/:date", tryCatch(controller.getByDate));

// POST, PUT, DEL

router.post("/", tryCatch(controller.createEvent));
router.put("/:id", tryCatch(controller.updateEvent));
router.delete("/:id", tryCatch(controller.deleteEvent));

// APARTMENTS

router.get("/apartments/:id", tryCatch(controller.getApartments));
router.put("/apartments/:id", tryCatch(controller.updateApartments));

module.exports = router;
