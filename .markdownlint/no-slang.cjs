"use strict";

// Забороняє розмовний і маркетинговий сленг та кириличну транслітерацію
// англомовних ІТ-термінів у тексті документації (код і посилання не перевіряються).
const FORBIDDEN = [
  { pattern: /юскейс\p{L}*/iu, hint: "Use Case" },
  { pattern: /юзкейс\p{L}*/iu, hint: "Use Case" },
  { pattern: /свагер\p{L}*/iu, hint: "Swagger / OpenAPI" },
  { pattern: /джейсон\p{L}*/iu, hint: "JSON" },
  { pattern: /маркдаун\p{L}*/iu, hint: "Markdown" },
  { pattern: /рест[ -]?апі/iu, hint: "REST API" },
  { pattern: /апішк\p{L}*/iu, hint: "API" },
  { pattern: /ендпоінтик\p{L}*/iu, hint: "endpoint" },
  { pattern: /деплой\p{L}*/iu, hint: "розгортання (deployment)" },
  { pattern: /інтуїтивно зрозуміл\p{L}*/iu, hint: "вимірюваний критерій зручності" },
  { pattern: /(?<!\p{L})крут\p{L}*/iu, hint: "інженерне формулювання" },
  { pattern: /зручн\p{L}* модул\p{L}*/iu, hint: "інженерне формулювання" },
  { pattern: /сучасн\p{L}* метод\p{L}* шифруванн\p{L}*/iu, hint: "назва алгоритму" },
];

const stripInlineCode = (line) =>
  line.replace(/`[^`]*`/g, (m) => " ".repeat(m.length)).replace(/\]\([^)]*\)/g, (m) => " ".repeat(m.length));

module.exports = {
  names: ["F2001", "no-slang"],
  description: "Розмовний сленг або транслітерація ІТ-термінів",
  tags: ["language"],
  parser: "none",
  function: function noSlang(params, onError) {
    let inFence = false;
    params.lines.forEach((rawLine, index) => {
      if (/^\s*(```|~~~)/.test(rawLine)) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;
      const line = stripInlineCode(rawLine);
      for (const { pattern, hint } of FORBIDDEN) {
        const match = pattern.exec(line);
        if (match) {
          onError({
            lineNumber: index + 1,
            detail: `«${match[0]}» → ${hint}`,
            range: [match.index + 1, match[0].length],
          });
        }
      }
    });
  },
};
