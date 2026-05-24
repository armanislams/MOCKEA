import Trainer from "../model/trainer.js";

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
export const getTrainers = async (req, res, next) => {
  try {
    const trainers = await Trainer.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: trainers.length,
      trainers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new trainer
// @route   POST /api/trainers/add
// @access  Private/Admin
export const postTrainer = async (req, res, next) => {
  try {
    const { name, email, specialty, experience, bio, imageUrl, rating } = req.body;

    // Validation
    if (!name || !email || !specialty || !experience || !bio) {
      return res.status(400).json({
        success: false,
        message: "Please provide Name, Email, Specialty, Experience, and Bio.",
      });
    }

    // Check if trainer exists
    const trainerExists = await Trainer.findOne({ email });
    if (trainerExists) {
      return res.status(409).json({
        success: false,
        message: "A trainer with this email already exists.",
      });
    }

    const trainer = await Trainer.create({
      name,
      email,
      specialty,
      experience,
      bio,
      imageUrl: imageUrl || "",
      rating: rating !== undefined ? Number(rating) : 5.0,
    });

    res.status(201).json({
      success: true,
      message: "Trainer added successfully!",
      trainer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a trainer
// @route   DELETE /api/trainers/:id
// @access  Private/Admin
export const deleteTrainer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    await Trainer.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Trainer deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};
