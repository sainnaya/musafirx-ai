
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

export const categorizeExpense = async (description: string, amount: number): Promise<{ category: string, subcategory: string }> => {
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

export const resolveDestination = async (query: string): Promise<{ name: string, url?: string }> => {
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

export const generateTourGuides = async (
    location: string
): Promise<TourGuide[]> => {
    const prompt = `
Generate exactly 3 fictional, highly realistic local tour guides for "${location}".

For each guide provide:

- id: string
- name: string (local-sounding name)
- languages: string[] (relevant languages spoken in ${location})
- specialty: string (for example: Food Tours, History, Nightlife, Culture, Photography)
- rating: number between 4.5 and 5.0
- ratePerHour: number in USD
- imageUrl: string using:
  https://picsum.photos/200/200?random=RANDOM_NUMBER

Make every field mandatory.

Return ONLY valid JSON matching the requested schema.
`;

    
    // Fallback guides
    
    const createFallbackGuides = (): TourGuide[] => {
        const randomImage = () =>
            `https://picsum.photos/200/200?random=${Math.floor(
                Math.random() * 1000
            )}`;

        return [
            {
                id: `guide-${Date.now()}-1`,
                name: "Arjun Patel",
                languages: ["English", "Hindi"],
                specialty: "Culture & Local Experiences",
                rating: 4.9,
                ratePerHour: 35,
                imageUrl: randomImage()
            },
            {
                id: `guide-${Date.now()}-2`,
                name: "Maya Sharma",
                languages: ["English", "Hindi"],
                specialty: "Food & Street Tours",
                rating: 4.8,
                ratePerHour: 30,
                imageUrl: randomImage()
            },
            {
                id: `guide-${Date.now()}-3`,
                name: "Kabir Mehta",
                languages: ["English", "Hindi"],
                specialty: "History & Photography",
                rating: 4.9,
                ratePerHour: 40,
                imageUrl: randomImage()
            }
        ];
    };

    
    // Normalize Gemini response
    
    const normalizeGuides = (data: any[]): TourGuide[] => {
        if (!Array.isArray(data)) {
            return [];
        }

        return data
            .map((guide, index) => {
                const name =
                    typeof guide?.name === "string" &&
                    guide.name.trim()
                        ? guide.name.trim()
                        : `Local Guide ${index + 1}`;

                const languages = Array.isArray(guide?.languages)
                    ? guide.languages.filter(
                          (language: unknown): language is string =>
                              typeof language === "string" &&
                              language.trim().length > 0
                      )
                    : [];

                const specialty =
                    typeof guide?.specialty === "string" &&
                    guide.specialty.trim()
                        ? guide.specialty.trim()
                        : "Local Experiences";

                const rating =
                    typeof guide?.rating === "number" &&
                    Number.isFinite(guide.rating)
                        ? Math.min(5, Math.max(4.5, guide.rating))
                        : 4.8;

                const ratePerHour =
                    typeof guide?.ratePerHour === "number" &&
                    Number.isFinite(guide.ratePerHour)
                        ? Math.max(0, Math.round(guide.ratePerHour))
                        : 30;

                const imageUrl =
                    typeof guide?.imageUrl === "string" &&
                    guide.imageUrl.trim()
                        ? guide.imageUrl
                        : `https://picsum.photos/200/200?random=${Math.floor(
                              Math.random() * 1000
                          )}`;

                return {
                    id:
                        typeof guide?.id === "string" &&
                        guide.id.trim()
                            ? guide.id
                            : `guide-${Date.now()}-${index}`,

                    name,

                    languages:
                        languages.length > 0
                            ? languages
                            : ["English"],

                    specialty,

                    rating,

                    ratePerHour,

                    imageUrl
                };
            })
            .filter((guide) => guide.name.length > 0);
    };

    
    // Gemini request with retry
   
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(
                `Generating tour guides for "${location}" - attempt ${attempt}/${maxRetries}`
            );

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
                                id: {
                                    type: Type.STRING
                                },

                                name: {
                                    type: Type.STRING
                                },

                                languages: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.STRING
                                    }
                                },

                                specialty: {
                                    type: Type.STRING
                                },

                                rating: {
                                    type: Type.NUMBER
                                },

                                ratePerHour: {
                                    type: Type.NUMBER
                                },

                                imageUrl: {
                                    type: Type.STRING
                                }
                            },

                            required: [
                                "id",
                                "name",
                                "languages",
                                "specialty",
                                "rating",
                                "ratePerHour",
                                "imageUrl"
                            ]
                        }
                    }
                }
            });

            const rawText = response.text?.trim();

            if (!rawText) {
                throw new Error("Gemini returned an empty response");
            }

            let parsedData: unknown;

            try {
                parsedData = JSON.parse(rawText);
            } catch (parseError) {
                console.error(
                    "Failed to parse Gemini guide response:",
                    parseError
                );

                throw new Error("Gemini returned invalid JSON");
            }

            const normalizedGuides = normalizeGuides(
                Array.isArray(parsedData) ? parsedData : []
            );

            if (normalizedGuides.length > 0) {
                console.log(
                    `Successfully generated ${normalizedGuides.length} tour guides`
                );

                return normalizedGuides;
            }

            throw new Error("Gemini returned no valid guides");
        } catch (error: any) {
            const errorMessage =
                error?.message || String(error);

            console.error(
                `Guide generation attempt ${attempt} failed:`,
                error
            );

            // Temporary Gemini errors
            const isTemporaryError =
                errorMessage.includes("503") ||
                errorMessage.includes("UNAVAILABLE") ||
                errorMessage.includes("high demand") ||
                errorMessage.includes("overloaded") ||
                errorMessage.includes("temporarily");

            // Don't retry errors that aren't temporary
            if (!isTemporaryError) {
                console.error(
                    "Non-retryable Gemini error. Using fallback guides."
                );

                return createFallbackGuides();
            }

            // Retry if attempts remain
            if (attempt < maxRetries) {
                const delay = attempt * 2000;

                console.log(
                    `Gemini temporarily unavailable. Retrying in ${
                        delay / 1000
                    } seconds...`
                );

                await new Promise((resolve) =>
                    setTimeout(resolve, delay)
                );
            }
        }
    }

    
    // Final fallback
    
    console.warn(
        `Gemini unavailable after ${maxRetries} attempts. Using fallback guides.`
    );

    return createFallbackGuides();
};



