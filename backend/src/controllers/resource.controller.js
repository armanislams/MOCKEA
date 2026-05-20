import Resource from "../model/Resource.js";

// Helper to seed default resources if collection is empty
const seedDefaultResources = async () => {
  const defaults = [
    {
      title: "Ultimate IELTS Vocabulary E-Book",
      description: "Boost your lexical resource score with 500+ high-band academic words, contextual sentences, and practice exercises categorized by frequent topics.",
      ctaText: "Download E-Book",
      link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      category: "Vocabulary",
      fileType: "PDF",
      size: "4.8 MB",
      downloadCount: 1420,
    },
    {
      title: "10 Templates for Writing Task 2",
      description: "Master opinion, discussion, and double-question essay structures with professional templates, outline guides, and cohesive linking devices.",
      ctaText: "Download Templates",
      link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
      category: "Writing Guide",
      fileType: "PDF",
      size: "2.3 MB",
      downloadCount: 980,
    },
    {
      title: "Band 8+ Speaking Test Crib Sheet",
      description: "Complete cue-card cheat sheets, starter phrases for Part 1-3, and speaking transition formulas to ensure highly fluent and natural responses.",
      ctaText: "Get Crib Sheet",
      link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
      category: "Speaking Templates",
      fileType: "PDF",
      size: "1.5 MB",
      downloadCount: 1750,
    },
  ];

  await Resource.insertMany(defaults);
};

export const getAllResources = async (req, res) => {
  try {
    let resources = await Resource.find().sort({ createdAt: -1 });
    
    if (resources.length === 0) {
      await seedDefaultResources();
      resources = await Resource.find().sort({ createdAt: -1 });
    }
    
    res.status(200).json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const incrementDownload = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    res.status(200).json({ success: true, downloadCount: resource.downloadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    res.status(200).json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    res.status(200).json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
