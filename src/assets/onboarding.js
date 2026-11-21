(()=>{
const key='asbarix-onboarding-v3';
const dialog=document.createElement('dialog');dialog.className='onboarding';dialog.setAttribute('aria-labelledby','onboarding-title');
dialog.innerHTML='<button type="button" class="ob-close" aria-label="إغلاق">×</button><h2 id="onboarding-title">مونتاج صار أبسط</h2><ol><li><strong>اختر الأداة:</strong> الحاسبات الأساسية في الشريط، وبقية الأدوات في «المنتجات» و«المزيد».</li><li><strong>اكتب المقاس والكمية:</strong> النتيجة تظهر مباشرة بدون إعدادات كثيرة.</li><li><strong>تحتاج تخصيصًا؟</strong> افتح الخيارات المتقدمة أو المقارنات عند الحاجة. الأسعار الرسمية تظل محفوظة.</li></ol><p>تقدر ترجع لهذه التعليمات من «طريقة الاستخدام» في أي وقت.</p><div class="bar"><button class="primary" type="button" id="onboarding-done">ابدأ العمل</button></div>';
document.body.append(dialog);
function show(){if(!dialog.open)dialog.showModal();}
let triggers=[...document.querySelectorAll('[data-help]')];
if(!triggers.length){const button=document.createElement('button');button.type='button';button.className='help-trigger';button.setAttribute('aria-label','طريقة الاستخدام');button.innerHTML='<span class="ht-icon" aria-hidden="true">؟</span><span class="ht-text">طريقة الاستخدام</span>';document.body.append(button);triggers=[button];}
triggers.forEach(button=>button.addEventListener('click',show));
function remember(){try{localStorage.setItem(key,'seen');}catch{}}
const done=()=>{remember();dialog.close();};dialog.querySelector('#onboarding-done').onclick=done;dialog.querySelector('.ob-close').onclick=done;dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)done();});
dialog.addEventListener('cancel',remember);
try{if(localStorage.getItem(key)!=='seen')show();}catch{show();}
})();