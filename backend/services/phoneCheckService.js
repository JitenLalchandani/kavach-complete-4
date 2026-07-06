const axios = require('axios');

// ─── NumVerify ────────────────────────────────────────────────────────────────
// Verifies phone numbers and detects carrier (Jio/Airtel/VI etc.)
// Get free API key at https://numverify.com
const NUMVERIFY_API_KEY = process.env.NUMVERIFY_API_KEY;

// ─── Truecaller ───────────────────────────────────────────────────────────────
// Best spam/scam number database for India
// Apply for API access at https://truecaller.com/blog/truecaller-api
const TRUECALLER_API_KEY = process.env.TRUECALLER_API_KEY;

// ─── Google Safe Browsing ─────────────────────────────────────────────────────
// Detects phishing/malware links
// Get free API key at https://developers.google.com/safe-browsing
const GOOGLE_SAFE_BROWSING_KEY = process.env.GOOGLE_SAFE_BROWSING_KEY;

/**
 * Cleans a phone number to digits only with country code.
 * Defaults to +91 (India) if no country code provided.
 */
const normalizePhone = (number) => {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

// ─── NumVerify: Carrier & Line Type Detection ─────────────────────────────────
const checkWithNumVerify = async (phoneNumber) => {
  if (!NUMVERIFY_API_KEY) {
    console.warn('[NumVerify] API key not set — running in demo mode');
    return {
      valid: true,
      carrier: 'Unknown (NumVerify API key not configured)',
      lineType: 'mobile',
      location: 'India',
      countryCode: 'IN',
      demo: true,
    };
  }

  try {
    const number = normalizePhone(phoneNumber);
    const response = await axios.get('http://apilayer.net/api/validate', {
      params: {
        access_key: NUMVERIFY_API_KEY,
        number,
        country_code: 'IN',
        format: 1,
      },
      timeout: 8000,
    });

    const data = response.data;
    return {
      valid: data.valid,
      carrier: data.carrier || 'Unknown',
      lineType: data.line_type || 'unknown',
      location: data.location || 'India',
      countryCode: data.country_code || 'IN',
      internationalFormat: data.international_format,
      demo: false,
    };
  } catch (error) {
    console.error('[NumVerify] Error:', error.message);
    return { valid: null, carrier: 'Lookup failed', demo: false, error: true };
  }
};

// ─── Truecaller: Spam Score & Scam Detection ──────────────────────────────────
const checkWithTruecaller = async (phoneNumber) => {
  if (!TRUECALLER_API_KEY) {
    console.warn('[Truecaller] API key not set — running in demo mode');
    return {
      isSpam: false,
      spamScore: 0,
      spamType: null,
      name: 'Unknown',
      tags: [],
      demo: true,
      message: 'Truecaller API key not configured. Add TRUECALLER_API_KEY to .env to enable real spam detection.',
    };
  }

  try {
    const number = normalizePhone(phoneNumber);
    const response = await axios.get('https://api4.truecaller.com/v1/search', {
      params: { q: number, countryCode: 'IN', type: 4 },
      headers: {
        Authorization: `Bearer ${TRUECALLER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    });

    const data = response.data;
    const topMatch = data?.data?.[0];

    return {
      isSpam: topMatch?.spamInfo?.isSpam || false,
      spamScore: topMatch?.spamInfo?.spamScore || 0,
      spamType: topMatch?.spamInfo?.spamType || null,
      name: topMatch?.name || 'Unknown',
      tags: topMatch?.tags || [],
      demo: false,
    };
  } catch (error) {
    console.error('[Truecaller] Error:', error.message);
    return {
      isSpam: false,
      spamScore: 0,
      spamType: null,
      name: 'Unknown',
      tags: [],
      demo: false,
      error: true,
      message: 'Truecaller lookup failed',
    };
  }
};

// ─── Google Safe Browsing: Link/URL Scam Detection ───────────────────────────
const checkUrlWithGoogleSafeBrowsing = async (urls) => {
  const urlList = Array.isArray(urls) ? urls : [urls];

  if (!GOOGLE_SAFE_BROWSING_KEY) {
    console.warn('[GoogleSafeBrowsing] API key not set — running in demo mode');
    return {
      threats: [],
      safe: true,
      demo: true,
      message: 'Google Safe Browsing API key not configured. Add GOOGLE_SAFE_BROWSING_KEY to .env to enable link scanning.',
    };
  }

  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_KEY}`,
      {
        client: { clientId: 'kavach-app', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: urlList.map((url) => ({ url })),
        },
      },
      { timeout: 8000 }
    );

    const matches = response.data?.matches || [];
    return {
      threats: matches.map((m) => ({
        url: m.threat?.url,
        threatType: m.threatType,
        platformType: m.platformType,
      })),
      safe: matches.length === 0,
      demo: false,
    };
  } catch (error) {
    console.error('[GoogleSafeBrowsing] Error:', error.message);
    return { threats: [], safe: true, demo: false, error: true, message: 'Link scan failed' };
  }
};

// ─── Combined Full Scam Check ─────────────────────────────────────────────────
/**
 * Runs all available checks on a phone number and optional URLs extracted
 * from a message, then returns a unified risk assessment.
 */
const fullScamCheck = async ({ phoneNumber, urls = [] }) => {
  const results = { phoneNumber: null, urlScan: null, overallRisk: 'low', summary: [] };

  if (phoneNumber) {
    const [numVerify, truecaller] = await Promise.all([
      checkWithNumVerify(phoneNumber),
      checkWithTruecaller(phoneNumber),
    ]);

    results.phoneNumber = { numVerify, truecaller };

    if (truecaller.isSpam) {
      results.overallRisk = truecaller.spamScore > 70 ? 'critical' : 'high';
      results.summary.push(`⚠️ This number is flagged as spam by Truecaller (score: ${truecaller.spamScore}/100)`);
    }
    if (truecaller.spamType) {
      results.summary.push(`Spam type: ${truecaller.spamType}`);
    }
    if (numVerify.carrier) {
      results.summary.push(`Carrier: ${numVerify.carrier} · Line type: ${numVerify.lineType}`);
    }
    if (!numVerify.valid && numVerify.valid !== null) {
      results.summary.push('⚠️ This phone number appears to be invalid');
      if (results.overallRisk === 'low') results.overallRisk = 'medium';
    }
  }

  if (urls.length > 0) {
    const urlScan = await checkUrlWithGoogleSafeBrowsing(urls);
    results.urlScan = urlScan;

    if (!urlScan.safe && urlScan.threats.length > 0) {
      results.overallRisk = 'critical';
      urlScan.threats.forEach((t) => {
        results.summary.push(`🔴 Dangerous link detected: ${t.url} (${t.threatType})`);
      });
    }
  }

  if (results.summary.length === 0) {
    results.summary.push('No immediate threats detected by automated checks.');
  }

  return results;
};

/**
 * Extracts URLs from a block of text (e.g. a scam SMS or WhatsApp message)
 */
const extractUrls = (text) => {
  const urlRegex = /https?:\/\/[^\s]+/gi;
  return text.match(urlRegex) || [];
};

module.exports = {
  checkWithNumVerify,
  checkWithTruecaller,
  checkUrlWithGoogleSafeBrowsing,
  fullScamCheck,
  extractUrls,
};
