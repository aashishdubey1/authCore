import type { Request } from "express";
import { UAParser } from "ua-parser-js";

export function getClientInfo(req: Request) {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress ||
    req.ip;

  const userAgent = req.headers["user-agent"] || "unknown";

  const { browser, os, device } = UAParser(userAgent);

  const deviceInfo = `${browser.name ?? "Unknown"} ${
    browser.version ?? ""
  } on ${os.name ?? "Unknown"} ${os.version ?? ""} ${
    device.model ?? "Unknown"
  }`;

  return { ip, deviceInfo, userAgent };
}
