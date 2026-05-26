/* ================================================================
   product-common.js — 제품 페이지 공통 스크립트
   사용: dikel.html, cold-rolled.html, heat-treated.html
   ================================================================ */

/* ── 탭 전환 ── */
function setTab(el) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

/* ── 아코디언 토글 ── */
function toggleAcc(header) {
    const item = header.closest('.acc-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) {
        item.classList.add('open');
        // 아코디언이 열릴 때 레이아웃 재계산을 위해 resize 이벤트 발생 (약간의 지연 필요)
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    }
}

/* ── 활용분야 탭 전환 ── */
function setUsageTab(index) {
    const menuItems = document.querySelectorAll('.usage-menu-item');
    menuItems.forEach((el, i) => {
        if (i === index) el.classList.add('active');
        else el.classList.remove('active');
    });

    const tabContents = document.querySelectorAll('.usage-tab-content');
    tabContents.forEach((el, i) => {
        if (i === index) el.classList.add('active');
        else el.classList.remove('active');
    });
    
    // 탭 전환 시에도 레이아웃 재계산
    window.dispatchEvent(new Event('resize'));
}

/* ── 공정카드 스케일링 (데스크탑) ── */
function scaleProcessCard() {
    const card = document.getElementById('process-card');
    const sticky = card?.parentElement;
    if (!card || !sticky) return;
    if (window.innerWidth <= 1023) return;
    const availW = sticky.clientWidth;
    const cardW = 1860;
    const cardH = 1080;
    if (availW <= 0) return;
    if (availW < cardW) {
        const s = availW / cardW;
        card.style.transform = `scale(${s})`;
        sticky.style.height = (cardH * s) + 'px';
    } else {
        card.style.transform = '';
        sticky.style.height = '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    scaleProcessCard();
    window.addEventListener('resize', function () {
        requestAnimationFrame(scaleProcessCard);
    });
});

