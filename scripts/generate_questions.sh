#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")/.."

# Run the question generator script
node scripts/generate_questions.cjs $1