---
description: Never open the browser during this project
---

// turbo-all

## RULE: No browser usage in this project

This project must never use browser automation tools (browser subagent).
All UI verification must be done by the USER manually, by viewing the code directly.

### How to verify changes
1. The user will manually check the result at `http://localhost:3000`
2. After code changes, ask the user to refresh and check the page visually
3. Describe changes made clearly so the user knows what to look for
4. Never call `browser_subagent` or any tool that opens a browser window

### Reporting changes
After making changes, provide a concise summary of:
- What files were modified
- What visual changes to expect
- Any potential issues the user should check manually