/* ── 히어로 텍스트 스크롤 컬러 전환 ── */
document.addEventListener('DOMContentLoaded', function () {
    const outer = document.querySelector('.hero-text-outer');
    if (!outer) return;
    const h2 = outer.querySelector('.hero-text-section h2');
    if (!h2) return;

    /* 글자를 한 글자씩 span.char로 감싸기 */
    function wrapCharacters(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < text.length; i++) {
                const span = document.createElement('span');
                span.className = 'char';
                if (text[i] === ' ') {
                    span.classList.add('space');
                    span.textContent = '\u00A0'; // Unicode for Non-Breaking Space
                } else {
                    span.textContent = text[i];
                }
                frag.appendChild(span);
            }
            node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
            Array.from(node.childNodes).forEach(wrapCharacters);
        }
    }
    wrapCharacters(h2);

    const chars = h2.querySelectorAll('.char');

    function onScroll() {
        const rect = outer.getBoundingClientRect();
        const inner = outer.querySelector('.hero-text-inner');
        if (!inner) return;
        const scrollRoom = outer.offsetHeight - inner.offsetHeight;
        const scrolled = -rect.top;

        let progress = Math.max(0, Math.min(1, scrolled / Math.max(scrollRoom, 1)));

        // 이미지 확장용 wrapper가 있는지 확인
        const imgWrapper = document.querySelector('.hero-image-wrapper');
        const isCompanyInfo = imgWrapper && document.body.dataset.page === 'company-info';

        if (isCompanyInfo) {
            // ─── 회사소개 (company-info) 전용 고성능 2단계 인터랙션 ───
            // 1단계: 텍스트 컬러 전환 (전체 스크롤의 0% ~ 40%)
            let textProgress = Math.max(0, Math.min(1, progress / 0.4));
            
            // 2단계: 이미지 확장 및 풀프레임 전환 (전체 스크롤의 40% ~ 100%)
            let imageProgress = 0;
            if (progress > 0.4) {
                imageProgress = Math.max(0, Math.min(1, (progress - 0.4) / 0.6));
            }

            // 1) 텍스트 캐릭터 활성화 (한 번 활성화되면 유지)
            const activeCount = Math.floor(textProgress * chars.length);
            chars.forEach((c, i) => { if (i < activeCount) c.classList.add('active'); });

            // 2) 텍스트 영역 페이드아웃 및 위로 슬라이드
            const textSection = outer.querySelector('.hero-text-section');
            if (textSection) {
                textSection.style.opacity = 1 - imageProgress;
                textSection.style.transform = `translateY(${-80 * imageProgress}px)`;
            }

            // 3) GNB 상단 헤더 페이드아웃 (풀프레임 몰입도 극대화)
            const gnb = document.querySelector('.gnb');
            if (gnb) {
                if (progress < 1) {
                    gnb.style.opacity = 1 - imageProgress;
                    gnb.style.pointerEvents = (imageProgress > 0.85) ? 'none' : 'auto';
                } else {
                    gnb.style.opacity = '';
                    gnb.style.pointerEvents = '';
                }
            }

            // 4) 이미지 프레임 확장 및 100vw/100vh 꽉 채움 제어
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            const scale = screenW / 1920;

            // 모바일 360/태블릿 해상도에서는 모바일 전용 헤더 이미지 사용
            const img = imgWrapper.querySelector('#expand-image');
            if (img) {
                const targetSrc = (screenW < 1024) ? 'assets/companyinfo/company_header_m.png' : 'assets/companyinfo/company_header.png';
                if (img.getAttribute('src') !== targetSrc) {
                    img.setAttribute('src', targetSrc);
                }
            }

            // 반응형 시작 크기 정의
            const startW = (screenW < 1024) ? (screenW - 32) : (1860 * scale);
            const startH = (screenW < 1024) ? Math.min(448, screenH * 0.55) : (540 * scale);
            const startRadius = (screenW < 1024) ? 20 : (30 * scale);

            // 텍스트 아래 이미지 시작 Y좌표 계산
            let startTop = (screenW < 1024) ? 140 : (260 * scale);
            if (textSection) {
                const imgSec = document.querySelector('.hero-image-section');
                const padTop = imgSec ? parseFloat(window.getComputedStyle(imgSec).paddingTop) : 0;
                startTop = textSection.offsetHeight + padTop;
            }

            // imageProgress에 따른 선형 보간 (Lerp)
            const currentW = startW + (screenW - startW) * imageProgress;
            const currentH = startH + (screenH - startH) * imageProgress;
            const currentTop = startTop * (1 - imageProgress);
            const currentRadius = startRadius * (1 - imageProgress);

            imgWrapper.style.position = 'absolute';
            imgWrapper.style.left = '50%';
            imgWrapper.style.transform = 'translateX(-50%)';
            imgWrapper.style.top = currentTop + 'px';
            imgWrapper.style.width = currentW + 'px';
            imgWrapper.style.height = currentH + 'px';
            imgWrapper.style.borderRadius = currentRadius + 'px';
            imgWrapper.style.maxWidth = 'none';

            // 5) 이미지 내부 오버레이 텍스트 노출
            const overlay = imgWrapper.querySelector('.hero-image-overlay');
            if (overlay) {
                let overlayOpacity = Math.max(0, (imageProgress - 0.4) / 0.6);
                overlay.style.opacity = overlayOpacity;
            }
        } else {
            // ─── 일반 페이지 (연혁 등) 용 기본 1단계 텍스트 전환 인터랙션 ───
            const activeCount = Math.floor(progress * chars.length);
            // 한 번 active가 된 글자는 되돌리지 않음 (one-way)
            chars.forEach((c, i) => { if (i < activeCount) c.classList.add('active'); });

            if (imgWrapper && document.body.dataset.page !== 'network') {
                const baseW = 1920;
                const screenW = window.innerWidth;
                const scale = screenW / baseW;

                const startW = (screenW < 1024) ? 328 : (1860 * scale);
                const endW = 1920 * scale;
                const startH = (screenW < 1024) ? 448 : (540 * scale);
                const endH = (screenW < 1024) ? 740 : (1190 * scale);
                
                const startRadius = (screenW < 1024) ? 20 : (30 * scale);
                const endRadius = 0;
                
                const currentW = startW + (endW - startW) * progress;
                const currentH = startH + (endH - startH) * progress;
                const currentRadius = startRadius + (endRadius - startRadius) * progress;
                
                imgWrapper.style.width = currentW + 'px';
                imgWrapper.style.height = currentH + 'px';
                imgWrapper.style.borderRadius = currentRadius + 'px';
                imgWrapper.style.maxWidth = 'none';

                const overlay = imgWrapper.querySelector('.hero-image-overlay');
                if (overlay) {
                    let overlayOpacity = Math.max(0, (progress - 0.6) / 0.4);
                    overlay.style.opacity = overlayOpacity;
                }
            }
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
});

/* ── 탭 패널 전환 (디켈 가치/제품/브랜드 탭) ── */
document.querySelectorAll('.tab-item[data-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
        const panelId = this.getAttribute('data-tab');

        // 모든 탭 아이템에서 active 제거
        document.querySelectorAll('.tab-item[data-tab]').forEach(function (t) { 
            t.classList.remove('active'); 
        });
        
        // 모든 탭 패널에서 active 제거
        document.querySelectorAll('.tab-panel').forEach(function (p) { 
            p.classList.remove('active'); 
        });

        // 클릭된 탭과 동일한 data-tab을 가진 모든 탭 아이템에 active 추가 (동기화)
        document.querySelectorAll('.tab-item[data-tab="' + panelId + '"]').forEach(function (t) {
            t.classList.add('active');
        });

        // 해당 패널 활성화
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');
        
        // 패널 전환 시 레이아웃 재계산
        window.dispatchEvent(new Event('resize'));
    });
});

