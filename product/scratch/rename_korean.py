#!/usr/bin/env python3
"""
한글 파일명 → 영문 파일명 일괄 변환 (macOS NFD 대응)
glob으로 실제 파일시스템 경로를 가져와서 리네임
"""
import os, glob, unicodedata

ROOT = '/Users/hare/Documents/비욘드엔'
os.chdir(ROOT)

def nfc(s):
    return unicodedata.normalize('NFC', s)

# ── 1. 한글 파일 목록 가져오기 (glob은 macOS NFD를 올바르게 처리) ──
korean_files = []
for g in glob.glob('**/*', recursive=True):
    if '.git' in g or '_archive' in g or '_temp' in g:
        continue
    basename = os.path.basename(g)
    # Check if basename contains any Korean character (NFD or NFC)
    nfc_base = nfc(basename)
    has_korean = any('\uac00' <= c <= '\ud7a3' or '\u3131' <= c <= '\u3163' or '\u1100' <= c <= '\u11ff' or '\u3164' <= c <= '\u318e' for c in nfc_base)
    if has_korean and os.path.isfile(g):
        korean_files.append(g)

print(f"Found {len(korean_files)} Korean-named files\n")

# ── 2. 매핑 테이블 (NFC basename → 영문 basename) ──
NAME_MAP = {
    # assets/common
    'img_회사정보.png': 'img_company.png',
    'img_투자정보.png': 'img_invest.png',
    'img_지속가능경영.png': 'img_sustainability.png',
    'img_인재경영.png': 'img_talent.png',
    # assets/main
    'card_국내시장 점유율.png': 'card_market-share.png',
    # dikel process
    '1.냉연코일 세팅.svg': '1.cold-coil-setup.svg',
    '2.탈지라인.svg': '2.degreasing-line.svg',
    '3.전해니켈도금.svg': '3.electrolytic-nickel.svg',
    '4.배치형 소둔.svg': '4.batch-annealing.svg',
    '4.연속소둔.svg': '4.continuous-annealing.svg',
    '5.표면마감.svg': '5.surface-finish.svg',
    '5.표면마감1.svg': '5.surface-finish1.svg',
    '6.장력 형상 조정.svg': '6.tension-leveling.svg',
    '7.정밀컷팅.svg': '7.precision-cutting.svg',
    '8.포장정리.svg': '8.packaging.svg',
    # dikel brand
    '국문.png': 'kr.png',
    '국문.svg': 'kr.svg',
    '국문m.svg': 'kr-m.svg',
    '영문.png': 'en.png',
    '영문.svg': 'en.svg',
    '영문m.svg': 'en-m.svg',
    # dikel/dikel
    'img_강판.svg': 'img_steel-plate.svg',
    '로고.svg': 'logo.svg',
    '화살표.svg': 'arrow.svg',
    '화살표1.svg': 'arrow1.svg',
    # dikel misc
    'video_dikel 가치.mp4': 'video_dikel-value.mp4',
    '니켈도금강판_제품소개.mp4': 'nickel-product-intro.mp4',
    '니켈산업용부품.mp4': 'nickel-industrial-parts.mp4',
    '강판.png': 'steel-plate.png',
    '강판.svg': 'steel-plate.svg',
    '니켈강판.png': 'nickel-plate.png',
    '니켈도금강판_대량_Default.svg': 'nickel-mass-default.svg',
    '니켈도금강판_대량_모바일_Default.png': 'nickel-mass-mobile-default.png',
    '니켈도금강판_대량_모바일_Focus.png': 'nickel-mass-mobile-focus.png',
    '니켈도금강판_대량_모바일_bg.png': 'nickel-mass-mobile-bg.png',
    '니켈도금강판_특수.png': 'nickel-special.png',
    '동국산업의.svg': 'dk-industry.svg',
    '전기차.svg': 'ev.svg',
    '전동드라이버.svg': 'power-driver.svg',
    '전동이륜.svg': 'e-bike.svg',
    # cold-rolled
    '1.열연 코일 세팅.svg': '1.hot-coil-setup.svg',
    '2.산세라인.png': '2.pickling-line.png',
    '3.정밀컷팅.svg': '3.precision-cutting.svg',
    '4.냉간압연.svg': '4.cold-rolling.svg',
    '5.소둔라인.svg': '5.annealing-line.svg',
    '6.표면마감.svg': '6.surface-finish.svg',
    '7.포장정리.svg': '7.packaging.svg',
    '가공가능구격_모바일.png': 'spec-mobile.png',
    '그래프1.svg': 'graph1.svg',
    '그래프2.svg': 'graph2.svg',
    '그래프3.svg': 'graph3.svg',
    '그래프4.svg': 'graph4.svg',
    '냉연강판.png': 'cold-rolled.png',
    '냉연강판1.svg': 'cold-rolled1.svg',
    '냉연강판_Default.svg': 'cold-rolled-default.svg',
    '냉연강판_모바일.png': 'cold-rolled-mobile.png',
    '대용량연속코일_모바일.png': 'large-coil-mobile.png',
    '산세강판_모바일.png': 'pickled-mobile.png',
    # heat-treated
    '1.냉연코일 세팅.svg': '1.cold-coil-setup.svg',
    '2.열처리.svg': '2.heat-treatment.svg',
    '4.포장정리.svg': '4.packaging.svg',
    'T 열처리_Default.svg': 'qt-default.svg',
    'img_열처리강판.png': 'img_heat-treated.png',
    '냉연강판_모빌리티_1.mp4': 'mobility-1.mp4',
    '냉연강판_산업용부품.mp4': 'industrial-parts.mp4',
    '모빌리티산업영상.mp4': 'mobility-video.mp4',
    '열처리부품영상.mp4': 'heat-parts-video.mp4',
    '열처리제품사양.png': 'heat-spec.png',
    '대응규격_모바일.png': 'standard-mobile.png',
    '모빌리티1.svg': 'mobility1.svg',
    '모빌리티2.svg': 'mobility2.svg',
    '모빌리티3.svg': 'mobility3.svg',
    '모빌리티4.svg': 'mobility4.svg',
    '모빌리티5.svg': 'mobility5.svg',
    '변화의.png': 'change.png',
    '산업용부품1.svg': 'industrial1.svg',
    '산업용부품2.svg': 'industrial2.svg',
    '산업용부품3.svg': 'industrial3.svg',
    '산업용부품4.svg': 'industrial4.svg',
    '산업용부품5.svg': 'industrial5.svg',
    '열처리2.png': 'heat-treated2.png',
    '열처리강판.png': 'heat-treated-plate.png',
    '제품사양.png': 'product-spec.png',
    # product-center
    '경험이.png': 'experience.png',
    '경험이1.svg': 'experience1.svg',
    '글로벌 비즈니스.png': 'global-business.png',
    '기술과.svg': 'technology.svg',
    '니켈도금강판.png': 'nickel-plate.png',
    '대규모.png': 'large-scale.png',
    '대규모1.svg': 'large-scale1.svg',
    '산업별.png': 'by-industry.png',
    '산업별1.svg': 'by-industry1.svg',
    '세계시장.png': 'global-market.png',
    '세계시장1.svg': 'global-market1.svg',
    '품질의.png': 'quality.png',
    '품질의1.svg': 'quality1.svg',
    # rnd
    'ic_연구개발.svg': 'ic_rnd.svg',
    'ic_연구개발1.svg': 'ic_rnd1.svg',
    'ic_연구개발2.svg': 'ic_rnd2.svg',
    'img_w_미래 혁신의 기회 탐색.png': 'img_w_future-innovation.png',
    'img_w_변화의 흐름을 읽는 기술 기획.png': 'img_w_tech-planning.png',
    'img_w_실제적 가치로 이어진 연구.png': 'img_w_practical-research.png',
    'img_연구개발 현장_1_w.png': 'img_rnd-scene-1.png',
    'img_연구개발 현장_2_w.png': 'img_rnd-scene-2.png',
    'img_연구개발 현장_3_w.png': 'img_rnd-scene-3.png',
    'img_연구개발 현장_4_w.png': 'img_rnd-scene-4.png',
}

