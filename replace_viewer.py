
import re

with open("frontend/src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace from {/* Document Viewer */} to </div> right before {/* Checkboxes */}
# We need to be careful with regex over many lines.
pattern = r"\{\/\*\s*Document Viewer\s*\*\/\}[\s\S]*?(?=\{\/\*\s*Checkboxes\s*\*\/\})"

replacement = """{/* Document Viewer */}
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: CREAM_BORDER }}>
                  <iframe 
                    src="/legal-policy.pdf" 
                    title="LocalSM Recruitment & Assessment Policy"
                    className="w-full"
                    style={{ height: "600px", border: "none" }}
                  />
                </div>

                """

new_content = re.sub(pattern, replacement, content)

with open("frontend/src/App.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Document Viewer replaced with iframe.")

