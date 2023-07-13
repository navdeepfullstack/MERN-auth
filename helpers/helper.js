const nodemailer = require("nodemailer");

module.exports = {
  unixTimestamp: function () {
    var time = Date.now();
    var n = time / 1000;
    return (time = Math.floor(n));
  },
  sendMail: async (email, subject, text) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "e8e9d8dbfc81cb",
          pass: "bc08d1d47eb804",
        },
      });
      const options = () => {
        return {
          from: "ankit.kumar@iapptechnologiesllp.com",
          to: email,
          subject: subject,
          text: text,
        };
      };
      transporter.sendMail(options(), (error, info) => {
        if (error) {
          console.log("ERROR", error);
          return error;
        } else {
          console.log("SUCCESS");
          return true;
        }
      });
    } catch (error) {
      return error;
    }
  },
  error: async function (res, err, req) {
    console.log("----------", err, "===========================>error");

    let code = typeof err === "object" ? (err.code ? err.code : 400) : 400;
    let message =
      typeof err === "object" ? (err.message ? err.message : "") : err;

    if (req) {
      req.flash("flashMessage", {
        color: "error",
        message,
      });

      const originalUrl = req.originalUrl.split("/")[1];
      return res.redirect(`/${originalUrl}`);
    }

    return res.status(code).json({
      success: false,
      message: message,
      code: code,
      body: null,
    });
  },
  success: function (res, message = "", body = {}) {
    return res.status(200).json({
      success: true,
      code: 200,
      message: message,
      body: body,
    });
  },
};
