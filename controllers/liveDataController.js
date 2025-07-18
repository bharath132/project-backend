const { getFromSheet } = require("../services/sheetService.js");
const { getLatestValue } = require("../utils/sharedData.js");
const downsampleTo10Seconds = require("../utils/downsample.js");
const dayjs = require("dayjs");
exports.getLiveData = async (req, res) => {
  let oneHourData = []
  const latestValue = getLatestValue();
  await getFromSheet();
  //filter and simplify the data
  let simplified = sheetData.filter(
    (data) => Number(data[1]) !== 0 && Number(data[1]) % 50 === 0
  );
  if (simplified.length > 25) {
    simplified = simplified.slice(-25).reverse();
  }
  const now = dayjs();
  const oneHourAgo = now.subtract(1, "hour");

  oneHourData = simplified.filter(([time, value]) => {
    const timestamp = dayjs(time);
    return timestamp.isAfter(oneHourAgo) && timestamp.isBefore(now);
  });

  // Get the last 3600 entries for ChartData
  ChartData = sheetData.slice(-3600);
  const reducedData = downsampleTo10Seconds(ChartData);
  res.json({
    userValue: `${latestValue}`,
    history: simplified.map(([time, value]) => ({
      time,
      value: Number(value),
    })),
    // ChartData: ChartData.map(([time, value]) => ({
    //   time: new Date(time).toLocaleString("sv-SE").replace(" ", "T"),
    //   value: Number(value),
    // })),
    ChartData: oneHourData.map(([time, value]) => ({
      time: new Date(time).toLocaleString("sv-SE").replace(" ", "T"),
      value: Number(value),
    })),
  });
};
