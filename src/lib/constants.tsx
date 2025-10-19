// Fix: Provide the implementation for the constants.
import React from 'react';
import type { Subject, PremadeGame } from './types';

export const SUBJECTS: Subject[] = [
  {
    nameKey: "subject_french",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
    color: "text-blue-500 dark:text-blue-300",
    bgColor: "bg-blue-500/20",
  },
  {
    nameKey: "subject_maths",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="12" y1="10" x2="12" y2="18"></line><line x1="8" y1="10" x2="8" y2="18"></line><line x1="8" y1="14" x2="12" y2="14"></line></svg>,
    color: "text-red-500 dark:text-red-300",
    bgColor: "bg-red-500/20",
  },
  {
    nameKey: "subject_history",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
    color: "text-yellow-500 dark:text-yellow-300",
    bgColor: "bg-yellow-500/20",
  },
   {
    nameKey: "subject_english",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>,
    color: "text-purple-500 dark:text-purple-300",
    bgColor: "bg-purple-500/20",
  },
  {
    nameKey: "subject_spanish",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><path d="M12 8v5"/><path d="M15.5 11.5L18 13l-3.5 1.5"/><path d="M8.5 11.5L6 13l3.5 1.5"/><path d="M12 13v5l-3 3"/><path d="M15 21l-3-3"/></svg>,
    color: "text-orange-500 dark:text-orange-300",
    bgColor: "bg-orange-500/20",
  },
   {
    nameKey: "subject_german",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.2 6.2C13.8 5.5 12 6.5 12 8s0 3 2 3c2.7 0 4.8-2.2 4.8-5 .1-1.3-1-3-3.8-3"/><path d="M8.8 17.8c1.4.7 3.2-.3 3.2-2s0-3-2-3c-2.7 0-4.8 2.2-4.8 5C5.2 20.3 7 22 9.8 21"/><path d="M12 8s0 3-2 3c-2.8 0-5-2.2-5-5s2.2-5 5-5c1.4 0 2.5.6 3.2 1.2"/><path d="M12 16s0-3 2-3c2.8 0 5 2.2 5 5s-2.2 5-5 5c-1.4 0-2.5-.6-3.2-1.2"/></svg>,
    color: "text-amber-500 dark:text-amber-300",
    bgColor: "bg-amber-500/20",
  },
  {
    nameKey: "subject_svt",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="5" />
        <path d="M12 14v8" />
        <path d="M9 19h6" />
        <path d="M15.5 5.5L20 1" />
        <path d="M20 5V1h-4" />
      </svg>
    ),
    color: "text-green-500 dark:text-green-300",
    bgColor: "bg-green-500/20",
  },
  {
    nameKey: "subject_physics",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>,
    color: "text-teal-500 dark:text-teal-300",
    bgColor: "bg-teal-500/20",
  },
  {
    nameKey: "subject_technology",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
    color: "text-slate-500 dark:text-slate-300",
    bgColor: "bg-slate-500/20",
  },
   {
    nameKey: "subject_arts",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M7 7c2-2 5-2 7 0M7 17c2 2 5 2 7 0"/></svg>,
    color: "text-pink-500 dark:text-pink-300",
    bgColor: "bg-pink-500/20",
  },
  {
    nameKey: "subject_music",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    color: "text-indigo-500 dark:text-indigo-300",
    bgColor: "bg-indigo-500/20",
  },
  {
    nameKey: "subject_games",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12M12 6v12"/></svg>,
    color: "text-lime-500 dark:text-lime-300",
    bgColor: "bg-lime-500/20",
  }
];

