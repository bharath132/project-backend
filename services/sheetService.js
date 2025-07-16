const { google } = require("googleapis");
const { auth } = require("../config/googleAuth.js");
const getISTTime = require("../utils/getISTTime.js").getISTTime;
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
async function appendToSheet(data) {
  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:B",
      valueInputOption: "RAW",
      resource: {
        values: [[getISTTime(), data]],
      },
    });
    console.log(" Appended to sheet:", data);
  } catch (err) {
    console.error(" Sheet error:", err.message);
  }
}

exports.getFromSheet = getFromSheet;
exports.appendToSheet = appendToSheet;
