# -*- coding: utf-8 -*-
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

def page(title, extra_css, body_page, container_class, content, layout="sub"):
    css = "\n".join(
        f'    <link rel="stylesheet" href="{href}">' for href in extra_css
    )
    banner = '        <div id="mc-inject-banner"></div>\n' if layout != "auth" else ""
    snb = '            <div id="mc-inject-snb"></div>\n' if layout != "auth" else ""
    return f"""<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>{title} | 이창현수학</title>
    <base href="/site/">
    <link rel="icon" href="img/common/favicon.svg" type="image/svg+xml">
    <script src="js/jquery-1.8.3.min.js"></script>
    <link rel="stylesheet" href="css/sh_common.css">
    <link rel="stylesheet" href="css/sh_sub.css">
{css}
</head>
<body data-page="{body_page}">
<div id="sh_wrapper" style="background-image:url(img/sub/head_sub_bg.png);background-repeat:no-repeat;background-position-x:center;">
    <div id="mc-inject-header"></div>
{banner}    <div id="sh_container"{container_class}>
{snb}        <div id="sh_container_wrapper">
            <div id="sh_content">
{content}
            </div>
        </div>
    </div>
    <div id="mc-inject-footer"></div>
</div>
<script src="js/chrome.js"></script>
<script src="js/topmenu_script.js"></script>
<script src="js/banner-apply.js"></script>
</body>
</html>
"""

def gate(name, audience="student"):
    who = "학부모" if audience == "parent" else "학생"
    return f"""                <div id="mc_preview_page" class="pagecommon">
                    <div class="mc_gate_box">
                        <p class="mc_gate_eyebrow">CLASSROOM</p>
                        <h4>로그인이 필요합니다</h4>
                        <p class="mc_gate_desc">{name}는 {who} 회원만 이용할 수 있습니다.<br>로그인 후 다시 이용해 주세요.</p>
                        <div class="mc_gate_actions">
                            <a class="mc_gate_btn is-primary" href="login.html">로그인</a>
                        </div>
                    </div>
                </div>"""

pages = {}

pages["preview.html"] = page(
    "맛보기강좌",
    ["css/sh_preview.css"],
    "preview",
    ' class="mc-preview-wrap"',
    """                <div id="mc_preview_page" class="pagecommon">
                    <div class="mc_pv_head">
                        <p class="mc_pv_eyebrow">PREVIEW</p>
                        <h4>맛보기강좌</h4>
                        <p>이창현수학 수업 분위기와 강의 스타일을 미리 확인해 보세요.</p>
                    </div>
                    <ul class="mc_pv_grid">
                        <li class="mc_pv_card">
                            <a href="https://www.youtube.com/@math_chang2" class="mc_pv_open" target="_blank" rel="noopener noreferrer">
                                <div class="mc_pv_thumb">
                                    <img src="img/main/inc03/video.png" alt="이창현수학 유튜브 채널">
                                    <span class="mc_pv_play" aria-hidden="true"></span>
                                </div>
                                <div class="mc_pv_body">
                                    <p class="mc_pv_title"><span class="mc_pv_badge">맛보기강좌</span><span class="mc_pv_title_text">이창현수학 유튜브 채널</span></p>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>""",
)

for fn, title, extra, key, cls, html in [
    ("my-courses.html", "내강좌", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "my-courses", ' class="mc-preview-wrap"', gate("내강좌")),
    ("qa-video.html", "개별질문영상", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "qa-video", ' class="mc-preview-wrap"', gate("개별질문영상")),
    ("student-progress.html", "수업 현황", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "student-progress", ' class="mc-preview-wrap mc-progress-wrap"', gate("수업 현황")),
    ("student-test.html", "테스트 현황", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "student-test", ' class="mc-preview-wrap"', gate("테스트 현황")),
    ("student-monthly.html", "월별 통계", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "student-monthly", ' class="mc-preview-wrap"', gate("월별 통계")),
    ("student-online.html", "온라인 강의실", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "student-online", ' class="mc-preview-wrap"', gate("온라인 강의실")),
    ("parent-progress.html", "수업 현황", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "parent-progress", ' class="mc-preview-wrap mc-progress-wrap"', gate("수업 현황", "parent")),
    ("parent-test.html", "테스트 현황", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "parent-test", ' class="mc-preview-wrap"', gate("테스트 현황", "parent")),
    ("parent-monthly.html", "월별 통계", ["css/sh_preview.css", "css/sh_classroom_gate.css"], "parent-monthly", ' class="mc-preview-wrap"', gate("월별 통계", "parent")),
]:
    pages[fn] = page(title, extra, key, cls, html)

