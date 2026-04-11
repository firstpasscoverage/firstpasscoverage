<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into First Pass Coverage. The integration covers the full user journey — from uploading a screenplay through receiving coverage, purchasing credits, and managing subscriptions — with both client-side and server-side event tracking.

**Key changes made:**

- **`instrumentation-client.ts`** (new): Initializes PostHog client-side using the Next.js 16.2 recommended approach, with reverse proxy ingestion, exception capture, and debug mode in development.
- **`src/app/posthog-provider.tsx`** (updated): Removed the `useEffect`-based `posthog.init()` call (now handled by `instrumentation-client.ts`) while keeping the `PHProvider` React context wrapper.
- **`next.config.ts`** (updated): Added PostHog reverse proxy rewrites (`/ingest/...`) to improve ad-blocker resilience and `skipTrailingSlashRedirect: true`.
- **`src/lib/posthog-server.ts`** (new): Singleton server-side PostHog client (`posthog-node`) for capturing events from API routes and webhook handlers.
- **`.env.local`** (updated): Ensured `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` are set to correct values.
- **`posthog-node`** installed as a new dependency.

| Event | Description | File |
|---|---|---|
| `screenplay_uploaded` | User selects or drops a valid screenplay PDF | `src/app/coverage/page.tsx` |
| `coverage_analysis_started` | User clicks "Analyze Screenplay" | `src/app/coverage/page.tsx` |
| `coverage_analysis_completed` | Analysis finishes successfully (includes `overall_score`) | `src/app/coverage/page.tsx` |
| `coverage_analysis_failed` | Analysis returns an error (includes `error` message) | `src/app/coverage/page.tsx` |
| `coverage_pdf_downloaded` | User downloads PDF from live coverage page | `src/app/coverage/page.tsx` |
| `coverage_copied_to_clipboard` | User copies coverage text from live coverage page | `src/app/coverage/page.tsx` |
| `checkout_initiated` | User clicks a pricing button (includes `plan`, `billing_period`, `price_id`) | `src/app/pricing/page.tsx` |
| `library_coverage_pdf_downloaded` | User downloads PDF from library detail view | `src/app/library/[id]/CoverageDetailClient.tsx` |
| `library_coverage_copied` | User copies coverage from library detail view | `src/app/library/[id]/CoverageDetailClient.tsx` |
| `coverage_analyzed` | Server-side: analysis saved to DB (includes `title`, `genre`, `page_count`, `overall_score`, `recommendation`, `calculated_score`) | `src/app/api/analyze/route.ts` |
| `checkout_session_created` | Server-side: Stripe checkout session created (includes `price_type`, `price_id`) | `src/app/api/stripe/checkout/route.ts` |
| `payment_completed` | Server-side: one-off payment fulfilled, credits added (includes `credits_added`, `amount_total`) | `src/app/api/stripe/webhook/route.ts` |
| `subscription_activated` | Server-side: subscription payment succeeded (includes `tier`, `credits`) | `src/app/api/stripe/webhook/route.ts` |
| `subscription_canceled` | Server-side: subscription canceled or expired | `src/app/api/stripe/webhook/route.ts` |

## Next steps

We've built a dashboard and five insights to keep an eye on the metrics that matter most:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/366219/dashboard/1430965

- **Coverage Submission Funnel** (upload → started → completed): https://us.posthog.com/project/366219/insights/xbL26Dck
- **Coverage Analyses Over Time** (daily active users): https://us.posthog.com/project/366219/insights/8c2pcGBG
- **Checkout Initiated by Plan** (which plans drive the most clicks): https://us.posthog.com/project/366219/insights/riKhtVUN
- **Subscriptions Activated vs. Canceled** (churn indicator): https://us.posthog.com/project/366219/insights/DzR84Xui
- **Analysis Failure Rate** (failed / started × 100): https://us.posthog.com/project/366219/insights/CNwgCTgb

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
