import express from "express";
import { promises as fs } from "fs";
import gradesRouter from "./routes/grades.js";

const app = express();
const { readFile, writeFile } = fs;

app.use(express.json());

app.listen(3000, async () => {
  try {
    await readFile("grades.json");
    console.log("API Iniciada, Arquivo Lido!");
  } catch (err) {
    console.log("Arquivo não encontrado ou erro ao iniciar o servidor");
  }
});

app.use("/grade", gradesRouter);
