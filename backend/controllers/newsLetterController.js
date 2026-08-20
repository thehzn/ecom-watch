import Newsletter from "../models/NewsletterModel.js";
import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";

export const subscribeNewsletter = async (req, res) => {
  try {
  const userId = req.user.id;

  const currentUser = await User.findById(userId);

  if (!currentUser) {
  return res.status(404).json({status: false,message: "User not found"})
  }

  const existingSubscriber = await Newsletter.findOne({user: userId });

  if (existingSubscriber) {
  return res.status(400).json({status: false,message: "You are already subscribed"});
  }

  const subscriber = await Newsletter.create({
    user: userId,
    email: currentUser.email
  });

  await Notification.create({
  type: "subscription",
  message: `${currentUser.firstName} ${currentUser.lastName} subscribed to the newsletter`,
  user: userId
 });

    return res.status(201).json({ status: true, message: "Newsletter subscription successful",
      subscriber: {
        id: subscriber._id,
        email: subscriber.email
       }
    });

  } catch (error) {
    return res.status(500).json({status: false, message: error.message
    });
  }
};