pages["notice.html"] = page(
    "공지사항",
    ["css/sh_preview.css", "css/sh_notice.css"],
    "notice",
    ' class="mc-preview-wrap mc-notice-wrap"',
    """                <div id="mc_notice_page" class="pagecommon">
                    <div class="mc_pv_head">
                        <p class="mc_pv_eyebrow">NOTICE</p>
                        <h4>공지사항</h4>
                        <p>학원 운영 안내와 주요 소식을 전해 드립니다.</p>
                    </div>
                    <div class="mc_nt_toolbar">
                        <fieldset id="sh_bo_sch" class="mc_nt_sch">
                            <legend class="sound_only">게시물 검색</legend>
                            <form action="notice.html" method="get">
                                <select name="sfl"><option value="wr_subject">제목</option></select>
                                <input type="text" name="stx" class="sch_input" placeholder="검색어를 입력하세요">
                                <button type="submit" class="sch_btn" title="검색"><i class="fa fa-search" aria-hidden="true"></i></button>
                            </form>
                        </fieldset>
                    </div>
                    <div id="sh_list_tbl" class="mc_nt_tbl">
                        <table cellpadding="0" cellspacing="0">
                            <thead><tr><th class="num">No</th><th class="subject">제목</th><th class="name">작성자</th><th class="datetime">등록일</th></tr></thead>
                            <tbody>
                                <tr class="bo_notice"><td class="num"><span class="mc_nt_pin">공지</span></td><td class="subject"><div class="mc_nt_subj"><a href="notice.html">테스트 공지사항입니다.</a></div><div class="mc_nt_meta_m"><span>이창현수학</span><span>2026.03.16</span></div></td><td class="name sv_use">이창현수학</td><td class="datetime">2026.03.16</td></tr>
                                <tr class="bo_notice"><td class="num"><span class="mc_nt_pin">공지</span></td><td class="subject"><div class="mc_nt_subj"><a href="notice.html">테스트 공지사항입니다.</a></div><div class="mc_nt_meta_m"><span>이창현수학</span><span>2026.03.16</span></div></td><td class="name sv_use">이창현수학</td><td class="datetime">2026.03.16</td></tr>
                                <tr class="bo_notice"><td class="num"><span class="mc_nt_pin">공지</span></td><td class="subject"><div class="mc_nt_subj"><a href="notice.html">테스트 공지사항입니다.</a></div><div class="mc_nt_meta_m"><span>이창현수학</span><span>2026.03.16</span></div></td><td class="name sv_use">이창현수학</td><td class="datetime">2026.03.16</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>""",
)

pages["free.html"] = page(
    "자유게시판",
    ["css/sh_preview.css", "css/sh_free.css"],
    "free",
    ' class="mc-preview-wrap mc-free-wrap"',
    """                <div id="mc_free_page" class="pagecommon">
                    <div class="mc_pv_head">
                        <p class="mc_pv_eyebrow">COMMUNITY</p>
                        <h4>자유게시판</h4>
                        <p>학습 이야기와 소식을 자유롭게 나눠 보세요.</p>
                    </div>
                    <div class="mc_fr_toolbar">
                        <fieldset id="sh_bo_sch" class="mc_fr_sch">
                            <legend class="sound_only">게시물 검색</legend>
                            <form action="free.html" method="get">
                                <select name="sfl"><option value="wr_subject">제목</option></select>
                                <input type="text" name="stx" class="sch_input" placeholder="검색어를 입력하세요">
                                <button type="submit" class="sch_btn" title="검색"><i class="fa fa-search" aria-hidden="true"></i></button>
                            </form>
                        </fieldset>
                    </div>
                    <div class="mc_fr_tbl">
                        <table cellpadding="0" cellspacing="0">
                            <thead><tr><th class="num">No</th><th class="subject">제목</th><th class="name">글쓴이</th><th class="datetime">등록</th></tr></thead>
                            <tbody>
                                <tr><td colspan="4" class="empty_table">아직 등록된 글이 없습니다. 첫 글을 남겨 보세요.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>""",
)

