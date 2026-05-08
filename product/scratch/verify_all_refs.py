#!/usr/bin/env python3
"""
전수 검사: 모든 HTML/CSS/JS 파일에서 참조하는 에셋이 실제로 존재하는지 확인
"""
import os, re, glob, unicodedata

ROOT = '/Users/hare/Documents/비욘드엔'
os.chdir(ROOT)

def nfc(s):
    return unicodedata.normalize('NFC', s)

ASSET_EXTS = ('.png', '.svg', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.webm', '.hdr', '.ico')
SKIP_DIRS = ('.git', '_archive', '_temp', 'node_modules', 'scratch')

# Collect all source files
src_files = []
for g in glob.glob('**/*', recursive=True):
    if any(skip in g for skip in SKIP_DIRS):
        continue
    if g.endswith(('.html', '.css', '.js')) and os.path.isfile(g):
        src_files.append(g)

print(f"검사 대상 파일: {len(src_files)}개\n")
print("=" * 70)

total_refs = 0
broken_refs = 0
broken_list = []

for fpath in sorted(src_files):
    basedir = os.path.dirname(os.path.abspath(fpath))
    
    with open(fpath, 'rb') as fp:
        raw = fp.read()
    
    # Normalize to NFC for consistent matching
    try:
        content = nfc(raw.decode('utf-8'))
    except:
        continue
    
    # Pattern 1: src="..." or src='...'
    # Pattern 2: url('...') or url("...") or url(...)
    # Pattern 3: href="..." (only for asset files, not HTML links)
    patterns = [
        (r'src=["\']([^"\']+)["\']', 'src'),
        (r'url\(["\']?([^"\')\s]+)["\']?\)', 'url()'),
    ]
    
    file_broken = []
    
    for pattern, ptype in patterns:
        for m in re.finditer(pattern, content):
            ref = m.group(1).strip()
            
            # Skip non-file references
            if ref.startswith(('http://', 'https://', 'data:', '#', 'javascript:', '//', 'blob:')):
                continue
            # Skip CSS variables
            if ref.startswith('--') or ref.startswith('var('):
                continue
            # Only check asset files
            if not any(ref.lower().endswith(ext) for ext in ASSET_EXTS):
                continue
            
            total_refs += 1
            
            # Resolve path
            fullpath = os.path.normpath(os.path.join(basedir, ref))
            
            # Check existence (try both NFD and NFC)
            exists = os.path.exists(fullpath)
            if not exists:
                nfd_path = unicodedata.normalize('NFD', fullpath)
                exists = os.path.exists(nfd_path)
            
            if not exists:
                broken_refs += 1
                # Find the line number
                lines = content.split('\n')
                line_num = 0
                for i, line in enumerate(lines, 1):
                    if ref in line:
                        line_num = i
                        break
                
                file_broken.append((line_num, ptype, ref))
                broken_list.append((fpath, line_num, ptype, ref))
    
    if file_broken:
        print(f"\n❌ {fpath}")
        for ln, pt, ref in file_broken:
            print(f"   L{ln} [{pt}] {ref}")
    else:
        # Count refs in this file
        file_refs = 0
        for pattern, ptype in patterns:
            for m in re.finditer(pattern, content):
                ref = m.group(1).strip()
                if ref.startswith(('http://', 'https://', 'data:', '#', 'javascript:', '//', 'blob:')):
                    continue
                if ref.startswith('--') or ref.startswith('var('):
                    continue
                if any(ref.lower().endswith(ext) for ext in ASSET_EXTS):
                    file_refs += 1
        if file_refs > 0:
            print(f"✅ {fpath} ({file_refs}개 참조 정상)")

print("\n" + "=" * 70)
print(f"\n📊 검사 결과:")
print(f"   총 에셋 참조: {total_refs}개")
print(f"   정상: {total_refs - broken_refs}개")
print(f"   깨진 참조: {broken_refs}개")

if broken_refs > 0:
    print(f"\n🔴 깨진 참조 목록:")
    for fpath, ln, pt, ref in broken_list:
        print(f"   {fpath}:{ln} → {ref}")
else:
    print(f"\n🟢 모든 에셋 참조가 정상입니다!")
