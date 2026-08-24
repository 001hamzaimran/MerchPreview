import { Router } from "express";
import {
  getConfigurations,
  getConfigurationByProduct,
  saveConfiguration,
  deleteConfiguration,
} from "../Controllers/Configuration.Controller.js";

const router = Router();

router.get("/", getConfigurations);
router.get("/:productId", getConfigurationByProduct);
router.post("/", saveConfiguration);
router.delete("/:id", deleteConfiguration);

export default router;
