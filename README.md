
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5245d31b-825e-427a-b5fa-4cf6ac0e58cf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
SAHELI AI — Background Research & Unique Selling Propositions
1. THE PROBLEM: WHY THIS PROJECT EXISTS
1.1 Scale of Gender-Based Violence in India
The numbers are stark and well-documented:

Nearly 1 in 3 ever-married women in India (aged 15–49) has experienced physical, sexual, or emotional violence from her spouse. This translates to approximately 32% at the national level, based on the National Family Health Survey (NFHS-5, 2019–21) [cite:a19e9c16][cite:845b6f65].
According to the latest NFHS-6 data (2023–24), gender-based violence saw a dip from 29.2% to 22.3%, but rural women still face significantly more violence (24.4%) than urban women (17.5%) [cite:a74d9ffe].
Physical violence is the most prevalent form at 27–28%, followed by emotional violence at 12.5–14%, and sexual violence at 5.5–6.7% [cite:865d47ad][cite:a19e9c16].
The NCRB recorded 4.45 lakh cases of crimes against women in 2022, but NFHS data (based on confidential household surveys) suggests the real prevalence is far higher — cultural stigma and fear of retaliation suppress formal complaints [cite:845b6f65].
Karnataka (44%), Bihar (40%), Manipur (40%), and Telangana (37%) have the highest rates of spousal violence [cite:845b6f65].
1.2 The Help-Seeking Gap
The most chilling statistic is not the violence itself, but the silence around it:

Only 13.5% of women who faced spousal violence in India sought any help at all [cite:a19e9c16].
87% of women who experienced physical or sexual violence by their spouse never sought help of any kind. Among the few who did, only 7% approached a formal institution [cite:0e3d034e].
Only 18% of women who experienced intimate partner violence reported it to a government body [cite:845b6f65].
Among those who faced a dispute and took no action, 72% of women said they did not know what to do, compared to 46% of men. Among women from De-notified Tribe and Scheduled Tribe communities, over half reported complete uncertainty about available pathways — over twice the rate of men in the same communities [cite:0e3d034e].
80% of people who had not used legal aid had simply never heard of it. The most fundamental dimension of the justice gap is not distrust — it is invisibility [cite:0e3d034e].
1.3 The Rural Justice Gap
Research from Uttar Pradesh, Rajasthan, and other states reveals a multi-layered barrier system:

Socio-cultural barriers:

Traditional stigmas around reporting domestic violence
Fear of family dishonour and social ostracism
Normalisation of violence within families and communities — many women do not recognise what they experience as "violence" [cite:d698e8ef][cite:845b6f65]
Economic dependency keeps women trapped in violent households [cite:845b6f65]
Institutional barriers:

Inadequate legal infrastructure in rural areas
Shortage of Protection Officers under PWDVA
One-Stop Centres (OSCs) are often underfunded — some states have fewer than a dozen functioning centres [cite:845b6f65]
The paralegal volunteer network has shrunk by 38% in recent years [cite:0e3d034e]
A legal aid clinic that served 42 villages in 2017 now reaches 163 villages — the same resources stretched across 4x the area [cite:0e3d034e]
Legal system failures:

Only 6.8% of domestic violence cases filed completed trials in 2018 [cite:c7c06d16]
Conviction rate under PWDVA was around 15.5–18% [cite:c7c06d16][cite:845b6f65]
Over 2 lakh domestic cruelty cases remain pending, with the average trial lasting more than 5 years [cite:845b6f65]
Police often view domestic violence as a "private matter" and discourage formal complaints [cite:c7c06d16]
1.4 The Digital Divide
The digital dimension adds another layer of exclusion:

