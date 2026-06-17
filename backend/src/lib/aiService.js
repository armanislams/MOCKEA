import dotenv from 'dotenv';
dotenv.config();

/**
 * Isolated service to evaluate IELTS submissions using Gemini 2.5 Flash.
 * Implemented using Node's native fetch (requires Node 18+) to maintain zero-dependencies.
 */
class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  /**
   * Evaluates an IELTS Writing task essay.
   * 
   * @param {string} essayContent The student's submitted essay text.
   * @param {string} questionTitle The title of the question or prompt.
   * @param {string} testType 'writing' (Writing module).
   * @returns {Promise<object>} Detailed grading analysis.
   */
  async evaluateWriting(essayContent, questionTitle = "IELTS Academic Writing Essay") {
    if (!this.apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to realistic simulated mock grading.");
      return this.getMockWritingFeedback(essayContent);
    }

    const systemPrompt = `
You are an expert, highly strict IELTS Writing Examiner. You evaluate submissions with professional precision in complete alignment with the official IELTS grading descriptors.
Analyze the student's submitted essay and calculate their band score (0-9 scale, typically increments of 0.5 like 6.5, 7.0, 7.5).

Evaluate the following essay:
- **IELTS Prompt / Title**: "${questionTitle}"
- **Student Submission**:
"""
${essayContent}
"""

You MUST respond with a valid, clean JSON object. Ensure that there are no markdown boxes (no triple backticks), just a raw JSON string that can be parsed by JSON.parse. The JSON schema must strictly contain:
{
  "bandScore": "7.0",
  "criteriaScores": {
    "taskAchievement": 7.0,
    "coherenceCohesion": 6.5,
    "lexicalResource": 7.0,
    "grammaticalRange": 7.5
  },
  "feedback": "A summary of the overall performance. Highlighting positive aspects and grammar choices.",
  "improvements": [
    "A specific piece of actionable advice to raise the score.",
    "Another targeted suggestion about cohesion or sentence structure."
  ],
  "corrections": [
    {
      "originalText": "The exact sentence containing the error",
      "correctedText": "The corrected sentence",
      "explanation": "Brief explanation of the grammatical or vocabulary mistake"
    }
  ]
}
`;

    return this.callGemini(systemPrompt);
  }

  /**
   * Evaluates an IELTS Speaking task recording/transcript.
   * 
   * @param {string} speakTranscript The transcription of the student's speech (or placeholders).
   * @param {string} cueCardPrompt The title or text of the cue card prompt.
   * @returns {Promise<object>} Detailed grading analysis.
   */
  async evaluateSpeaking(speakTranscript, cueCardPrompt = "IELTS Speaking Cue Card") {
    if (!this.apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to realistic simulated mock grading.");
      return this.getMockSpeakingFeedback(speakTranscript);
    }

    const systemPrompt = `
You are an expert, highly strict IELTS Speaking Examiner. You evaluate speaking transcripts with professional precision in complete alignment with the official IELTS speaking descriptors.
Analyze the student's transcribed speech and calculate their band score (0-9 scale, typically increments of 0.5).

Evaluate the following transcription:
- **Speaking Cue Card / Prompt**: "${cueCardPrompt}"
- **Transcribed Speech**:
"""
${speakTranscript}
"""

You MUST respond with a valid, clean JSON object. Ensure that there are no markdown boxes, just a raw JSON string that can be parsed by JSON.parse. The JSON schema must strictly contain:
{
  "bandScore": "6.5",
  "criteriaScores": {
    "fluencyCoherence": 6.5,
    "lexicalResource": 7.0,
    "grammaticalRange": 6.0,
    "pronunciation": 7.0
  },
  "feedback": "A summary of the candidate's coherence, pace, and grammar choices.",
  "improvements": [
    "Specific tip on how to reduce pauses or fillers.",
    "A grammar/vocabulary expansion suggestion."
  ],
  "corrections": [
    {
      "originalText": "Segment of speech with grammatical issues or hesitation",
      "correctedText": "The corrected phrasing",
      "explanation": "Why this change improves their speaking band score"
    }
  ]
}
`;

    return this.callGemini(systemPrompt);
  }

  /**
   * Internal helper to make the REST call to Gemini 2.5 Flash API.
   */
  async callGemini(promptText) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error (HTTP ${response.status}): ${errorText}`);
      }

      const resJson = await response.json();
      const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        throw new Error("Invalid response format received from Gemini API.");
      }

      return JSON.parse(rawText.trim());
    } catch (error) {
      console.error("AI Evaluation Failed:", error);
      throw new Error(`LLM Grading failed: ${error.message}`);
    }
  }

  /**
   * Fallback mock generator for IELTS Writing
   */
  getMockWritingFeedback(essay) {
    const wordCount = essay.split(/\s+/).filter(Boolean).length;
    let band = "6.5";
    let message = "Excellent attempt! The response covers the main prompts, but can be improved with better sentence structures and more advanced academic linking words.";
    
    if (wordCount < 150) {
      band = "5.5";
      message = "Your essay is under the required length of 150/250 words. This significantly affects the Task Achievement band score.";
    } else if (wordCount > 250) {
      band = "7.5";
      message = "Superb depth of writing! You have structured your ideas very logically, with strong coherence and transition markers.";
    }

    return {
      bandScore: band,
      criteriaScores: {
        taskAchievement: parseFloat(band),
        coherenceCohesion: parseFloat(band) - 0.5 >= 0 ? parseFloat(band) - 0.5 : parseFloat(band),
        lexicalResource: parseFloat(band),
        grammaticalRange: parseFloat(band)
      },
      feedback: message,
      improvements: [
        "Incorporate a wider range of academic linking vocabulary (e.g., 'furthermore', 'notwithstanding', 'consequently').",
        "Diversify sentence structures by blending compound and complex sentences to elevate grammatical complexity."
      ],
      corrections: [
        {
          originalText: "Sample sentence from essay demonstrating vocabulary limits...",
          correctedText: "An enhanced, more academic version of the sentence...",
          explanation: "Showcases how using advanced words improves cohesiveness."
        }
      ]
    };
  }

  /**
   * Fallback mock generator for IELTS Speaking
   */
  getMockSpeakingFeedback(transcript) {
    return {
      bandScore: "6.5",
      criteriaScores: {
        fluencyCoherence: 6.5,
        lexicalResource: 7.0,
        grammaticalRange: 6.0,
        pronunciation: 7.0
      },
      feedback: "Good pacing and vocabulary range! You address the topic smoothly but exhibit slight hesitations and use recurring filler phrases.",
      improvements: [
        "Work on reducing filler words such as 'like', 'um', 'actually'.",
        "Use idiomatic expressions naturally to secure a band 7.0+ in Lexical Resource."
      ],
      corrections: [
        {
          originalText: "I went to a... like a big shopping mall...",
          correctedText: "I visited a spacious shopping mall...",
          explanation: "Replaced fillers with descriptive vocabulary to demonstrate active lexical control."
        }
      ]
    };
  }

  /**
   * Generates a conversational response from Gemini 2.5 Flash.
   * 
   * @param {Array<object>} messages - Array of { role, content }
   * @param {string} systemInstruction - The system instruction/persona details
   * @returns {Promise<string>} The AI's response text
   */
  async chat(messages, systemInstruction) {
    if (!this.apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to a realistic simulated response.");
      return "Hello! (Note: Simulated chat since Gemini API Key is missing). How can I support you today with your IELTS preparation?";
    }

    try {
      // Convert standard { role, content } messages to Gemini format: { role: 'user'|'model', parts: [{ text: content }] }
      const formattedContents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const bodyPayload = {
        contents: formattedContents
      };

      if (systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error (HTTP ${response.status}): ${errorText}`);
      }

      const resJson = await response.json();
      const aiResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error("Invalid response format received from Gemini API.");
      }

      return aiResponse.trim();
    } catch (error) {
      console.error("AI Chatbot Error:", error);
      throw new Error(`AI Chat failed: ${error.message}`);
    }
  }
}

export default new AIService();
