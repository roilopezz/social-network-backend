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
    // origin: "http://localhost:3000",
    origin: "https://tal-lopez.netlify.app",
    credentials: true,
    methods: ["POST"],
  })
);

const { PORT = 1337, SHEET = "1FSg3QFEPVETCtWX-OOcrUFcmFDd9YDvq8WRzAohBfAM" } =
  process.env;

app.post("/", async (req, res) => {
  if (!req.body.Name || !req.body.Phone || !req.body.Service) {
    return res.status(404).send("name phone and service is required");
  }

  try {
    const doc = new GoogleSpreadsheet(SHEET);
    const connectSheet = await doc.useServiceAccountAuth(creds);

    const loadInfo = await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const addRow = await sheet.addRow({ ...req.body });
    const saveRow = await sheet.saveUpdatedCells();

    res.send("The data was sent successfully");
  } catch (err) {
    res.send(err).status(404);
  }

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

app.listen(PORT, () => console.log(`running on ${PORT}`));