51.6% of rural women aged 15+ do not own a mobile phone, while 80.7% of rural men do (NSO Comprehensive Modular Survey: Telecom, 2025) [cite:e2c3b00d][cite:4153771b].
76.3% of rural women use mobile phones (for calls/internet) — but more than a quarter don't own the device they use, meaning they lack privacy and autonomy [cite:4153771b].
The gender gap in phone ownership is especially stark in states like West Bengal (80% usage vs 43% ownership), Madhya Pradesh (67% vs 32%), and Uttar Pradesh (75% vs 43%) [cite:4153771b].
83.3% of rural households have internet access, but mostly via mobile data (98.9% in rural areas) [cite:7f556d4d].
Only ~44% rural internet penetration vs over 100% urban — uneven infrastructure limits digital justice access [cite:fbaeb974].
Digital literacy remains a major barrier — most rural residents lack the technical skills to navigate online legal systems, file e-complaints, or use government portals [cite:fbaeb974].
1.5 The Legal Awareness Gap
Many women, especially in rural areas, are unaware of the PWDVA (Protection of Women from Domestic Violence Act, 2005) or the remedies available to them [cite:845b6f65].
Women with no education face 35% physical violence rates, compared to 14% for women with higher education — education is directly correlated with both violence risk and legal awareness [cite:865d47ad].
The UNDP India Justice Needs Assessment (surveying 2,500 people from marginalised communities across 6 states) found that when disputes arise, most people do not call a lawyer or visit a legal aid clinic — they turn to family, friends, community leaders, or local mechanisms like the Nyaya Panchayat [cite:0e3d034e].
The Supreme Court has recognised (in Suk Das v. Union Territory of Arunachal Pradesh, 1986) that illiterate and unaware rural individuals should not be denied free legal aid — but this principle has not been meaningfully implemented in practice [cite:fbaeb974].
2. EXISTING SOLUTIONS & THE GAPS THEY LEAVE
2.1 Government Initiatives



Initiative	What It Does	Gap
NALSA (National Legal Services Authority)	Free legal aid for women (irrespective of income), Lok Adalats, legal literacy camps [cite:e63129a8]	Requires physical visit to authority; low awareness in rural areas; complex application process
Tele-Law	Pre-litigation advice through Common Service Centres (CSCs) [cite:0e3d034e]	Requires visiting a CSC — not accessible from home; limited hours; not voice-based
Nyaya Setu (Govt WhatsApp Chatbot, launched Jan 2026)	Free legal advice on WhatsApp — property, divorce, matrimonial cases; AI-powered chatbot; connects to panel lawyers [cite:0fbc0e32]	Text-based on WhatsApp — requires literacy; not voice-first; no safety features for women in danger; no multilingual voice output
Nyaya Bandhu	Pro bono legal services platform; AADHAAR-based auth; video/text consultations; multilingual voice assistant "Vaani Bandhu"; uses Gemini API [cite:cab204c2]	App-based download required; focused on lawyer-client matching, not self-help guidance; not specifically designed for rural women in crisis
One-Stop Centres (OSCs)	Integrated support for violence survivors	Underfunded; some states have fewer than a dozen; physical presence required
2.2 Private / NGO Legal-Tech Platforms



Platform	What It Does	Gap
Nyaaya (by Vidhi Centre for Legal Policy)	Open-access digital repository of simplified legal explainers in multiple formats; has a dedicated women's section [cite:91fb3f1a]	Text-based content; requires reading ability; no voice interaction; no emergency features; no case tracking
Nyaya Saathi (LegalAidAI.in)	AI legal consultant for citizens; 16 Know Your Rights cards; DIY guides; document templates; case tracking; WhatsApp access; zero-hallucination legal research with Indian Kanoon [cite:53ce9c7e][cite:7273b8f7]	Focused on urban users and advocates; text/chat-based; no voice-first design; no safety features; not designed for low-literacy rural women
NyayGuru	India's first legal AI chatbot (since 2023); 3 lakh+ users; works in Hindi, English, Marathi, Tamil, Telugu, Kannada, Malayalam; 100 free queries/month [cite:96817dd9]	Text chatbot; requires typing; no voice input/output; no emergency features; no safety or disguise mode
NyaySetu (private, nyaysetu.in)	WhatsApp-based legal consultation scheduling; AI chatbot for preliminary guidance; Razorpay payments [cite:19ecbdf7]	Paid consultation model; not free for actual advice; text-based; no voice; no women-specific safety features
NyayMithr (STEP IT)	Multilingual (Telugu, Hindi, English); citizen app + advocate portal; 50+ legal topics; verified advocate directory; case tracker via eCourts [cite:7f57db23]	Requires app download; text-based interaction; not voice-first; no emergency SOS; no disguise mode
Landesa	Paralegal program training women to help landless women with land titles [cite:f6ef479b]	Field-based, limited scale; not technology-driven; geographic constraints
2.3 The Gap Summary
After analyzing all existing solutions, here is what NO existing platform in India currently offers as a combined package:

