
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Itinerary, TripPreferences, ChatMessage, Photo, UserVoiceProfile, SocialMediaContent, TourGuide, CommunityPost } from "../types";

const apiKey = import.meta.env.VITE_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Schema definition for strict JSON generation
const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the trip" },
    destination: { type: Type.STRING, description: "The specific city and country of the destination (e.g. 'Tokyo, Japan')" },
    description: { type: Type.STRING, description: "A brief summary of the experience" },
    totalEstimatedCost: { type: Type.NUMBER, description: "Total estimated cost in USD" },
    currency: { type: Type.STRING, description: "Local currency code" },
    travelTips: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "3-5 crucial travel tips for this specific location and demographic"
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          date: { type: Type.STRING, description: "The specific calendar date (e.g., 'Mon, July 15')" },
          theme: { type: Type.STRING, description: "Theme of the day (e.g., Cultural Immersion)" },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "Specific time range (e.g., '08:00 AM - 09:30 AM')" },
                activity: { type: Type.STRING, description: "Name of the place or activity" },
                description: { type: Type.STRING, description: "Specific instructions (e.g., 'Try the matcha latte here.')" },
                location: { type: Type.STRING, description: "Address or area name" },
                estimatedCost: { type: Type.NUMBER, description: "Cost in USD" },
                type: { type: Type.STRING, description: "One of: food, sight-seeing, adventure, relax, culture" }
              }
            }
          }
        }
      }
    }
  }
};

export const generateItinerary = async (prefs: TripPreferences): Promise<Itinerary> => {
  // Use gemini-3.1-flash-lite for speed and quality
  const model = "gemini-3.1-flash-lite"; 
  
  const prompt = `
    Create a detailed, day-by-day travel itinerary for a trip to ${prefs.destination}.
    Start Date: ${prefs.startDate || "Anytime"}.
    Duration: ${prefs.duration} days.
    Travel Party: ${prefs.travelers} (Provide age-appropriate recommendations).
    Budget Level: ${prefs.budget}.
    Interests: ${prefs.interests.join(", ")}.
    Language: The response content should be in ${prefs.language}, but the JSON keys must remain in English.
    
    CRITICAL INSTRUCTIONS:
    1. **Time Slots**: Provide specific time ranges for every activity (e.g., "09:00 AM - 11:00 AM"). Ensure a logical flow (Breakfast -> Morning Activity -> Lunch -> Afternoon -> Dinner).
    2. **Logistics**: Account for travel time between locations.
    3. **Specifics**: Do not just say "Lunch", recommend a specific restaurant or type of food popular in that area.
    4. **Hidden Gems**: Include "MusafirX" special touches like hidden photo spots or local secrets.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
       config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as Itinerary;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};

export const askTravelAssistant = async (
  query: string, 
  currentContext: string,
  history: ChatMessage[] = []
): Promise<{ text: string, sources?: { title: string, uri: string }[] }> => {
  try {
    // Construct history for context
    let historyText = "";
    if (history.length > 0) {
      historyText = "Chat History:\n" + history.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n') + "\n";
    }

    const prompt = `
      System: You are MusafirX AI, a helpful travel assistant.
      Context: User is planning a trip. Current plan details: ${currentContext}.
      ${historyText}
      
      User Query: ${query}
      
      Instructions:
      1. Be **concise and to the point**. Do not write long paragraphs unless asked.
      2. If asking for recommendations, give a list.
      3. Use a friendly, professional tone.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    
    });

    const text = response.text || "I'm having trouble connecting to the travel servers right now.";
    
    // Extract sources from grounding metadata
    const sources: { title: string, uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources: sources.length > 0 ? sources : undefined };
  } catch (e) {
    console.error("Chat error", e);
    return { text: "Sorry, I am currently offline." };
  }
};

export const analyzeImageForSocial = async (
  imageBase64: string, 
  additionalContext: string
): Promise<{ caption: string; hashtags: string[]; location: string }> => {
  try {
    const prompt = `
      Analyze this travel photo. 
      Context provided by user: "${additionalContext}".
      
      Task:
      1. Identify the likely location or setting.
      2. Write a catchy, engaging Instagram caption (max 2 sentences).
      3. Generate 5-7 trending travel hashtags.
      
      Return JSON: { "caption": string, "hashtags": string[], "location": string }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            location: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Image analysis failed", e);
    throw e;
  }
};

export const categorizeExpense = async (description: string, amount: number): Promise<{category: string, subcategory: string}> => {
  try {
    const prompt = `
      Categorize this expense: "${description}" with amount ${amount}.
      Return JSON with 'category' and 'subcategory'.
      
      Categories: Food, Transport, Accommodation, Activities, Shopping, Utilities, Health, Other.
      Subcategories example:
      Food -> Restaurants, Groceries, Snacks, Drinks.
      Transport -> Flight, Taxi, Train, Bus, Fuel.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("AI Categorization failed", e);
    return { category: 'Other', subcategory: 'General' };
  }
};

