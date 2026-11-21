/* ASBARIX: progressive-disclosure UI; no calculator or pricing logic is changed. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);

  function makeFold(title, className) {
    const details = document.createElement('details');
    details.className = 'ui-fold ' + (className || '');
    const summary = document.createElement('summary');
    summary.textContent = title;
    details.append(summary);
    const body = document.createElement('div');
    body.className = 'ui-fold-body';
    details.append(body);
    return { details, body };
  }

  function moveField(id, body) {
    const field = $(id)?.closest('.field');
    if (field) body.append(field);
  }

  function cleanEmptyGroups(container) {
    container?.querySelectorAll('.pair, .opts').forEach(group => {
      if (!group.children.length) group.remove();
    });
  }

  function openOnError(errorId, fold) {
    const error = $(errorId);
    if (!error || !fold || !('MutationObserver' in window)) return;
    const update = () => {
      if (!error.hidden && error.textContent.trim()) fold.open = true;
    };
    new MutationObserver(update).observe(error, {
      attributes: true, attributeFilter: ['hidden'], childList: true, subtree: true
    });
    update();
  }

  function primaryNavigation() {
    const tabs = document.querySelector('.tabbar .tabs');
    if (!tabs || tabs.querySelector('.ui-nav-select')) return;
    const collections = [
      { name: 'المنتجات', items: [['offset-products', 'منتجات الأوفست'], ['gifts', 'الهدايا الدعائية']] },
      { name: 'المزيد', items: [['cups', 'قوالب الأكواب'], ['suppliers', 'الموردون والأسعار']] }
    ];
    const selects = [];
    collections.forEach(group => {
      const select = document.createElement('select');
      select.className = 'ui-nav-select';
      select.setAttribute('aria-label', 'انتقل إلى ' + group.name);
      const placeholder = new Option(group.name + ' ▾', '');
      select.add(placeholder);
      group.items.forEach(([key, label]) => select.add(new Option(label, key)));
      select.addEventListener('change', () => {
        const tab = document.querySelector('.tabbar [data-tab="' + select.value + '"]');
        if (tab) tab.click();
        syncNav();
      });
      tabs.append(select);
      selects.push({ select, keys: group.items.map(x => x[0]) });
    });
    function syncNav() {
      const tab = (location.hash || '#sheets').slice(1);
      selects.forEach(({ select, keys }) => {
        select.value = keys.includes(tab) ? tab : '';
        select.classList.toggle('is-active', keys.includes(tab));
      });
    }
    window.addEventListener('hashchange', syncNav);
    syncNav();
  }

  function simplifySheets() {
    const tab = $('tab-sheets');
    const side = tab?.querySelector('.panel.side');
    if (!side) return;
    const { details, body } = makeFold('خيارات الطباعة المتقدمة', 'ui-fold-settings');
    for (const id of ['sh-bleed', 'sh-gap', 'sh-margin', 'sh-spare', 'sh-price']) moveField(id, body);
    const options = $('sh-rot')?.closest('.opts');
    if (options) body.append(options);
    side.insertBefore(details, $('sh-err') || null);
    cleanEmptyGroups(side);
    Array.from(side.querySelectorAll('h3')).find(h => h.textContent.trim() === 'الكمية والتكلفة')?.replaceChildren('الكمية');
    openOnError('sh-err', details);

    const main = tab.querySelector('.panel.main');
    const heading = Array.from(main?.querySelectorAll('h3') || [])
      .find(node => node.textContent.includes('كل مقاسات الورق'));
    const table = heading?.nextElementSibling;
    if (heading && table) {
      const comparison = makeFold('مقارنة مقاسات الأفرخ', 'ui-fold-comparison');
      comparison.body.append(heading, table);
      main.append(comparison.details);
    }
  }

  function simplifyStickers() {
    const tab = $('tab-stickers');
    const side = tab?.querySelector('.panel.side');
    if (!side) return;
    const { details, body } = makeFold('خيارات القص والتكلفة المتقدمة', 'ui-fold-settings');
    for (const id of ['st-gap', 'st-side', 'st-price', 'st-supplier']) moveField(id, body);
    const option = $('st-rotwrap');
    if (option) body.append(option);
    side.insertBefore(details, $('st-err') || null);
    cleanEmptyGroups(side);
    Array.from(side.querySelectorAll('h3')).find(h => h.textContent.trim() === 'الكمية والتكلفة')?.replaceChildren('الكمية');
    openOnError('st-err', details);

    const main = tab.querySelector('.panel.main');
    const heading = Array.from(main?.querySelectorAll('h3') || [])
      .find(node => node.textContent.includes('كل عروض الرولات'));
    const table = heading?.nextElementSibling;
    if (heading && table) {
      const comparison = makeFold('مقارنة عروض الرولات', 'ui-fold-comparison');
      comparison.body.append(heading, table);
      main.append(comparison.details);
    }

    // The calculator is the primary task; list prices remain accessible below it.
    const priceSection = tab.querySelector('.ready-prices[data-group="stickers"]')?.closest('section');
    if (priceSection) tab.append(priceSection);
    const card = priceSection?.querySelector('details.rp-card');
    if (card) card.open = false;
  }

  function simplifyAcrylic() {
    const tab = $('tab-acrylic');
    const side = tab?.querySelector('.panel.side');
    const details = side?.querySelector('details.production-options');
    if (!details) return;
    const summary = details.querySelector('summary');
    if (summary) summary.textContent = 'خيارات القص والتسعير المتقدمة';
    const anchor = details.querySelector('h3');
    const moved = [];
    const pricingControls = side.querySelector('.profit-control');
    if (pricingControls) moved.push(pricingControls);
    for (const id of ['sale-rate', 'ac-t', 'ac-gap']) {
      const field = $(id)?.closest('.field');
      if (field) moved.push(field);
    }
    const rotate = $('ac-rotwrap');
    if (rotate) moved.push(rotate);
    // Extra refresh is useful but does not need to occupy the primary workflow.
    const refresh = $('sale-material')?.parentElement?.querySelector('button.chip');
    if (refresh) moved.push(refresh);
    moved.forEach(node => details.insertBefore(node, anchor || null));
    cleanEmptyGroups(side);
    openOnError('ac-err', details);
  }

  function simplifyCups() {
    const tab = $('tab-cups');
    const sidebar = tab?.querySelector('#workspace .ws > div:first-child');
    const sizePanel = sidebar?.querySelector('.panel:first-child');
    if (sizePanel) {
      const custom = makeFold('تخصيص مقاس الكوب', 'ui-fold-settings');
      for (const id of ['inD', 'ind', 'inh']) moveField(id, custom.body);
      const row = $('resetDims')?.closest('.row2');
      if (row) custom.body.append(row);
      sizePanel.append(custom.details);
    }
    const margins = sidebar?.querySelectorAll('.panel')[1];
    if (margins) {
      const settings = makeFold('الهوامش ولسان اللصق', 'ui-fold-settings');
      settings.body.append(margins);
      sidebar.append(settings.details);
      openOnError('errors', settings.details);
    }
    const stage = $('stage')?.closest('.panel');
    if (stage) {
      const layers = stage.querySelector('.legend');
      const descriptions = stage.querySelector('.legdesc');
      if (layers) {
        const options = makeFold('طبقات المعاينة وإرشادات القص', 'ui-fold-comparison');
        options.body.append(layers);
        if (descriptions) options.body.append(descriptions);
        stage.append(options.details);
      }
      const calcRow = $('calcRow');
      if (calcRow) {
        const math = makeFold('تفاصيل القياسات والحسابات', 'ui-fold-comparison');
        math.body.append(calcRow);
        stage.append(math.details);
      }
    }
  }

  function simplifyBanners() {
    const design = $('bn-design')?.closest('label');
    const calculator = $('banner-calc')?.querySelector('.rp-card');
    if (design && calculator) {
      const advanced = makeFold('خدمات إضافية', 'ui-fold-settings');
      advanced.body.append(design);
      calculator.insertBefore(advanced.details, $('bn-out') || null);
    }
    const list = document.querySelector('#tab-banners .ready-prices details.rp-card');
    if (list) list.open = false;
  }

  function init() {
    if (document.documentElement.dataset.asbarixSimpleUi === 'yes') return;
    document.documentElement.dataset.asbarixSimpleUi = 'yes';
    primaryNavigation();
    simplifySheets();
    simplifyStickers();
    simplifyAcrylic();
    simplifyCups();
    simplifyBanners();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