pages["review.html"] = page(
    "수강후기",
    ["css/sh_preview.css", "css/sh_review.css"],
    "review",
    ' class="mc-preview-wrap mc-review-wrap"',
    """                <div id="mc_review_page" class="pagecommon">
                    <div class="mc_pv_head">
                        <p class="mc_pv_eyebrow">REVIEW</p>
                        <h4>수강후기</h4>
                        <p>이창현수학 수강생·학부모의 생생한 후기를 확인하세요.</p>
                    </div>
                    <ul class="mc_rv_grid">
                        <li class="mc_rv_card"><article class="mc_rv_card_inner"><header class="mc_rv_head"><div class="mc_rv_head_row"><span class="mc_rv_label">수강후기</span><span class="mc_rv_num">01</span></div><p class="mc_rv_author">OO대 OO학과 김OO</p><p class="mc_rv_title">내신 성적이 한 학기 만에 올랐습니다</p></header><div class="mc_rv_body"><div class="mc_rv_body_txt">개념부터 차근차근 잡아 주셔서 막혀 있던 부분이 풀렸고, 한 학기 만에 내신 성적이 눈에 띄게 올랐습니다.</div></div></article></li>
                        <li class="mc_rv_card"><article class="mc_rv_card_inner"><header class="mc_rv_head"><div class="mc_rv_head_row"><span class="mc_rv_label">수강후기</span><span class="mc_rv_num">02</span></div><p class="mc_rv_author">OO대 OO학과 이OO</p><p class="mc_rv_title">수능 수학 등급 목표를 달성했어요</p></header><div class="mc_rv_body"><div class="mc_rv_body_txt">실전 감각을 키우는 수업과 온라인강의실 복습 덕분에 목표했던 수능 수학 등급을 달성할 수 있었습니다.</div></div></article></li>
                        <li class="mc_rv_card"><article class="mc_rv_card_inner"><header class="mc_rv_head"><div class="mc_rv_head_row"><span class="mc_rv_label">수강후기</span><span class="mc_rv_num">03</span></div><p class="mc_rv_author">OO고 OO학년 박OO</p><p class="mc_rv_title">개인질문으로 막힌 문제를 풀었습니다</p></header><div class="mc_rv_body"><div class="mc_rv_body_txt">수업 후에도 개별질문영상으로 막힌 문제를 바로 물어볼 수 있어서 막힘 없이 진도를 따라갈 수 있었습니다.</div></div></article></li>
                        <li class="mc_rv_card"><article class="mc_rv_card_inner"><header class="mc_rv_head"><div class="mc_rv_head_row"><span class="mc_rv_label">수강후기</span><span class="mc_rv_num">04</span></div><p class="mc_rv_author">OO대 OO학과 최OO</p><p class="mc_rv_title">온라인강의실로 복습 습관을 들였어요</p></header><div class="mc_rv_body"><div class="mc_rv_body_txt">학부모교실에서 학습 현황을 함께 확인하고, 온라인강의실로 복습 습관을 잡을 수 있었습니다.</div></div></article></li>
                    </ul>
                </div>""",
)

pages["inquiry.html"] = page(
    "이용문의",
    ["css/sh_preview.css", "css/sh_inquiry.css"],
    "inquiry",
    ' class="mc-preview-wrap mc-inquiry-wrap"',
    """                <div id="mc_inquiry_page" class="pagecommon">
                    <div class="mc_pv_head">
                        <p class="mc_pv_eyebrow">INQUIRY</p>
                        <h4>이용문의</h4>
                        <p>수강·학습관리 관련 궁금한 점을 남겨 주세요.</p>
                    </div>
                    <nav class="mc_iq_tabs" role="tablist" aria-label="이용문의 메뉴">
                        <a class="mc_iq_tab is-on" href="inquiry.html" role="tab" aria-selected="true">이용문의</a>
                        <a class="mc_iq_tab" href="inquiry-faq.html" role="tab" aria-selected="false">FAQ</a>
                    </nav>
                    <section class="mc_iq_list_section" aria-label="이용문의 목록">
                        <div class="mc_iq_empty">
                            <p>등록된 문의가 없습니다.</p>
                        </div>
                    </section>
                </div>""",
)

