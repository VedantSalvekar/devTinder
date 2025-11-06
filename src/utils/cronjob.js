const cron = require("node-cron");

cron.schedule("* * * * *", () => {
  try {
  } catch (err) {
    console.error(err);
  }
});
