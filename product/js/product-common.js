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
        if (i === index) {
            el.classList.add('active');
            // 활성화된 패널 내부의 비디오 명시적 play() 강제 실행 (iOS/사파리 무음 자동재생 유실 해결)
            el.querySelectorAll('video').forEach(function(video) {
                video.play().catch(function(err) {
                    console.log("Usage video autoplay prevented:", err);
                });
            });
        }
        else {
            el.classList.remove('active');
        }
    });
    
    // 탭 전환 시에도 레이아웃 재계산
    window.dispatchEvent(new Event('resize'));
}

/* ── 공정카드 스케일링 (데스크탑) ── */
function scaleProcessCard() {
    const card = document.getElementById('process-card');
    const sticky = card?.parentElement;
    if (!card || !sticky) return;
    if (window.innerWidth <= 1023) {
        card.style.transform = '';
        sticky.style.height = '';
        return;
    }
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
    
    // 초기 로드 시 활성화된 활용분야 비디오 명시적 play 호출
    document.querySelectorAll('.usage-tab-content.active video').forEach(function(video) {
        video.play().catch(function(err) {
            console.log("Initial usage video autoplay prevented:", err);
        });
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
                span.textContent = text[i];
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
        const scrollRoom = outer.offsetHeight - outer.querySelector('.hero-text-inner').offsetHeight;
        const scrolled = -rect.top;

        let progress = Math.max(0, Math.min(1, scrolled / Math.max(scrollRoom * 0.6, 1)));

        const activeCount = Math.floor(progress * chars.length);

        // 한 번 active가 된 글자는 되돌리지 않음 (one-way)
        chars.forEach((c, i) => {
            if (i < activeCount) c.classList.add('active');
        });

        // 모든 글자가 활성화되면 리스너 제거 (성능 최적화)
        if (activeCount >= chars.length) {
            window.removeEventListener('scroll', onScroll);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
});


/* ── 탭 패널 전환 (디켈 가치/제품/브랜드 탭) ── */
const productTabStorageKey = 'productTab:' + window.location.pathname;

function activateProductTab(panelId, shouldPersist) {
    if (!panelId) return;

    const panel = document.getElementById(panelId);
    if (!panel || !panel.classList.contains('tab-panel')) return;

    document.querySelectorAll('.tab-item[data-tab]').forEach(function (t) {
        t.classList.remove('active');
    });

    document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.remove('active');
    });

    document.querySelectorAll('.tab-item[data-tab="' + panelId + '"]').forEach(function (t) {
        t.classList.add('active');
    });

    panel.classList.add('active');

    // 탭 패널이 활성화될 때 내부 비디오가 있을 경우 iOS/Safari 자동재생 누락 대응을 위해 명시적으로 play() 호출
    panel.querySelectorAll('video').forEach(function(video) {
        video.play().catch(function(err) {
            console.log("Autoplay was prevented or video failed to play:", err);
        });
    });

    if (shouldPersist) {
        sessionStorage.setItem(productTabStorageKey, panelId);
    }

    window.dispatchEvent(new Event('resize'));
}

function getInitialProductTabId() {
    const hashPanelId = window.location.hash ? window.location.hash.slice(1) : '';
    const savedPanelId = sessionStorage.getItem(productTabStorageKey);

    if (hashPanelId) {
        const hashPanel = document.getElementById(hashPanelId);
        if (hashPanel && hashPanel.classList.contains('tab-panel')) {
            return hashPanelId;
        }
    }

    if (savedPanelId) {
        const savedPanel = document.getElementById(savedPanelId);
        if (savedPanel && savedPanel.classList.contains('tab-panel')) {
            return savedPanelId;
        }
    }

    return '';
}

document.querySelectorAll('.tab-item[data-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
        const panelId = this.getAttribute('data-tab');
        activateProductTab(panelId, true);
        if (panelId && window.location.hash !== '#' + panelId) {
            history.replaceState(null, '', '#' + panelId);
        }
    });
});

function restoreProductTab() {
    const initialPanelId = getInitialProductTabId();
    if (initialPanelId) {
        activateProductTab(initialPanelId, false);
    }
}

document.addEventListener('DOMContentLoaded', restoreProductTab);
window.addEventListener('pageshow', restoreProductTab);
window.addEventListener('hashchange', restoreProductTab);

