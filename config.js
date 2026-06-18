/* Shared pricing config for the Spyne Pricing Calculator.
 *
 * DEFAULTS below are the built-in prices. The admin page (admin.html) can override
 * them; overrides are saved in the browser (localStorage) and read by the calculator.
 * To make an edit the permanent default for everyone, edit the DEFAULTS here (or use
 * Export on the admin page and paste the JSON in), then commit + redeploy.
 */
window.PRICING_KEY = "spyne_pricing_config_v1";

/* Admin passcode (frontend deterrent, not real security — anyone can read source).
 * Change this value to rotate it. */
window.ADMIN_PASSCODE = "spyne2026";

window.PRICING_DEFAULTS = {
  vini: {
    // Per agent, per rooftop, per month. Add or remove tiers freely.
    tiers: [
      { vins: 50,  salesIn: 900,  salesOut: 1150, servIn: 1100, servOut: 1399 },
      { vins: 100, salesIn: 1200, salesOut: 1800, servIn: 1440, servOut: 2160 },
      { vins: 200, salesIn: 1600, salesOut: 2400, servIn: 1920, servOut: 2880 },
      { vins: 300, salesIn: 2100, salesOut: 3150, servIn: 2520, servOut: 3780 },
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

window.loadPricingConfig = function () {
  const d = JSON.parse(JSON.stringify(window.PRICING_DEFAULTS));
  let saved = null;
  try { const s = localStorage.getItem(window.PRICING_KEY); if (s) saved = JSON.parse(s); } catch (e) {}
  if (!saved) return d;
  // shallow-merge one level into vini/studio so new default keys survive old saves
  return {
    vini:   Object.assign({}, d.vini,   saved.vini   || {}),
    studio: Object.assign({}, d.studio, saved.studio || {}),
  };
};
window.savePricingConfig  = function (cfg) { localStorage.setItem(window.PRICING_KEY, JSON.stringify(cfg)); };
window.resetPricingConfig = function () { localStorage.removeItem(window.PRICING_KEY); };
window.hasPricingOverride = function () { try { return !!localStorage.getItem(window.PRICING_KEY); } catch (e) { return false; } };
