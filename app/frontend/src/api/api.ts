import { AskRequest, AskResponse, ChatRequest, ChatMessage } from "./models";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { DefaultAzureCredential } from "@azure/identity";
import { DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { SearchClient } from "@azure/search-documents";

export async function askApi(options: AskRequest): Promise<AskResponse> {
    const response = await fetch("/ask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: options.question,
            approach: options.approach,
            overrides: {
                retrieval_mode: options.overrides?.retrievalMode,
                semantic_ranker: options.overrides?.semanticRanker,
                semantic_captions: options.overrides?.semanticCaptions,
                top: options.overrides?.top,
                temperature: options.overrides?.temperature,
                prompt_template: options.overrides?.promptTemplate,
                prompt_template_prefix: options.overrides?.promptTemplatePrefix,
                prompt_template_suffix: options.overrides?.promptTemplateSuffix,
                exclude_category: options.overrides?.excludeCategory
            }
        })
    });

    const parsedResponse: AskResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function chatApi(options: ChatRequest): Promise<AskResponse> {
    const response = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            history: options.history,
            approach: options.approach,
            overrides: {
                retrieval_mode: options.overrides?.retrievalMode,
                semantic_ranker: options.overrides?.semanticRanker,
                semantic_captions: options.overrides?.semanticCaptions,
                top: options.overrides?.top,
                temperature: options.overrides?.temperature,
                prompt_template: options.overrides?.promptTemplate,
                prompt_template_prefix: options.overrides?.promptTemplatePrefix,
                prompt_template_suffix: options.overrides?.promptTemplateSuffix,
                exclude_category: options.overrides?.excludeCategory,
                suggest_followup_questions: options.overrides?.suggestFollowupQuestions,
                indexoption: options.overrides?.indexoption
            }
        })
    });

    const parsedResponse: AskResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function getToken(chatHistory: ChatMessage[]) {
    // const endpoint = "https://cog-rob2nleooqzme.openai.azure.com/";
    // const azureApiKey = "2f1f7bdb69ef4fbd94b91bcd4043a1f5";

    // const messages = chatHistory;

    // const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    // const deploymentId = "chat";
    // const events = await client.getChatCompletions(deploymentId, messages, {
    //     temperature: 0.7,
    //     maxTokens: 128,
    //     topP: 0.95,
    //     frequencyPenalty: 0,
    //     presencePenalty: 0
    // });

    // return events.usage.totalTokens;

    const response = await fetch("https://vpgapimgnt.azure-api.net/deployments/chat/chat/completions?api-version=2023-03-15-preview", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "3b82ec9108cc4fad9a7b2a1a2b4051eb",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: chatHistory
        })
    });
    const totalTokens = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(totalTokens.error || "Unknown error");
    }

    return totalTokens.usage.total_tokens;
}

export async function getUserInfo(email: string): Promise<string> {
    const response = await fetch("https://openai-chatbot-user-token-bd4ef0768b61.herokuapp.com/auth/getUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email
        })
    });

    const userInfo = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(userInfo.error || "Unknown error");
    }

    return userInfo;
}

export function getCitationFilePath(citation: string): string {
    return `/content/${citation}`;
}
