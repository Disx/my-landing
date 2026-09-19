# office-admin.by — сайт (Hugo)

Статический сайт на Hugo: главная (услуги, процесс, FAQ, форма заявки), 12 страниц услуг и блог под SEO-контент. Деплой — GitHub Pages со своим доменом.

> **Контекст проекта, семантическое ядро, правила тональности и бэклог — в `CLAUDE.md`** в корне репозитория. Перед правкой контента читать его.

---

## 1. Конфигурация

Контакты и гео правятся в **одном месте — `hugo.toml`**, блок `[params]`. Это единый источник правды, шаблоны берут значения оттуда.

| Параметр | Текущее значение |
|---|---|
| `businessName` | `Office-Admin` |
| `city` / `region` | `Минск` / `Беларусь` |
| `phoneDisplay` / `phoneHref` | `+375 (29) 640-57-19` / `375296405719` |
| `email` | `info@office-admin.by` |
| `showAddress` | `false` (офиса с приёмом нет) |
| `metrikaId` | `105088641` |

Telegram-ссылки собираются из номера телефона: `https://t.me/+{{ .Site.Params.phoneHref }}`. Отдельного параметра с ником нет — так задумано.

**Исключение из единого источника правды:** плавающий виджет связи в `layouts/partials/footer.html` — там номер прописан жёстко в ссылках `tel:`, Viber, WhatsApp и Telegram. При смене номера править и его.

### Настройки, важные для индексации

```toml
disableKinds = ["taxonomy", "term"]
enableGitInfo = true

[frontmatter]
  lastmod = [":git", "lastmod", "date", "publishDate"]
```

- `disableKinds` не даёт Hugo создавать страницы `/tags/*` и `/categories/`. Без этого в `sitemap.xml` попадали десятки пустых страниц с тонким контентом.
- `enableGitInfo` вместе с блоком `[frontmatter]` берёт `lastmod` из даты коммита, а не из поля `date`. Иначе переписанные страницы остаются в карте сайта с исходной датой, и поисковик не видит изменений. Требует `fetch-depth: 0` в workflow — в `deploy.yml` он уже стоит.

**В TOML порядок строк важен:** простые параметры должны идти до первой секции `[...]`, иначе попадут внутрь неё.

---

## 2. Локальный запуск

```bash
hugo server -D
# открой http://localhost:1313
```

## 3. Деплой

В `.github/workflows/` два workflow: `deploy.yml` (сборка и публикация на GitHub Pages, Hugo 0.150.0) и `build-check.yml` (проверка сборки, Hugo latest, при падении шлёт вебхук в n8n). Оба срабатывают на push в `main` — два запуска на коммит это штатно.

```bash
git add -A
git commit -m "описание правки"
git push
```

Файл `static/CNAME` содержит `office-admin.by` — домен подхватывается автоматически. Перед GitHub Pages стоит Cloudflare (Full Setup).

**Если правки не видны на живом сайте** — скорее всего кэш Cloudflare. Обход через query-параметры и заголовки `Cache-Control` не работает, помогает только **Purge Everything** (Caching → Configuration).

---

## 4. Форма обратной связи

Сейчас работает через **Web3Forms**: ключ зашит в `layouts/index.html` в поле `access_key`, заявки приходят на почту, указанную при получении ключа.

```html
<input type="hidden" name="access_key" value="...">
```

**Вариант на будущее — свой n8n → Telegram.** В `static/js/main.js` меняется одна строка:

```js
var ENDPOINT = "https://n8n.office-admin.by/webhook/zayavka";
```

n8n принимает JSON (`name`, `organization`, `phone`, `message`) и передаёт в ноду Telegram. Нужен публичный HTTPS-вебхук (через Cloudflare Tunnel) и заголовок `Access-Control-Allow-Origin: https://office-admin.by` в ответе.

---

## 5. SEO вне сайта

Вёрстка и разметка сделаны: semantic HTML, мета, Open Graph, JSON-LD `ProfessionalService`, `sitemap.xml`, `robots.txt`. Семантическое ядро собрано и разложено по страницам — см. `CLAUDE.md`.

Что даёт отдачу за пределами сайта, по убыванию:

1. **Google Business Profile** и **Яндекс.Бизнес** — карточки компании с категорией «IT-услуги/системное администрирование», городом, телефоном и сайтом. Для локальной выдачи весомее, чем правки на самом сайте.
2. **Подтверждение сайта и sitemap:** Google Search Console (`sc-domain:office-admin.by`) и Яндекс.Вебмастер — оба подключены.
3. **Единый NAP** — название, телефон и город одинаково на сайте, в Google и Яндексе.
4. **Контент.** Блог наполняется автоматически: воркфлоу n8n «Content: office-admin» берёт тему из data table `content_topics`, генерирует статью и коммитит в `content/blog/` по вторникам.
5. **Отзывы** в карточках Google/Яндекс — просить у довольных клиентов. На сайте отзывы живут в `content/reviews/_index.md`, **выдумывать их нельзя**.

### Если новые страницы долго не появляются в поиске

1. Открыть `https://office-admin.by/sitemap.xml` и убедиться, что страница там есть, а `lastmod` у неё свежий.
2. В Search Console → Sitemaps отправить `https://office-admin.by/sitemap.xml` повторно — это заставляет Google перечитать карту.
3. Для самых важных страниц — URL Inspection → Request indexing (лимит порядка десятка URL в сутки).

---

## Структура

```
CLAUDE.md                  контекст проекта для Claude Code — читать первым
hugo.toml                  конфиг + контакты/гео (единый источник правды)
content/
  _index.md                главная
  <услуга>/_index.md       12 страниц услуг
  blog/                    статьи (часть генерируется автоматически)
  documents/, reviews/, privacy-policy/
data/services.yaml         карточки услуг на главной
layouts/                   шаблоны
static/                    css, js, robots.txt, favicon, CNAME, docs/, certificates/
.github/workflows/         автодеплой и проверка сборки
```

Чтобы добавить услугу — блок в `data/services.yaml` плюс папка в `content/`. Чтобы добавить статью — `.md` в `content/blog/`. Вёрстку трогать не нужно.