# ── 3. 실제 리네임 ──
# Build a lookup: for each file on disk, NFC its basename and see if it's in NAME_MAP
renamed_pairs = []  # (old_raw_bytes_basename, new_basename) for reference replacement

renamed = 0
for fpath in korean_files:
    basename = os.path.basename(fpath)
    nfc_basename = nfc(basename)
    
    if nfc_basename in NAME_MAP:
        new_basename = NAME_MAP[nfc_basename]
        new_path = os.path.join(os.path.dirname(fpath), new_basename)
        
        # Read the raw bytes of the old basename for reference replacement later
        raw_old = basename.encode('utf-8')
        
        os.rename(fpath, new_path)
        print(f"  ✅ {fpath}  →  {new_path}")
        renamed_pairs.append((raw_old, new_basename.encode('utf-8'), nfc_basename.encode('utf-8')))
        renamed += 1
    else:
        print(f"  ⚠ No mapping for: {nfc_basename} (in {fpath})")

print(f"\n✅ Renamed {renamed} files\n")

# ── 4. 참조 치환 (HTML/CSS/JS) ──
target_files = []
for g in glob.glob('**/*', recursive=True):
    if '.git' in g or '_archive' in g or '_temp' in g or 'scratch' in g:
        continue
    if g.endswith(('.html', '.css', '.js')) and os.path.isfile(g):
        target_files.append(g)

updated_files = 0
for fpath in sorted(target_files):
    with open(fpath, 'rb') as fp:
        raw = fp.read()
    
    original = raw
    for raw_old, raw_new, nfc_old in renamed_pairs:
        # Replace the raw NFD form (as stored on macOS filesystem / in some files)
        if raw_old in raw:
            raw = raw.replace(raw_old, raw_new)
        # Also replace the NFC form (as stored in some other files)
        if nfc_old in raw:
            raw = raw.replace(nfc_old, raw_new)
    
    if raw != original:
        with open(fpath, 'wb') as fp:
            fp.write(raw)
        print(f"  📝 UPDATED: {fpath}")
        updated_files += 1

print(f"\n✅ Updated {updated_files} source files")

# ── 5. 검증: 남아있는 한글 참조 확인 ──
print("\n── Remaining Korean references check ──")
remaining = 0
for fpath in sorted(target_files):
    with open(fpath, 'r', encoding='utf-8') as fp:
        for i, line in enumerate(fp, 1):
            nfc_line = nfc(line)
            # Check for Korean chars in src/url references only
            if ('src=' in nfc_line or 'url(' in nfc_line) and any('\uac00' <= c <= '\ud7a3' for c in nfc_line):
                print(f"  ⚠ {fpath}:{i}: {nfc_line.strip()[:120]}")
                remaining += 1

if remaining == 0:
    print("  ✅ No remaining Korean references in src/url attributes!")
else:
    print(f"\n  ⚠ {remaining} Korean references still remain")
