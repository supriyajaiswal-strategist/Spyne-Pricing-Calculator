/* Shared pricing config for the Spyne Pricing Calculator.
 *
 * DEFAULTS below are the built-in baseline prices. The live shared prices are stored
 * in Supabase (one row in the `pricing_config` table). The admin page saves there, the
 * calculator reads from there, so edits are shared across everyone instantly. If Supabase
 * is unreachable / unconfigured it falls back to a local cache, then to DEFAULTS.
 *
 * SETUP: paste your Supabase project URL and anon (public) key below, and run the SQL
 * in SUPABASE_SETUP.sql once in the Supabase SQL editor.
 */
window.PRICING_KEY = "spyne_pricing_config_v1";

// ---- Supabase ----
window.SUPABASE_URL = "https://ldogkqhabxxwhaxjgzpi.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_REMkOPZmiyrtB9-Z5_F0ew_ZR32xPoq"; // public publishable key (safe to expose)
window.SUPABASE_TABLE = "pricing_config";
window.SUPABASE_ROW_ID = 1;

window.PRICING_DEFAULTS = {
  vini: {
    // Per agent, per rooftop, per month. Add or remove tiers freely.
    tiers: [
      { vins: 50,  salesIn: 900,  salesOut: 1200, servIn: 1000, servOut: 1400 },
      { vins: 100, salesIn: 1200, salesOut: 1500, servIn: 1300, servOut: 1700 },
      { vins: 200, salesIn: 1600, salesOut: 2000, servIn: 1800, servOut: 2200 },
      { vins: 300, salesIn: 2100, salesOut: 2600, servIn: 2300, servOut: 2860 },
    ],
    bundle: 0.10,                                            // all-4-agents discount (decimal)
    volume: { t1: 3, t2: 7, r0: 0.10, r1: 0.20, r2: 0.30 }, // rooftop volume tiers: r0=under t1, r1=t1..t2-1, r2=t2+
    integrations: [
      { name: "Vinsolutions",             type: "sales",    cost: 95 },
      { name: "CDK (Elead)",              type: "sales",    cost: 500 },
      { name: "CDK Drive",                type: "service",  cost: 3400 },
      { name: "Dealersocket (Solera)",    type: "sales",    cost: 200 },
      { name: "Tekion (CRM and DMS)",     type: "sales",    cost: null },
      { name: "xTime",                    type: "service",  cost: 291 },
      { name: "Update Promise",           type: "sales",    cost: null },
      { name: "Dealerbuilt/Lightyear",    type: "sales",    cost: null },
      { name: "MyKaarma",                 type: "sales",    cost: 62 },
      { name: "PBS",                      type: "service",  cost: null },
      { name: "DealerFX",                 type: "sales",    cost: null },
      { name: "Reynolds Services US",     type: "service",  cost: 1300 },
      { name: "Reynolds Services Canada", type: "service",  cost: null },
      { name: "Reynolds CRM US",          type: "sales",    cost: 1300 },
      { name: "Reynolds CRM Canada",      type: "sales",    cost: null },
      { name: "Evox",                     type: "cji",      cost: 83 },
      { name: "clearvin",                 type: "vincheck", cost: 483 },
    ],
  },
  studio: {
    // Per rooftop, per month. lite/pro = base plan; smartMatch/smartCampaigns = add-ons.
    tiers: [
      { vins: 50,  lite: 199, pro: 499,  smartMatch: 298, smartCampaigns: 374 },
      { vins: 100, lite: 349, pro: 849,  smartMatch: 598, smartCampaigns: 524 },
      { vins: 200, lite: 599, pro: 1499, smartMatch: 748, smartCampaigns: 749 },
      { vins: 300, lite: 749, pro: 1899, smartMatch: 748, smartCampaigns: 974 },
      { vins: 400, lite: 799, pro: 1999, smartMatch: 748, smartCampaigns: 1199 },
    ],
    addons: [
      { key: "smartMatch",     label: "SmartMatch",     sublabel: "SmartMatch — New + Pre-owned" },
      { key: "smartCampaigns", label: "SmartCampaigns", sublabel: null },
    ],
  },
};

function mergePricingConfig(d, saved) {
  if (!saved) return JSON.parse(JSON.stringify(d));
  // shallow-merge one level into vini/studio so new default keys survive old saves
  return {
    vini:   Object.assign({}, d.vini,   saved.vini   || {}),
    studio: Object.assign({}, d.studio, saved.studio || {}),
  };
}

function sbConfigured() {
  return window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes("YOUR_PROJECT") && !window.SUPABASE_ANON_KEY.includes("YOUR_");
}
function sbHeaders(extra) {
  return Object.assign({ apikey: window.SUPABASE_ANON_KEY, Authorization: "Bearer " + window.SUPABASE_ANON_KEY }, extra || {});
}
function sbUrl(qs) {
  return window.SUPABASE_URL + "/rest/v1/" + window.SUPABASE_TABLE + (qs || "");
}

/* Load the SHARED config from Supabase. Falls back to a local cache, then to
 * built-in defaults, so it still works unconfigured / offline (e.g. local preview). */
window.loadPricingConfig = async function () {
  const d = window.PRICING_DEFAULTS;
  if (sbConfigured()) {
    try {
      const r = await fetch(sbUrl("?id=eq." + window.SUPABASE_ROW_ID + "&select=data"), { headers: sbHeaders(), cache: "no-store" });
      if (r.ok) {
        const rows = await r.json();
        const data = rows && rows[0] ? rows[0].data : null;
        try { localStorage.setItem(window.PRICING_KEY, JSON.stringify(data || {})); } catch (e) {}
        return mergePricingConfig(d, data);
      }
    } catch (e) { /* unreachable — fall through */ }
  }
  try { const s = localStorage.getItem(window.PRICING_KEY); if (s) return mergePricingConfig(d, JSON.parse(s)); } catch (e) {}
  return mergePricingConfig(d, null);
};

/* Save to Supabase (upsert the single config row). Returns { ok, shared, error }.
 * With no backend reachable, saves locally so dev still works. */
function saveLocal(cfg) {
  try { localStorage.setItem(window.PRICING_KEY, JSON.stringify(cfg)); return { ok: true, shared: false }; }
  catch (e) { return { ok: false, error: "No storage available" }; }
}

window.savePricingConfig = async function (cfg) {
  if (sbConfigured()) {
    try {
      const r = await fetch(sbUrl(), {
        method: "POST",
        headers: sbHeaders({ "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify({ id: window.SUPABASE_ROW_ID, data: cfg }),
      });
      if (r.ok) { try { localStorage.setItem(window.PRICING_KEY, JSON.stringify(cfg)); } catch (e) {} return { ok: true, shared: true }; }
      const msg = await r.text().catch(() => "");
      return { ok: false, error: "Supabase " + r.status + (msg ? ": " + msg.slice(0, 120) : "") };
    } catch (e) {
      return { ok: false, error: "Network error reaching Supabase" };
    }
  }
  return saveLocal(cfg); // not configured -> local fallback (dev)
};

/* Reset = write the built-in defaults to the shared store. */
window.resetPricingConfig = async function () {
  return window.savePricingConfig(JSON.parse(JSON.stringify(window.PRICING_DEFAULTS)));
};
window.hasPricingOverride = function () { try { return !!localStorage.getItem(window.PRICING_KEY); } catch (e) { return false; } };
