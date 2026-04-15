---
allowed-tools: AskUserQuestionTool
argument-hint: [file]
description: Helps to develop a specification through non-obvious questions
model: claude-sonnet-4-6
disable-model-invocation: true
---

Read $1 and interview me in detail using the AskUserQuestionTool about literally anything.

- Technical implementation details
- UI & UX
- Concerns
- Tradeoffs, etc.

But make sure the questions are not obvious

Be very in-depth and continue interviewing me continually until it's complete, then write the spec to the file.
