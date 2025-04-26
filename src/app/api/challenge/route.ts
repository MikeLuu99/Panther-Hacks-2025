import { type NextRequest, NextResponse } from "next/server";
import { challengeSchema } from "@/lib/challengeSchema";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { revalidateTag } from "next/cache";
import { systemPrompt } from "@/util/prompt";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    const result = await generateObject({
      model: google("gemini-2.0-flash-001"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: text,
            },
          ],
        },
      ],
      schema: challengeSchema,
    });

    revalidateTag("challenge");
    console.log(result.object);
    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
