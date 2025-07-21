const { getFromSheet } = require("../services/sheetService.js");
const { getLatestValue } = require("../utils/sharedData.js");
const downsampleTo10Seconds = require("../utils/downsample.js");
const dayjs = require("dayjs");
const { sheets } = require("googleapis/build/src/apis/sheets/index.js");
let sheetData = [];
let ChartData = [];
exports.getLiveData = async (req, res) => {

  const Value = getLatestValue();
  await getFromSheet();
  //filter and simplify the data
  let simplified = sheetData.filter(
    (data) => Number(data[1]) !== 0 && Number(data[1]) % 50 === 0
  );
  const ChartData2 = simplified
  if (simplified.length > 25) {
    simplified = simplified.slice(-25).reverse();
  }

const ONE_HOUR = 60 * 60 * 1000;
const oneHourAgoUTC = Date.now() - ONE_HOUR;

const oneHourData = ChartData2.filter(([timestamp, value]) => {
  // Convert IST to UTC by subtracting 5.5 hours (19800 seconds = 19800000 ms)
  const istDate = new Date(timestamp);
  const utcTime = istDate.getTime() - 5.5 * 60 * 60 * 1000;

  return utcTime > oneHourAgoUTC;
});

  // Get the last 60 entries for ChartData
  ChartData = sheetData.slice(-60);
  const reducedData = downsampleTo10Seconds(ChartData);
  res.json({
    userValue: `${Value}`,
    history: simplified.map(([time, value]) => ({
      time,
      value: Number(value),
    })),
    ChartData: ChartData.map(([time, value]) => ({
      time: new Date(time).toLocaleString("sv-SE").replace(" ", "T"),
      value: Number(value),
    })),
    // ChartData: oneHourData.map(([time, value]) => ({
    //   time: new Date(time).toLocaleString("sv-SE").replace(" ", "T"),
    //   value: Number(value),
    // })),
   
  });
};
