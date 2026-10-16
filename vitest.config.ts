import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // describe, it, expect доступні без імпорту в кожному файлі
    // (узгоджено з "vitest/globals" у tsconfig.json)
    globals: true,
    // Тестується чиста бізнес-логіка без DOM, тому достатньо node;
    // для тестів компонентів знадобиться jsdom
    environment: 'node',
    // Раннер шукає тести лише в каталозі tests і лише у файлах *.test.ts
    include: ['tests/**/*.test.ts'],
    coverage: {
      // v8 - вбудований рушій покриття Node.js, не потребує інструментування коду
      provider: 'v8',
      // text - таблиця в терміналі, html - детальний звіт coverage/index.html
      reporter: ['text', 'html'],
      // Враховуємо лише код продукту; без цього у звіт потрапили б
      // конфігурації й самі тести, що спотворило б показники
      include: ['src/**/*.ts'],
      // Мінімальні пороги: за їх недосягнення прогін завершується з помилкою
      thresholds: {
        lines: 80, // не менше 80 % виконаних рядків
        branches: 80, // не менше 80 % пройдених гілок умов
        functions: 100, // кожна функція має бути викликана хоча б раз
      },
    },
  },
});
