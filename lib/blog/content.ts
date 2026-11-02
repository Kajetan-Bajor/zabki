// Content approved for the review draft in the instruction supplied by Kuba.
export const parishName='Parafia pw. Świętej Trójcy w Ząbkach';
export const phone='608 186 185';
export const phoneLink='tel:+48608186185';
export const bankAccount='14109025900000000131735833';
export const phoneHTML=`<a href="${phoneLink}">${phone}</a>`;
export const massSchedule='<p><strong>Dni powszednie:</strong> 7:00 i 18:00.<br><strong>Roraty w Adwencie:</strong> 6:00.<br><strong>Niedziele i uroczystości:</strong> 7:00, 8:30, 10:00, 11:30, 13:00 i 18:00.<br><strong>Porządek wakacyjny:</strong> 7:00, 8:30, 10:00, 12:00 i 18:00.</p>';
export const officeSchedule=`<p><strong>Poniedziałki, środy i piątki:</strong> 9:00–10:30 oraz 16:30–18:00.</p><p><strong>Uwaga:</strong> w pierwsze piątki miesiąca obowiązuje wyjątek od tego harmonogramu. Godziny wymagają potwierdzenia w kancelarii.</p><p><strong>Telefon:</strong> ${phoneHTML} — czynny w godzinach otwarcia kancelarii.</p>`;
export const confessionInfo=`<p>Informacje o terminach spowiedzi można uzyskać w kancelarii parafialnej pod numerem ${phoneHTML}, w godzinach jej otwarcia.</p>`;
export const sacramentContact=`<p>W sprawach przygotowania do sakramentów oraz posług duszpasterskich prosimy o kontakt z kancelarią parafialną: ${phoneHTML}, w godzinach jej otwarcia.</p>`;
export const worshipSchedule='<p><strong>Pierwsza niedziela miesiąca o 19:00.</strong></p><p>Jeśli w tym terminie przypada inne ważne święto lub uroczystość, zmiana jest wcześniej podawana w ogłoszeniach parafialnych.</p><p><a href="/wieczory-uwielbienia">Poznaj Wieczory Uwielbienia</a></p>';
const accountHTML=`<strong>Rachunek bankowy parafii</strong><br><span class="parish-account">14 1090 2590 0000 0001 3173 5833</span><br><button class="copy-account" type="button" data-copy-account="${bankAccount}">Kopiuj numer rachunku</button><span class="copy-account-status" role="status" aria-live="polite"></span>`;
const massCard='<p><strong>Dni powszednie:</strong> 7:00 i 18:00.<br><strong>Roraty w Adwencie:</strong> 6:00.</p><p><strong>Niedziele i uroczystości:</strong><br>7:00, 8:30, 10:00, 11:30, 13:00 i 18:00.</p><p><strong>Porządek wakacyjny:</strong><br>7:00, 8:30, 10:00, 12:00 i 18:00.</p>';
const officeCard=`<p><strong>Poniedziałki, środy i piątki:</strong><br>9:00–10:30 i 16:30–18:00.</p><p>W pierwsze piątki miesiąca obowiązuje wyjątek — godziny potwierdź w kancelarii.</p><p><strong>Telefon:</strong> ${phoneHTML}<br>Prosimy dzwonić w godzinach otwarcia.</p>`;
const confessionCard=`<p>Terminy spowiedzi potwierdzisz w kancelarii parafialnej pod numerem ${phoneHTML}.</p><p><strong>Zadzwoń w godzinach otwarcia:</strong><br>pon., śr. i pt. 9:00–10:30 i 16:30–18:00. W pierwsze piątki miesiąca godziny wymagają potwierdzenia.</p>`;
const worshipCard='<p><strong>Pierwsza niedziela miesiąca, 19:00.</strong></p><p>Jeśli termin zbiega się z innym ważnym świętem lub uroczystością, zmiana jest wcześniej podawana w ogłoszeniach parafialnych.</p><p><a href="/wieczory-uwielbienia">Poznaj Wieczory Uwielbienia</a></p>';
const tokens:Record<string,string>={MASS_SCHEDULE:massSchedule,OFFICE_SCHEDULE:officeSchedule,CONFESSION_INFO:confessionInfo,SACRAMENT_CONTACT:sacramentContact,WORSHIP_SCHEDULE:worshipSchedule,PARISH_ACCOUNT:accountHTML,MASS_CARD:massCard,OFFICE_CARD:officeCard,CONFESSION_CARD:confessionCard,WORSHIP_CARD:worshipCard};
export function resolveContent(html:string){return html.replace(/\{\{([A-Z_]+)\}\}/g,(match,key)=>tokens[key]??match)}
