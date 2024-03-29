const router = require("express").Router();
const controller = require("./controller");
const { tryCatch } = require("../../utils/tryCatch");

router.get("/all", tryCatch(controller.getAll));
router.get("/:id", tryCatch(controller.get));

router.post("/", tryCatch(controller.post));
router.put("/:id", tryCatch(controller.put));
router.delete("/:id", tryCatch(controller.del));

module.exports = router;
