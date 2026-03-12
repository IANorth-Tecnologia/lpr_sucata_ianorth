# Daily Code Review Automation

## Overview

This Daily Code Review automation analyzes all commits in the repository, generates a comprehensive changelog, identifies risk patterns, and checks for missing test coverage.

## Features

### ✨ Automated Changelog Generation
- Categorizes commits by type (features, fixes, refactoring, documentation)
- Shows commit hash, author, and message
- Groups changes for easy review

### ⚠️ Risk Pattern Detection
Detects potential issues:
- **Critical**: Hardcoded credentials, SQL injection risks
- **High**: Security concerns, API key exposure
- **Medium**: Large files, complex logic, empty catch blocks
- **Low**: Console logs, commented code

### 🧪 Test Coverage Analysis
- Tracks which files have been modified
- Identifies files without corresponding tests
- Calculates test coverage ratio
- Recommends test creation for uncovered code

## Execution

### Manual Trigger
```bash
gh workflow run daily-code-review.yml