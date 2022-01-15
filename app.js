const { GoogleSpreadsheet } = require("google-spreadsheet");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const creds = require("./client_secret.json");
const cors = require("cors");
require("dotenv").config();

app.use(
  cors({
    credentials: true,
    origin: "https://tal-lopez.netlify.app/",
  })
);

const { PORT = 1337, SHEET = "1FSg3QFEPVETCtWX-OOcrUFcmFDd9YDvq8WRzAohBfAM" } =
  process.env;

app.post("/", async (req, res) => {
  const doc = new GoogleSpreadsheet(SHEET);
  await doc.useServiceAccountAuth(creds);

  await doc.loadInfo(); // loads document properties and worksheets
  console.log(doc.title);

  const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

  let t = await sheet.addRow({ ...req.body });

  await sheet.saveUpdatedCells();
  res.send("The data was sent successfully");

  //   (method) GoogleSpreadsheetWorksheet.addRow(values: {
  //     [header: string]: string | number | boolean;
  // } | (string | number | boolean)[], options?: {
  //     raw: boolean;
  //     insert: boolean;
  // })

  //   await doc.updateProperties({ title: 'renamed doc' });

  //   const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  //   console.log(sheet.title);
  //   console.log(sheet.rowCount);

  //   // adding / removing sheets
  //   const newSheet = await doc.addSheet({ title: 'hot new sheet!' });
  //   await newSheet.delete();
});

app.listen(PORT, (req, res) => console.log("running on 1337"));