export const PREMADE_GAMES: PremadeGame[] = [
    {
        nameKey: "game_maths_calc_rush_name",
        descriptionKey: "game_maths_calc_rush_desc",
        html: `<!DOCTYPE html><html><head><title>Calcul Rush</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f0f0f0;}.container{text-align:center;padding:20px;background:white;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.1);}#problem{font-size:2em;margin:20px 0;}#answer{font-size:1.5em;padding:10px;width:100px;text-align:center;}#feedback{height:20px;font-weight:bold;margin-top:10px;}</style></head><body><div class="container"><h1>Calcul Rush</h1><div id="problem"></div><input type="number" id="answer" /><p>Score: <span id="score">0</span></p><div id="feedback"></div></div><script>let score=0;let currentProblem={a:0,b:0,answer:0};const problemEl=document.getElementById('problem');const answerEl=document.getElementById('answer');const scoreEl=document.getElementById('score');const feedbackEl=document.getElementById('feedback');function newProblem(){currentProblem.a=Math.ceil(Math.random()*10);currentProblem.b=Math.ceil(Math.random()*10);currentProblem.answer=currentProblem.a+currentProblem.b;problemEl.textContent=currentProblem.a + ' + ' + currentProblem.b + ' = ?';}answerEl.addEventListener('keyup',function(e){if(e.key==='Enter'){checkAnswer();}});function checkAnswer(){const userAnswer=parseInt(answerEl.value);if(userAnswer===currentProblem.answer){score++;feedbackEl.textContent='Correct !';feedbackEl.style.color='green';}else{score=Math.max(0,score-1);feedbackEl.textContent='Faux. La réponse était '+currentProblem.answer;feedbackEl.style.color='red';}scoreEl.textContent=score;answerEl.value='';newProblem();}newProblem();</script></body></html>`,
        subjectNameKey: "subject_maths",
    },
    {
        nameKey: "game_french_conjug_name",
        descriptionKey: "game_french_conjug_desc",
        html: `<!DOCTYPE html><html><head><title>Conjuguaison Express</title><style>body{font-family:sans-serif;text-align:center;padding-top:50px;}</style></head><body><h1>Conjuguaison Express</h1><p id="challenge"></p><input id="response" type="text"><button onclick="check()">Vérifier</button><p id="result"></p><script>const verbs = { "être": { "présent": { "je": "suis", "tu": "es", "il": "est" } }, "avoir": { "présent": { "je": "ai", "tu": "as", "il": "a" } } }; let currentVerb, currentPronoun; function newChallenge() { const verbKeys = Object.keys(verbs); currentVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)]; const pronounKeys = Object.keys(verbs[currentVerb].présent); currentPronoun = pronounKeys[Math.floor(Math.random() * pronounKeys.length)]; document.getElementById('challenge').innerText = \`Conjuguez "\${currentVerb}" au présent avec "\${currentPronoun}" :\`; document.getElementById('response').value = ''; document.getElementById('result').innerText = ''; } function check() { const answer = document.getElementById('response').value.trim().toLowerCase(); const correctAnswer = verbs[currentVerb].présent[currentPronoun]; if (answer === correctAnswer) { document.getElementById('result').innerText = "Correct !"; } else { document.getElementById('result').innerText = "Faux. La réponse est : " + correctAnswer; } setTimeout(newChallenge, 2000); } window.onload = newChallenge;</script></body></html>`,
        subjectNameKey: "subject_french",
    },
    {
        nameKey: "game_history_dates_name",
        descriptionKey: "game_history_dates_desc",
        html: `<!DOCTYPE html><html><head><title>Dates Clés</title></head><body><h1>Dates Clés</h1><p>Associez la date à l'événement.</p><div id="game"></div><script>const events = { "1789": "Révolution française", "1492": "Découverte de l'Amérique", "1914": "Début de la Première Guerre mondiale" }; let date, correctAnswer; function newQuestion() { const dates = Object.keys(events); date = dates[Math.floor(Math.random() * dates.length)]; correctAnswer = events[date]; const options = [correctAnswer, ...Object.values(events).filter(v => v !== correctAnswer).sort(() => .5 - Math.random()).slice(0, 2)].sort(() => .5 - Math.random()); let gameHtml = \`<p>Que s'est-il passé en \${date} ?</p>\`; options.forEach(opt => { gameHtml += \`<button onclick="check('\${opt}')">\${opt}</button>\`; }); document.getElementById('game').innerHTML = gameHtml; } function check(answer) { if (answer === correctAnswer) { alert("Correct !"); } else { alert("Faux, la bonne réponse était " + correctAnswer); } newQuestion(); } newQuestion();</script></body></html>`,
        subjectNameKey: "subject_history",
    },
    {
        nameKey: "game_svt_body_parts_name",
        descriptionKey: "game_svt_body_parts_desc",
        html: `<!DOCTYPE html><html><head><title>Le Corps Humain</title></head><body><h1>Le Corps Humain</h1><p>Quiz sur les parties du corps.</p><script>alert('Jeu de SVT à venir !');</script></body></html>`,
        subjectNameKey: "subject_svt"
    }
];