export const generateCommunityPosts = async (
  topic: string
): Promise<CommunityPost[]> => {
  const prompt = `
Generate exactly 4 realistic social media posts from travelers currently in or discussing "${topic}".

Each post should look authentic, natural, and useful to other travelers.

Return ONLY valid JSON matching the requested schema.

Rules:
- user must always be a realistic traveler name
- location must be a specific place or area related to ${topic}
- content should be engaging and useful, such as a travel tip, experience, recommendation, or question
- likes must be a realistic number between 5 and 500
- tags must contain 1-4 relevant hashtags
- imageUrl must use this format:
  https://picsum.photos/600/400?random=RANDOM_NUMBER
- timestamp must be a Unix timestamp in milliseconds
`;

  // ---------------------------------------------------------
  // Fallback posts
  // ---------------------------------------------------------
  const createFallbackPosts = (): CommunityPost[] => {
    const now = Date.now();

    return [
      {
        id: `fallback-${now}-1`,
        user: "Aarav Mehta",
        location: `${topic}`,
        content: `Just exploring ${topic} and loving the experience so far! Does anyone have a hidden gem or local spot they would recommend?`,
        likes: 42,
        tags: ["#Travel", "#Explore"],
        imageUrl: `https://picsum.photos/600/400?random=${Math.floor(
          Math.random() * 1000
        )}`,
        timestamp: now - 1000 * 60 * 35
      },
      {
        id: `fallback-${now}-2`,
        user: "Maya Sharma",
        location: `${topic}`,
        content: `Quick travel tip: give yourself some free time instead of planning every minute. Some of my best memories came from randomly discovering places along the way.`,
        likes: 87,
        tags: ["#TravelTips", "#Wanderlust"],
        imageUrl: `https://picsum.photos/600/400?random=${Math.floor(
          Math.random() * 1000
        )}`,
        timestamp: now - 1000 * 60 * 90
      },
      {
        id: `fallback-${now}-3`,
        user: "Kabir Patel",
        location: `${topic}`,
        content: `Has anyone visited ${topic} recently? I'm planning a trip and would love recommendations for food, photography spots, and things that are worth experiencing.`,
        likes: 64,
        tags: ["#TripPlanning", "#TravelCommunity"],
        imageUrl: `https://picsum.photos/600/400?random=${Math.floor(
          Math.random() * 1000
        )}`,
        timestamp: now - 1000 * 60 * 180
      },
      {
        id: `fallback-${now}-4`,
        user: "Riya Kapoor",
        location: `${topic}`,
        content: `One thing I have learned while traveling: don't be afraid to talk to locals. They often know the best places that never show up on the usual tourist lists.`,
        likes: 123,
        tags: ["#LocalTips", "#SoloTravel"],
        imageUrl: `https://picsum.photos/600/400?random=${Math.floor(
          Math.random() * 1000
        )}`,
        timestamp: now - 1000 * 60 * 300
      }
    ];
  };

  // ---------------------------------------------------------
  // Validate and normalize Gemini response
  // ---------------------------------------------------------
  const normalizePosts = (data: any[]): CommunityPost[] => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((post, index) => {
        const username =
          typeof post?.user === "string" && post.user.trim()
            ? post.user.trim()
            : `Traveler ${index + 1}`;

        const location =
          typeof post?.location === "string" &&
            post.location.trim()
            ? post.location.trim()
            : topic;

        const content =
          typeof post?.content === "string" &&
            post.content.trim()
            ? post.content.trim()
            : `Sharing my experience traveling around ${topic}.`;

        const likes =
          typeof post?.likes === "number" && post.likes >= 0
            ? Math.floor(post.likes)
            : Math.floor(Math.random() * 150) + 10;

        const tags = Array.isArray(post?.tags)
          ? post.tags.filter(
            (tag: unknown): tag is string =>
              typeof tag === "string" && tag.trim().length > 0
          )
          : [];

        const imageUrl =
          typeof post?.imageUrl === "string" &&
            post.imageUrl.trim()
            ? post.imageUrl
            : `https://picsum.photos/600/400?random=${Math.floor(
              Math.random() * 1000
            )}`;

        const timestamp =
          typeof post?.timestamp === "number" &&
            Number.isFinite(post.timestamp)
            ? post.timestamp
            : Date.now() -
            Math.floor(Math.random() * 24 * 60 * 60 * 1000);

        return {
          id:
            typeof post?.id === "string" && post.id.trim()
              ? post.id
              : `community-${Date.now()}-${index}`,

          user: username,

          location,

          content,

          likes,

          tags: tags.length > 0 ? tags : ["#Travel"],

          imageUrl,

          timestamp
        };
      })
      .filter((post) => post.content.length > 0);
  };

  // ---------------------------------------------------------
  // Gemini request with retry
  // ---------------------------------------------------------
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Generating community posts for "${topic}" - attempt ${attempt}/${maxRetries}`
      );

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
                id: {
                  type: Type.STRING
                },

                user: {
                  type: Type.STRING
                },

                location: {
                  type: Type.STRING
                },

                content: {
                  type: Type.STRING
                },

                likes: {
                  type: Type.NUMBER
                },

                tags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING
                  }
                },

                imageUrl: {
                  type: Type.STRING
                },

                timestamp: {
                  type: Type.NUMBER
                }
              },

              required: [
                "id",
                "user",
                "location",
                "content",
                "likes",
                "tags",
                "imageUrl",
                "timestamp"
              ]
            }
          }
        }
      });

      const rawText = response.text?.trim();

      if (!rawText) {
        throw new Error("Gemini returned an empty response");
      }

      let parsedData: unknown;

      try {
        parsedData = JSON.parse(rawText);
      } catch (parseError) {
        console.error(
          "Failed to parse Gemini community response:",
          parseError
        );

        throw new Error("Gemini returned invalid JSON");
      }

      const normalizedPosts = normalizePosts(
        Array.isArray(parsedData) ? parsedData : []
      );

      if (normalizedPosts.length > 0) {
        console.log(
          `Successfully generated ${normalizedPosts.length} community posts`
        );

        return normalizedPosts;
      }

      throw new Error("Gemini returned no valid community posts");
    } catch (error: any) {
      const errorMessage =
        error?.message || String(error);

      console.error(
        `Community post generation attempt ${attempt} failed:`,
        error
      );

      // Check for temporary Gemini availability errors
      const isTemporaryError =
        errorMessage.includes("503") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("high demand") ||
        errorMessage.includes("temporarily") ||
        errorMessage.includes("overloaded");

      if (!isTemporaryError) {
        console.error(
          "Non-retryable Gemini error. Using fallback posts."
        );

        return createFallbackPosts();
      }

      // If this was not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = attempt * 2000;

        console.log(
          `Gemini is temporarily unavailable. Retrying in ${delay / 1000}s...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );
      }
    }
  }

  // ---------------------------------------------------------
  // Gemini failed after all retries
  // ---------------------------------------------------------
  console.warn(
    `Gemini unavailable after ${maxRetries} attempts. Using fallback community posts.`
  );

  return createFallbackPosts();
};


