import '../styles/globals.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  // // // service worker
  useEffect(() => {
    if("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
<<<<<<< HEAD
       navigator.serviceWorker.register("/swCacheSite.js", {type: 'module'}).then(
=======
       navigator.serviceWorker.register("swCacheSite.js").then(
>>>>>>> young-IntegrateSW
          function (registration) {
            console.log("Service Worker registration successful with scope: ", registration.scope);
          },
          function (err) {
            console.log("Service Worker registration failed: ", err);
          }
        );
        // navigator.serviceWorker.ready.then(function(swRegistration) {
        //   console.log('successfully requested a one time sync')
        //   return swRegistration.sync.register('myFirstSync');
        // });
      });
    }
  }, [])

  

  const getLayout = Component.getLayout || ((page) => page)
  return getLayout(<Component {...pageProps} />)
}

export default MyApp
