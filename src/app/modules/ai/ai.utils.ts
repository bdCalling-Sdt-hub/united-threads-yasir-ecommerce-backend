/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from "openai";
import config from "../../config";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

// Initialize OpenAI with API key
export const ai = new OpenAI({
  apiKey: config.ai.apiKey,
  //project: config.ai.projectId,
  organization: config.ai.organizationId,
});

/**
 * Generates images using DALL·E API
 *
 * @param {string} prompt - The prompt to generate images from
 * @param {number} n - Number of images to generate
 * @param {string} size - Size of the images (e.g., '1024x1024')
 * @returns {Promise<string[]>} - A promise that resolves to an array of image URLs
 */

export const generateImage = async (
  prompt: string,
  n: number = 1, // Number of images to generate
  size: "1024x1024" | "512x512" | "256x256" = "256x256",
): Promise<string[]> => {
  try {
    const response = await ai.images.generate({
      prompt,
      n,
      size,
      model: "dall-e-3",
      response_format: "b64_json",
    });

    if (!response || !response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response from OpenAI API");
    }

    return response.data.map((image) => `data:image/png;base64,${image.b64_json}`);
  } catch (error: any) {
    console.log("Error generating image:", error);
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to generate image");
  }
};