/* ── 가로 스크롤바 동기화 (모바일 전용) ── */
document.addEventListener('DOMContentLoaded', function() {
    function initScrollSync() {
        // 기존 .spec-table-container 대응
        document.querySelectorAll('.spec-table-container').forEach(function(container) {
            const scrollHorizontal = container.nextElementSibling;
            if (scrollHorizontal && scrollHorizontal.classList.contains('scroll-horizontal')) {
                const thumb = scrollHorizontal.querySelector('.scroll-thumb');
                const track = scrollHorizontal.querySelector('.scroll-track');
                
                if (thumb && track) {
                    // 1. Bind scroll event listener once
                    if (!container.dataset.scrollBound) {
                        container.addEventListener('scroll', function() {
                            const scrollLimit = this.scrollWidth - this.clientWidth;
                            if (scrollLimit <= 0) return;
                            const scrollLeft = this.scrollLeft;
                            const scrollPercent = Math.max(0, Math.min(1, scrollLeft / scrollLimit));
                            const maxTravel = track.clientWidth - thumb.clientWidth;
                            thumb.style.transform = `translateX(${scrollPercent * maxTravel}px)`;
                        });
                        container.dataset.scrollBound = "true";
                    }
                    
                    // 2. Recalculate layout on init/resize
                    const clientWidth = container.clientWidth;
                    const scrollWidth = container.scrollWidth;
                    const scrollLimit = scrollWidth - clientWidth;
                    
                    if (window.innerWidth >= 1024 || scrollLimit <= 0) {
                        scrollHorizontal.style.setProperty('display', 'none', 'important');
                    } else {
                        scrollHorizontal.style.setProperty('display', 'block', 'important');
                        
                        // Calculate track width and dynamic thumb width
                        const trackWidth = track.clientWidth || 324;
                        const thumbWidth = Math.max(30, (clientWidth / scrollWidth) * trackWidth);
                        thumb.style.width = thumbWidth + 'px';
                        
                        // Update thumb position based on current scrollLeft
                        const scrollLeft = container.scrollLeft;
                        const scrollPercent = Math.max(0, Math.min(1, scrollLeft / scrollLimit));
                        const maxTravel = trackWidth - thumbWidth;
                        thumb.style.transform = `translateX(${scrollPercent * maxTravel}px)`;
                    }
                }
            }
        });

        // .cat-scroll-indicator 대응 (data-target 기반 혹은 형제 요소 기반)
        document.querySelectorAll('.cat-scroll-indicator').forEach(function(indicator) {
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
                if (!indicator.dataset.scrollBound) {
                    scrollBox.addEventListener('scroll', function() {
                        const scrollLimit = this.scrollWidth - this.clientWidth;
                        if (scrollLimit <= 0) return;
                        
                        const scrollLeft = this.scrollLeft;
                        const scrollPercent = Math.max(0, Math.min(1, scrollLeft / scrollLimit));
                        
                        const maxTravel = track.clientWidth - thumb.clientWidth;
                        thumb.style.transform = `translateX(${scrollPercent * maxTravel}px)`;
                    });
                    indicator.dataset.scrollBound = "true";
                }

                // Recalculate layout
                const clientWidth = scrollBox.clientWidth;
                const scrollWidth = scrollBox.scrollWidth;
                const scrollLimit = scrollWidth - clientWidth;

                if (window.innerWidth >= 1024 || scrollLimit <= 0) {
                    indicator.style.setProperty('display', 'none', 'important');
                } else {
                    indicator.style.setProperty('display', 'block', 'important');

                    const trackWidth = track.clientWidth || 324;
                    const thumbWidth = Math.max(30, (clientWidth / scrollWidth) * trackWidth);
                    thumb.style.width = thumbWidth + 'px';

                    const scrollLeft = scrollBox.scrollLeft;
                    const scrollPercent = Math.max(0, Math.min(1, scrollLeft / scrollLimit));
                    const maxTravel = trackWidth - thumbWidth;
                    thumb.style.transform = `translateX(${scrollPercent * maxTravel}px)`;
                }
            }
        });
    }
    
    initScrollSync();
    // 리사이즈 시 다시 시도 (숨겨져 있던 요소가 나타날 수 있음)
    window.addEventListener('resize', initScrollSync);
});
