export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err?.code === 'ERR_MODULE_NOT_FOUND' && /^\.{1,2}\//.test(specifier)) {
      for (const suffix of ['.ts', '/index.ts']) {
        try { return await nextResolve(specifier + suffix, context); } catch { /* další varianta */ }
      }
    }
    throw err;
  }
}
