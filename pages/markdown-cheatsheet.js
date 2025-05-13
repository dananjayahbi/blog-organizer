import React from 'react';
import Head from 'next/head';
import styles from '../styles/MarkdownCheatsheet.module.css';

const MarkdownCheatsheet = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Markdown Cheat Sheet</title>
        <meta name="description" content="Quick reference guide for Markdown syntax" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Markdown Cheat Sheet</h1>
        
        <p className={styles.intro}>
          This is a quick reference guide for Markdown syntax. Use this to format your blog posts.
        </p>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2>Basic Syntax</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Markdown Syntax</th>
                  <th>Renders As</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Heading 1</td>
                  <td><code># Heading 1</code></td>
                  <td><h1 className={styles.preview}>Heading 1</h1></td>
                </tr>
                <tr>
                  <td>Heading 2</td>
                  <td><code>## Heading 2</code></td>
                  <td><h2 className={styles.preview}>Heading 2</h2></td>
                </tr>
                <tr>
                  <td>Heading 3</td>
                  <td><code>### Heading 3</code></td>
                  <td><h3 className={styles.preview}>Heading 3</h3></td>
                </tr>
                <tr>
                  <td>Bold</td>
                  <td><code>**bold text**</code></td>
                  <td><strong>bold text</strong></td>
                </tr>
                <tr>
                  <td>Italic</td>
                  <td><code>*italicized text*</code></td>
                  <td><em>italicized text</em></td>
                </tr>
                <tr>
                  <td>Bold and Italic</td>
                  <td><code>***bold and italic***</code></td>
                  <td><strong><em>bold and italic</em></strong></td>
                </tr>
                <tr>
                  <td>Blockquote</td>
                  <td><code>&gt; blockquote</code></td>
                  <td><blockquote className={styles.preview}>blockquote</blockquote></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.card}>
            <h2>Lists</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Markdown Syntax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ordered List</td>
                  <td>
                    <pre><code>1. First item<br/>2. Second item<br/>3. Third item</code></pre>
                  </td>
                </tr>
                <tr>
                  <td>Unordered List</td>
                  <td>
                    <pre><code>- First item<br/>- Second item<br/>- Third item</code></pre>
                  </td>
                </tr>
                <tr>
                  <td>Nested Lists</td>
                  <td>
                    <pre><code>- First item<br/>  - Indented item<br/>  - Indented item<br/>- Second item</code></pre>
                  </td>
                </tr>
                <tr>
                  <td>Task List</td>
                  <td>
                    <pre><code>- [x] Completed task<br/>- [ ] Incomplete task</code></pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.card}>
            <h2>Links and Images</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Markdown Syntax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Link</td>
                  <td><code>[link text](https://www.example.com)</code></td>
                </tr>
                <tr>
                  <td>Image</td>
                  <td><code>![alt text](image.jpg)</code></td>
                </tr>
                <tr>
                  <td>Linked Image</td>
                  <td><code>[![alt text](image.jpg)](https://www.example.com)</code></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.card}>
            <h2>Code</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Markdown Syntax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Inline Code</td>
                  <td><code>`code`</code></td>
                </tr>
                <tr>
                  <td>Code Block</td>
                  <td>
                    <pre><code>```<br/>code block<br/>```</code></pre>
                  </td>
                </tr>
                <tr>
                  <td>Syntax Highlighting</td>
                  <td>
                    <pre><code>```javascript<br/>console.log('Hello world!');<br/>```</code></pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          
          <section className={styles.card}>
            <h2>Tables</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Markdown Syntax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <pre><code>| Header 1 | Header 2 |<br/>|----------|----------|<br/>| Cell 1   | Cell 2   |<br/>| Cell 3   | Cell 4   |</code></pre>
                  </td>
                </tr>
                <tr>
                  <td>
                    <pre><code>| Left     | Center   | Right    |<br/>|:---------|:--------:|----------:|<br/>| Aligned  | Aligned  | Aligned  |</code></pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.card}>
            <h2>Horizontal Rule</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Markdown Syntax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>---</code> or <code>***</code> or <code>___</code></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.card}>
            <h2>Advanced Tips</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Markdown Syntax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Footnote</td>
                  <td><code>Here's a sentence with a footnote. [^1]<br/><br/>[^1]: This is the footnote.</code></td>
                </tr>
                <tr>
                  <td>Strikethrough</td>
                  <td><code>~~The world is flat.~~</code></td>
                </tr>
                <tr>
                  <td>Escape Character</td>
                  <td><code>\* Without the backslash, this would be a bullet in an unordered list.</code></td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Keep this window open for reference while writing your blog posts.</p>
      </footer>
    </div>
  );
};

export default MarkdownCheatsheet;