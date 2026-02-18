import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import serverConfig from "./config/server.config";
import apiRoutes from "./routes";

const app: Express = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use("/api", apiRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.listen(serverConfig.PORT, () => {
  console.log("Server is running on", serverConfig.PORT);
});