Voice-first interaction — most are text/chat-based, requiring literacy
Women-specific safety features — SOS, app disguise, quick exit, safe words
Indian language voice processing using government-grade APIs (Bhashini)
Synced text + speech output — karaoke-style highlighting
YouTube video help integrated by legal category and language
No app download required — works as a PWA in any mobile browser
Anonymous mode — no personal data required to use
Free at point of use — no paid consultations
Designed for low-literacy rural women — not urban advocates or general citizens
Case history auto-recording — every query saved for follow-up
3. THE TECHNOLOGY OPPORTUNITY
3.1 Bhashini — India's Language Infrastructure
Bhashini (National Language Translation Mission, under MeitY) is a government-built digital public infrastructure for Indian languages. It is already being used successfully in agriculture — farmers in Maharashtra speak in Marathi and receive AI-generated crop advice, and dairy farmers in Gujarat describe symptoms via voice and get diagnoses [cite:f63fd058].

Key facts:

Supports 22+ Indian languages with models trained by IIT Bombay, IIT Madras, IIIT Hyderabad, CDAC, and AI4Bharat [cite:4658d333][cite:d97d4282]
Provides ASR (speech-to-text), NMT (translation), and TTS (text-to-speech) in a single pipeline [cite:38680c41]
Free API access for PoC and development (register at bhashini.gov.in) [cite:d97d4282]
Has processed billion+ inferencing requests and impacted crore+ Indians [cite:4658d333]
Already proven in rural e-governance and agriculture use cases [cite:f63fd058]
Saheli AI leverages Bhashini the same way agriculture apps do — but for legal aid, an area where no voice-based solution currently exists for women.

3.2 Groq — Ultra-Fast LLM Inference
Groq's LPU (Language Processing Unit) provides inference speeds of 500+ tokens/second for Llama 3 models, making real-time legal guidance generation feasible even on slow rural connections. The free developer tier allows ~1,000+ requests/day, sufficient for an MVP serving 100+ users [cite:095051ff][cite:5a66e04d].

3.3 PWA — No Download Required
A Progressive Web App works in any mobile browser without app store download. This is critical because:

51.6% of rural women don't own phones — they use shared/borrowed devices where installing apps is not possible
App store accounts require email and digital literacy
PWAs can be bookmarked to the home screen and work offline
Easier to update than native apps
3.4 Smartphone Availability
Despite the ownership gap, 75.6% of rural women who own a mobile phone have a smartphone [cite:e2c3b00d]. Among those who use mobile phones (76.3% of rural women), most access the internet via mobile data [cite:7f556d4d]. This means a web-based app is reachable for the majority of the target audience, especially when accessed through shared household devices.

4. UNIQUE SELLING PROPOSITIONS (USPs)
USP 1: Voice-First Legal Aid for Illiterate and Low-Literacy Women
No existing legal aid platform in India is voice-first. Every other solution — Nyaaya, Nyaya Saathi, NyayGuru, NyaySetu, NyayMithr — requires the user to read and type. Saheli AI allows a woman to simply speak her problem in Hindi, Marathi, or English and receive spoken guidance back. This is the single most important differentiator: it serves the 65% of rural women with no or low literacy who are completely excluded from every text-based legal platform.

USP 2: Synced Text + Speech Output (Karaoke-Style)
The guidance screen displays text and plays speech simultaneously, with word-by-word highlighting. A mute button lets users who prefer to read silence the audio. This dual-mode output serves both low-literacy users (who rely on audio) and semi-literate users (who can read along) — no other legal platform offers this synchronized experience.

USP 3: Women-Centric Safety Architecture
No existing legal-tech platform includes safety features designed for women in potentially dangerous domestic situations. Saheli AI includes:

