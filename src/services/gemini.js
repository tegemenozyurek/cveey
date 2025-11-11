const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD9bd7fS62ByXIKey2krTJ6SF47qxFnZCw"
const MODEL_PREF = import.meta.env.VITE_GEMINI_MODEL || ""
let cachedSelectableModels = null

function buildPrompt({ age, heightCm, weightKg, lastGlucoseMgDl, foodName, foodAmount }) {
	return `
You are GlucoSense, a careful assistant for people with diabetes. Estimate the short-term postprandial blood glucose change after eating the specified food considering portion size and typical glycemic impact.

Respond with a single concise sentence and an approximate glucose level in mg/dL. Avoid disclaimers beyond a brief safety reminder.

User profile:
- Age: ${age}
- Height: ${heightCm} cm
- Weight: ${weightKg} kg
- Last glucose: ${lastGlucoseMgDl} mg/dL

Meal:
- Food: ${foodName}
- Amount: ${foodAmount}

Output format example:
"Your glucose may rise to ~120 mg/dL. Consider monitoring after 1–2 hours."
`
}

export async function predictGlucose(input) {
	const contents = [
		{
			role: "user",
			parts: [{ text: buildPrompt(input) }],
		},
	]

	let modelId = await resolveSupportedModel()
	if (!modelId) {
		modelId = pickFromDefaults()
	}
	const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ contents }),
	})
	if (!res.ok) {
		const errText = await res.text().catch(() => "")
		throw new Error(`Gemini request failed: ${res.status} ${errText}`)
	}
	const data = await res.json()
	const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No prediction provided."
	return { text, model: modelId }
}

async function resolveSupportedModel() {
	// If we already discovered a working model, reuse it
	if (cachedSelectableModels && cachedSelectableModels.selected) {
		return cachedSelectableModels.selected
	}
	// Fetch available models from API
	const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(GEMINI_API_KEY)}`
	const listRes = await fetch(listUrl, { method: "GET" })
	if (!listRes.ok) {
		// Fallback to common defaults if listing fails
		return pickFromDefaults()
	}
	const listData = await listRes.json().catch(() => ({}))
	const models = (Array.isArray(listData?.models) ? listData.models : [])
		.map(m => ({
			name: m?.name || "",
			methods: Array.isArray(m?.supportedGenerationMethods) ? m.supportedGenerationMethods : [],
		}))
		.filter(m => m.name.startsWith("models/"))
		.map(m => ({ id: m.name.replace(/^models\//, ""), methods: m.methods }))
		.filter(m => m.methods.includes("generateContent"))
		// Avoid -8b which is often not available in this API
		.filter(m => !m.id.includes("-8b"))
		// Prefer 1.5 flash/pro families
		.sort((a, b) => {
			const score = (id) => {
				if (/^gemini-1\.5-flash/.test(id)) return 0
				if (/^gemini-1\.5-pro/.test(id)) return 1
				return 2
			}
			return score(a.id) - score(b.id)
		})

	// If user specified a preferred model and it's present, use it
	if (MODEL_PREF) {
		const found = models.find(m => m.id === MODEL_PREF)
		if (found) {
			cachedSelectableModels = { list: models, selected: found.id }
			return found.id
		}
	}
	// Otherwise pick the first preferred
	if (models.length > 0) {
		cachedSelectableModels = { list: models, selected: models[0].id }
		return models[0].id
	}
	// If listing returned nothing usable, fallback
	return pickFromDefaults()
}

function pickFromDefaults() {
	// Very conservative defaults known to exist broadly
	const defaults = [
		"gemini-1.5-flash",
		"gemini-1.5-pro",
	]
	// Respect user preference if it is one of the defaults
	if (MODEL_PREF && defaults.includes(MODEL_PREF)) return MODEL_PREF
	return defaults[0]
}


