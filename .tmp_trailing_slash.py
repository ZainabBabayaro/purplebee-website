#!/usr/bin/env python3
"""
Bulk trailing-slash normalisation for Purple Bee Cakes internal URLs.
Run from repo root. Only modifies src/**/*.jsx and src/**/*.js and data files.
"""
import re
from pathlib import Path

SRC = Path('src')
DATA = Path('src/data')

# Files to process
files = list(SRC.rglob('*.jsx')) + list(SRC.rglob('*.js'))
files.append(Path('prerender.js'))

# Paths we intentionally do NOT add a trailing slash to
EXACT_EXCLUDE = {'/', '/404', '/admin'}
API_PREFIXES = ('/api/', '/assets/', '/images/', '/cdn-cgi/')

def is_excluded(path):
    if path in EXACT_EXCLUDE:
        return True
    # API and asset paths
    if path.startswith('/api/'):
        return True
    for prefix in API_PREFIXES:
        if path.startswith(prefix) or path == prefix.rstrip('/'):
            return True
    # File-like paths (have a dot in the last segment)
    if re.search(r'/[^/]*\.[^/]*$', path):
        return True
    # Already ends with slash
    if path.endswith('/'):
        return True
    return False

def add_slash(path):
    """Add trailing slash to an internal path, preserving query string."""
    if is_excluded(path):
        return path
    # Split query/hash
    m = re.match(r'^([^?#]*)([?#].*)?$', path)
    if not m:
        return path
    base, rest = m.groups()
    rest = rest or ''
    return f'{base}/{rest}'

# Regex patterns and replacement functions
patterns = []

# 1. Link to="/foo" and to='/foo'
patterns.append((
    re.compile(r"(to=)(['\"])(/[^'\"]*?)\2"),
    lambda m: f"{m.group(1)}{m.group(2)}{add_slash(m.group(3))}{m.group(2)}"
))

# 2. to={"/foo"} and to={'/foo'}
patterns.append((
    re.compile(r"(to=\{)(['\"])(/[^'\"]*?)\2(\})",),
    lambda m: f"{m.group(1)}{m.group(2)}{add_slash(m.group(3))}{m.group(2)}{m.group(4)}"
))

# 3. navigate('/foo') and navigate("/foo")
patterns.append((
    re.compile(r"(navigate\()(['\"])(/[^'\"]*?)\2"),
    lambda m: f"{m.group(1)}{m.group(2)}{add_slash(m.group(3))}{m.group(2)}"
))

# 4. canonicalPath="/foo"
patterns.append((
    re.compile(r"(canonicalPath=)(['\"])(/[^'\"]*?)\2"),
    lambda m: f"{m.group(1)}{m.group(2)}{add_slash(m.group(3))}{m.group(2)}"
))

# 5. path: '/foo' in breadcrumb objects
patterns.append((
    re.compile(r"(path:\s*)(['\"])(/[^'\"]*?)\2"),
    lambda m: f"{m.group(1)}{m.group(2)}{add_slash(m.group(3))}{m.group(2)}"
))

# 6. to: '/foo' in navigation/data objects
patterns.append((
    re.compile(r"(to:\s*)(['\"])(/[^'\"]*?)\2"),
    lambda m: f"{m.group(1)}{m.group(2)}{add_slash(m.group(3))}{m.group(2)}"
))

# 7. Journal inline links [label](/foo)
patterns.append((
    re.compile(r"(\[([^\]]+)\]\()(/[^)\s]*?)(\))"),
    lambda m: f"{m.group(1)}{add_slash(m.group(3))}{m.group(4)}"
))

# 8. Template literals: `/path/${var}` -> `/path/${var}/`
#    But only when inside to={...} or canonicalPath={...} or href={...}
#    We handle the most common cases by looking for backtick strings that start with /
#    and contain ${...} and end without slash/query/hash.
patterns.append((
    re.compile(r"(`/[^`]*?\$\{[^`]*?\}[^`]*?[^/`?#])(`)"),
    lambda m: f"{m.group(1)}/{m.group(2)}"
))

# 9. href="/foo" and href='/foo' (for internal links)
patterns.append((
    re.compile(r"(href=)(['\"])(/[^'\"]*?)\2"),
    lambda m: f"{m.group(1)}{m.group(2)}{add_slash(m.group(3))}{m.group(2)}"
))

# 10. href={"/foo"} and href={'/foo'}
patterns.append((
    re.compile(r"(href=\{)(['\"])(/[^'\"]*?)\2(\})"),
    lambda m: f"{m.group(1)}{m.group(2)}{add_slash(m.group(3))}{m.group(2)}{m.group(4)}"
))

for f in files:
    text = f.read_text()
    original = text
    for regex, repl in patterns:
        text = regex.sub(repl, text)
    if text != original:
        f.write_text(text)
        print(f'Updated {f}')

print('Done.')
