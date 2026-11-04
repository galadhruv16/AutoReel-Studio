import { NextResponse } from 'next/server';
import { InstagramPublishPayload, InstagramPublishResult } from '@/types/studio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Helper to poll container status until ready or failed (max 60 seconds)
 */
async function pollContainerStatus(
  containerId: string,
  accessToken: string,
  maxAttempts = 15,
  delayMs = 3000
): Promise<{ status: string; error?: string }> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API_BASE}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(
        accessToken
      )}`
    );
    const data = await res.json();

    if (data.status_code === 'FINISHED') {
      return { status: 'FINISHED' };
    }
    if (data.status_code === 'ERROR') {
      return { status: 'ERROR', error: data.status || 'Meta video transcoding error' };
    }
    if (data.status_code === 'EXPIRED') {
      return { status: 'EXPIRED', error: 'Container expired before publishing' };
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return { status: 'IN_PROGRESS' };
}

export async function POST(request: Request) {
  try {
    const body: InstagramPublishPayload = await request.json();
    const {
      videoUrl,
      caption,
      scheduledPublishTime,
      coverUrl,
      thumbOffsetMs,
      accessToken: reqToken,
      instagramAccountId: reqAccountId,
    } = body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid public MP4 video URL is required to publish to Instagram Reels.' },
        { status: 400 }
      );
    }

    if (!caption || typeof caption !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Caption text is required for the Reel.' },
        { status: 400 }
      );
    }

    // Instagram caption limit check
    if (caption.length > 2200) {
      return NextResponse.json(
        { success: false, error: `Caption exceeds Instagram limit of 2,200 characters (current: ${caption.length}).` },
        { status: 400 }
      );
    }

    const envToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const envAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

    const accessToken = reqToken || envToken;
    const accountId = reqAccountId || envAccountId;

    const hasLiveCredentials =
      Boolean(accessToken && accountId) &&
      !accessToken?.includes('your_') &&
      !accountId?.includes('your_') &&
      accessToken!.length > 15;

    // Validate scheduling timestamp if provided
    let scheduledTimeISO: string | undefined;
    if (scheduledPublishTime) {
      const nowSec = Math.floor(Date.now() / 1000);
      const minSchedule = nowSec + 15 * 60; // minimum 15 mins ahead
      const maxSchedule = nowSec + 75 * 24 * 60 * 60; // maximum 75 days ahead

      if (scheduledPublishTime < minSchedule) {
        return NextResponse.json(
          {
            success: false,
            error: 'Meta Graph API requires scheduled posts to be at least 15 minutes in the future.',
          },
          { status: 400 }
        );
      }
      if (scheduledPublishTime > maxSchedule) {
        return NextResponse.json(
          {
            success: false,
            error: 'Meta Graph API allows scheduling at most 75 days in advance.',
          },
          { status: 400 }
        );
      }
      scheduledTimeISO = new Date(scheduledPublishTime * 1000).toISOString();
    }

    // =========================================================================
    // CASE A: SANDBOX / SIMULATION MODE (No live credentials set)
    // =========================================================================
    if (!hasLiveCredentials) {
      const mockContainerId = `sim_cnt_${Date.now()}`;
      const mockMediaId = `sim_reel_${Date.now()}`;
      const mockCode = 'C' + Math.random().toString(36).substring(2, 10).toUpperCase();

      return NextResponse.json({
        success: true,
        mode: 'sandbox',
        containerId: mockContainerId,
        mediaId: mockMediaId,
        permalink: `https://www.instagram.com/reel/${mockCode}/`,
        status: scheduledPublishTime ? 'SCHEDULED' : 'PUBLISHED',
        scheduledTime: scheduledTimeISO,
        message: scheduledPublishTime
          ? `[Sandbox Simulation] Reel scheduled for ${scheduledTimeISO}. Configure INSTAGRAM_ACCESS_TOKEN in .env for live Meta Graph posting.`
          : `[Sandbox Simulation] Reel published successfully to simulated profile. Configure INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID in .env to publish live to Instagram.`,
      } as InstagramPublishResult);
    }

    // =========================================================================
    // CASE B: LIVE META GRAPH API v19.0 EXECUTION
    // =========================================================================

    // Step 1: Create media container
    const containerParams = new URLSearchParams();
    containerParams.append('access_token', accessToken!);
    containerParams.append('media_type', 'REELS');
    containerParams.append('video_url', videoUrl);
    containerParams.append('caption', caption);
    containerParams.append('share_to_feed', 'true');

    if (coverUrl) {
      containerParams.append('cover_url', coverUrl);
    }
    if (thumbOffsetMs !== undefined) {
      containerParams.append('thumb_offset', String(thumbOffsetMs));
    }
    if (scheduledPublishTime) {
      containerParams.append('scheduled_publish_time', String(scheduledPublishTime));
    }

    const containerRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: containerParams.toString(),
    });

    const containerData = await containerRes.json();

    if (!containerRes.ok || !containerData.id) {
      const errMsg =
        containerData.error?.message ||
        `Failed to create Instagram Reel container (HTTP ${containerRes.status})`;
      return NextResponse.json(
        {
          success: false,
          mode: 'live',
          error: errMsg,
        } as InstagramPublishResult,
        { status: 502 }
      );
    }

    const containerId = containerData.id;

    // Step 2: Poll container until Meta transcode is ready
    const pollResult = await pollContainerStatus(containerId, accessToken!);
    if (pollResult.status === 'ERROR' || pollResult.status === 'EXPIRED') {
      return NextResponse.json(
        {
          success: false,
          mode: 'live',
          containerId,
          error: pollResult.error || 'Instagram video container failed transcoding.',
        } as InstagramPublishResult,
        { status: 502 }
      );
    }

    // If scheduled, Meta automatically publishes when the scheduled_publish_time arrives!
    if (scheduledPublishTime) {
      return NextResponse.json({
        success: true,
        mode: 'live',
        containerId,
        status: 'SCHEDULED',
        scheduledTime: scheduledTimeISO,
        message: `Reel container scheduled successfully on Meta Instagram Graph API for ${scheduledTimeISO}`,
      } as InstagramPublishResult);
    }

    // Step 3: Publish immediate container
    const publishParams = new URLSearchParams();
    publishParams.append('access_token', accessToken!);
    publishParams.append('creation_id', containerId);

    const publishRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishParams.toString(),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok || !publishData.id) {
      return NextResponse.json(
        {
          success: false,
          mode: 'live',
          containerId,
          error: publishData.error?.message || 'Failed to publish Instagram media container',
        } as InstagramPublishResult,
        { status: 502 }
      );
    }

    const mediaId = publishData.id;

    // Step 4: Fetch permalink
    let permalink = `https://www.instagram.com/`;
    try {
      const permalinkRes = await fetch(
        `${GRAPH_API_BASE}/${mediaId}?fields=permalink,shortcode&access_token=${encodeURIComponent(
          accessToken!
        )}`
      );
      if (permalinkRes.ok) {
        const pData = await permalinkRes.json();
        if (pData.permalink) {
          permalink = pData.permalink;
        }
      }
    } catch {
      // ignore permalink lookup error
    }

    return NextResponse.json({
      success: true,
      mode: 'live',
      containerId,
      mediaId,
      permalink,
      status: 'PUBLISHED',
      message: 'Reel published live to Instagram Reels successfully!',
    } as InstagramPublishResult);
  } catch (error: any) {
    console.error('Instagram publish error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while processing Instagram publication',
      },
      { status: 500 }
    );
  }
}
