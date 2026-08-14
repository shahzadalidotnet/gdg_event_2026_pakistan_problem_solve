const { HttpError } = require('./http');

const JSON_FIELDS = ['documents', 'steps', 'offices', 'tips'];
function requireObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  return value;
}

function cleanString(value, field, options = {}) {
  const { required = false, max = 500, min = 0, nullable = false } = options;
  if (value === undefined || value === null) {
    if (required) throw new HttpError(400, `${field} is required`);
    return nullable ? null : undefined;
  }
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string`);
  const cleaned = value.trim();
  if (!cleaned && required) throw new HttpError(400, `${field} is required`);
  if (!cleaned && nullable) return null;
  if (cleaned.length < min) throw new HttpError(400, `${field} must be at least ${min} characters`);
  if (cleaned.length > max) throw new HttpError(400, `${field} must be at most ${max} characters`);
  return cleaned;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateDate(value, field, required = false) {
  const cleaned = cleanString(value, field, { required, max: 10, nullable: !required });
  if (cleaned && !isIsoDate(cleaned)) {
    throw new HttpError(400, `${field} must be a valid ISO date (YYYY-MM-DD)`);
  }
  return cleaned;
}

function validateEmail(value) {
  const email = cleanString(value, 'email', { max: 254, nullable: true });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'email must be valid');
  }
  return email;
}

function validateSlug(value) {
  const slug = cleanString(value, 'slug', { required: true, max: 120 });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new HttpError(400, 'slug must contain lowercase letters, numbers, and single hyphens only');
  }
  return slug;
}

function validateUrl(value) {
  const url = cleanString(value, 'source_url', { required: true, max: 2048 });
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol');
  } catch {
    throw new HttpError(400, 'source_url must be a valid HTTP(S) URL');
  }
  return url;
}

function validateStringArray(value, field) {
  if (!Array.isArray(value) || value.length > 100) {
    throw new HttpError(400, `${field} must be an array with at most 100 items`);
  }
  return value.map((item, index) => cleanString(item, `${field}[${index}]`, { required: true, max: 500 }));
}

function validateSteps(value) {
  if (!Array.isArray(value) || value.length > 100) {
    throw new HttpError(400, 'steps must be an array with at most 100 items');
  }
  return value.map((step, index) => {
    requireObject(step);
    return {
      title: cleanString(step.title, `steps[${index}].title`, { required: true, max: 200 }),
      detail: cleanString(step.detail, `steps[${index}].detail`, { required: true, max: 3000 }),
    };
  });
}

function validateGuide(body, options = {}) {
  requireObject(body);
  const slug = options.slug || validateSlug(body.slug);
  if (options.slug && body.slug !== undefined && validateSlug(body.slug) !== options.slug) {
    throw new HttpError(400, 'The guide slug cannot be changed');
  }

  const guide = {
    slug,
    org: cleanString(body.org, 'org', { required: true, max: 200 }),
    title: cleanString(body.title, 'title', { required: true, max: 300 }),
    summary: cleanString(body.summary, 'summary', { required: true, max: 3000 }),
    last_verified: validateDate(body.last_verified, 'last_verified', true),
    source_label: cleanString(body.source_label, 'source_label', { required: true, max: 200 }),
    source_url: validateUrl(body.source_url),
    fee: cleanString(body.fee, 'fee', { required: true, max: 500 }),
    processing_time: cleanString(body.processing_time, 'processing_time', { required: true, max: 500 }),
    documents: validateStringArray(body.documents, 'documents'),
    steps: validateSteps(body.steps),
    offices: validateStringArray(body.offices, 'offices'),
    hours: cleanString(body.hours, 'hours', { required: true, max: 1000 }),
    collection: cleanString(body.collection, 'collection', { required: true, max: 2000 }),
    tips: validateStringArray(body.tips, 'tips'),
  };

  return guide;
}

function validateReport(body) {
  requireObject(body);
  return {
    guideSlug: validateSlug(body.guideSlug),
    message: cleanString(body.message, 'message', { required: true, min: 5, max: 3000 }),
    visitedOn: validateDate(body.visitedOn, 'visitedOn'),
    city: cleanString(body.city, 'city', { max: 120, nullable: true }),
    reporterEmail: validateEmail(body.email),
  };
}

function validateConfirmation(body) {
  requireObject(body);
  return { guideSlug: validateSlug(body.guideSlug) };
}

function serializeGuide(guide) {
  return {
    ...guide,
    ...Object.fromEntries(JSON_FIELDS.map((field) => [field, JSON.stringify(guide[field])])),
  };
}

module.exports = {
  JSON_FIELDS,
  cleanString,
  requireObject,
  serializeGuide,
  validateConfirmation,
  validateGuide,
  validateReport,
  validateSlug,
};
