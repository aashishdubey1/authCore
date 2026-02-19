import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import serverConfig from "./config/server.config";
import apiRoutes from "./routes";

const app: Express = express();

const corsOptions = {
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use(cors(corsOptions));

app.use("/api", apiRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.listen(serverConfig.PORT, () => {
  console.log("Server is running on", serverConfig.PORT);
});