pages["inquiry-faq.html"] = page(
    "이용문의",
    ["css/sh_preview.css", "css/sh_inquiry.css"],
    "inquiry",
    ' class="mc-preview-wrap mc-inquiry-wrap"',
    """                <div id="mc_inquiry_page" class="pagecommon">
                    <div class="mc_pv_head">
                        <p class="mc_pv_eyebrow">INQUIRY</p>
                        <h4>이용문의</h4>
                        <p>수강·학습관리 관련 궁금한 점을 남겨 주세요.</p>
                    </div>
                    <nav class="mc_iq_tabs" role="tablist" aria-label="이용문의 메뉴">
                        <a class="mc_iq_tab" href="inquiry.html" role="tab" aria-selected="false">이용문의</a>
                        <a class="mc_iq_tab is-on" href="inquiry-faq.html" role="tab" aria-selected="true">FAQ</a>
                    </nav>
                    <ul class="mc_iq_faq_list" aria-label="자주 묻는 질문">
                        <li><button type="button" class="mc_iq_faq_item" data-faq-id="1"><span class="mc_iq_faq_qmark" aria-hidden="true">Q</span><span class="mc_iq_faq_tit">맛보기강좌는 어떻게 수강하나요?</span><span class="mc_iq_faq_more" aria-hidden="true"><i class="fa fa-angle-right"></i></span></button></li>
                        <li><button type="button" class="mc_iq_faq_item" data-faq-id="2"><span class="mc_iq_faq_qmark" aria-hidden="true">Q</span><span class="mc_iq_faq_tit">중학교·고등학교 수학 모두 수업 가능한가요?</span><span class="mc_iq_faq_more" aria-hidden="true"><i class="fa fa-angle-right"></i></span></button></li>
                        <li><button type="button" class="mc_iq_faq_item" data-faq-id="3"><span class="mc_iq_faq_qmark" aria-hidden="true">Q</span><span class="mc_iq_faq_tit">학부모도 자녀 학습 현황을 볼 수 있나요?</span><span class="mc_iq_faq_more" aria-hidden="true"><i class="fa fa-angle-right"></i></span></button></li>
                    </ul>
                    <div class="mc_iq_modal mc_iq_faq_modal" id="mc_iq_faq_modal" hidden>
                        <div class="mc_iq_modal_dim" data-close="faq"></div>
                        <div class="mc_iq_modal_panel is-faq" role="dialog" aria-modal="true" aria-labelledby="mc_iq_faq_modal_title">
                            <div class="mc_iq_modal_head">
                                <p class="mc_iq_faq_modal_eyebrow">Q&amp;A</p>
                                <h2 id="mc_iq_faq_modal_title">FAQ</h2>
                                <button type="button" class="mc_iq_modal_close" data-close="faq" aria-label="닫기"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="mc_iq_modal_body" id="mc_iq_faq_modal_body"></div>
                        </div>
                    </div>
                    <script>
                    (function(){
                      var faqs={1:{t:"맛보기강좌는 어떻게 수강하나요?",a:"홈페이지 상단의 내강의실 > 맛보기강좌 메뉴에서 강의 스타일과 수업 분위기를 미리 확인할 수 있습니다."},2:{t:"중학교·고등학교 수학 모두 수업 가능한가요?",a:"중등 수학(선행·내신)부터 고등 수학, 수능 실전까지 모두 수업합니다. 학생 목표에 맞춰 커리큘럼을 구성합니다."},3:{t:"학부모도 자녀 학습 현황을 볼 수 있나요?",a:"학부모교실에서 자녀의 수업 현황, 테스트 현황, 월별 통계를 함께 확인할 수 있습니다."}};
                      var modal=document.getElementById("mc_iq_faq_modal");
                      var title=document.getElementById("mc_iq_faq_modal_title");
                      var body=document.getElementById("mc_iq_faq_modal_body");
                      if(!modal) return;
                      function openFaq(id){var f=faqs[id]; if(!f) return; title.textContent=f.t; body.innerHTML="<div class=\\"mc_iq_faq_modal_q\\"><span>Q</span><p>"+f.t+"</p></div><div class=\\"mc_iq_faq_modal_a\\"><span>A</span><p>"+f.a+"</p></div>"; modal.hidden=false; document.body.classList.add("mc-iq-modal-open");}
                      function closeFaq(){modal.hidden=true; document.body.classList.remove("mc-iq-modal-open");}
                      document.querySelectorAll(".mc_iq_faq_item").forEach(function(btn){btn.addEventListener("click",function(){openFaq(btn.getAttribute("data-faq-id"));});});
                      modal.querySelectorAll("[data-close]").forEach(function(el){el.addEventListener("click",closeFaq);});
                      document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!modal.hidden) closeFaq();});
                    })();
                    </script>
                </div>""",
)

