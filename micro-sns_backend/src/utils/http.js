export const ok = (res, data) => res.json({ ok: true, data });
export const created = (res, data) => res.status(201).json({ ok: true, data });
export const badRequest = (res, msg) =>
  res.status(400).json({ ok: false, error: msg });
export const notFound = (res, msg = 'Not found') =>
  res.status(404).json({ ok: false, error: msg });
export const serverError = (res, err) =>
  res.status(500).json({ ok: false, error: err?.message || 'Server error' });
