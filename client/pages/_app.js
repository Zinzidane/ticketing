import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <h1>Header {currentUser.email}</h1>
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContenxt) => {
  const client = buildClient(appContenxt.ctx);
  const { data } = await client.get('/api/users/currentuser');
  let pageProps = {};

  if (appContenxt.Component.getInitialProps) {
    pageProps = await appContenxt.Component.getInitialProps(appContenxt.ctx);
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
