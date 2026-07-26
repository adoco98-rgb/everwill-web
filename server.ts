import express from "express";
import { createServer } from "node:http";
import { configureApp } from "./server/_core/index";

const app = express();
await configureApp(app, createServer(app));

export default app;
