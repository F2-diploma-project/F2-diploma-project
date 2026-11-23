# Інформаційна система автоматизації B2B-продажів та розпізнавання інвентарю закладів харчування засобами комп'ютерного зору

Кваліфікаційна робота (спеціальність 121/F2 «Інженерія програмного забезпечення»). B2B-система для закладів харчування: мобільний застосунок для касира й адміністратора, серверна частина на NestJS і модуль Snap & Sell, який розпізнає страви на фото вітрини через Vision API та формує чернетки лотів. З B2C-модулем (окрема робота) система взаємодіє лише через REST-контракт.

[![Backend CI](https://github.com/F2-diploma-project/F2-diploma-project/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/F2-diploma-project/F2-diploma-project/actions/workflows/backend-ci.yml)
[![Mobile CI](https://github.com/F2-diploma-project/F2-diploma-project/actions/workflows/mobile-ci.yml/badge.svg)](https://github.com/F2-diploma-project/F2-diploma-project/actions/workflows/mobile-ci.yml)
[![Docs Quality Gate](https://github.com/F2-diploma-project/F2-diploma-project/actions/workflows/docs-linter.yml/badge.svg)](https://github.com/F2-diploma-project/F2-diploma-project/actions/workflows/docs-linter.yml)

## Документація

- Зведений документ Розділів 1 і 2 (Google Docs): [F2_Diploma_Розділи_1-2_Гуцуляк](https://docs.google.com/document/d/11yym7Yu2vg7pIggLXqZeeUuG1O88exjSY25eENWGJ3A/edit)
- Розділ 1. Аналіз предметної області та постановка задачі: [`docs/1_analysis.md`](docs/1_analysis.md)
- Специфікація вимог (SRS): [`docs/srs.md`](docs/srs.md)
- Розділ 2. Обґрунтування архітектурних рішень та проєктування системи: [`docs/2_design.md`](docs/2_design.md)
- Архітектурні рішення (ADR): [`docs/adr/`](docs/adr/)
- Специфікація API (OpenAPI 3.1): [`docs/api/openapi.yaml`](docs/api/openapi.yaml); контракт із B2C-модулем: [`contracts/b2c-contract.yaml`](contracts/b2c-contract.yaml)
- Діаграма прецедентів (StarUML): [`docs/uml/use-cases.mdj`](docs/uml/use-cases.mdj)
- Зміст документації та календарний план: [`docs/README.md`](docs/README.md)

Документацію в `docs/` перевіряє конвеєр [Docs Quality Gate](.github/workflows/docs-linter.yml): markdownlint із правилами в [`.markdownlint.json`](.markdownlint.json) і власним правилом термінології [`.markdownlint/no-slang.cjs`](.markdownlint/no-slang.cjs) на кожен Pull Request у `main`.

## Структура репозиторію

| Каталог | Вміст |
| --- | --- |
| `src/backend/` | Серверна частина: NestJS API та обробник черги розпізнавання |
| `src/mobile/` | Мобільний застосунок Expo (React Native) для касира й адміністратора |
| `contracts/` | REST-контракт B2B ↔ B2C (OpenAPI) |
| `docs/` | Пояснювальна записка, SRS, ADR, специфікація API, UML |

## Технологічний стек

TypeScript · Node.js 24 + NestJS · PostgreSQL · Redis · BullMQ · Expo (React Native) + Expo Router · Jest, Supertest, React Native Testing Library · Docker · GitHub Actions.

## Запуск

Інфраструктура (PostgreSQL і Redis), з кореня репозиторію:

```bash
docker compose up -d --wait
```

Серверна частина, з `src/backend/`:

```bash
npm ci && cp .env.example .env && npm run start:dev
```

Мобільний застосунок, з `src/mobile/`:

```bash
npm ci && npx expo start
```
