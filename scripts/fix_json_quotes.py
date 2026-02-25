#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import re

# Read batch-2
with open(r'E:\musekidoc\data\artists-batch-2.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Chinese quotes with regular quotes (they're inside JSON strings already)
content = content.replace('"', '"').replace('"', '"')
content = content.replace(''', "'").replace(''', "'")

# Write back
with open(r'E:\musekidoc\data\artists-batch-2.json', 'w', encoding='utf-8') as f:
    f.write(content)

# Read batch-3
with open(r'E:\musekidoc\data\artists-batch-3.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Chinese quotes
content = content.replace('"', '"').replace('"', '"')
content = content.replace(''', "'").replace(''', "'")

# Write back
with open(r'E:\musekidoc\data\artists-batch-3.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed Chinese quotes in both files")

# Validate
try:
    with open(r'E:\musekidoc\data\artists-batch-2.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("✓ Batch 2 JSON is valid")
except Exception as e:
    print(f"✗ Batch 2 error: {e}")

try:
    with open(r'E:\musekidoc\data\artists-batch-3.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("✓ Batch 3 JSON is valid")
except Exception as e:
    print(f"✗ Batch 3 error: {e}")
