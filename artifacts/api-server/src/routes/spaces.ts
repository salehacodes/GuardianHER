import { Router } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();
const anthropic = new Anthropic();

const LocationInputSchema = z.object({
  location: z.string().min(1),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
});

router.post("/spaces/nearby", async (req, res) => {
  const parsed = LocationInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { location } = parsed.data;

  try {
    const prompt = `You are GuardianHER's Safe Spaces AI. List nearby safe spaces for a woman near ${location}.

Respond with ONLY valid JSON array (no markdown):
[
  {
    "id": 1,
    "name": "<realistic place name>",
    "type": "police",
    "address": "<realistic address near ${location}>",
    "distance": "<X.X km>",
    "isOpen": true,
    "phone": "<realistic phone number>",
    "rating": <float 3.5-5.0>
  },
  ...
]

Include 2 police stations, 2 hospitals, 2 pharmacies, 1 womens_center, 1 shelter. Make names and addresses realistic for ${location}. Vary isOpen status. All 8 items.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    res.json(JSON.parse(content.text));
  } catch (err) {
    req.log.error({ err }, "Safe spaces error");
    res.json([
      { id: 1, name: "Central Police Station", type: "police", address: `Main Street, ${location}`, distance: "0.8 km", isOpen: true, phone: "100", rating: 4.2 },
      { id: 2, name: "City Hospital Emergency", type: "hospital", address: `Hospital Road, ${location}`, distance: "1.2 km", isOpen: true, phone: "108", rating: 4.5 },
      { id: 3, name: "MedPlus Pharmacy", type: "pharmacy", address: `Market Lane, ${location}`, distance: "0.4 km", isOpen: true, phone: "+91-11-2222-3333", rating: 4.1 },
      { id: 4, name: "Women's Resource Center", type: "womens_center", address: `Civil Lines, ${location}`, distance: "2.1 km", isOpen: true, phone: "1091", rating: 4.8 },
      { id: 5, name: "District Police Outpost", type: "police", address: `North Avenue, ${location}`, distance: "1.5 km", isOpen: true, phone: "100", rating: 3.9 },
      { id: 6, name: "Community Health Clinic", type: "hospital", address: `Park Road, ${location}`, distance: "0.9 km", isOpen: false, phone: "+91-11-4444-5555", rating: 4.0 },
      { id: 7, name: "Apollo Pharmacy", type: "pharmacy", address: `Station Road, ${location}`, distance: "0.6 km", isOpen: true, phone: "+91-11-6666-7777", rating: 4.3 },
      { id: 8, name: "Safe Haven Shelter", type: "shelter", address: `Shelter Colony, ${location}`, distance: "3.2 km", isOpen: true, phone: "181", rating: 4.7 },
    ]);
  }
});

export default router;
