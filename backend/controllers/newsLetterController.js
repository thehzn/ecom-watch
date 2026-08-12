import Newsletter from "../models/NewsletterModel.js";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
    return res.status(400).json({status: false,message: "Email is required"});
    }

    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
    return res.status(400).json({status: false,message: "Email is already subscribed"});
    }

    const subscriber = await Newsletter.create({ email });
    return res.status(201).json({status: true,message: "Newsletter subscription successful",
      subscriber: {
        id: subscriber._id,
        email: subscriber.email,
      },
    });
  } catch (error) {
    return res.status(500).json({status: false,message: error.message});
  }
};