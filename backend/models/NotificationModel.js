import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {type: String,required: true},

    message: {type: String,required: true},

    user: {type: mongoose.Schema.Types.ObjectId,ref: "user"},

    isRead: {type: Boolean,default: false}
  },
  { timestamps: true }
);

const Notification = mongoose.model("notification",notificationSchema
);

export default Notification;