SOS button with one-tap calling to 181, 100, 112, 1098 via tel: links that open the phone's native dialer
Quick exit — instantly closes the app and clears session
App disguise mode — shows a calculator interface instead of the legal app
Safe words — pre-agreed phrases that silently trigger emergency protocols
Silent GPS location sharing with trusted contacts
Anonymous mode — no personal data collected, no login required
USP 4: Government-Grade Indian Language Processing (Bhashini)
Saheli AI uses Bhashini — the same government infrastructure that Prime Minister Modi has praised in Mann Ki Baat and that powers Parliament translation [cite:4658d333]. This is not a commercial API with limited Indian language support; it is purpose-built for Indian languages by India's top research institutions. No other legal aid app uses Bhashini for voice processing.

USP 5: No Download, No Account, No Cost
Saheli AI is a PWA that works in any mobile browser. No app store download, no email account, no phone number verification, no payment. A woman can borrow a family member's phone, open the browser, speak her problem, and get guidance — all anonymously, all free. This removes every barrier that existing platforms impose.

USP 6: Integrated YouTube Video Help in Multiple Languages
No existing legal platform integrates curated YouTube videos by legal category and language. Saheli AI lets users watch verified legal-aid videos in Hindi, Marathi, or English — categorized by legal issue (domestic violence, custody, property, etc.). For visual learners and those who prefer watching over reading/listening, this is a powerful additional channel.

USP 7: Automatic Case Recording and History
Every query — whether voice or text — is automatically saved as a case with full details (original query, category, guidance received, language, timestamp). Users can revisit, add notes, upload evidence (photos/audio), and track status. This creates a documented record that can be critical for legal proceedings — and no other free platform does this automatically without requiring the user to explicitly "save."

USP 8: Dual LLM with Automatic Fallback (Groq → OpenAI)
Saheli AI uses Groq's Llama 3 as the primary LLM (ultra-fast, free tier) with automatic fallback to OpenAI GPT-4o-mini if Groq fails. This ensures reliability without cost — the app works even if one provider is down, and the user never experiences a complete failure. No other legal aid platform offers this dual-provider resilience.

USP 9: Gemini for Document Understanding
Users can photograph a legal notice, court order, or police document and upload it. Gemini's multimodal capabilities extract the text and explain it in simple language in the user's chosen language. No other legal aid app for rural women offers photo-to-explanation document understanding.

USP 10: Designed for the Real Constraints of Rural India
Every design decision in Saheli AI is anchored in the documented reality of rural India:

Large touch targets (44x44px minimum) for users with calloused hands or tremors
High contrast mode for older users with vision issues
Voice-only navigation — no typing required for the core flow
Offline caching — guidance for common scenarios works without internet
Simple language — max 15 words per sentence in guidance
Cultural sensitivity — warm color palette, appropriate imagery
Works on shared devices — anonymous mode, quick exit, session clearing
5. TARGET USER PERSONAS
Persona 1: Sunita, 32, Rural Maharashtra
Married, 2 children, husband is a farm laborer
Experiences domestic violence when husband drinks
Owns a basic smartphone (shared with husband)
Can speak Marathi but cannot read or write fluently
Does not know PWDVA exists
Fearful of being caught seeking help
Saheli AI serves her: Voice input in Marathi, spoken guidance, disguise mode, SOS with direct dialing
Persona 2: Lakshmi, 45, Rural Uttar Pradesh
Widowed, fighting for property rights with brothers-in-law
Semi-literate (can read basic Hindi)
Uses her son's smartphone
Knows she has "some rights" but doesn't know what to do
Saheli AI serves her: Voice or text input in Hindi, synced text+speech guidance she can read along with, case history to track her progress, YouTube videos in Hindi about property rights
Persona 3: Priya, 26, Rural Karnataka
Seeking divorce and child custody
Educated up to 10th grade, can read and write
Has her own smartphone
Fearful husband will check her phone
Saheli AI serves her: Anonymous mode (no personal data), app disguise as calculator, quick exit, SOS, guidance in her language, evidence upload for documentation
6. MARKET CONTEXT & POLICY ALIGNMENT
6.1 Policy Alignment
Saheli AI aligns with multiple national priorities:

