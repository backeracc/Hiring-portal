
with open("frontend/public/legal-policy.md", "a", encoding="utf-8") as f:
    f.write("""

| Law / Instrument | Relevant clauses | Why it matters here |
|---|---|---|
| Digital Personal Data Protection Act, 2023 | Sections 4, 5, 6, 7, 8, 11, 12, 13, 15, 16, 17 | Covers lawful processing, notice, consent, security, rights, grievances, data retention, and exemptions. |
| Digital Personal Data Protection Rules, 2025 | Notified by MeitY on 14 Nov 2025; apply as and when the relevant rules are in force | Supports operational privacy, notice, and compliance handling for digital personal data. |
| Information Technology Act, 2000 | Sections 4, 5, 43A, 66C, 66D, 67C | Recognizes electronic records and signatures, supports reasonable security practices, and addresses identity theft and cheating by personation. |
| Indian Contract Act, 1872 | Sections 10, 13, 14, 19, 23 | Supports acceptance of terms, consent, free consent, and lawful object/consideration. |

The above list is non-exhaustive. LocalSM should obtain a lawyer review before publishing this policy, especially if it uses webcam monitoring, biometric checks, image capture, data retention rules, or any third-party proctoring vendor.

### 11. Candidate Declaration
By signing or submitting the assessment, the candidate declares that: (a) the work is original; (b) no unauthorized help was used; (c) the candidate understood the rules; (d) LocalSM may verify the submission; and (e) a confirmed violation may lead to immediate disqualification.

### 12. LocalSM Rights
- Change the format, duration, or evaluation method without prior notice.
- Reject any submission where authenticity cannot be reasonably verified.
- Require a re-test, re-explanation, or follow-up interview.
- Invalidate a result obtained through misconduct.
- Keep internal records of confirmed integrity violations.
- Decline future applications where permitted by law.

Nothing in this policy creates a right to selection, a right to employment, or a right to appeal.
""")

print("Appended successfully.")

