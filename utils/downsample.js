const dayjs = require("dayjs");

function downsampleTo10Seconds(data) {
  const result = [];
  for (let i = 0; i < data.length; i += 3) {
    const group = data.slice(i, i + 3);
    const values = group.map(d => Number(d[1])).filter(v => !isNaN(v));
    if (values.length === 0) continue;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const rawTime = group[group.length - 1][0];
    const formattedTime = dayjs(rawTime).format("YYYY-MM-DDTHH:mm:ss");
    result.push({ time: formattedTime, value: Math.round(avg) });
  }
  return result;
}

module.exports = downsampleTo10Seconds;