// Fix: Update type definition to allow 'className' prop for styling with React.cloneElement.
export const AVATAR_ICONS: Record<string, React.ReactElement<{ className?: string }>> = {
    'user': <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    'folder': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5a2 2 0 0 1 2-2h5l2 2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9"/></svg>,
    'book': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    'lightbulb': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a5 5 0 0 1 5 5c0 2-2 4-2 4H9s-2-2-2-4a5 5 0 0 1 5-5z"/></svg>,
    'flask': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M12 3v7l-3 7h12l-3-7V3M6 17h16"/></svg>,
    'globe': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 1 1 0 20 15 15 0 0 1 0-20"/></svg>,
    'graduation-cap': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>,
    'terminal': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6M12 19h8"/></svg>,
    'brain': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5zM12 12a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0v-1a5 5 0 0 0-5-5zM4 12a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1M20 12a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1"/></svg>,
    'atom': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.4-2.4 2.4-6.3 0-8.7s-6.3-2.4-8.7 0-2.4 6.3 0 8.7 6.3 2.4 8.7 0z"/><path d="M3.8 3.8c-2.4 2.4-2.4 6.3 0 8.7s6.3 2.4 8.7 0 2.4-6.3 0-8.7-6.3-2.4-8.7 0z"/></svg>,
    'dna': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4c0 4 4 4 4 8s-4 4-4 8M20 4c0 4-4 4-4 8s4 4 4 8M8 8h8M8 16h8"/></svg>,
    'scroll': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8a2 2 0 0 0 2-2v-2H6v2a2 2 0 0 0 2 2z"/><path d="M4 3h12a2 2 0 0 1 2 2v12H4V5a2 2 0 0 1 2-2zM16 3v18"/></svg>,
    'map': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z"/><path d="M8 2v16M16 6v16"/></svg>,
    'palette': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M7 7c2-2 5-2 7 0M7 17c2 2 5 2 7 0"/></svg>,
    'music': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    'chart-bar': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 12h4m-4 4h9m-9-8h2"/></svg>,
    'check': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
    'pin': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    'star': <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
    'camera': <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>,
    'code-bracket': <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
    'heart': <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
    'bolt': <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
    'sun': <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
    'rocket': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 11.5L12 2l7.5 9.5-7.5 9.5zM12 22V2"/></svg>,
    'sparkles': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8 L19.25 5.25 L22 4 L19.25 2.75 L18 0 L16.75 2.75 L14 4 L16.75 5.25 Z M10 22 L11.25 19.25 L14 18 L11.25 16.75 L10 14 L8.75 16.75 L6 18 L8.75 19.25 Z M18 22 L16.75 19.25 L14 18 L16.75 16.75 L18 14 L19.25 16.75 L22 18 L19.25 19.25 Z M4 8 L2.75 5.25 L0 4 L2.75 2.75 L4 0 L5.25 2.75 L8 4 L5.25 5.25 Z"/></svg>,
    'cog': <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.424.35.534.954.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
    'trophy': <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 0 1.373-3.852A9.75 9.75 0 0 0 4.5 6.75c0-2.432 1.255-4.596 3.168-5.832A9.753 9.753 0 0 1 12 3c2.09 0 4.028.623 5.682 1.668C19.595 5.904 21 8.068 21 10.5c0 2.236-1.005 4.21-2.627 5.648A9.75 9.75 0 0 0 16.5 18.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v3.75m0 0h3.75m-3.75 0H8.25" /></svg>,
};
export const AVATAR_ICON_KEYS = Object.keys(AVATAR_ICONS);