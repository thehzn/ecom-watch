import Enquiry from "../models/EnquiryModel.js";
import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";


export const createEnquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const userId = req.user?.id;
    if (!subject || !message || (!userId && (!name || !email))) {
    return res.status(400).json({status: false,message: "Subject and message are required"});
    }

    let enquiryData = {
      name,
      email,
      subject,
      message
    };

    if (userId) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({status: false,message: "User not found"});
      }

      enquiryData.user = userId;
      enquiryData.name = `${user.firstName} ${user.lastName}`;
      enquiryData.email = user.email;
    }

    const enquiry = await Enquiry.create(enquiryData);

    const notification = await Notification.create({
      type: "enquiry",
      message: `${enquiry.name} submitted a new enquiry`,
      user: userId || undefined
    })
    console.log("ENQUIRY NOTIFICATION CREATED:", notification);

    return res.status(201).json({status: true,message: "Enquiry submitted successfully",enquiry});
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate("user", "firstName lastName email").sort({ createdAt: -1 });
    return res.status(200).json({status: true,message: "Enquiries fetched successfully",enquiries});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
}


export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
    return res.status(404).json({status: false,message: "Enquiry not found"});
    }

    if (enquiry.status === "Resolved") {
    return res.status(400).json({status: false,message: "Enquiry is already resolved"});
    }

    enquiry.status = "Resolved";
    await enquiry.save();
    return res.status(200).json({status: true,message: "Enquiry marked as resolved successfully",enquiry});

  } catch (error) {
    return res.status(500).json({status: false,message: error.message})
  }
}