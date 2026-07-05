
from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size = 10)

with open("legal-policy.md", "r", encoding="utf-8") as f:
    text = f.read()

# very simple rendering
for line in text.split("\n"):
    # strip markdown formatting just for simplicity
    line = line.replace("#", "").strip()
    pdf.multi_cell(0, 5, txt = line)

pdf.output("legal-policy.pdf")
print("PDF created using fpdf")

