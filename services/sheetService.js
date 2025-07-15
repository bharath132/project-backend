const { google } = require("googleapis");
const { auth } = require("../config/googleAuth.js");
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
async function getFromSheet() {
  try {
    await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth });
    const respond = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A:B",
    });
    sheetData = respond.data.values;
  } catch (err) {
    console.error("Error fetching data from sheet:", err.message);
  }
}

exports.getFromSheet = getFromSheet;