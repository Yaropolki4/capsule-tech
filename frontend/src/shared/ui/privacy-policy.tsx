// Текст политики продублирован в landing/src/components/privacy-policy.tsx —
// при изменении обновляйте оба файла.

const CONTACT_EMAIL = "pisareff.ya@yandex.ru";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground text-pretty">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 pl-5 list-disc marker:text-brand-accent-text">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Email() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="text-brand-accent-text underline underline-offset-2 hover:no-underline"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

export function PrivacyPolicy() {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl sm:text-[40px] leading-[1.1] font-bold tracking-tight text-balance">
          Политика обработки персональных данных
        </h1>
        <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
          Дата последнего обновления: 22.09.2026
        </p>
      </header>

      <Section title="1. Оператор персональных данных">
        <p>
          Обработку персональных данных пользователей сайта Capsule AI
          (capsule-ai.ru) осуществляет Писарев Ярослав Алексеевич, контакты для
          связи: <Email />.
        </p>
      </Section>

      <Section title="2. Какие данные собираются">
        <List
          items={[
            "имя",
            "адрес электронной почты",
            "содержание сообщений, отправляемых пользователем в чат",
            "фотографии, загружаемые пользователем",
            "технические данные, необходимые для авторизации (файлы cookie сессии)",
          ]}
        />
      </Section>

      <Section title="3. Цели обработки">
        <List
          items={[
            "регистрация и авторизация пользователя на сайте",
            "обеспечение работы функции общения с ИИ-ассистентом (обработка запроса и формирование ответа)",
            "обработка загружаемых пользователем фотографий в рамках функционала сервиса",
            "обратная связь с пользователем при необходимости",
          ]}
        />
      </Section>

      <Section title="4. Правовое основание обработки">
        <p>
          Согласие субъекта персональных данных (ст. 6 Федерального закона от
          27.07.2006 № 152-ФЗ «О персональных данных»), полученное при
          регистрации на сайте.
        </p>
      </Section>

      <Section title="5. Передача данных третьим лицам">
        <p>
          Для обработки сообщений пользователя сайт использует API OpenAI. В
          связи с этим сообщения пользователя могут передаваться и
          обрабатываться на серверах OpenAI, расположенных за пределами
          Российской Федерации (трансграничная передача персональных данных).
          Иным лицам персональные данные не передаются и не продаются.
        </p>
      </Section>

      <Section title="6. Сроки хранения">
        <p>
          Данные хранятся до удаления аккаунта пользователем, после чего
          удаляются в течение разумного срока, необходимого для технической
          обработки запроса на удаление.
        </p>
      </Section>

      <Section title="7. Права пользователя">
        <p>
          Пользователь вправе в любой момент запросить у оператора сведения об
          обработке его персональных данных, потребовать их уточнения,
          блокирования или удаления, а также отозвать согласие на обработку,
          написав на <Email />.
        </p>
      </Section>

      <Section title="8. Cookie">
        <p>
          Сайт использует файлы cookie, необходимые для авторизации и работы
          личного кабинета. Продолжая пользоваться сайтом, пользователь
          соглашается с их использованием в соответствии с настоящей
          Политикой.
        </p>
      </Section>
    </article>
  );
}
