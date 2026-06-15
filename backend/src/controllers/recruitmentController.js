const Recruitment = require('../models/Recruitment');
const { analyzeCandidate, normalizeList } = require('../services/aiRecruitmentService');

const recruitmentController = {
    createJobOpening: async (req, res) => {
        try {
            const skills = normalizeList(req.body.skills);
            const aiResult = await analyzeCandidate({
                resumeText: req.body.resumeText,
                jobRequirements: req.body.jobRequirements,
                skills
            });

            const newCandidate = new Recruitment({ 
                ...req.body,
                skills,
                ...aiResult,
                status: req.body.status || (aiResult.matchScore >= 70 ? 'Review' : 'Pending'),
                createdBy: req.user?.userId || req.user?.id 
            });
            await newCandidate.save();
            return res.status(201).json({ message: "Candidate application analyzed and logged.", data: newCandidate });
        } catch (error) {
            console.error("Recruitment creation entry error:", error);
            return res.status(500).json({ message: "Failed to add candidate log entry.", error: error.message });
        }
    },

    getJobOpenings: async (req, res) => {
        try {
            let candidates = await Recruitment.find().sort({ matchScore: -1, createdAt: -1 });

            if (candidates.length === 0) {
                candidates = await Recruitment.insertMany([
                    {
                        name: "Amit Sharma",
                        position: "MERN Stack Engineer",
                        status: "Shortlisted",
                        experience: "3 Years",
                        skills: ["React", "Node.js", "MongoDB"],
                        matchScore: 88,
                        matchedSkills: ["React", "Node.js", "MongoDB"],
                        missingSkills: ["Docker"],
                        aiRecommendation: "Strong Fit",
                        aiSummary: "Strong MERN profile with most core requirements covered."
                    },
                    {
                        name: "Priya Patel",
                        position: "UI/UX Designer",
                        status: "Interview",
                        interviewDate: new Date(),
                        experience: "2 Years",
                        skills: ["Figma", "UX Research", "Prototyping"],
                        matchScore: 76,
                        matchedSkills: ["Figma", "UX"],
                        missingSkills: ["React"],
                        aiRecommendation: "Good Fit",
                        aiSummary: "Good design profile with relevant product workflow experience."
                    },
                    {
                        name: "Rohan Shah",
                        position: "QA Automation Lead",
                        status: "Pending",
                        experience: "4 Years",
                        skills: ["Testing", "Selenium", "API"],
                        matchScore: 64,
                        matchedSkills: ["Testing", "API"],
                        missingSkills: ["JavaScript"],
                        aiRecommendation: "Average Fit",
                        aiSummary: "Relevant QA background, but some role-specific skills are missing."
                    }
                ]);
                candidates = candidates.sort((candidateA, candidateB) => candidateB.matchScore - candidateA.matchScore);
            }

            return res.status(200).json(candidates);
        } catch (error) {
            console.error("Recruitment engine execution error:", error);
            return res.status(500).json({ message: "Failed to fetch candidate listings.", error: error.message });
        }
    },

    updateCandidateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            console.log('Update request - ID:', id, 'Status:', status);

            if (!status) {
                return res.status(400).json({ message: "Status is required." });
            }

            const validStatuses = ['Applied', 'Review', 'Shortlisted', 'Interview', 'Hired', 'Rejected', 'Pending'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            }

            const updatedCandidate = await Recruitment.findByIdAndUpdate(
                id,
                { status },
                { returnDocument: 'after', runValidators: true }
            );

            console.log('Updated candidate:', updatedCandidate);

            if (!updatedCandidate) {
                return res.status(404).json({ message: "Candidate not found." });
            }

            return res.status(200).json({ message: "Candidate status updated successfully.", data: updatedCandidate });
        } catch (error) {
            console.error("Failed to update candidate status:", error);
            return res.status(500).json({ message: "Failed to update candidate status.", error: error.message });
        }
    }
};

module.exports = recruitmentController;
