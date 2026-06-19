import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY || '';
const UPSTASH_URL = import.meta.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_TOKEN = import.meta.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

const kitUrl = 'https://mikeyshaw.work/mikey-shaw-acmi-starter-kit.html';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { firstName, email, role } = body;

    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: 'firstName and email required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailSlug = email.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const ts = Date.now();

    // 1. Save lead to Upstash Redis
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      const lead = {
        email, firstName, role,
        source: 'acmi-starter-kit',
        subscribed: true,
        created_at: new Date().toISOString(),
        status: 'kit-sent'
      };

      await fetch(`${UPSTASH_URL}/pipeline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
          ['SET', `acmi:lead:${emailSlug}:starter-kit`, JSON.stringify(lead)],
          ['ZADD', 'acmi:leads:starter-kit:timeline', ts.toString(), JSON.stringify({
            ts, source: `lead:${emailSlug}`, kind: 'kit-download-request',
            summary: `[lead-intake @mikey] ${firstName} ${email} requested ACMI Starter Kit (role: ${role})`
          })],
          ['ZADD', 'acmi:bus:relay:events', ts.toString(), JSON.stringify({
            ts, source: 'agent:bentley', kind: 'lead-captured',
            correlationId: `starterKitLead-${ts}`,
            summary: `[lead-captured @bentley] ${firstName} ${email} — ACMI Starter Kit requested, role: ${role}`
          })]
        ])
      });
    }

    // 2. Send welcome email via Resend
    let emailSent = false;
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        await resend.emails.send({
          from: 'Mikey Shaw <mikey@madezmedia.com>',
          to: email,
          subject: `Your ACMI Starter Kit is ready, ${firstName} 👋`,
          html: getWelcomeEmail(firstName, kitUrl)
        });
        emailSent = true;
      } catch (emailErr: any) {
        console.error('[starter-kit] Resend error:', emailErr?.message);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      emailSent,
      message: emailSent
        ? 'Check your inbox — the kit is on its way!'
        : 'Your download link will arrive shortly.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('[starter-kit] Fatal error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};

function getWelcomeEmail(firstName: string, url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your ACMI Starter Kit</title>
</head>
<body style="margin:0;padding:0;background:#faf9f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f5;padding:40px 20px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e5df;">

        <!-- Header -->
        <tr>
          <td style="background:#2d4a3e;padding:40px 48px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#00b9f1;font-family:monospace;">Free Resource · No fluff</p>
            <h1 style="margin:0;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">
              Your ACMI Starter Kit<br/>is ready.
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 20px;font-size:16px;color:#2d4a3e;line-height:1.6;">
              Hey ${firstName}, 👋
            </p>
            <p style="margin:0 0 20px;font-size:15px;color:#2d4a3e;line-height:1.7;">
              Most AI tools forget everything after every session. ACMI gives your AI a <strong>persistent memory layer</strong> — so it knows your business, your clients, and your goals across every conversation, forever.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#2d4a3e;line-height:1.7;">
              Your kit includes:
            </p>
            <ul style="margin:0 0 28px 0;padding:0 0 0 20px;">
              <li style="margin-bottom:10px;font-size:14px;color:#2d4a3e;">✅ <strong>The ACMI Business Entity Model</strong> — Profile / Signals / Timeline template</li>
              <li style="margin-bottom:10px;font-size:14px;color:#2d4a3e;">✅ <strong>The 30-Day Signal Audit Guide</strong> — find your biggest context gaps</li>
              <li style="margin-bottom:10px;font-size:14px;color:#2d4a3e;">✅ <strong>The Starter Code Pack</strong> — Node.js scripts, 20-min setup</li>
              <li style="margin-bottom:10px;font-size:14px;color:#2d4a3e;">✅ <strong>10 AI Conversation Starters</strong> — prompts designed for ACMI context</li>
            </ul>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
              <tr>
                <td style="background:#2d4a3e;border-radius:100px;padding:16px 32px;text-align:center;">
                  <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">
                    ↓ Download Your ACMI Starter Kit
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px;font-size:14px;color:#2d4a3e;line-height:1.6;">
              <em>P.S. Want to talk through how to apply this to your specific business?</em>
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#2d4a3e;line-height:1.6;">
              Book a free 20-min strategy call — no sales pitch, just working through your workflow.
            </p>

            <!-- Calendly link -->
            <table cellpadding="0" cellspacing="0" style="margin:0;">
              <tr>
                <td style="background:#E5007d;border-radius:100px;padding:14px 28px;text-align:center;">
                  <a href="https://cal.com/mad-ez-media/ai-automation-discovery" style="color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">
                    → Book a Free 20-Min Strategy Call
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f3f0;padding:24px 48px;text-align:center;border-top:1px solid #e8e5df;">
            <p style="margin:0;font-size:12px;color:#2d4a3e;opacity:0.6;line-height:1.5;">
              You're getting this because you requested the ACMI Starter Kit from mikeyshaw.work.<br/>
              No spam. Unsubscribe anytime.<br/>
              © 2026 Mad EZ Media Partners
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
