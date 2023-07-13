const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    username: {
      type: String,

      default: "",
    },
    email: {
      type: String,

      default: "",
    },
    password: {
      type: String,

      default: "",
    },
    dob: {
      type: String,

      default: "",
    },
    gender: {
      type: String,
      required: false,
      default: "",
    },
    country: {
      type: String,

      default: "",
    },
    phone: {
      type: String,

      unqiue: true,
    },

    login_time: {
      type: String,

      default: "",
    },
    social_id:{
      type:String,
      default: "",
    }
  },
  { timestamps: true }
);



module.exports = User = mongoose.model("users", UserSchema);
