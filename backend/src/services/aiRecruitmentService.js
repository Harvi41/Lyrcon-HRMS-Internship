const OpenAI = require('openai');

const RECOMMENDATIONS = ['Strong Fit', 'Good Fit', 'Average Fit', 'Weak Fit'];

const normalizeList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const clampScore = (score) => {
    const numericScore = Number(score);
    if (Number.isNaN(numericScore)) {
        return 0;
    }
    return Math.max(0, Math.min(100, Math.round(numericScore)));
};

const getRecommendation = (score) => {
    if (score >= 85) return 'Strong Fit';
    if (score >= 70) return 'Good Fit';
    if (score >= 45) return 'Average Fit';
    return 'Weak Fit';
};

const shouldUseOpenAI = () => {
    return process.env.USE_OPENAI_RECRUITMENT === 'true' && Boolean(process.env.OPENAI_API_KEY);
};

const extractRequiredSkills = (jobRequirements) => {
    const commonSkills = [
        'javascript', 'react', 'node', 'node.js', 'express', 'mongodb', 'mongoose',
        'html', 'css', 'python', 'java', 'sql', 'typescript', 'redux', 'api',
        'rest', 'git', 'docker', 'aws', 'testing', 'figma', 'ui', 'ux'
    ];
    const requirements = String(jobRequirements || '').toLowerCase();

    return commonSkills.filter((skill) => requirements.includes(skill));
};

const analyzeWithFallback = ({ resumeText, jobRequirements, skills }) => {
    const providedSkills = normalizeList(skills);
    const requiredSkills = extractRequiredSkills(jobRequirements);
    const candidateText = `${resumeText || ''} ${providedSkills.join(' ')}`.toLowerCase();
    const matchedSkills = requiredSkills.filter((skill) => candidateText.includes(skill));
    const missingSkills = requiredSkills.filter((skill) => !candidateText.includes(skill));
    const score = requiredSkills.length > 0
        ? clampScore((matchedSkills.length / requiredSkills.length) * 100)
        : 50;

    return {
        matchScore: score,
        matchedSkills,
        missingSkills,
        aiSummary: 'Free local matching was used. The score is based on skills found in the resume compared with the job requirements.',
        aiRecommendation: getRecommendation(score)
    };
};

const parseAIResponse = (response) => {
    const outputText = response.output_text;
    if (!outputText) {
        throw new Error('OpenAI returned an empty analysis response.');
    }

    const parsed = JSON.parse(outputText);
    const recommendation = RECOMMENDATIONS.includes(parsed.aiRecommendation)
        ? parsed.aiRecommendation
        : getRecommendation(parsed.matchScore);

    return {
        matchScore: clampScore(parsed.matchScore),
        matchedSkills: normalizeList(parsed.matchedSkills),
        missingSkills: normalizeList(parsed.missingSkills),
        aiSummary: String(parsed.aiSummary || '').trim(),
        aiRecommendation: recommendation
    };
};

const analyzeCandidate = async ({ resumeText, jobRequirements, skills }) => {
    if (!shouldUseOpenAI() || !resumeText || !jobRequirements) {
        return analyzeWithFallback({ resumeText, jobRequirements, skills });
    }

    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await client.responses.create({
            model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
            instructions: [
                'You are an HR recruitment assistant.',
                'Evaluate only job-relevant skills, experience, tools, projects, and responsibilities.',
                'Ignore protected or personal attributes such as age, gender, religion, caste, marital status, address, photo, disability, and nationality.',
                'Return a fair candidate-job fit analysis as strict JSON only.'
            ].join(' '),
            input: [
                `Job requirements:\n${jobRequirements}`,
                `Candidate skills:\n${normalizeList(skills).join(', ') || 'Not provided'}`,
                `Resume text:\n${resumeText}`
            ].join('\n\n'),
            text: {
                format: {
                    type: 'json_schema',
                    name: 'candidate_match',
                    strict: true,
                    schema: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            matchScore: {
                                type: 'number',
                                description: 'Overall candidate fit from 0 to 100.'
                            },
                            matchedSkills: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            missingSkills: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            aiSummary: {
                                type: 'string',
                                description: 'Short HR-friendly explanation of the candidate fit.'
                            },
                            aiRecommendation: {
                                type: 'string',
                                enum: RECOMMENDATIONS
                            }
                        },
                        required: ['matchScore', 'matchedSkills', 'missingSkills', 'aiSummary', 'aiRecommendation']
                    }
                }
            }
        });

        return parseAIResponse(response);
    } catch (error) {
        console.error('AI recruitment analysis failed:', error.message);
        return analyzeWithFallback({ resumeText, jobRequirements, skills });
    }
};

module.exports = { analyzeCandidate, normalizeList };
