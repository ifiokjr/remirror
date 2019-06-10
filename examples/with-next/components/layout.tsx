import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';

interface Props {
  title?: string;
}

const Layout: React.FunctionComponent<Props> = ({ children, title = 'This is the default title' }) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <header>
        <nav>
          <Link href='/'>
            <a>Home</a>
          </Link>{' '}
          |{' '}
          <Link href='/ui/twitter'>
            <a>Twitter UI</a>
          </Link>{' '}
          |{' '}
          <Link href='/ui/wysiwyg'>
            <a>Wysiwyg UI</a>
          </Link>{' '}
          |{' '}
          <Link href='/initial-props'>
            <a>With Initial Props</a>
          </Link>
        </nav>
      </header>
      {children}
      <footer>
        <hr />
        <span>I'm here to stay (Footer)</span>
      </footer>
    </div>
  );
};

export default Layout;