export const resolveDestination = async (query: string): Promise<{name: string, url?: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Find the specific best travel destination (City, Country) for the user query: "${query}". 
      If the query is already a city, format it as "City, Country".
      Return ONLY the destination name string.`,
      config: {
        tools: [{ googleMaps: {} }],
        temperature: 0,
      }
    });
    
    const name = response.text?.trim() || query;
    let url: string | undefined;

    // Extract grounding link if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        // @ts-ignore - Dynamic access to grounding structure
        if (chunk.web?.uri) { url = chunk.web.uri; break; }
        // @ts-ignore
        if (chunk.maps?.uri) { url = chunk.maps.uri; break; }
      }
    }

    return { name, url };
  } catch (e) {
    console.error("Destination resolve failed", e);
    return { name: query };
  }
};

export const convertCurrency = async (amount: number, from: string, to: string): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Convert ${amount} ${from} to ${to} using the latest available exchange rate. 
      Return JSON with key 'result' containing the number only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            result: { type: Type.NUMBER }
          }
        }
      }
    });
    
    const data = JSON.parse(response.text || '{}');
    return data.result || 0;
  } catch (e) {
    console.error("Currency conversion failed", e);
    return 0;
  }
};

export const generateSocialMediaContent = async (
  trip: Itinerary,
  photos: Photo[],
  userVoice: UserVoiceProfile
): Promise<SocialMediaContent> => {
  const prompt = `You are a viral travel content creator. Generate engaging social media content.

TRIP DETAILS:
Destination: ${trip.title}
Highlights: ${trip.days.flatMap(d => d.activities).map(a => a.activity).slice(0, 10).join(', ')}
Duration: ${trip.days.length} days
Vibe: ${trip.description}

PHOTOS AVAILABLE (Reference these by index number):
${photos.map((p, idx) => `
Photo ${idx + 1}: ${p.description}
- Location: ${p.location}
- Tags: ${p.aiTags.join(', ')}
- Aesthetic Score: ${p.aestheticScore}/100
`).join('\n')}

USER'S CONTENT STYLE:
Tone: ${userVoice.tone}
Target Audience: ${userVoice.audience}
Emoji Usage: ${userVoice.emojiStyle}
Hashtag Strategy: ${userVoice.hashtagCount} hashtags

TASK:
Create platform-specific content that matches the user's authentic voice.
Return a SINGLE JSON Object with the exact structure below. Do NOT use markdown code blocks.

Structure required:
{
  "instagram": {
    "posts": [{ "photoReference": number, "caption": "string", "hashtags": ["string"], "locationTag": "string", "firstComment": "string", "viralPotentialScore": number }],
    "stories": [{ "photoReference": number, "stickerIdeas": ["string"], "text": "string", "cta": "string" }],
    "reel": { "concept": "string", "hook": "string", "photoSequence": [number], "music": "string", "captions": ["string"], "trendAlignment": "string" }
  },
  "twitter": { "thread": ["string"], "standalonetweet": "string", "hashtags": ["string"] },
  "facebook": { "post": "string", "photoAlbum": { "title": "string", "description": "string", "photoOrder": [number] } },
  "linkedIn": { "post": "string", "tone": "string" },
  "tiktok": { "concepts": [{ "hook": "string", "narrative": "string", "photoSequence": [number], "sound": "string", "hashtags": ["string"], "duration": "string" }] },
  "blogPost": { "seoTitle": "string", "metaDescription": "string", "url": "string", "fullPost": "string", "sections": ["string"], "internalLinks": ["string"], "ctaPlacement": ["string"] }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as SocialMediaContent;
  } catch (e) {
    console.error("Social generation failed", e);
    throw e;
  }
};

export const generateTourGuides = async (location: string): Promise<TourGuide[]> => {
  const prompt = `
    Generate 3 fictional, highly realistic local tour guides for ${location}.
    For each guide, provide:
    - id: string
    - name: string (local sounding name)
    - languages: string[] (relevant languages)
    - specialty: string (e.g. "Food Tours", "History", "Nightlife")
    - rating: number (4.5 to 5.0)
    - ratePerHour: number (in USD)
    - imageUrl: string (Use "https://picsum.photos/200/200?random=" plus a random number)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              languages: { type: Type.ARRAY, items: { type: Type.STRING } },
              specialty: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              ratePerHour: { type: Type.NUMBER },
              imageUrl: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Guide generation failed", e);
    return [];
  }
};

export const generateCommunityPosts = async (topic: string): Promise<CommunityPost[]> => {
  const prompt = `
    Generate 4 realistic social media posts from travelers currently in or discussing ${topic}.
    Each post should look authentic.
    
    Fields required:
    - id: string
    - user: string (name)
    - location: string (specific spot in ${topic})
    - content: string (the post text, engaging, maybe a question or tip)
    - likes: number
    - tags: string[]
    - imageUrl: string (Use "https://picsum.photos/600/400?random=" plus a random number)
    - timestamp: number (use Date.now() minus random time)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              user: { type: Type.STRING },
              location: { type: Type.STRING },
              content: { type: Type.STRING },
              likes: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              imageUrl: { type: Type.STRING },
              timestamp: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Community post generation failed", e);
    return [];
  }
};
