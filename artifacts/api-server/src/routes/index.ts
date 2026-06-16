import { Router, type IRouter } from "express";
import healthRouter from "./health";
import safetyRouter from "./safety";
import routesRouter from "./routes";
import sosRouter from "./sos";
import circleRouter from "./circle";
import guardianRouter from "./guardian";
import evidenceRouter from "./evidence";
import deepfakeRouter from "./deepfake";
import reportsRouter from "./reports";
import spacesRouter from "./spaces";
import assistantRouter from "./assistant";
import heatmapRouter from "./heatmap";
import dashboardRouter from "./dashboard";
import codewordsRouter from "./codewords";
import evidenceAiRouter from "./evidence-ai";
import memoryRouter from "./memory";

const router: IRouter = Router();

router.use(healthRouter);
router.use(safetyRouter);
router.use(routesRouter);
router.use(sosRouter);
router.use(circleRouter);
router.use(guardianRouter);
router.use(evidenceAiRouter);
router.use(evidenceRouter);
router.use(deepfakeRouter);
router.use(reportsRouter);
router.use(spacesRouter);
router.use(assistantRouter);
router.use(codewordsRouter);
router.use(heatmapRouter);
router.use(dashboardRouter);
router.use(memoryRouter);

export default router;
