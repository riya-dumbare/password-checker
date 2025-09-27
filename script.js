const COMMON = new Set([
  "123456","password","123456789","12345678","12345","qwerty",
  "abc123","111111","iloveyou","admin","welcome","monkey","letmein"
]);

const input = document.getElementById('password');
const fill = document.getElementById('fill');
const labelEl = document.getElementById('label');
const feedbackEl = document.getElementById('feedback');
const tipsEl = document.getElementById('tips');
const toggleBtn = document.getElementById('toggleBtn');
const copyBtn = document.getElementById('copyBtn');
const generateBtn = document.getElementById('generateBtn');

function poolSize(pw){
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
  return pool;
}

function entropy(pw){
  const p = poolSize(pw);
  if (!p) return 0;
  return pw.length * Math.log2(p);
}

function hasSequences(pw){
  const s = pw.toLowerCase();
  const seqs = ['abcdefghijklmnopqrstuvwxyz','0123456789','qwertyuiopasdfghjklzxcvbnm'];
  for (const seq of seqs){
    for (let i=0;i<seq.length-2;i++){
      if (s.includes(seq.slice(i,i+3))) return true;
    }
  }
  return false;
}

function isRepeating(pw){
  if (pw.length < 3) return false;
  const unique = new Set(pw);
  return unique.size <= 2;
}

function hasDictionaryWord(pw){
  const words = ['password','admin','user','guest','login','welcome','qwerty','letmein','love','iloveyou','hello'];
  const s = pw.toLowerCase();
  for (const w of words){
    if (s.includes(w) && w.length >= 4) return true;
  }
  return false;
}

function scorePassword(pw){
  if (!pw) return {score:0, label:'', feedback:'No password entered.'};
  if (COMMON.has(pw.toLowerCase())) return {score:1, label:'Very Weak', feedback:'Common password — avoid.'};

  let score = 0;
  const len = pw.length;
  const variety = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].reduce((acc, re) => acc + (re.test(pw)?1:0), 0);

  if (len >= 12) score += 3;
  else if (len >= 8) score += 2;
  else if (len >= 6) score += 1;

  score += variety;

  if (hasSequences(pw)) score -= 2;
  if (isRepeating(pw)) score -= 2;
  if (hasDictionaryWord(pw)) score -= 1;

  score = Math.max(0, Math.min(score, 10));

  let label;
  if (score >= 8) label='Very Strong';
  else if (score >= 6) label='Strong';
  else if (score >= 4) label='Medium';
  else if (score >= 2) label='Weak';
  else label='Very Weak';

  return {score, label, feedback:`Length=${len}, Variety=${variety}, Entropy≈${entropy(pw).toFixed(1)} bits`};
}

function generateSuggestions(pw){
  const suggestions = [];

  if (!pw) {
    suggestions.push("Start typing a password to get suggestions.");
    return suggestions;
  }

  if (COMMON.has(pw.toLowerCase())) {
    suggestions.push("This is a very common password — choose something unique.");
    return suggestions;
  }

  if (pw.length < 8) suggestions.push("Make it at least 8 characters long.");
  if (!/[A-Z]/.test(pw)) suggestions.push("Add an uppercase letter.");
  if (!/[a-z]/.test(pw)) suggestions.push("Add a lowercase letter.");
  if (!/[0-9]/.test(pw)) suggestions.push("Add a number.");
  if (!/[^A-Za-z0-9]/.test(pw)) suggestions.push("Add a special character (e.g., ! @ # $ % ^ & *).");

  if (hasSequences(pw)) suggestions.push("Avoid predictable sequences like 'abc' or '123'.");
  if (isRepeating(pw)) suggestions.push("Avoid repeated characters (e.g., 'aaaa').");
  if (hasDictionaryWord(pw)) suggestions.push("Avoid common words or names inside the password.");

  return suggestions;
}

function getColor(score){
  if (score>=8) return '#0f9d58';
  if (score>=6) return '#fbbc04';
  if (score>=4) return '#f4b400';
  return '#ea4335';
}

input.addEventListener('input', ()=>{
  const pw = input.value;

  const {score, label, feedback} = scorePassword(pw);
  fill.style.width = (score*10)+'%';
  fill.style.background = getColor(score);
  labelEl.textContent = pw?`${label} (${score}/10)`:'Enter a password';
  feedbackEl.textContent = feedback;

  const suggestions = generateSuggestions(pw);
  tipsEl.innerHTML = '<ul>' + suggestions.map(s => `<li>${s}</li>`).join('') + '</ul>';
});

/* Eye toggle */
toggleBtn.addEventListener('click', () => {
  const icon = toggleBtn.querySelector("i");
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = 'password';
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

/* Copy password */
copyBtn.addEventListener('click', () => {
  if (!input.value) {
    tipsEl.textContent = "Nothing to copy.";
    setTimeout(()=> tipsEl.textContent='', 1500);
    return;
  }
  navigator.clipboard.writeText(input.value).then(()=> {
    tipsEl.textContent = "Password copied to clipboard!";
    setTimeout(()=> tipsEl.textContent='', 1800);
  }).catch(()=> {
    tipsEl.textContent = "Unable to copy.";
    setTimeout(()=> tipsEl.textContent='', 1800);
  });
});

/* Generate strong password */
function generatePassword(length = 16) {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';
  const all = lower + upper + numbers + symbols;

  let password = '';
  password += lower[Math.floor(Math.random()*lower.length)];
  password += upper[Math.floor(Math.random()*upper.length)];
  password += numbers[Math.floor(Math.random()*numbers.length)];
  password += symbols[Math.floor(Math.random()*symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random()*all.length)];
  }

  password = password.split('').sort(() => Math.random()-0.5).join('');
  return password;
}

generateBtn.addEventListener('click', () => {
  const pw = generatePassword(16);
  input.value = pw;
  input.dispatchEvent(new Event('input'));
});
