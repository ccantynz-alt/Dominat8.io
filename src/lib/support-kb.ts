/**
 * Support Knowledge Base — AI Customer Support
 *
 * Comprehensive product knowledge that Claude uses to answer
 * customer emails accurately. This is the single source of truth
 * for all support responses.
 *
 * Covers: product features, pricing, billing, technical issues,
 * account management, and common troubleshooting steps.
 */

// ── Knowledge base articles ──────────────────────────────────────────────────

export interface KBArticle {
  id: string;
  category: SupportCategory;
  title: string;
  content: string;
  keywords: string[];
}

export type SupportCategory =
  | "billing"
  | "technical"
  | "account"
  | "feature"
  | "bug"
  | "general";

export type SupportPriority = "low" | "medium" | "high" | "urgent";

export const KNOWLEDGE_BASE: KBArticle[] = [
  // ── Billing & Pricing ────────────────────────────────────────────────────
  {
    id: "kb-pricing-plans",
    category: "billing",
    title: "Pricing Plans Overview",
    content: `Dominat8.io has four pricing tiers:

**Free — $0/month**
- 3 agent credits per month
- 7-day share links
- HTML download
- Design presets
- Agents: SEO Sweep, Responsive Audit, Claude Builder

**Starter — $9/month**
- 20 agent credits per month
- 90-day share links
- Fix agent access
- SEO scan
- Embed/export
- Adds: Link Scanner, Accessibility Checker, Performance Optimizer, Claude Refiner

**Pro — $29/month**
- 100 agent credits per month
- A/B variants & seasonal variants
- CDN deploy with custom domain
- Email support
- Password-protected shares
- Monthly rebuild
- Adds: Design Fixer agent

**Agency — $99/month**
- 500 agent credits per month
- Everything in Pro
- 5 team seats
- White-label output
- API access
- Bulk generation
- Weekly rebuild
- SLA + dedicated support

All paid plans include a 14-day money-back guarantee.`,
    keywords: ["price", "pricing", "plan", "cost", "free", "starter", "pro", "agency", "subscription", "tier"],
  },
  {
    id: "kb-credits",
    category: "billing",
    title: "Agent Credits System",
    content: `Credits are consumed when you run AI agents:

**Credit costs per agent:**
- SEO Sweep: 1 credit
- Responsive Audit: 1 credit
- Link Scanner: 1 credit
- Accessibility Checker: 2 credits
- Performance Optimizer: 2 credits
- Claude Refiner: 2 credits
- Claude Builder: 3 credits
- Design Fixer: 5 credits

**Monthly credits reset** on the 1st of each month.
**Purchased credits never expire.**

**Credit packs:**
- 50 credits: $4.99
- 200 credits: $14.99 (most popular)
- 500 credits: $29.99 (best value)

Credits deduct from monthly allowance first, then purchased balance.`,
    keywords: ["credit", "credits", "agent", "usage", "allowance", "pack", "buy", "purchase", "run out", "how many"],
  },
  {
    id: "kb-billing-manage",
    category: "billing",
    title: "Managing Your Subscription",
    content: `**Upgrade:** Go to /pricing and select a new plan. Changes take effect immediately.
**Downgrade:** Contact support or manage via your Stripe billing portal. You keep access until the current billing period ends.
**Cancel:** You can cancel anytime. Your plan stays active until the end of the billing period. After that, you revert to the Free plan.
**Refunds:** We offer a 14-day money-back guarantee on all paid plans. Contact hello@dominat8.io for refund requests.
**Invoices:** Available through your Stripe billing portal. We send receipts via email after each payment.`,
    keywords: ["upgrade", "downgrade", "cancel", "refund", "invoice", "billing", "subscription", "change plan", "money back"],
  },

  // ── Technical / How-To ───────────────────────────────────────────────────
  {
    id: "kb-getting-started",
    category: "technical",
    title: "Getting Started",
    content: `**How to build your first website:**
1. Go to dominat8.io/build
2. Describe your business in one sentence (e.g., "A premium dog walking service in Austin, TX")
3. Optionally select an industry and design vibe
4. Click "Generate" — your site appears in ~30 seconds
5. Preview, iterate, and download or deploy

**No coding required.** The AI generates complete HTML, CSS, and JavaScript.

**Tips for better results:**
- Be specific about your business (location, services, unique selling points)
- Mention your target audience
- Reference a design style you like (minimal, bold, glass, etc.)
- Include details like pricing, testimonials, or team info for more realistic content`,
    keywords: ["start", "getting started", "how to", "build", "create", "first site", "tutorial", "guide", "begin"],
  },
  {
    id: "kb-custom-domain",
    category: "technical",
    title: "Custom Domains",
    content: `**Custom domains are available on Pro ($29/mo) and Agency ($99/mo) plans.**

To connect your domain:
1. Deploy your site via the CDN deploy feature
2. Add a CNAME record pointing to your Dominat8 subdomain
3. SSL is provisioned automatically (Let's Encrypt)
4. DNS propagation takes 15-60 minutes

**Subdomains:** Pro and Agency users get a free yourname.dominat8.io subdomain.

**Troubleshooting:**
- If your domain shows "Not Secure," wait for SSL provisioning (up to 1 hour)
- If it's not resolving, double-check the CNAME record
- Existing DNS records (A records) may conflict — remove them first`,
    keywords: ["domain", "custom domain", "CNAME", "DNS", "SSL", "subdomain", "connect domain", "own domain"],
  },
  {
    id: "kb-editing",
    category: "technical",
    title: "Editing Generated Sites",
    content: `**Yes, you can edit and iterate on your generated website.**

Options:
1. **Re-generate sections:** Ask the AI to change specific parts ("make the hero bigger", "change CTA color to blue")
2. **Run agents:** Use SEO Sweep, Design Fixer, etc. to automatically improve specific aspects
3. **Download HTML:** Export the raw HTML/CSS/JS and edit in any code editor
4. **Conversational editing:** Use the /api/io/converse endpoint for back-and-forth iteration (keeps full conversation history)

**The AI remembers your preferences** if you use the Memory feature — your brand colors, fonts, and business info carry across sessions.`,
    keywords: ["edit", "change", "modify", "update", "iterate", "redo", "revise", "customize"],
  },
  {
    id: "kb-seo",
    category: "technical",
    title: "SEO Features",
    content: `Dominat8 generates SEO-ready websites with:
- Meta title and description tags
- Open Graph tags for social sharing
- Proper heading hierarchy (H1 → H2 → H3)
- Semantic HTML structure
- Mobile-responsive design (Google's #1 ranking factor)
- Fast load times (single-page, no bloat)

**SEO agents:**
- **SEO Sweep** (1 credit): Quick scan with actionable recommendations
- **Deep SEO Audit** (via /api/io/seo-deep): Comprehensive analysis with citations

**Sitemap & robots.txt** can be generated through the SEO pipeline configuration.`,
    keywords: ["SEO", "search engine", "Google", "ranking", "meta", "sitemap", "robots", "optimization", "traffic"],
  },

  // ── Account ──────────────────────────────────────────────────────────────
  {
    id: "kb-account-manage",
    category: "account",
    title: "Account Management",
    content: `**Sign up/in:** Uses Clerk authentication (email, Google, or GitHub).
**Email change:** Update your email in account settings.
**Password reset:** Click "Forgot password" on the sign-in page.
**Delete account:** Email privacy@dominat8.io with the subject "Account Deletion Request." We process deletions within 7 business days. All your data (sites, preferences, conversation history) is permanently deleted.
**Data export:** You can download all your generated HTML at any time via the dashboard. Conversation history and memory data can be exported via the API.
**Privacy:** See our privacy policy at dominat8.io/privacy. We retain generated sites for 90 days (shared) or 30 days (account data after deletion).`,
    keywords: ["account", "login", "password", "delete", "privacy", "data", "GDPR", "export", "sign in", "sign up"],
  },

  // ── Features ─────────────────────────────────────────────────────────────
  {
    id: "kb-agents",
    category: "feature",
    title: "AI Agents Overview",
    content: `Dominat8 has 8 specialized AI agents:

1. **Claude Builder** (3 credits) — Generates complete websites from a text prompt
2. **Claude Refiner** (2 credits) — Improves and polishes existing sites
3. **SEO Sweep** (1 credit) — Quick SEO audit and fixes
4. **Responsive Audit** (1 credit) — Checks mobile/tablet compatibility
5. **Link Scanner** (1 credit) — Validates all links and anchors
6. **Accessibility Checker** (2 credits) — WCAG compliance check
7. **Performance Optimizer** (2 credits) — Speed and Core Web Vitals
8. **Design Fixer** (5 credits) — Advanced design improvements

**Agent access depends on your plan.** Free users get 3 agents. Starter unlocks all except Design Fixer. Pro and Agency get everything.`,
    keywords: ["agent", "AI", "builder", "refiner", "SEO", "audit", "accessibility", "performance", "design fixer"],
  },
  {
    id: "kb-api-access",
    category: "feature",
    title: "API Access",
    content: `**API access is available on the Agency plan ($99/mo).**

Endpoints include:
- POST /api/io/generate — Generate a website from text
- POST /api/io/converse — Iterative design conversation
- POST /api/io/validate — Code validation
- POST /api/io/research — Competitor research
- POST /api/io/orchestrate — Full pipeline (research → build → validate)
- POST /api/io/export — Generate client deliverables

Authentication: Include your API key in the Authorization header.
Rate limits: 60 requests/minute on Agency plan.

Full API documentation is available at dominat8.io/docs (coming soon).`,
    keywords: ["API", "endpoint", "integration", "developer", "programmatic", "automate", "webhook"],
  },

  // ── Common Issues ────────────────────────────────────────────────────────
  {
    id: "kb-generation-failed",
    category: "bug",
    title: "Generation Failed / Timeout",
    content: `**If your website generation fails:**

1. **Try again** — Transient API errors happen occasionally. A simple retry usually works.
2. **Simplify your prompt** — Very long or complex prompts can time out. Try a shorter description.
3. **Check your credits** — If you're out of credits, the generation will fail. Check your balance at /dashboard.
4. **Browser issues** — Clear your cache or try an incognito window.
5. **Service status** — If multiple generations fail, our AI provider may be experiencing issues. Try again in 5-10 minutes.

If the problem persists after 3+ attempts, contact hello@dominat8.io with:
- Your prompt (what you typed)
- The error message (if any)
- Your browser and device`,
    keywords: ["fail", "error", "timeout", "broken", "not working", "crash", "stuck", "loading", "slow"],
  },
  {
    id: "kb-site-not-loading",
    category: "bug",
    title: "Deployed Site Not Loading",
    content: `**If your deployed site isn't loading:**

1. **DNS propagation** — After connecting a custom domain, wait 15-60 minutes for DNS to propagate.
2. **SSL provisioning** — HTTPS certificates take up to 1 hour to provision. Try HTTP in the meantime.
3. **Check CNAME record** — Ensure it points to your .dominat8.io subdomain (not an IP address).
4. **Clear browser cache** — Hard refresh (Ctrl+Shift+R / Cmd+Shift+R).
5. **Remove conflicting records** — Delete any existing A records for the same hostname.

If the site was working before and suddenly stopped, contact support with your domain name.`,
    keywords: ["deploy", "live", "not loading", "down", "offline", "domain", "DNS", "SSL", "HTTPS"],
  },
];

// ── Lookup helpers ───────────────────────────────────────────────────────────

export function searchKnowledgeBase(query: string): KBArticle[] {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/).filter((w) => w.length > 2);

  // Score each article by keyword match
  const scored = KNOWLEDGE_BASE.map((article) => {
    let score = 0;
    for (const word of words) {
      for (const kw of article.keywords) {
        if (kw.includes(word) || word.includes(kw)) score += 2;
      }
      if (article.title.toLowerCase().includes(word)) score += 3;
      if (article.content.toLowerCase().includes(word)) score += 1;
    }
    return { article, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.article);
}

export function getArticlesByCategory(category: SupportCategory): KBArticle[] {
  return KNOWLEDGE_BASE.filter((a) => a.category === category);
}

// ── Format KB articles as context for Claude ─────────────────────────────────

export function formatKBForPrompt(articles: KBArticle[]): string {
  if (articles.length === 0) return "";

  return articles
    .map((a) => `### ${a.title}\n${a.content}`)
    .join("\n\n---\n\n");
}
