const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const helper = require("../helpers/helper");
const {loginValidation}= require('../helpers/validation')

require("dotenv").config();

const signup = async (req, res) => {
  try {
   
    const { email, username, password, dob, country, gender, phone } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      throw "User already exists";
    }

    user = await User.findOne({ phone });

    if (user) {
      throw "Phone number already exists";
    }

    let login_time = helper.unixTimestamp();

    let salt = await bcrypt.genSalt(+process.env.BCRYPT_SALT_HASH_ROUNDS);
    let hashPassword = await bcrypt.hash(password, salt);

    let createUser = await User.create({
      email,
      username,
      password: hashPassword,
      dob,
      country,
      gender,
      phone,
      login_time,
    });

    return helper.success(res, "User registered successfully", {
      user: createUser,
    });
  } catch (error) {
    return helper.error(res, error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw "User not found";
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw "Incorrect password";
    }

    const login_time = helper.unixTimestamp();

    await User.updateOne({ _id: user._id }, { login_time });

    const payload = {
      id: user._id,
      login_time,
    };

    const token = await jwt.sign(payload, process.env.SECRET_OR_KEY);

    return helper.success(res, "User logged in successfully", {
      user,
      token,
    });
  } catch (error) {
    return helper.error(res, error);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization.substring(7);
    const decode = jwt.decode(token);

    const user = await User.findById(decode.id);
    console.log(user);

    if (!user) {
      throw "User not found";
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log(isMatch);
    if (!isMatch) {
      throw "Incorrect current password";
    }

    const salt = await bcrypt.genSalt(+process.env.BCRYPT_SALT_HASH_ROUNDS);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;
    await user.save();

    return helper.success(res, "Password updated successfully", {});
  } catch (error) {
    console.log(error);
    return helper.error(res, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.substring(7);
    const decoded = jwt.decode(token);
    const userId = decoded.id;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw "User not found";
    }

    const emailExists = await User.exists({
      email: req.body.email,
      _id: { $ne: userId },
    });
    if (emailExists) {
      throw "Email already exists";
    }

    const phoneExists = await User.exists({
      phone: req.body.phone,
      _id: { $ne: userId },
    });
    if (phoneExists) {
      throw "Phone number already exists";
    }

    const updateUserDetails = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    return helper.success(res, "Profile updated", { user: updateUserDetails });
  } catch (error) {
    console.log(error);
    return helper.error(res, error);
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Please provide an email.");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User does not exist.");
    }
    let payload = {
      id: user._id,
      login_time: user.login_time,
    };

    let token = jwt.sign(payload, process.env.SECRET_OR_KEY);

    // Compose the password reset link with the reset token
    const resetLink = `https://example.com/reset-password?token=${token}`;

    // Send the email with the reset link
    const emailPayload = helper.sendMail(
      email,
      "Password Reset Link",
      resetLink
    );

    if (emailPayload) {
      return helper.success(
        res,
        "Password reset link sent to your email address."
      );
    } else {
      throw new Error("Failed to send email.");
    }
  } catch (error) {
    console.log(error);
    return helper.error(res, error.message);
  }
};
const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw "User not found";
    } else {
      if (newPassword != confirmPassword) {
        throw "Password didn't match";
      } else {
        const salt = await bcrypt.genSalt(+process.env.BCRYPT_SALT_HASH_ROUNDS);
        const hashPassword = await bcrypt.hash(confirmPassword, salt);
        user.password = hashPassword;
        await user.save();
        return helper.success(res, "Password updated", {});
      }
    }
  } catch (error) {
    console.log(error);
    return helper.error(res, error);
  }
};

const socialLogin = async (req, res) => {
  try {
    const login_time = helper.unixTimestamp();
    const { social_id, email } = req.body;

    if (email) {
      const checkUser = await User.findOne({ email, social_id });
      if (!checkUser) {
        const updateUser = await User.findOneAndUpdate(
          { email },
          { social_id, login_time },
          { new: true }
        );
        let payload = {
          id: updateUser._id,
          login_time,
        };
        let token = jwt.sign(payload, process.env.SECRET_OR_KEY);
        return helper.success(res, "User logged in successfully", {
          token,
          user: updateUser,
        });
      } else {
        let payload = {
          id: checkUser._id,
          login_time,
        };
        let token = jwt.sign(payload, process.env.SECRET_OR_KEY);
        return helper.success(res, "User logged in successfully", {
          token,
          user: checkUser,
        });
      }
    } else {
      const checkUser = await User.findOne({ social_id });
      if (checkUser) {
        let payload = {
          id: checkUser._id,
          login_time,
        };
        let token = jwt.sign(payload, process.env.SECRET_OR_KEY);
        return helper.success(res, "User logged in successfully", {
          token,
          user: checkUser,
        });
      } else {
        const newUserCreate = new User({
          ...req.body,
          login_time: login_time,
        });
        const saveUser = await newUserCreate.save();
        let payload = {
          id: saveUser._id,
          login_time,
        };
        let token = jwt.sign(payload, process.env.SECRET_OR_KEY);
        return helper.success(res, "User logged in successfully", {
          token,
          user: saveUser,
        });
      }
    }
  } catch (error) {
    return helper.error(res, error);
  }
};
const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
 

    const user = await User.findById(userId);
    if (!user) {
      throw "User not exist.";
    } else {
      return helper.success(res, "User profile", { user });
    }
  } catch (error) {
    return helper.error(res, error);
  }
};

module.exports = {
  signup,
  login,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  socialLogin,
  getProfile,
};
