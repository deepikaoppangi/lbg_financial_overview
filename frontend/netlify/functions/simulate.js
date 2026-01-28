// Netlify Function (CommonJS) that calls OpenAI securely using OPENAI_API_KEY
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
            };
        }

        const body = JSON.parse(event.body || "{}");
        const { period, question, snapshot } = body;

        if (!question || !snapshot) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing question or snapshot" }),
            };
        }

        const prompt = `
You are a financial wellbeing assistant for Lloyds Banking Group.
User question: "${question}"
Time horizon: ${period}

Snapshot:
- Income per month: £${Math.round(snapshot.salary_monthly || 0)}
- Expenses per month: £${Math.round(snapshot.monthly_expense_total || 0)}
- Savings per month: £${Math.round(snapshot.savings_est_monthly || 0)}
- Resilience: ${Math.round(snapshot.resilience || 0)}%
- Liquidity: ${Math.round(snapshot.liquidity || 0)}%

Return:
- A short heading (max 80 characters)
- 3–5 bullet-style lines of practical, clear guidance.
`;

        // Use dynamic import so this function works even when the repo is not ESM.
        const OpenAI = (await import("openai")).default;
        const client = new OpenAI({ apiKey });

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are concise and practical. UK context. Use GBP (£). Avoid long disclaimers.",
                },
                { role: "user", content: prompt },
            ],
            max_tokens: 350,
            temperature: 0.3,
        });

        const text =
            completion.choices?.[0]?.message?.content?.trim() ||
            "No response generated.";

        const parts = text.split("\n").map((l) => l.trim()).filter(Boolean);
        const heading = (parts[0] || "Scenario plan").replace(/^[-•*\s]+/, "");
        const lines =
            parts.slice(1).length > 0
                ? parts.slice(1).map((l) => l.replace(/^[-•*\s]+/, ""))
                : ["No detailed guidance returned."];

        return {
            statusCode: 200,
            body: JSON.stringify({ heading, lines, enabled: true }),
        };
    } catch (err) {
        console.error("simulate function error", err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Simulation failed",
                detail: err?.message ? err.message : String(err),
            }),
        };
    }
};

