"""Profile pages must use the same analytics defaults as the Next.js pages (#70)."""
from emit_profile_pages import CONSENT_DEFAULT_JS

assert "analytics_storage:'granted'" in CONSENT_DEFAULT_JS, "analytics must default to granted outside consent regions"
assert '"DE"' in CONSENT_DEFAULT_JS and '"GB"' in CONSENT_DEFAULT_JS, "EU/UK must stay denied until the visitor chooses"
assert "typeof lgc.analytics==='boolean'" in CONSENT_DEFAULT_JS, "a saved choice must win"
assert "ad_storage:'granted'" not in CONSENT_DEFAULT_JS, "ads stay denied by default"
print("ok")
