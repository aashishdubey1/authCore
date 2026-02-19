import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import serverConfig from "./server.config";

const adapter = new PrismaPg({ connectionString: serverConfig.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export default prisma;
