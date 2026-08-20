import Notification from "../models/NotificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate("user", "firstName lastName email").sort({ createdAt: -1 });

    return res.status(200).json({status: true,notifications
    });

  } catch (error) {
    return res.status(500).json({status: false,message: error.message });
  }
}



export const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({isRead: false});

    return res.status(200).json({status: true,count});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message
    });
  }
}


export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(id,{ isRead: true },{returnDocument: "after" });

    if (!notification) {
    return res.status(404).json({status: false,message: "Notification not found" });
    }

    return res.status(200).json({ status: true, message: "Notification marked as read", notification});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message });
  }
}