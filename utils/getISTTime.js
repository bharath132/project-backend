exports.getISTTime = function () {
  const utcDate = new Date();

  return utcDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "numeric",
  });
};
