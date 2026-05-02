import styles from "./page.module.css";

export default function CodepenExamplePage() {
  return (
    <section className={styles.page}>
      <div className={styles.wrapper}>

        <form className={styles.formContact} action="">
          <fieldset>
            <p>Hey, Stranger!</p>
            <p>
              My name is{" "}
              <span
                className={`${styles.formField} ${styles.fieldName}`}
                data-placeholder="your name"
                tabIndex={1}
                contentEditable
                suppressContentEditableWarning
              />{" "}
              and I&apos;m writting tou you since I&apos;m interested in{" "}
              <span
                className={`${styles.formField} ${styles.fieldMessage}`}
                data-placeholder="your message"
                tabIndex={2}
                contentEditable
                suppressContentEditableWarning
              />
              .
            </p>
            <p>
              This is my{" "}
              <span
                className={`${styles.formField} ${styles.fieldEmail}`}
                data-placeholder="email address"
                tabIndex={3}
                contentEditable
                suppressContentEditableWarning
              />
              .
            </p>
            <p>Hope to get in touch soon. Cheers!</p>
            <button type="submit" className="button button--xlarge" tabIndex={4}>
              Send message &#187;
            </button>
          </fieldset>
        </form>
      </div>

      <svg
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xmlSpace="preserve"
        className={styles.svgDefs}
      >
        <defs>
          <filter id="blur0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0 0" />
          </filter>
          <filter id="blur1">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0 5" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0 10" />
          </filter>
          <filter id="blur3">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0 15" />
          </filter>
          <filter id="blur4">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0 20" />
          </filter>
        </defs>
      </svg>
    </section>
  );
}