/* ── 가로 스크롤바 동기화 (모바일 전용) ── */
document.addEventListener('DOMContentLoaded', function() {
    function initScrollSync() {
        // 기존 .spec-table-container 대응
        document.querySelectorAll('.spec-table-container').forEach(function(container) {
            if (container.dataset.scrollBound) return; // 이미 바인딩됨
            
            const scrollHorizontal = container.nextElementSibling;
            if (scrollHorizontal && scrollHorizontal.classList.contains('scroll-horizontal')) {
                const thumb = scrollHorizontal.querySelector('.scroll-thumb');
                const track = scrollHorizontal.querySelector('.scroll-track');
                
                if (thumb && track) {
                    container.addEventListener('scroll', function() {
                        const scrollWidth = this.scrollWidth - this.clientWidth;
                        if (scrollWidth <= 0) return;
                        const scrollLeft = this.scrollLeft;
                        const scrollPercent = Math.max(0, Math.min(1, scrollLeft / scrollWidth));
                        const maxTravel = track.clientWidth - thumb.clientWidth;
                        thumb.style.transform = `translateX(${scrollPercent * maxTravel}px)`;
                    });
                    container.dataset.scrollBound = "true";
                }
            }
        });

        // .cat-scroll-indicator 대응 (data-target 기반 혹은 형제 요소 기반)
        document.querySelectorAll('.cat-scroll-indicator').forEach(function(indicator) {
            if (indicator.dataset.scrollBound) return; // 이미 바인딩됨

            const thumb = indicator.querySelector('.cat-scroll-thumb');
            const track = indicator.querySelector('.cat-scroll-track, .cat-scroll-bg');
            if (!thumb || !track) return;

            const targetId = indicator.getAttribute('data-target');
            let scrollBox = targetId ? document.getElementById(targetId) : null;
            
            if (!scrollBox) {
                const prev = indicator.previousElementSibling;
                if (prev) {
                    scrollBox = prev.querySelector('[id*="scroll"]') || (prev.classList.contains('cat-table-wrap') ? prev : null);
                }
            }

            if (scrollBox && thumb && track) {
                scrollBox.addEventListener('scroll', function() {
                    const scrollWidth = this.scrollWidth - this.clientWidth;
                    if (scrollWidth <= 0) return;
                    
                    const scrollLeft = this.scrollLeft;
                    const scrollPercent = Math.max(0, Math.min(1, scrollLeft / scrollWidth));
                    
                    const maxTravel = track.clientWidth - thumb.clientWidth;
                    thumb.style.transform = `translateX(${scrollPercent * maxTravel}px)`;
                });
                indicator.dataset.scrollBound = "true";
                
                // 초기 위치 설정 (이미 스크롤되어 있을 경우 대비)
                const initialWidth = scrollBox.scrollWidth - scrollBox.clientWidth;
                if (initialWidth > 0) {
                    const initialPercent = scrollBox.scrollLeft / initialWidth;
                    const initialTravel = (track.clientWidth - thumb.clientWidth) * initialPercent;
                    thumb.style.transform = `translateX(${initialTravel}px)`;
                }
            }
        });
    }
    
    initScrollSync();
    // 리사이즈 시 다시 시도 (숨겨져 있던 요소가 나타날 수 있음)
    window.addEventListener('resize', initScrollSync);
});

/* ── 경영이념 섹션 스크롤 애니메이션 ── */
document.addEventListener('DOMContentLoaded', function () {
    const phSection = document.querySelector('.philosophy-section');
    if (!phSection) return;

    const orangePath = phSection.querySelector('.ph-svg-path-orange');
    const cards = phSection.querySelectorAll('.ph-card');
    
    if (!orangePath) return;

    // 카드가 원의 경로에 맞춰 강조되도록 애니메이션 사이클에 맞춤 (총 10초 루프)
    function syncCardHighlight() {
        const time = (Date.now() % 10000) / 1000; // 0~10초 반복
        
        cards.forEach(card => card.classList.remove('active'));

        if (time < 2.5) {
            phSection.querySelector('.ph-card-tl')?.classList.add('active');
        } else if (time < 5) {
            phSection.querySelector('.ph-card-bl')?.classList.add('active');
        } else if (time < 7.5) {
            phSection.querySelector('.ph-card-br')?.classList.add('active');
        } else {
            phSection.querySelector('.ph-card-tr')?.classList.add('active');
        }
        
        requestAnimationFrame(syncCardHighlight);
    }

    syncCardHighlight();
});

/* ── 핵심가치 카드 스크롤 reveal (한번 활성화 후 유지) ── */
document.addEventListener('DOMContentLoaded', function () {
    const valueCards = document.querySelectorAll('.value-card');
    if (!valueCards.length) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                // 한 번 보이면 영구적으로 revealed 클래스 추가
                entry.target.classList.add('revealed');
                // 더 이상 관찰 불필요 — 해제
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.25   // 카드의 25%가 보이면 활성화
    });

    valueCards.forEach(function (card) {
        observer.observe(card);
    });
});
