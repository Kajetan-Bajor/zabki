export const parishName='Parafia pw. Świętej Trójcy w Ząbkach';
export const parishAddress='ul. Józefa Piłsudskiego 46, 05-091 Ząbki';
export const parishFacebook='https://www.facebook.com/swietatrojcazabki';
export const phone='608 186 185';
export const phoneLink='tel:+48608186185';
export const bankAccount='14109025900000000131735833';
export const phoneHTML=`<a href="${phoneLink}">${phone}</a>`;
const massTimes=[
  ['Dni powszednie','7:00 i 18:00.'],
  ['Roraty w Adwencie','6:00 zamiast porannej Mszy Świętej o 7:00.'],
  ['Niedziele i uroczystości','7:00, 8:30, 10:00, 11:30, 13:00 i 18:00.'],
  ['Niedziele w lipcu i sierpniu','7:00, 8:30, 10:00, 12:00 i 18:00.'],
];
const massRows=massTimes.map(([label,times])=>`<strong>${label}:</strong> ${times}`);
export const massSchedule=`<p>${massRows.join('<br>')}</p>`;
export const officeSchedule=`<p><strong>Poniedziałki, środy i piątki:</strong> 9:00–10:30 oraz 16:30–18:00.</p><p><strong>W pierwszy piątek miesiąca kancelaria jest nieczynna przez cały dzień.</strong></p><p><strong>Telefon:</strong> ${phoneHTML} — czynny w godzinach otwarcia kancelarii.</p>`;
export const confessionInfo='<p>Spowiedź odbywa się podczas każdej Mszy Świętej.</p><p><strong>W pierwszy piątek miesiąca</strong> spowiadamy również rano od 6:45 i po południu od 16:30.</p>';
export const sacramentContact=`<p>W sprawach przygotowania do sakramentów oraz posług duszpasterskich prosimy o kontakt z kancelarią parafialną pod numerem ${phoneHTML}, w godzinach jej otwarcia.</p>`;
const worshipInfo='<p><strong>Pierwsza niedziela miesiąca o 19:00</strong> w kościele parafialnym, po wieczornej Mszy Świętej.</p><p>Zmiany związane ze świętami i uroczystościami podajemy z wyprzedzeniem w <a href="/ogloszenia-parafialne">ogłoszeniach parafialnych</a>.</p>';
export const worshipSchedule=worshipInfo+'<p><a href="/wieczory-uwielbienia">Poznaj Wieczory Uwielbienia</a></p>';
const accountHTML=`<strong>Rachunek bankowy parafii</strong><br><span class="parish-account">${bankAccount.replace(/^(\d{2})(?=\d)/,'$1 ').replace(/(\d{4})(?=\d)/g,'$1 ')}</span><br><button class="copy-account" type="button" data-copy-account="${bankAccount}">Kopiuj numer rachunku</button><span class="copy-account-status" role="status" aria-live="polite"></span>`;
const massCard=`<p>${massRows.slice(0,2).join('<br>')}</p><p>${massRows[2]}</p><p>${massRows[3]}</p>`;
const tokens:Record<string,string>={MASS_SCHEDULE:massSchedule,OFFICE_SCHEDULE:officeSchedule,CONFESSION_INFO:confessionInfo,SACRAMENT_CONTACT:sacramentContact,WORSHIP_INFO:worshipInfo,WORSHIP_SCHEDULE:worshipSchedule,PARISH_ACCOUNT:accountHTML,MASS_CARD:massCard,OFFICE_CARD:officeSchedule,CONFESSION_CARD:confessionInfo,WORSHIP_CARD:worshipSchedule};
export function resolveContent(html:string){return html.replace(/\{\{([A-Z_]+)\}\}/g,(match,key)=>tokens[key]??match)}