pages["login.html"] = page(
    "로그인",
    ["css/mc-auth.css"],
    "login",
    ' class="mc-auth-page"',
    """                <div class="mc-auth">
                    <div class="mc-auth-shell">
                        <aside class="mc-auth-brand">
                            <div>
                                <div class="eyebrow">Math Chang</div>
                                <h2><span>이창현</span>수학<br> 학습관리 시스템</h2>
                                <p>복습영상 · 온라인 강의 · 학습 관리<br>학생과 학부모가 함께 확인하는 학습 공간입니다.</p>
                            </div>
                            <div class="brand-foot">중·고등 수학 맞춤 수업</div>
                        </aside>
                        <div class="mc-auth-panel">
                            <div class="mc-auth-tabs">
                                <span class="is-active">로그인</span>
                                <a href="register.html">회원가입</a>
                            </div>
                            <h1 class="mc-auth-title">로그인</h1>
                            <p class="mc-auth-desc">아이디와 비밀번호를 입력해 주세요.</p>
                            <form action="login.html" method="post" onsubmit="return false;">
                                <div class="mc-field">
                                    <label for="login_id">아이디 <span class="req">*</span></label>
                                    <input type="text" id="login_id" class="frm_input required" maxlength="20" placeholder="아이디">
                                </div>
                                <div class="mc-field">
                                    <label for="login_pw">비밀번호 <span class="req">*</span></label>
                                    <input type="password" id="login_pw" class="frm_input required" maxlength="20" placeholder="비밀번호">
                                </div>
                                <div class="mc-auth-meta">
                                    <div class="chk_box">
                                        <input type="checkbox" id="login_auto_login">
                                        <label for="login_auto_login">자동 로그인</label>
                                    </div>
                                    <a href="login.html">아이디/비밀번호 찾기</a>
                                </div>
                                <button type="submit" class="mc-btn mc-btn-primary">로그인</button>
                            </form>
                        </div>
                    </div>
                </div>""",
    layout="auth",
)

pages["register.html"] = page(
    "회원가입",
    ["css/mc-auth.css"],
    "register",
    ' class="mc-auth-page"',
    """                <div class="mc-register-wrap">
                    <div class="mc-register-card">
                        <div class="mc-auth-tabs" style="margin-bottom:24px;">
                            <a href="login.html">로그인</a>
                            <span class="is-active">회원가입</span>
                        </div>
                        <h1 class="mc-auth-title">회원가입</h1>
                        <p class="mc-auth-desc">회원 유형을 선택한 뒤, 약관에 동의해 주세요.</p>
                        <form action="register.html" method="post" onsubmit="return false;">
                            <div class="mc-type-switch" role="radiogroup" aria-label="회원 유형">
                                <label class="mc-type-card is-active">
                                    <input type="radio" name="mb_1" value="student" checked>
                                    <strong>학생 회원</strong>
                                    <span>강의·복습·학습 통계를 확인하는 학생용 계정입니다.</span>
                                </label>
                                <label class="mc-type-card">
                                    <input type="radio" name="mb_1" value="parent">
                                    <strong>학부모 회원</strong>
                                    <span>자녀 학습 현황과 월별 통계를 함께 확인하는 학부모용 계정입니다.</span>
                                </label>
                            </div>
                            <div id="mc_parent_step1_guide" class="mc-parent-notice" style="display:none;margin-bottom:18px">
                                <strong>학부모 가입 안내</strong><br>
                                자녀 학생 아이디로 연동을 요청하며, <strong>관리자 승인 후</strong> 학부모교실·자녀 현황 확인이 가능합니다.
                            </div>
                            <section class="mc-agree-box">
                                <div class="mc-agree-head">
                                    <h3>(필수) 서비스 이용 약관</h3>
                                    <label class="mc-agree-check"><input type="checkbox" value="1"><span>동의합니다</span></label>
                                </div>
                                <div class="mc-agree-body">
                                    <h4>제1조 (목적)</h4>
                                    <p>본 약관은 이창현수학(이하 "회사")이 제공하는 온라인 수학 강의 및 학습 관리 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                                </div>
                            </section>
                            <section class="mc-agree-box">
                                <div class="mc-agree-head">
                                    <h3>(필수) 개인정보 수집 및 이용</h3>
                                    <label class="mc-agree-check"><input type="checkbox" value="1"><span>동의합니다</span></label>
                                </div>
                                <div class="mc-agree-body">
                                    <p>회사는 회원가입, 서비스 제공, 학습 관리를 위해 이름, 아이디, 비밀번호, 연락처를 수집·이용합니다.</p>
                                </div>
                            </section>
                            <button type="submit" class="mc-btn mc-btn-primary">다음</button>
                        </form>
                    </div>
                </div>
                <script>
                (function(){
                  document.querySelectorAll('.mc-type-card').forEach(function(card){
                    card.addEventListener('click', function(){
                      document.querySelectorAll('.mc-type-card').forEach(function(c){ c.classList.remove('is-active'); });
                      card.classList.add('is-active');
                      var guide=document.getElementById('mc_parent_step1_guide');
                      if(guide) guide.style.display = card.querySelector('input').value==='parent' ? '' : 'none';
                    });
                  });
                })();
                </script>""",
    layout="auth",
)

for name, html in pages.items():
    path = os.path.join(ROOT, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", name)