SDG 5 (Gender Equality): Directly addresses Target 5.2 — eliminate all forms of violence against women and girls
SDG 16 (Peace, Justice, Strong Institutions): Directly addresses Target 16.3 — promote equal access to justice for all
National Legal Services Authority Act, 1987: Women are entitled to free legal aid irrespective of income (Section 12(c)) [cite:e63129a8] — Saheli AI makes this right accessible
Digital India initiative: Leverages Bhashini (a MeitY initiative) to deliver government-grade language technology to the last mile
BharatNet / rural connectivity: PWA works on low-bandwidth mobile data connections
PMGDISHA (Pradhan Mantri Gramin Digital Saksharta Abhiyan): Complements digital literacy missions by providing a purpose-built tool for legal awareness
6.2 Competitive Landscape Summary


EXISTING SOLUTIONS          | VOICE | SAFETY | FREE | INDIAN LANGS | RURAL-FOCUSED
----------------------------|-------|--------|------|--------------|-------------
Nyaaya                      |  ❌   |   ❌   |  ✅  |    Partial   |     ❌
Nyaya Saathi                |  ❌   |   ❌   |  ✅* |    Partial   |     ❌
NyayGuru                    |  ❌   |   ❌   |  ✅* |    Yes       |     ❌
NyaySetu (Govt WhatsApp)    |  ❌   |   ❌   |  ✅  |    Partial   |     ❌
Nyaya Bandhu                | Partial|  ❌   |  ✅  |    Yes       |     ❌
NyayMithr                   |  ❌   |   ❌   |  ✅* |    Yes       |     ❌
Landesa (paralegals)        |  ❌   |   ❌   |  ✅  |    N/A       |     ✅
Tele-Law (via CSC)          |  ❌   |   ❌   |  ✅  |    Partial   |     ✅
----------------------------|-------|--------|------|--------------|-------------
SAHELI AI                   |  ✅   |   ✅   |  ✅  |    Yes       |     ✅

* = freemium model with paid tiers
Saheli AI is the only solution that combines all five critical attributes: voice-first, safety features, completely free, Indian language voice processing, and rural-focused design.

7. SOCIAL IMPACT POTENTIAL
Quantitative Projections (Year 1)



Metric	Target	Rationale
Women accessing legal guidance	50,000	Even 0.1% of the ~50M rural women facing spousal violence
Legal cases documented	10,000	20% of users actively document their case
NGO partnerships	200	Pan-India network of field workers
Villages reached	500	Through NGO pilot programs
Languages served	3 (MVP) → 10+ (scale)	Starting Hindi, Marathi, English; expanding via Bhashini
Qualitative Impact
Breaking the silence: The 87% of women who never seek help now have a private, anonymous, voice-based channel that requires no literacy and leaves no trace on shared devices.
Legal awareness at the last mile: Women who don't know PWDVA exists will hear about their rights — protection orders, maintenance, custody — in their own language, in their own voice.
Documented evidence: Auto-recorded case histories create a paper trail that can support future legal proceedings — critical when 90% of perpetrators are not even recorded in police files [cite:c7c06d16].
Safety in crisis: The SOS with direct dialer integration, app disguise, and quick exit can literally save lives in acute domestic violence situations.
Scalable without cost: Using free tiers of Bhashini, Groq, and Gemini, the app can serve thousands of women at ₹0 marginal cost until significant scale is reached.
8. KEY STATISTICS TO REFERENCE IN PRESENTATIONS
1 in 3 married Indian women has experienced spousal violence [cite:a19e9c16]
87% never seek help [cite:0e3d034e]
Only 7% of those who seek help approach a formal institution [cite:0e3d034e]
72% of women who took no action said they didn't know what to do [cite:0e3d034e]
80% of people who hadn't used legal aid had never heard of it [cite:0e3d034e]
51.6% of rural women don't own a mobile phone [cite:e2c3b00d]
Only 6.8% of domestic violence cases complete trial [cite:c7c06d16]
Conviction rate of ~15.5% under domestic violence laws [cite:c7c06d16]
38% shrinkage in the paralegal volunteer network [cite:0e3d034e]
2 lakh+ domestic cruelty cases pending in courts [cite:845b6f65]
22+ Indian languages supported by Bhashini [cite:4658d333]
₹0 cost to operate using free API tiers until scale
