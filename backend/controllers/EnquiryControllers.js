import Enquiry from "../models/EnquiryModel.js";

export const createEnquiry = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    const userId = req.user?.id;
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        status: false,
        message: "All fields are required"
      });
    }

    const enquiryData = {
      name: `${firstName} ${lastName}`,
      email,
      subject,
      message
    };
    if (userId) {
      enquiryData.user = userId;
    }

    const enquiry = await Enquiry.create(enquiryData);
    return res.status(201).json({
      status: true,
      message: "Enquiry submitted successfully",
      enquiry
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
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