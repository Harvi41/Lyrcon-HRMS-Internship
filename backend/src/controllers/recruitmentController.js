const Recruitment = require('../models/Recruitment');

const recruitmentController = {
    createJobOpening: async (req, res) => {
        try {
            const newCandidate = new Recruitment({ 
                ...req.body, 
                createdBy: req.user?.userId || req.user?.id 
            });
            await newCandidate.save();
            return res.status(201).json({ message: "Candidate application logged.", data: newCandidate });
        } catch (error) {
            console.error("Recruitment creation entry error:", error);
            return res.status(500).json({ message: "Failed to add candidate log entry.", error: error.message });
        }
    },

    getJobOpenings: async (req, res) => {
        try {
            let candidates = await Recruitment.find().sort({ createdAt: -1 });

            if (candidates.length === 0) {
                candidates = await Recruitment.insertMany([
                    { name: "Amit Sharma", position: "MERN Stack Engineer", status: "Shortlisted" },
                    { name: "Priya Patel", position: "UI/UX Designer", status: "Interview", interviewDate: new Date() },
                    { name: "Rohan Shah", position: "QA Automation Lead", status: "Pending" }
                ]);
            }

            return res.status(200).json(candidates);
        } catch (error) {
            console.error("Recruitment engine execution error:", error);
            return res.status(500).json({ message: "Failed to fetch candidate listings.", error: error.message });
        }
    }
};

module.exports = recruitmentController;