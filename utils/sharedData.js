let lastReceivedValue = 0;

function setLatestValue(value) {
  lastReceivedValue = value;
}

function getLatestValue() {
  return lastReceivedValue;
}

exports.getLatestValue = getLatestValue;
exports.setLatestValue = setLatestValue;