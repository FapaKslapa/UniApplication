interface Env {
  APP: { fetch(request: Request): Promise<Response> };
  CRON_SECRET: string;
}

const jobs: Record<string, string> = {
  "*/20 * * * *": "check-updates",
  "0 3 * * SUN": "scrape-courses",
};

export default {
  async scheduled(controller: { cron: string }, env: Env) {
    const job = jobs[controller.cron];
    if (!job) return;

    const response = await env.APP.fetch(
      new Request(`https://app.internal/api/cron/${job}`, {
        method: "POST",
        headers: { "x-cron-secret": env.CRON_SECRET },
      }),
    );

    if (!response.ok) {
      console.error(
        `Cron ${job} failed: ${response.status} ${await response.text()}`,
      );
    }
  },
};
