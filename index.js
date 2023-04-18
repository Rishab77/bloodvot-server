const conn =
  "mongodb+srv://newa:XLSgse64YwLIhAIn@cluster0.uvkdvzd.mongodb.net/?retryWrites=true&w=majority";
const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const userProfileSchema = new mongoose.Schema({
  userId: String,
  bloodType: String,
  fullName: String,
  age: String,
  location: String,
  frequency: String,
  longitude: String,
  latitude: String,
});
const DonationCenterSchema = new mongoose.Schema({
  userId: String,
  fullName: String,
  phone: String,
  location: String,
});
const DonationHistorySchema = new mongoose.Schema({
  userId: String,
  date: String,
  location: String,
  fullName: String,
});

const User = mongoose.model("User", userSchema);
const UserProfile = mongoose.model("UserProfile", userProfileSchema);
const DonationCenter = mongoose.model("DonationCenter", DonationCenterSchema);
const DonationHistory = mongoose.model(
  "DonationHistory",
  DonationHistorySchema
);

mongoose
  .connect(conn, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(3000, () => {
      console.log("Listening on 3000");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });
app.get("/", (req, res) => {
  const bloodType = req.query.bloodType;
  res.json({ message: bloodType });
});
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email, password })
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      res.status(200).json({ email: user.email, user: user._id });
    })
    .catch((error) => {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    });
});

app.post("/api/addbloodgroup", (req, res) => {
  const { userId, bloodType } = req.body;
  const newUserProfile = new UserProfile({ userId, bloodType });

  newUserProfile
    .save()
    .then(() => {
      console.log("Profile Updated");
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.error("Error creating user profile:", err);
      res.status(500).json({ error: "Failed to create user profile" });
    });
});

app.post("/api/addprofile", async (req, res) => {
  const { userId } = req.body;

  try {
    console.log(userId, req.body);
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { "_id:": req.params.id }, // Filter by userId
      { $set: req.body }, // Update the document with the request body
      { new: true } // Return the updated document
    );
    res.json(updatedProfile);
  } catch (err) {
    console.error("Error updating user profile", err);
    res.status(500).send("Error updating user profile");
  }
});
app.post("/api/addDonationCenter", (req, res) => {
  const newUserProfile = new DonationCenter(req.body);

  newUserProfile
    .save()
    .then(() => {
      console.log("Added Donation Center");
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.error("Error creating user profile:", err);
      res.status(500).json({ error: "Failed to create user profile" });
    });
});
app.get("/api/getprofile", async (req, res) => {
  const { userId } = req.body;
  try {
    const userProfile = await UserProfile.findOne({ userId });
    console.log(userProfile);
    if (!userProfile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(userProfile);
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).send("Error retrieving user profile");
  }
});
app.get("/api/getallprofile", async (req, res) => {
  try {
    const userProfile = await UserProfile.find();
    if (!userProfile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(userProfile);
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).send("Error retrieving user profile");
  }
});
app.get("/api/getblood", async (req, res) => {
  const bloodType = req.query.bloodType;

  try {
    const userProfiles = await UserProfile.find({ bloodType });

    if (userProfiles.length === 0) {
      res
        .status(404)
        .json({ error: "No users found with the specified blood type" });
      return;
    }

    res.json(userProfiles);
  } catch (err) {
    console.error("Error retrieving user profiles:", err);
    res.status(500).send("Error retrieving user profiles");
  }
});
app.get("/api/getDonationCenter", async (req, res) => {
  try {
    const donationCenter = await DonationCenter.find();

    if (donationCenter.length === 0) {
      res
        .status(404)
        .json({ error: "No users found with the specified blood type" });
      return;
    }

    res.json(donationCenter);
  } catch (err) {
    console.error("Error retrieving user profiles:", err);
    res.status(500).send("Error retrieving user profiles");
  }
});
app.get("/api/getRegisterDonation", async (req, res) => {
  console.log(req.query)
  console.log(req.query.userId)
  try {
    const donationCenter = await DonationHistory.find({userId:req.query.userId});

    if (donationCenter.length === 0) {
      res
        .status(404)
        .json({ error: "No users found with the specified blood type" });
      return;
    }

    res.json(donationCenter);
  } catch (err) {
    console.error("Error retrieving user profiles:", err);
    res.status(500).send("Error retrieving user profiles");
  }
});
app.post("/api/registerDonation", (req, res) => {
  const newUserProfile = new DonationHistory(req.body);

  newUserProfile
    .save()
    .then(() => {
      console.log("Added Donation History");
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.error("Error creating user profile:", err);
      res.status(500).json({ error: "Failed to create user profile" });
    });
});

app.put("/api/updateprofile/", async (req, res) => {
  const { userId } = req.body;
  const updates = req.body;

  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    );
    if (!updatedProfile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(updatedProfile);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).send("Error updating user profile");
  }
});

app.post("/api/createuser", (req, res) => {
  const { email, password } = req.body;
  const newUser = new User({ email, password });

  newUser
    .save()
    .then(() => {
      console.log("New user created:", newUser);
      res.status(200).json({ email: newUser.email, user: newUser._id });
    })
    .catch((err) => {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Failed to create user" });
    });
});

app.listen(3001, () => {
  console.log("Listening on 3001");
});
